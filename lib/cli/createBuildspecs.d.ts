import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
export declare function createBuildspecs(options: any): {
    deployBuildspec: BuildSpec;
    destroyBuildspec: BuildSpec;
} | {
    deployBuildspec: undefined;
    destroyBuildspec: undefined;
};
