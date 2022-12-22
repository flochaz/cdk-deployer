import { Construct } from 'constructs';
/**
 * Utilities class used across the different resources
 */
export declare class Utils {
    /**
     * Import the default IAM role used by CDK
     * @param {Construct} scope the scope to import the role into
     * @param {string} id the ID of the role in the stack
     */
    static getCdkExecRole(scope: Construct, id: string): import("aws-cdk-lib/aws-iam").IRole;
    /**
     * Import the default IAM role used for CDK deploy
     * @param {Construct} scope the scope to import the role into
     * @param {string} id the ID of the role in the stack
     */
    static getCdkDeployRole(scope: Construct, id: string): import("aws-cdk-lib/aws-iam").IRole;
    /**
     * Import the default IAM role used for CDK file publishing
     * @param {Construct} scope the scope to import the role into
     * @param {string} id the ID of the role in the stack
     */
    static getCdkFilePublishRole(scope: Construct, id: string): import("aws-cdk-lib/aws-iam").IRole;
}
