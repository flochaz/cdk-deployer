"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkDeployer = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_codebuild_1 = require("aws-cdk-lib/aws-codebuild");
const aws_events_1 = require("aws-cdk-lib/aws-events");
const aws_events_targets_1 = require("aws-cdk-lib/aws-events-targets");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_kms_1 = require("aws-cdk-lib/aws-kms");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const cdk_deployer_build_1 = require("./cdk-deployer-build");
const utils_1 = require("./utils");
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
 * new CdkDeployer(AwsNativeRefArchApp, {
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
class CdkDeployer extends cdk.Stack {
    /**
     * Constructs a new instance of the TrackedConstruct
     * @param {Construct} scope the Scope of the CDK Construct
     * @param {string} id the ID of the CDK Construct
     * @param {CdkDeployerProps} props the CdkDeployer [properties]{@link CdkDeployerProps}
     */
    constructor(scope, props) {
        super(scope, 'CDKDeployer', {
            // Change the Stack Synthetizer to remove the CFN parameters for the CDK version
            synthesizer: new aws_cdk_lib_1.DefaultStackSynthesizer({
                generateBootstrapVersionRule: false,
            }),
        });
        // Add parameters to the stack so it can be transfered to the CDK application
        var parameters = '';
        for (let name in props.cdkParameters) {
            let param = props.cdkParameters[name];
            let cfnParam = new cdk.CfnParameter(this, name, param);
            parameters = parameters.concat(` -c ${name}=${cfnParam.value}`);
        }
        // Name of the stack to deploy in codebuild
        const stackName = props.stackName ? props.stackName : '';
        // Role used by the CodeBuild project
        const buildRole = new aws_iam_1.Role(this, 'CodeBuildRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('codebuild.amazonaws.com'),
        });
        // We need the CDK execution role so the CodeBuild role can assume it for CDK deployment
        const cdkDeployRole = utils_1.Utils.getCdkDeployRole(this, 'CdkDeployRole');
        const cdkPublishRole = utils_1.Utils.getCdkFilePublishRole(this, 'CdkPublishRole');
        buildRole.addManagedPolicy(new aws_iam_1.ManagedPolicy(this, 'CdkBuildPolicy', {
            statements: [
                new aws_iam_1.PolicyStatement({
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
                new aws_iam_1.PolicyStatement({
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
                new aws_iam_1.PolicyStatement({
                    resources: [`arn:aws:cloudformation:${aws_cdk_lib_1.Aws.REGION}:${aws_cdk_lib_1.Aws.ACCOUNT_ID}:stack/CDKToolkit*`],
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
                new aws_iam_1.PolicyStatement({
                    resources: [cdkDeployRole.roleArn, cdkPublishRole.roleArn],
                    actions: ['sts:AssumeRole'],
                }),
                new aws_iam_1.PolicyStatement({
                    resources: [`arn:aws:ssm:${aws_cdk_lib_1.Aws.REGION}:${aws_cdk_lib_1.Aws.ACCOUNT_ID}:parameter/cdk-bootstrap/*/*`],
                    actions: ['ssm:PutParameter', 'ssm:GetParameters'],
                }),
                new aws_iam_1.PolicyStatement({
                    resources: [`arn:aws:ecr:${aws_cdk_lib_1.Aws.REGION}:${aws_cdk_lib_1.Aws.ACCOUNT_ID}:repository/cdk*`],
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
                new aws_iam_1.PolicyStatement({
                    resources: [`arn:aws:iam::${aws_cdk_lib_1.Aws.ACCOUNT_ID}:role/cdk*`],
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
                new aws_iam_1.PolicyStatement({
                    resources: [`arn:aws:logs:${aws_cdk_lib_1.Aws.REGION}:${aws_cdk_lib_1.Aws.ACCOUNT_ID}:log-group:/aws/codebuild/*`],
                    actions: ['logs:PutLogEvents'],
                }),
            ],
        }));
        let source;
        if (props.githubRepository) {
            source = aws_codebuild_1.Source.gitHub({
                owner: props.githubRepository.split('/')[0],
                repo: props.githubRepository.split('/')[1],
                branchOrRef: props.gitBranch ? props.gitBranch : undefined,
                reportBuildStatus: true,
            });
        }
        else {
            const cdkAppSourceCodeBucketName = new aws_cdk_lib_1.CfnParameter(this, 'CDKAppSourceCodeBucketName', {
                type: 'String',
                default: props.cdkAppSourceCodeBucketName,
            });
            const cdkAppSourceCodeBucketPrefix = new aws_cdk_lib_1.CfnParameter(this, 'CDKAppSourceCodeBucketPrefix', {
                type: 'String',
                default: props.cdkAppSourceCodeBucketPrefix,
            });
            source = aws_codebuild_1.Source.s3({
                bucket: aws_s3_1.Bucket.fromBucketName(this, 'CdkAppBucket', cdkAppSourceCodeBucketName.valueAsString),
                path: `${cdkAppSourceCodeBucketPrefix.valueAsString}${props.cdkAppSourceCodeZipName}`,
            });
        }
        const codeBuildProject = new aws_codebuild_1.Project(this, 'CodeBuildProject', {
            source,
            // use encryptionKey from alias key alias/aws/s3
            encryptionKey: aws_kms_1.Alias.fromAliasName(this, 'defaultS3KmsKey', 'alias/aws/s3'),
            environment: {
                buildImage: aws_codebuild_1.LinuxBuildImage.STANDARD_5_0,
                computeType: aws_codebuild_1.ComputeType.SMALL,
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
                },
            },
            role: buildRole,
        });
        const startBuildRole = new aws_iam_1.Role(this, 'StartBuildRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
            inlinePolicies: {
                StartBuild: new aws_iam_1.PolicyDocument({
                    statements: [
                        new aws_iam_1.PolicyStatement({
                            resources: [codeBuildProject.projectArn],
                            actions: ['codebuild:StartBuild'],
                        }),
                    ],
                }),
            },
        });
        const startBuildFunction = new aws_lambda_1.Function(this, 'StartBuildFunction', {
            runtime: aws_lambda_1.Runtime.NODEJS_16_X,
            code: aws_lambda_1.Code.fromInline(cdk_deployer_build_1.startBuild(props.deployBuildSpec, props.destroyBuildSpec)),
            handler: 'index.handler',
            timeout: aws_cdk_lib_1.Duration.seconds(60),
            role: startBuildRole,
        });
        const reportBuildRole = new aws_iam_1.Role(this, 'ReportBuildRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
            inlinePolicies: {
                ReportBuild: new aws_iam_1.PolicyDocument({
                    statements: [
                        new aws_iam_1.PolicyStatement({
                            resources: [codeBuildProject.projectArn],
                            actions: ['codebuild:BatchGetBuilds', 'codebuild:ListBuildsForProject'],
                        }),
                    ],
                }),
            },
        });
        const reportBuildFunction = new aws_lambda_1.Function(this, 'ReportBuildFunction', {
            runtime: aws_lambda_1.Runtime.NODEJS_16_X,
            code: aws_lambda_1.Code.fromInline(cdk_deployer_build_1.reportBuild),
            handler: 'index.handler',
            timeout: aws_cdk_lib_1.Duration.seconds(60),
            role: reportBuildRole,
        });
        const buildCompleteRule = new aws_events_1.Rule(this, 'BuildCompleteEvent', {
            eventPattern: {
                source: ['aws.codebuild'],
                detailType: ['CodeBuild Build State Change'],
                detail: {
                    'build-status': ['SUCCEEDED', 'FAILED', 'STOPPED'],
                    'project-name': [codeBuildProject.projectName],
                },
            },
            targets: [new aws_events_targets_1.LambdaFunction(reportBuildFunction)],
        });
        const buildTrigger = new aws_cdk_lib_1.CustomResource(this, 'CodeBuildTriggerCustomResource', {
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
exports.CdkDeployer = CdkDeployer;
_a = JSII_RTTI_SYMBOL_1;
CdkDeployer[_a] = { fqn: "cdk-deployer.CdkDeployer", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWRlcGxveWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnN0cnVjdC9jZGstZGVwbG95ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxRUFBcUU7QUFDckUsaUNBQWlDO0FBRWpDLG1DQUFtQztBQUNuQyw2Q0FBbUc7QUFDbkcsNkRBQXFHO0FBQ3JHLHVEQUE4QztBQUM5Qyx1RUFBZ0U7QUFDaEUsaURBQTZHO0FBQzdHLGlEQUE0QztBQUM1Qyx1REFBaUU7QUFDakUsK0NBQTRDO0FBRTVDLDZEQUErRDtBQUMvRCxtQ0FBZ0M7QUE4RGhDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWdDRztBQUNILE1BQWEsV0FBWSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBTXhDOzs7OztPQUtHO0lBQ0gsWUFBWSxLQUFnQixFQUFFLEtBQXVCO1FBQ25ELEtBQUssQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFO1lBQzFCLGdGQUFnRjtZQUNoRixXQUFXLEVBQUUsSUFBSSxxQ0FBdUIsQ0FBQztnQkFDdkMsNEJBQTRCLEVBQUUsS0FBSzthQUNwQyxDQUFDO1NBQ0gsQ0FBQyxDQUFDO1FBRUgsNkVBQTZFO1FBQzdFLElBQUksVUFBVSxHQUFXLEVBQUUsQ0FBQztRQUM1QixLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUU7WUFDcEMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxJQUFJLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RCxVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNqRTtRQUVELDJDQUEyQztRQUMzQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFekQscUNBQXFDO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDaEQsU0FBUyxFQUFFLElBQUksMEJBQWdCLENBQUMseUJBQXlCLENBQUM7U0FDM0QsQ0FBQyxDQUFDO1FBRUgsd0ZBQXdGO1FBQ3hGLE1BQU0sYUFBYSxHQUFHLGFBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDcEUsTUFBTSxjQUFjLEdBQUcsYUFBSyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTNFLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FDeEIsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN4QyxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSx5QkFBZSxDQUFDO29CQUNsQixTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7b0JBQ2hCLE9BQU8sRUFBRTt3QkFDUCxlQUFlO3dCQUNmLGdCQUFnQjt3QkFDaEIsdUJBQXVCO3dCQUN2QixpQkFBaUI7d0JBQ2pCLGlCQUFpQjt3QkFDakIseUJBQXlCO3dCQUN6QixpQkFBaUI7d0JBQ2pCLGlCQUFpQjt3QkFDakIsaUJBQWlCO3dCQUNqQixpQkFBaUI7d0JBQ2pCLGlCQUFpQjtxQkFDbEI7aUJBQ0YsQ0FBQztnQkFDRixJQUFJLHlCQUFlLENBQUM7b0JBQ2xCLFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztvQkFDaEIsT0FBTyxFQUFFO3dCQUNQLGlCQUFpQjt3QkFDakIsaUJBQWlCO3dCQUNqQiwrQkFBK0I7d0JBQy9CLCtCQUErQjt3QkFDL0Isd0JBQXdCO3dCQUN4QixpQkFBaUI7d0JBQ2pCLG9CQUFvQjtxQkFDckI7aUJBQ0YsQ0FBQztnQkFDRixJQUFJLHlCQUFlLENBQUM7b0JBQ2xCLFNBQVMsRUFBRSxDQUFDLDBCQUEwQixpQkFBRyxDQUFDLE1BQU0sSUFBSSxpQkFBRyxDQUFDLFVBQVUsb0JBQW9CLENBQUM7b0JBQ3ZGLE9BQU8sRUFBRTt3QkFDUCwrQkFBK0I7d0JBQy9CLDRCQUE0Qjt3QkFDNUIsZ0NBQWdDO3dCQUNoQyxnQ0FBZ0M7d0JBQ2hDLGtDQUFrQzt3QkFDbEMsaUNBQWlDO3dCQUNqQyxvQ0FBb0M7d0JBQ3BDLDRCQUE0QjtxQkFDN0I7aUJBQ0YsQ0FBQztnQkFDRixJQUFJLHlCQUFlLENBQUM7b0JBQ2xCLFNBQVMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQztvQkFDMUQsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7aUJBQzVCLENBQUM7Z0JBQ0YsSUFBSSx5QkFBZSxDQUFDO29CQUNsQixTQUFTLEVBQUUsQ0FBQyxlQUFlLGlCQUFHLENBQUMsTUFBTSxJQUFJLGlCQUFHLENBQUMsVUFBVSw4QkFBOEIsQ0FBQztvQkFDdEYsT0FBTyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsbUJBQW1CLENBQUM7aUJBQ25ELENBQUM7Z0JBQ0YsSUFBSSx5QkFBZSxDQUFDO29CQUNsQixTQUFTLEVBQUUsQ0FBQyxlQUFlLGlCQUFHLENBQUMsTUFBTSxJQUFJLGlCQUFHLENBQUMsVUFBVSxrQkFBa0IsQ0FBQztvQkFDMUUsT0FBTyxFQUFFO3dCQUNQLHlCQUF5Qjt3QkFDekIsd0JBQXdCO3dCQUN4QiwyQkFBMkI7d0JBQzNCLDBCQUEwQjt3QkFDMUIseUJBQXlCO3dCQUN6QixtQ0FBbUM7d0JBQ25DLHNCQUFzQjt3QkFDdEIsd0JBQXdCO3dCQUN4Qix5QkFBeUI7d0JBQ3pCLHNCQUFzQjt3QkFDdEIsaUJBQWlCO3FCQUNsQjtpQkFDRixDQUFDO2dCQUNGLElBQUkseUJBQWUsQ0FBQztvQkFDbEIsU0FBUyxFQUFFLENBQUMsZ0JBQWdCLGlCQUFHLENBQUMsVUFBVSxZQUFZLENBQUM7b0JBQ3ZELE9BQU8sRUFBRTt3QkFDUCxhQUFhO3dCQUNiLGdCQUFnQjt3QkFDaEIsYUFBYTt3QkFDYixnQkFBZ0I7d0JBQ2hCLHNCQUFzQjt3QkFDdEIsc0JBQXNCO3dCQUN0QixtQkFBbUI7d0JBQ25CLG1CQUFtQjt3QkFDbkIsc0JBQXNCO3FCQUN2QjtpQkFDRixDQUFDO2dCQUNGLElBQUkseUJBQWUsQ0FBQztvQkFDbEIsU0FBUyxFQUFFLENBQUMsZ0JBQWdCLGlCQUFHLENBQUMsTUFBTSxJQUFJLGlCQUFHLENBQUMsVUFBVSw2QkFBNkIsQ0FBQztvQkFDdEYsT0FBTyxFQUFFLENBQUMsbUJBQW1CLENBQUM7aUJBQy9CLENBQUM7YUFDSDtTQUNGLENBQUMsQ0FDSCxDQUFDO1FBRUYsSUFBSSxNQUFjLENBQUM7UUFFbkIsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7WUFDMUIsTUFBTSxHQUFHLHNCQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNyQixLQUFLLEVBQUUsS0FBSyxDQUFDLGdCQUFpQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLElBQUksRUFBRSxLQUFLLENBQUMsZ0JBQWlCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsV0FBVyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQzFELGlCQUFpQixFQUFFLElBQUk7YUFDeEIsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSwwQkFBWSxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtnQkFDdEYsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLEtBQUssQ0FBQywwQkFBMEI7YUFDMUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLDBCQUFZLENBQUMsSUFBSSxFQUFFLDhCQUE4QixFQUFFO2dCQUMxRixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsS0FBSyxDQUFDLDRCQUE0QjthQUM1QyxDQUFDLENBQUM7WUFFSCxNQUFNLEdBQUcsc0JBQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sRUFBRSxlQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsMEJBQTBCLENBQUMsYUFBYSxDQUFDO2dCQUM3RixJQUFJLEVBQUUsR0FBRyw0QkFBNEIsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixFQUFFO2FBQ3RGLENBQUMsQ0FBQztTQUNKO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHVCQUFPLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzdELE1BQU07WUFDTixnREFBZ0Q7WUFDaEQsYUFBYSxFQUFFLGVBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztZQUMzRSxXQUFXLEVBQUU7Z0JBQ1gsVUFBVSxFQUFFLCtCQUFlLENBQUMsWUFBWTtnQkFDeEMsV0FBVyxFQUFFLDJCQUFXLENBQUMsS0FBSztnQkFDOUIsb0JBQW9CLEVBQUU7b0JBQ3BCLFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsVUFBVTtxQkFDbEI7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULEtBQUssRUFBRSxTQUFTO3FCQUNqQjtvQkFDRCxnQkFBZ0IsRUFBRTt3QkFDaEIsS0FBSyxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUU7cUJBQ3hEO2lCQUNGO2FBQ0Y7WUFDRCxJQUFJLEVBQUUsU0FBUztTQUNoQixDQUFDLENBQUM7UUFFSCxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDdEQsU0FBUyxFQUFFLElBQUksMEJBQWdCLENBQUMsc0JBQXNCLENBQUM7WUFDdkQsZUFBZSxFQUFFLENBQUMsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3JHLGNBQWMsRUFBRTtnQkFDZCxVQUFVLEVBQUUsSUFBSSx3QkFBYyxDQUFDO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSx5QkFBZSxDQUFDOzRCQUNsQixTQUFTLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUM7NEJBQ3hDLE9BQU8sRUFBRSxDQUFDLHNCQUFzQixDQUFDO3lCQUNsQyxDQUFDO3FCQUNIO2lCQUNGLENBQUM7YUFDSDtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxxQkFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUNsRSxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLElBQUksRUFBRSxpQkFBSSxDQUFDLFVBQVUsQ0FBQywrQkFBVSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDaEYsT0FBTyxFQUFFLGVBQWU7WUFDeEIsT0FBTyxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsY0FBYztTQUNyQixDQUFDLENBQUM7UUFFSCxNQUFNLGVBQWUsR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDeEQsU0FBUyxFQUFFLElBQUksMEJBQWdCLENBQUMsc0JBQXNCLENBQUM7WUFDdkQsZUFBZSxFQUFFLENBQUMsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3JHLGNBQWMsRUFBRTtnQkFDZCxXQUFXLEVBQUUsSUFBSSx3QkFBYyxDQUFDO29CQUM5QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSx5QkFBZSxDQUFDOzRCQUNsQixTQUFTLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUM7NEJBQ3hDLE9BQU8sRUFBRSxDQUFDLDBCQUEwQixFQUFFLGdDQUFnQyxDQUFDO3lCQUN4RSxDQUFDO3FCQUNIO2lCQUNGLENBQUM7YUFDSDtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxxQkFBUSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNwRSxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLElBQUksRUFBRSxpQkFBSSxDQUFDLFVBQVUsQ0FBQyxnQ0FBVyxDQUFDO1lBQ2xDLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLE9BQU8sRUFBRSxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLGVBQWU7U0FDdEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGlCQUFJLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQzdELFlBQVksRUFBRTtnQkFDWixNQUFNLEVBQUUsQ0FBQyxlQUFlLENBQUM7Z0JBQ3pCLFVBQVUsRUFBRSxDQUFDLDhCQUE4QixDQUFDO2dCQUM1QyxNQUFNLEVBQUU7b0JBQ04sY0FBYyxFQUFFLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUM7b0JBQ2xELGNBQWMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztpQkFDL0M7YUFDRjtZQUNELE9BQU8sRUFBRSxDQUFDLElBQUksbUNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ25ELENBQUMsQ0FBQztRQUVILE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQWMsQ0FBQyxJQUFJLEVBQUUsZ0NBQWdDLEVBQUU7WUFDOUUsWUFBWSxFQUFFLGtCQUFrQixDQUFDLFdBQVc7WUFDNUMsVUFBVSxFQUFFO2dCQUNWLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUUsU0FBUyxDQUFDLE9BQU87Z0JBQy9CLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixTQUFTLEVBQUUsU0FBUzthQUNyQjtTQUNGLENBQUMsQ0FBQztRQUVILFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbkQsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQy9ELENBQUM7O0FBMVBILGtDQTJQQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVC0wXG5cbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBBd3MsIENmblBhcmFtZXRlciwgQ3VzdG9tUmVzb3VyY2UsIERlZmF1bHRTdGFja1N5bnRoZXNpemVyLCBEdXJhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbXB1dGVUeXBlLCBMaW51eEJ1aWxkSW1hZ2UsIFByb2plY3QsIFNvdXJjZSwgQnVpbGRTcGVjIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZCc7XG5pbXBvcnQgeyBSdWxlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWV2ZW50cyc7XG5pbXBvcnQgeyBMYW1iZGFGdW5jdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBNYW5hZ2VkUG9saWN5LCBQb2xpY3lEb2N1bWVudCwgUG9saWN5U3RhdGVtZW50LCBSb2xlLCBTZXJ2aWNlUHJpbmNpcGFsIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBBbGlhcyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1rbXMnO1xuaW1wb3J0IHsgQ29kZSwgRnVuY3Rpb24sIFJ1bnRpbWUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IEJ1Y2tldCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IHN0YXJ0QnVpbGQsIHJlcG9ydEJ1aWxkIH0gZnJvbSAnLi9jZGstZGVwbG95ZXItYnVpbGQnO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBUaGUgcHJvcGVydGllcyBmb3IgdGhlIENka0RlcGxveWVyIGNvbnN0cnVjdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDZGtEZXBsb3llclByb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICAvLyBUT0RPIDogYWRkIGdpdGh1YiB0b2tlbiBmb3IgcHJpdmF0ZSByZXBvXG5cbiAgLyoqXG4gICAqIFRoZSBDREsgc3RhY2sgbmFtZSB0byBkZXBsb3lcbiAgICogQGRlZmF1bHQgLSBUaGUgZGVmYXVsdCBzdGFjayBpcyBkZXBsb3llZFxuICAgKi9cbiAgcmVhZG9ubHkgY2RrU3RhY2s/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBDRk4gcGFyYW1ldGVycyB0byBwYXNzIHRvIHRoZSBDREsgYXBwbGljYXRpb25cbiAgICogQGRlZmF1bHQgLSBObyBwYXJhbWV0ZXIgaXMgdXNlZFxuICAgKi9cbiAgcmVhZG9ubHkgY2RrUGFyYW1ldGVycz86IHsgW25hbWU6IHN0cmluZ106IGNkay5DZm5QYXJhbWV0ZXJQcm9wcyB9O1xuXG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiB0aGUgUzMgYnVja2V0IHdoZXJlIHRoZSBDREsgYXBwbGljYXRpb24gc291cmNlIGNvZGUgemlwIGlzIHN0b3JlZC5cbiAgICovXG4gIHJlYWRvbmx5IGNka0FwcFNvdXJjZUNvZGVCdWNrZXROYW1lPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgcHJlZml4IG9mIHRoZSBTMyBidWNrZXQgd2hlcmUgdGhlIENESyBhcHBsaWNhdGlvbiBzb3VyY2UgY29kZSB6aXAgaXMgc3RvcmVkLlxuICAgKi9cbiAgcmVhZG9ubHkgY2RrQXBwU291cmNlQ29kZUJ1Y2tldFByZWZpeD86IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIHppcCBmaWxlIGNvbnRhaW5pbmcgdGhlIENESyBhcHBsaWNhdGlvbiBzb3VyY2UgY29kZS5cbiAgICovXG4gIHJlYWRvbmx5IGNka0FwcFNvdXJjZUNvZGVaaXBOYW1lPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgZ2l0aHViIHJlcG9zaXRvcnkgY29udGFpbmluZyB0aGUgQ0RLIGFwcGxpY2F0aW9uXG4gICAqL1xuICByZWFkb25seSBnaXRodWJSZXBvc2l0b3J5Pzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIGxvY2F0aW9uIG9mIHRoZSBDREsgYXBwbGljYXRpb24gaW4gdGhlIEdpdGh1YiByZXBvc2l0b3J5LlxuICAgKiBJdCBpcyB1c2VkIHRvIGBjZGAgaW50byB0aGUgZm9sZGVyIGJlZm9yZSBkZXBsb3lpbmcgdGhlIENESyBhcHBsaWNhdGlvblxuICAgKiBAZGVmYXVsdCAtIFRoZSByb290IG9mIHRoZSByZXBvc2l0b3J5XG4gICAqL1xuICByZWFkb25seSBjZGtBcHBMb2NhdGlvbj86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBicmFuY2ggdG8gdXNlIG9uIHRoZSBHaXRodWIgcmVwb3NpdG9yeS5cbiAgICogQGRlZmF1bHQgLSBUaGUgbWFpbiBicmFuY2ggb2YgdGhlIHJlcG9zaXRvcnlcbiAgICovXG4gIHJlYWRvbmx5IGdpdEJyYW5jaD86IHN0cmluZztcblxuICAvKipcbiAgICogRGVwbG95IENvZGVCdWlsZCBidWlsZHNwZWMgZmlsZSBuYW1lIGF0IHRoZSByb290IG9mIHRoZSBjZGsgYXBwIGZvbGRlclxuICAgKi9cbiAgcmVhZG9ubHkgZGVwbG95QnVpbGRTcGVjPzogQnVpbGRTcGVjO1xuXG4gIC8qKlxuICAgKiBEZXN0cm95IENvZGVidWlsZCBidWlsZHNwZWMgZmlsZSBuYW1lIGF0IHRoZSByb290IG9mIHRoZSBjZGsgYXBwIGZvbGRlclxuICAgKi9cbiAgcmVhZG9ubHkgZGVzdHJveUJ1aWxkU3BlYz86IEJ1aWxkU3BlYztcbn1cblxuLyoqXG4gKiBBIGN1c3RvbSBDREsgU3RhY2sgdGhhdCBjYW4gYmUgc3ludGhldGl6ZWQgYXMgYSBzZWxmIGNvbnRhaW5lZCBDbG91ZEZvcm1hdGlvbiB0ZW1wbGF0ZSB0byBkZXBsb3kgYSBDREsgYXBwbGljYXRpb24gaG9zdGVkIG9uIEdpdEh1Yi5cbiAqIFRoaXMgc3RhY2sgaXMgc2VsZiBjb250YWluZWQgYW5kIGNhbiBiZSBvbmUtY2xpY2sgZGVwbG95ZWQgdG8gYW55IEFXUyBhY2NvdW50LlxuICogSXQgY2FuIGJlIHVzZWQgZm9yIHdvcmtzaG9wIG9yIGJsb2cgQVdTIENESyBleGFtcGxlcyBlYXN5IGRlcGxveW1lbnQuXG4gKiBUaGUgc3RhY2sgc3VwcG9ydHMgcGFzc2luZyB0aGUgQ0RLIGFwcGxpY2F0aW9uIHN0YWNrIG5hbWUgdG8gZGVwbG95IChpbiBjYXNlIHRoZXJlIGFyZSBtdWx0aXBsZSBzdGFja3MgaW4gdGhlIENESyBhcHApIGFuZCBDREsgcGFyYW1ldGVycy5cbiAqXG4gKiBJdCBjb250YWlucyB0aGUgbmVjZXNzYXJ5IHJlc291cmNlcyB0byBzeW5jaHJvbm91c2x5IGRlcGxveSBhIENESyBhcHBsaWNhdGlvbiBmcm9tIGEgR2l0SHViIHJlcG9zaXRvcnk6XG4gKiAgKiBBIENvZGVCdWlsZCBwcm9qZWN0IHRvIGVmZmVjdGl2ZWx5IGRlcGxveSB0aGUgQ0RLIGFwcGxpY2F0aW9uXG4gKiAgKiBBIFN0YXJ0QnVpbGQgY3VzdG9tIHJlc291cmNlIHRvIHN5bmNocm9ub3VzbHkgdHJpZ2dlciB0aGUgYnVpbGQgdXNpbmcgYSBjYWxsYmFjayBwYXR0ZXJuIGJhc2VkIG9uIEV2ZW50IEJyaWRnZVxuICogICogVGhlIG5lY2Vzc2FyeSByb2xlc1xuICpcbiAqIFRoZSBTdGFydEJ1aWxkIENGTiBjdXN0b20gcmVzb3VyY2UgaXMgdXNpbmcgdGhlIGNhbGxiYWNrIHBhdHRlcm4gdG8gd2FpdCBmb3IgdGhlIGJ1aWxkIGNvbXBsZXRpb246XG4gKiAgMS4gYSBMYW1iZGEgZnVuY3Rpb24gc3RhcnRzIHRoZSBidWlsZCBidXQgZG9lc24ndCByZXR1cm4gYW55IHZhbHVlIHRvIHRoZSBDRk4gY2FsbGJhY2sgVVJMLiBJbnN0ZWFkLCB0aGUgY2FsbGJhY2sgVVJMIGlzIHBhc3NlZCB0byB0aGUgYnVpbGQgcHJvamVjdC5cbiAqICAyLiB0aGUgY29tcGxldGlvbiBvZiB0aGUgYnVpbGQgdHJpZ2dlciBhbiBFdmVudCBhbmQgYSBzZWNvbmQgTGFtYmRhIGZ1bmN0aW9uIHdoaWNoIGNoZWNrcyB0aGUgcmVzdWx0IG9mIHRoZSBidWlsZCBhbmQgc2VuZCBpbmZvcm1hdGlvbiB0byB0aGUgQ0ZOIGNhbGxiYWNrIFVSTFxuICpcbiAqICAqIFVzYWdlIGV4YW1wbGU6XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBuZXcgQ2RrRGVwbG95ZXIoQXdzTmF0aXZlUmVmQXJjaEFwcCwge1xuICogIGdpdGh1YlJlcG9zaXRvcnk6ICdhd3Mtc2FtcGxlcy9hd3MtYW5hbHl0aWNzLXJlZmVyZW5jZS1hcmNoaXRlY3R1cmUnLFxuICogIGNka0FwcExvY2F0aW9uOiAncmVmYXJjaC9hd3MtbmF0aXZlJyxcbiAqICBjZGtQYXJhbWV0ZXJzOiB7XG4gKiAgICBRdWlja1NpZ2h0VXNlcm5hbWU6IHtcbiAqICAgICAgZGVmYXVsdDogJ215dXNlcicsXG4gKiAgICAgIHR5cGU6ICdTdHJpbmcnLFxuICogICAgfSxcbiAqICAgIFF1aWNrU2lnaHRJZGVudGl0eVJlZ2lvbjoge1xuICogICAgICBkZWZhdWx0OiAndXMtZWFzdC0xJyxcbiAqICAgICAgdHlwZTogJ1N0cmluZycsXG4gKiAgICB9LFxuICogIH0sXG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgQ2RrRGVwbG95ZXIgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAvKipcbiAgICogVGhlIHJlc3VsdCBvZiB0aGUgZGVsb3ltZW50XG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgZGVwbG95UmVzdWx0OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIFRyYWNrZWRDb25zdHJ1Y3RcbiAgICogQHBhcmFtIHtDb25zdHJ1Y3R9IHNjb3BlIHRoZSBTY29wZSBvZiB0aGUgQ0RLIENvbnN0cnVjdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdGhlIElEIG9mIHRoZSBDREsgQ29uc3RydWN0XG4gICAqIEBwYXJhbSB7Q2RrRGVwbG95ZXJQcm9wc30gcHJvcHMgdGhlIENka0RlcGxveWVyIFtwcm9wZXJ0aWVzXXtAbGluayBDZGtEZXBsb3llclByb3BzfVxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgcHJvcHM6IENka0RlcGxveWVyUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgJ0NES0RlcGxveWVyJywge1xuICAgICAgLy8gQ2hhbmdlIHRoZSBTdGFjayBTeW50aGV0aXplciB0byByZW1vdmUgdGhlIENGTiBwYXJhbWV0ZXJzIGZvciB0aGUgQ0RLIHZlcnNpb25cbiAgICAgIHN5bnRoZXNpemVyOiBuZXcgRGVmYXVsdFN0YWNrU3ludGhlc2l6ZXIoe1xuICAgICAgICBnZW5lcmF0ZUJvb3RzdHJhcFZlcnNpb25SdWxlOiBmYWxzZSxcbiAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIHBhcmFtZXRlcnMgdG8gdGhlIHN0YWNrIHNvIGl0IGNhbiBiZSB0cmFuc2ZlcmVkIHRvIHRoZSBDREsgYXBwbGljYXRpb25cbiAgICB2YXIgcGFyYW1ldGVyczogc3RyaW5nID0gJyc7XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wcy5jZGtQYXJhbWV0ZXJzKSB7XG4gICAgICBsZXQgcGFyYW0gPSBwcm9wcy5jZGtQYXJhbWV0ZXJzW25hbWVdO1xuICAgICAgbGV0IGNmblBhcmFtID0gbmV3IGNkay5DZm5QYXJhbWV0ZXIodGhpcywgbmFtZSwgcGFyYW0pO1xuICAgICAgcGFyYW1ldGVycyA9IHBhcmFtZXRlcnMuY29uY2F0KGAgLWMgJHtuYW1lfT0ke2NmblBhcmFtLnZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIE5hbWUgb2YgdGhlIHN0YWNrIHRvIGRlcGxveSBpbiBjb2RlYnVpbGRcbiAgICBjb25zdCBzdGFja05hbWUgPSBwcm9wcy5zdGFja05hbWUgPyBwcm9wcy5zdGFja05hbWUgOiAnJztcblxuICAgIC8vIFJvbGUgdXNlZCBieSB0aGUgQ29kZUJ1aWxkIHByb2plY3RcbiAgICBjb25zdCBidWlsZFJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnQ29kZUJ1aWxkUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2NvZGVidWlsZC5hbWF6b25hd3MuY29tJyksXG4gICAgfSk7XG5cbiAgICAvLyBXZSBuZWVkIHRoZSBDREsgZXhlY3V0aW9uIHJvbGUgc28gdGhlIENvZGVCdWlsZCByb2xlIGNhbiBhc3N1bWUgaXQgZm9yIENESyBkZXBsb3ltZW50XG4gICAgY29uc3QgY2RrRGVwbG95Um9sZSA9IFV0aWxzLmdldENka0RlcGxveVJvbGUodGhpcywgJ0Nka0RlcGxveVJvbGUnKTtcbiAgICBjb25zdCBjZGtQdWJsaXNoUm9sZSA9IFV0aWxzLmdldENka0ZpbGVQdWJsaXNoUm9sZSh0aGlzLCAnQ2RrUHVibGlzaFJvbGUnKTtcblxuICAgIGJ1aWxkUm9sZS5hZGRNYW5hZ2VkUG9saWN5KFxuICAgICAgbmV3IE1hbmFnZWRQb2xpY3kodGhpcywgJ0Nka0J1aWxkUG9saWN5Jywge1xuICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAna21zOkNyZWF0ZUtleScsXG4gICAgICAgICAgICAgICdrbXM6RGlzYWJsZUtleScsXG4gICAgICAgICAgICAgICdrbXM6RW5hYmxlS2V5Um90YXRpb24nLFxuICAgICAgICAgICAgICAna21zOlRhZ1Jlc291cmNlJyxcbiAgICAgICAgICAgICAgJ2ttczpEZXNjcmliZUtleScsXG4gICAgICAgICAgICAgICdrbXM6U2NoZWR1bGVLZXlEZWxldGlvbicsXG4gICAgICAgICAgICAgICdrbXM6Q3JlYXRlQWxpYXMnLFxuICAgICAgICAgICAgICAna21zOkRlbGV0ZUFsaWFzJyxcbiAgICAgICAgICAgICAgJ2ttczpDcmVhdGVHcmFudCcsXG4gICAgICAgICAgICAgICdrbXM6RGVzY3JpYmVLZXknLFxuICAgICAgICAgICAgICAna21zOlJldGlyZUdyYW50JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAnczM6Q3JlYXRlQnVja2V0JyxcbiAgICAgICAgICAgICAgJ3MzOlB1dEJ1Y2tldEFjbCcsXG4gICAgICAgICAgICAgICdzMzpQdXRFbmNyeXB0aW9uQ29uZmlndXJhdGlvbicsXG4gICAgICAgICAgICAgICdzMzpQdXRCdWNrZXRQdWJsaWNBY2Nlc3NCbG9jaycsXG4gICAgICAgICAgICAgICdzMzpQdXRCdWNrZXRWZXJzaW9uaW5nJyxcbiAgICAgICAgICAgICAgJ3MzOkRlbGV0ZUJ1Y2tldCcsXG4gICAgICAgICAgICAgICdzMzpQdXRCdWNrZXRQb2xpY3knLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmNsb3VkZm9ybWF0aW9uOiR7QXdzLlJFR0lPTn06JHtBd3MuQUNDT1VOVF9JRH06c3RhY2svQ0RLVG9vbGtpdCpgXSxcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgJ2Nsb3VkZm9ybWF0aW9uOkRlc2NyaWJlU3RhY2tzJyxcbiAgICAgICAgICAgICAgJ2Nsb3VkZm9ybWF0aW9uOkRlbGV0ZVN0YWNrJyxcbiAgICAgICAgICAgICAgJ2Nsb3VkZm9ybWF0aW9uOkRlbGV0ZUNoYW5nZVNldCcsXG4gICAgICAgICAgICAgICdjbG91ZGZvcm1hdGlvbjpDcmVhdGVDaGFuZ2VTZXQnLFxuICAgICAgICAgICAgICAnY2xvdWRmb3JtYXRpb246RGVzY3JpYmVDaGFuZ2VTZXQnLFxuICAgICAgICAgICAgICAnY2xvdWRmb3JtYXRpb246RXhlY3V0ZUNoYW5nZVNldCcsXG4gICAgICAgICAgICAgICdjbG91ZGZvcm1hdGlvbjpEZXNjcmliZVN0YWNrRXZlbnRzJyxcbiAgICAgICAgICAgICAgJ2Nsb3VkZm9ybWF0aW9uOkdldFRlbXBsYXRlJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICByZXNvdXJjZXM6IFtjZGtEZXBsb3lSb2xlLnJvbGVBcm4sIGNka1B1Ymxpc2hSb2xlLnJvbGVBcm5dLFxuICAgICAgICAgICAgYWN0aW9uczogWydzdHM6QXNzdW1lUm9sZSddLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6c3NtOiR7QXdzLlJFR0lPTn06JHtBd3MuQUNDT1VOVF9JRH06cGFyYW1ldGVyL2Nkay1ib290c3RyYXAvKi8qYF0sXG4gICAgICAgICAgICBhY3Rpb25zOiBbJ3NzbTpQdXRQYXJhbWV0ZXInLCAnc3NtOkdldFBhcmFtZXRlcnMnXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmVjcjoke0F3cy5SRUdJT059OiR7QXdzLkFDQ09VTlRfSUR9OnJlcG9zaXRvcnkvY2RrKmBdLFxuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAnZWNyOlNldFJlcG9zaXRvcnlQb2xpY3knLFxuICAgICAgICAgICAgICAnZWNyOkdldExpZmVjeWNsZVBvbGljeScsXG4gICAgICAgICAgICAgICdlY3I6UHV0SW1hZ2VUYWdNdXRhYmlsaXR5JyxcbiAgICAgICAgICAgICAgJ2VjcjpEZXNjcmliZVJlcG9zaXRvcmllcycsXG4gICAgICAgICAgICAgICdlY3I6TGlzdFRhZ3NGb3JSZXNvdXJjZScsXG4gICAgICAgICAgICAgICdlY3I6UHV0SW1hZ2VTY2FubmluZ0NvbmZpZ3VyYXRpb24nLFxuICAgICAgICAgICAgICAnZWNyOkNyZWF0ZVJlcG9zaXRvcnknLFxuICAgICAgICAgICAgICAnZWNyOlB1dExpZmVjeWNsZVBvbGljeScsXG4gICAgICAgICAgICAgICdlY3I6U2V0UmVwb3NpdG9yeVBvbGljeScsXG4gICAgICAgICAgICAgICdlY3I6RGVsZXRlUmVwb3NpdG9yeScsXG4gICAgICAgICAgICAgICdlY3I6VGFnUmVzb3VyY2UnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmlhbTo6JHtBd3MuQUNDT1VOVF9JRH06cm9sZS9jZGsqYF0sXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICdpYW06R2V0Um9sZScsXG4gICAgICAgICAgICAgICdpYW06Q3JlYXRlUm9sZScsXG4gICAgICAgICAgICAgICdpYW06VGFnUm9sZScsXG4gICAgICAgICAgICAgICdpYW06RGVsZXRlUm9sZScsXG4gICAgICAgICAgICAgICdpYW06QXR0YWNoUm9sZVBvbGljeScsXG4gICAgICAgICAgICAgICdpYW06RGV0YWNoUm9sZVBvbGljeScsXG4gICAgICAgICAgICAgICdpYW06R2V0Um9sZVBvbGljeScsXG4gICAgICAgICAgICAgICdpYW06UHV0Um9sZVBvbGljeScsXG4gICAgICAgICAgICAgICdpYW06RGVsZXRlUm9sZVBvbGljeScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6bG9nczoke0F3cy5SRUdJT059OiR7QXdzLkFDQ09VTlRfSUR9OmxvZy1ncm91cDovYXdzL2NvZGVidWlsZC8qYF0sXG4gICAgICAgICAgICBhY3Rpb25zOiBbJ2xvZ3M6UHV0TG9nRXZlbnRzJ10sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgbGV0IHNvdXJjZTogU291cmNlO1xuXG4gICAgaWYgKHByb3BzLmdpdGh1YlJlcG9zaXRvcnkpIHtcbiAgICAgIHNvdXJjZSA9IFNvdXJjZS5naXRIdWIoe1xuICAgICAgICBvd25lcjogcHJvcHMuZ2l0aHViUmVwb3NpdG9yeSEuc3BsaXQoJy8nKVswXSxcbiAgICAgICAgcmVwbzogcHJvcHMuZ2l0aHViUmVwb3NpdG9yeSEuc3BsaXQoJy8nKVsxXSxcbiAgICAgICAgYnJhbmNoT3JSZWY6IHByb3BzLmdpdEJyYW5jaCA/IHByb3BzLmdpdEJyYW5jaCA6IHVuZGVmaW5lZCxcbiAgICAgICAgcmVwb3J0QnVpbGRTdGF0dXM6IHRydWUsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2RrQXBwU291cmNlQ29kZUJ1Y2tldE5hbWUgPSBuZXcgQ2ZuUGFyYW1ldGVyKHRoaXMsICdDREtBcHBTb3VyY2VDb2RlQnVja2V0TmFtZScsIHtcbiAgICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6IHByb3BzLmNka0FwcFNvdXJjZUNvZGVCdWNrZXROYW1lLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGNka0FwcFNvdXJjZUNvZGVCdWNrZXRQcmVmaXggPSBuZXcgQ2ZuUGFyYW1ldGVyKHRoaXMsICdDREtBcHBTb3VyY2VDb2RlQnVja2V0UHJlZml4Jywge1xuICAgICAgICB0eXBlOiAnU3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogcHJvcHMuY2RrQXBwU291cmNlQ29kZUJ1Y2tldFByZWZpeCxcbiAgICAgIH0pO1xuXG4gICAgICBzb3VyY2UgPSBTb3VyY2UuczMoe1xuICAgICAgICBidWNrZXQ6IEJ1Y2tldC5mcm9tQnVja2V0TmFtZSh0aGlzLCAnQ2RrQXBwQnVja2V0JywgY2RrQXBwU291cmNlQ29kZUJ1Y2tldE5hbWUudmFsdWVBc1N0cmluZyksXG4gICAgICAgIHBhdGg6IGAke2Nka0FwcFNvdXJjZUNvZGVCdWNrZXRQcmVmaXgudmFsdWVBc1N0cmluZ30ke3Byb3BzLmNka0FwcFNvdXJjZUNvZGVaaXBOYW1lfWAsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBjb2RlQnVpbGRQcm9qZWN0ID0gbmV3IFByb2plY3QodGhpcywgJ0NvZGVCdWlsZFByb2plY3QnLCB7XG4gICAgICBzb3VyY2UsXG4gICAgICAvLyB1c2UgZW5jcnlwdGlvbktleSBmcm9tIGFsaWFzIGtleSBhbGlhcy9hd3MvczNcbiAgICAgIGVuY3J5cHRpb25LZXk6IEFsaWFzLmZyb21BbGlhc05hbWUodGhpcywgJ2RlZmF1bHRTM0ttc0tleScsICdhbGlhcy9hd3MvczMnKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIGJ1aWxkSW1hZ2U6IExpbnV4QnVpbGRJbWFnZS5TVEFOREFSRF81XzAsXG4gICAgICAgIGNvbXB1dGVUeXBlOiBDb21wdXRlVHlwZS5TTUFMTCxcbiAgICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IHtcbiAgICAgICAgICBQQVJBTUVURVJTOiB7XG4gICAgICAgICAgICB2YWx1ZTogcGFyYW1ldGVycyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIFNUQUNLTkFNRToge1xuICAgICAgICAgICAgdmFsdWU6IHN0YWNrTmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIENES19BUFBfTE9DQVRJT046IHtcbiAgICAgICAgICAgIHZhbHVlOiBwcm9wcy5jZGtBcHBMb2NhdGlvbiA/IHByb3BzLmNka0FwcExvY2F0aW9uIDogJycsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByb2xlOiBidWlsZFJvbGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBzdGFydEJ1aWxkUm9sZSA9IG5ldyBSb2xlKHRoaXMsICdTdGFydEJ1aWxkUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYUJhc2ljRXhlY3V0aW9uUm9sZScpXSxcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgIFN0YXJ0QnVpbGQ6IG5ldyBQb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgIHJlc291cmNlczogW2NvZGVCdWlsZFByb2plY3QucHJvamVjdEFybl0sXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFsnY29kZWJ1aWxkOlN0YXJ0QnVpbGQnXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHN0YXJ0QnVpbGRGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCAnU3RhcnRCdWlsZEZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTZfWCxcbiAgICAgIGNvZGU6IENvZGUuZnJvbUlubGluZShzdGFydEJ1aWxkKHByb3BzLmRlcGxveUJ1aWxkU3BlYywgcHJvcHMuZGVzdHJveUJ1aWxkU3BlYykpLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICByb2xlOiBzdGFydEJ1aWxkUm9sZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlcG9ydEJ1aWxkUm9sZSA9IG5ldyBSb2xlKHRoaXMsICdSZXBvcnRCdWlsZFJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFCYXNpY0V4ZWN1dGlvblJvbGUnKV0sXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICBSZXBvcnRCdWlsZDogbmV3IFBvbGljeURvY3VtZW50KHtcbiAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbY29kZUJ1aWxkUHJvamVjdC5wcm9qZWN0QXJuXSxcbiAgICAgICAgICAgICAgYWN0aW9uczogWydjb2RlYnVpbGQ6QmF0Y2hHZXRCdWlsZHMnLCAnY29kZWJ1aWxkOkxpc3RCdWlsZHNGb3JQcm9qZWN0J10sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXBvcnRCdWlsZEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsICdSZXBvcnRCdWlsZEZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTZfWCxcbiAgICAgIGNvZGU6IENvZGUuZnJvbUlubGluZShyZXBvcnRCdWlsZCksXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIHJvbGU6IHJlcG9ydEJ1aWxkUm9sZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJ1aWxkQ29tcGxldGVSdWxlID0gbmV3IFJ1bGUodGhpcywgJ0J1aWxkQ29tcGxldGVFdmVudCcsIHtcbiAgICAgIGV2ZW50UGF0dGVybjoge1xuICAgICAgICBzb3VyY2U6IFsnYXdzLmNvZGVidWlsZCddLFxuICAgICAgICBkZXRhaWxUeXBlOiBbJ0NvZGVCdWlsZCBCdWlsZCBTdGF0ZSBDaGFuZ2UnXSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgJ2J1aWxkLXN0YXR1cyc6IFsnU1VDQ0VFREVEJywgJ0ZBSUxFRCcsICdTVE9QUEVEJ10sXG4gICAgICAgICAgJ3Byb2plY3QtbmFtZSc6IFtjb2RlQnVpbGRQcm9qZWN0LnByb2plY3ROYW1lXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0YXJnZXRzOiBbbmV3IExhbWJkYUZ1bmN0aW9uKHJlcG9ydEJ1aWxkRnVuY3Rpb24pXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJ1aWxkVHJpZ2dlciA9IG5ldyBDdXN0b21SZXNvdXJjZSh0aGlzLCAnQ29kZUJ1aWxkVHJpZ2dlckN1c3RvbVJlc291cmNlJywge1xuICAgICAgc2VydmljZVRva2VuOiBzdGFydEJ1aWxkRnVuY3Rpb24uZnVuY3Rpb25Bcm4sXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIFByb2plY3ROYW1lOiBjb2RlQnVpbGRQcm9qZWN0LnByb2plY3ROYW1lLFxuICAgICAgICBCdWlsZFJvbGVBcm46IGJ1aWxkUm9sZS5yb2xlQXJuLFxuICAgICAgICBQYXJhbWV0ZXJzOiBwYXJhbWV0ZXJzLFxuICAgICAgICBTdGFja05hbWU6IHN0YWNrTmFtZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBidWlsZFRyaWdnZXIubm9kZS5hZGREZXBlbmRlbmN5KGJ1aWxkQ29tcGxldGVSdWxlKTtcbiAgICBidWlsZFRyaWdnZXIubm9kZS5hZGREZXBlbmRlbmN5KGJ1aWxkUm9sZSk7XG5cbiAgICB0aGlzLmRlcGxveVJlc3VsdCA9IGJ1aWxkVHJpZ2dlci5nZXRBdHRTdHJpbmcoJ0J1aWxkU3RhdHVzJyk7XG4gIH1cbn1cbiJdfQ==