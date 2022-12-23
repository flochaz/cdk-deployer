#!/usr/bin/env node
export declare const ARCHIVE_NAME = "cdk_app.zip";
export declare type CLIOptions = {
    githubRepoName: string;
    s3BucketName?: string | undefined;
    s3KeyPrefix?: string | undefined;
    s3BucketRegion: string;
    publicRead: boolean;
    githubRepoBranch: string;
    cdkProjectPath: string;
    stackName?: string | undefined;
    deployBuildspecName?: string | undefined;
    destroyBuildspecName?: string | undefined;
    installCommand?: string | undefined;
    buildCommand?: string | undefined;
    deployCommand?: string | undefined;
    destroyCommand?: string | undefined;
    bootstrapCommand?: string | undefined;
};
