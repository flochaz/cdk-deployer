// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import { Aws, CfnParameter, CustomResource, DefaultStackSynthesizer, Duration } from 'aws-cdk-lib';
import { ComputeType, LinuxBuildImage, Project, Source, BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Alias } from 'aws-cdk-lib/aws-kms';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { startBuild, reportBuild } from './cdk-standalone-deployer-build';
import { Utils } from './utils';

/**
 * The properties for the CdkStandaloneDeployer construct.
 */
export interface CdkStandaloneDeployerProps extends cdk.StackProps {
  // TODO : add github token for private repo

  /**
   * The CDK stack name to deploy
   * @default - The default stack is deployed
   */
  readonly cdkStack?: string;

  /**
   * The CFN parameters to pass to the CDK application
   * @default - No parameter is used
   */
  readonly cdkParameters?: { [name: string]: cdk.CfnParameterProps };

  /**
   * The name of the S3 bucket where the CDK application source code zip is stored.
   */
  readonly cdkAppSourceCodeBucketName?: string;

  /**
   * The prefix of the S3 bucket where the CDK application source code zip is stored.
   */
  readonly cdkAppSourceCodeBucketPrefix?: string;

  /**
   * The name of the zip file containing the CDK application source code.
   */
  readonly cdkAppSourceCodeZipName?: string;

  /**
   * The github repository containing the CDK application
   */
  readonly githubRepository?: string;
  /**
   * The location of the CDK application in the Github repository.
   * It is used to `cd` into the folder before deploying the CDK application
   * @default - The root of the repository
   */
  readonly cdkAppLocation?: string;
  /**
   * The branch to use on the Github repository.
   * @default - The main branch of the repository
   */
  readonly gitBranch?: string;

  /**
   * Deploy CodeBuild buildspec file name at the root of the cdk app folder
   */
  readonly deployBuildSpec?: BuildSpec;

  /**
   * Destroy Codebuild buildspec file name at the root of the cdk app folder
   */
  readonly destroyBuildSpec?: BuildSpec;

  /**
   * The custom qualifier to use for the CDK bootstrap and CDK application.
   * @see https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html#bootstrapping-customizing for more details
   * @default hnb659fds default qualifier from `DefaultStackSynthesizer.DEFAULT_QUALIFIER` is used
  */
  readonly cdkQualifier?: string;
}

/**
 * A custom CDK Stack that can be synthetized as a self contained CloudFormation template to deploy a CDK application hosted on GitHub.
 * This stack is self contained and can be one-click deployed to any AWS account.
 * It can be used for workshop or blog AWS CDK examples easy deployment.
 * The stack supports passing the CDK application stack name to deploy (in case there are multiple stacks in the CDK app) and CDK parameters.
 *
 * It contains the necessary resources to synchronously deploy a CDK application from a GitHub repository:
 *  * A CodeBuild project to effectively deploy the CDK application
 *  * A StartBuild custom resource to synchronously trigger the build using a callback pattern based on Event Bridge
 *  * The necessary roles
 *
 * The StartBuild CFN custom resource is using the callback pattern to wait for the build completion:
 *  1. a Lambda function starts the build but doesn't return any value to the CFN callback URL. Instead, the callback URL is passed to the build project.
 *  2. the completion of the build trigger an Event and a second Lambda function which checks the result of the build and send information to the CFN callback URL
 *
 *  * Usage example:
 * ```typescript
 * new CdkStandaloneDeployer(AwsNativeRefArchApp, {
 *  githubRepository: 'aws-samples/aws-analytics-reference-architecture',
 *  cdkAppLocation: 'refarch/aws-native',
 *  cdkParameters: {
 *    QuickSightUsername: {
 *      default: 'myuser',
 *      type: 'String',
 *    },
 *    QuickSightIdentityRegion: {
 *      default: 'us-east-1',
 *      type: 'String',
 *    },
 *  },
 * });
 * ```
 */
export class CdkStandaloneDeployer extends cdk.Stack {
  /**
   * The result of the deloyment
   */
  public readonly deployResult: string;

