import * as cdk from 'aws-cdk-lib';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';
/**
 * The properties for the CdkDeployer construct.
 */
export interface CdkDeployerProps extends cdk.StackProps {
    /**
     * The CDK stack name to deploy
     * @default - The default stack is deployed
     */
    readonly cdkStack?: string;
    /**
     * The CFN parameters to pass to the CDK application
     * @default - No parameter is used
     */
    readonly cdkParameters?: {
        [name: string]: cdk.CfnParameterProps;
    };
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
export declare class CdkDeployer extends cdk.Stack {
    /**
     * The result of the deloyment
     */
    readonly deployResult: string;
    /**
     * Constructs a new instance of the TrackedConstruct
     * @param {Construct} scope the Scope of the CDK Construct
     * @param {string} id the ID of the CDK Construct
     * @param {CdkDeployerProps} props the CdkDeployer [properties]{@link CdkDeployerProps}
     */
    constructor(scope: Construct, props: CdkDeployerProps);
}
