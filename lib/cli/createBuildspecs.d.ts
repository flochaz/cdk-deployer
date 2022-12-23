import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CLIOptions } from './';
export declare function createBuildspecs(options: CLIOptions): {
    deployBuildspec: BuildSpec;
    destroyBuildspec: BuildSpec;
} | {
    deployBuildspec: undefined;
    destroyBuildspec: undefined;
};