  /**
   * Constructs a new instance of the TrackedConstruct
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {CdkStandaloneDeployerProps} props the CdkStandaloneDeployer [properties]{@link CdkStandaloneDeployerProps}
   */
  constructor(scope: Construct, props: CdkStandaloneDeployerProps) {
    super(scope, 'CDKStandaloneDeployer', {
      description: 'CDK Standalone Deployer (uksb-1tnuj8j40)',
      // Change the Stack Synthetizer to remove the CFN parameters for the CDK version
      synthesizer: new DefaultStackSynthesizer({
        generateBootstrapVersionRule: false,
      }),
    });

    // Add parameters to the stack so it can be transfered to the CDK application
    var parameters: string = '';
    const cdkQualifier = new cdk.CfnParameter(this, 'CDK_QUALIFIER', {
      type: 'String',
      default: props.cdkQualifier ?? DefaultStackSynthesizer.DEFAULT_QUALIFIER,
    });
    for (let name in props.cdkParameters) {
      let param = props.cdkParameters[name];
      let cfnParam = new cdk.CfnParameter(this, name, param);
      parameters = parameters.concat(` -c ${name}=${cfnParam.value}`);
    }

    // Name of the stack to deploy in codebuild
    const stackName = props.stackName ? props.stackName : '';

    // Role used by the CodeBuild project
    const buildRole = new Role(this, 'CodeBuildRole', {
      assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
    });

    // We need the CDK execution role so the CodeBuild role can assume it for CDK deployment
    const cdkDeployRole = Utils.getCdkDeployRole(this, 'CdkDeployRole', cdkQualifier.valueAsString);
    const cdkFilePublishRole = Utils.getCdkFilePublishRole(this, 'CdkFilePublishRole', cdkQualifier.valueAsString);
    const cdkImagePublishRole = Utils.getCdkImagePublishRole(this, 'CdkImagePublishRole', cdkQualifier.valueAsString);

    buildRole.addManagedPolicy(
      new ManagedPolicy(this, 'CdkBuildPolicy', {
        statements: [
          new PolicyStatement({
            resources: ['*'],
            actions: [
              'kms:CreateKey',
              'kms:DisableKey',
              'kms:EnableKeyRotation',
              'kms:TagResource',
              'kms:DescribeKey',
              'kms:ScheduleKeyDeletion',
              'kms:CreateAlias',
              'kms:DeleteAlias',
              'kms:CreateGrant',
              'kms:DescribeKey',
              'kms:RetireGrant',
            ],
          }),
          new PolicyStatement({
            resources: ['*'],
            actions: [
              's3:CreateBucket',
              's3:PutBucketAcl',
              's3:PutEncryptionConfiguration',
              's3:PutBucketPublicAccessBlock',
              's3:PutBucketVersioning',
              's3:DeleteBucket',
              's3:PutBucketPolicy',
            ],
          }),
          new PolicyStatement({
            resources: [`arn:aws:cloudformation:${Aws.REGION}:${Aws.ACCOUNT_ID}:stack/CDKToolkit*`],
            actions: [
              'cloudformation:DescribeStacks',
              'cloudformation:DeleteStack',
              'cloudformation:DeleteChangeSet',
              'cloudformation:CreateChangeSet',
              'cloudformation:DescribeChangeSet',
              'cloudformation:ExecuteChangeSet',
              'cloudformation:DescribeStackEvents',
              'cloudformation:GetTemplate',
            ],
          }),
          new PolicyStatement({
            resources: [cdkDeployRole.roleArn, cdkFilePublishRole.roleArn, cdkImagePublishRole.roleArn],
            actions: ['sts:AssumeRole'],
          }),
          new PolicyStatement({
            resources: [`arn:aws:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/cdk-bootstrap/*/*`],
            actions: ['ssm:PutParameter', 'ssm:GetParameters', 'ssm:GetParameter'],
          }),
          new PolicyStatement({
            resources: [`arn:aws:ecr:${Aws.REGION}:${Aws.ACCOUNT_ID}:repository/cdk*`],
            actions: [
              'ecr:SetRepositoryPolicy',
              'ecr:GetLifecyclePolicy',
              'ecr:PutImageTagMutability',
              'ecr:DescribeRepositories',
              'ecr:ListTagsForResource',
              'ecr:PutImageScanningConfiguration',
              'ecr:CreateRepository',
              'ecr:PutLifecyclePolicy',
              'ecr:SetRepositoryPolicy',
              'ecr:DeleteRepository',
              'ecr:TagResource',
            ],
          }),
          new PolicyStatement({
            resources: [`arn:aws:iam::${Aws.ACCOUNT_ID}:role/cdk*`],
            actions: [
              'iam:GetRole',
              'iam:CreateRole',
              'iam:TagRole',
              'iam:DeleteRole',
              'iam:AttachRolePolicy',
              'iam:DetachRolePolicy',
              'iam:GetRolePolicy',
              'iam:PutRolePolicy',
              'iam:DeleteRolePolicy',
            ],
          }),
          new PolicyStatement({
            resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/codebuild/*`],
            actions: ['logs:PutLogEvents'],
          }),
        ],
      }),
    );

    let source: Source;

    if (props.githubRepository) {
      source = Source.gitHub({
        owner: props.githubRepository!.split('/')[0],
        repo: props.githubRepository!.split('/')[1],
        branchOrRef: props.gitBranch ? props.gitBranch : undefined,
        reportBuildStatus: true,
      });
    } else {
      const cdkAppSourceCodeBucketName = new CfnParameter(this, 'CDKAppSourceCodeBucketName', {
        type: 'String',
        default: props.cdkAppSourceCodeBucketName,
      });

      const cdkAppSourceCodeBucketPrefix = new CfnParameter(this, 'CDKAppSourceCodeBucketPrefix', {
        type: 'String',
        default: props.cdkAppSourceCodeBucketPrefix,
      });

      source = Source.s3({
        bucket: Bucket.fromBucketName(this, 'CdkAppBucket', cdkAppSourceCodeBucketName.valueAsString),
        path: `${cdkAppSourceCodeBucketPrefix.valueAsString}${props.cdkAppSourceCodeZipName}`,
      });
    }

    const codeBuildProject = new Project(this, 'CodeBuildProject', {
      source,
      // use encryptionKey from alias key alias/aws/s3
      encryptionKey: Alias.fromAliasName(this, 'defaultS3KmsKey', 'alias/aws/s3'),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        computeType: ComputeType.SMALL,
        environmentVariables: {
          PARAMETERS: {
            value: parameters,
          },
          STACKNAME: {
            value: stackName,
          },
          CDK_APP_LOCATION: {
            value: props.cdkAppLocation ? props.cdkAppLocation : '',
          },
          CDK_QUALIFIER: {
            value: cdkQualifier.valueAsString,
          },
        },
      },
      role: buildRole,
    });

    const startBuildRole = new Role(this, 'StartBuildRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
      inlinePolicies: {
        StartBuild: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: [codeBuildProject.projectArn],
              actions: ['codebuild:StartBuild'],
            }),
          ],
        }),
      },
    });

    const startBuildFunction = new Function(this, 'StartBuildFunction', {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromInline(startBuild(props.deployBuildSpec, props.destroyBuildSpec)),
      handler: 'index.handler',
      timeout: Duration.seconds(60),
      role: startBuildRole,
    });

    const reportBuildRole = new Role(this, 'ReportBuildRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
      inlinePolicies: {
        ReportBuild: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: [codeBuildProject.projectArn],
              actions: ['codebuild:BatchGetBuilds', 'codebuild:ListBuildsForProject'],
            }),
          ],
        }),
      },
    });

    const reportBuildFunction = new Function(this, 'ReportBuildFunction', {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromInline(reportBuild),
      handler: 'index.handler',
      timeout: Duration.seconds(60),
      role: reportBuildRole,
    });

    const buildCompleteRule = new Rule(this, 'BuildCompleteEvent', {
      eventPattern: {
        source: ['aws.codebuild'],
        detailType: ['CodeBuild Build State Change'],
        detail: {
          'build-status': ['SUCCEEDED', 'FAILED', 'STOPPED'],
          'project-name': [codeBuildProject.projectName],
        },
      },
      targets: [new LambdaFunction(reportBuildFunction)],
    });

    const buildTrigger = new CustomResource(this, 'CodeBuildTriggerCustomResource', {
      serviceToken: startBuildFunction.functionArn,
      properties: {
        ProjectName: codeBuildProject.projectName,
        BuildRoleArn: buildRole.roleArn,
        Parameters: parameters,
        StackName: stackName,
      },
    });

    buildTrigger.node.addDependency(buildCompleteRule);
    buildTrigger.node.addDependency(buildRole);

    this.deployResult = buildTrigger.getAttString('BuildStatus');
  }
}
