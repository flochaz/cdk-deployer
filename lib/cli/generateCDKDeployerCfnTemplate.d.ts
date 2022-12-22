export declare function generateCDKStandaloneDeployerCfnTemplate(options: {
    githubRepoName: string;
    s3BucketName?: string;
    s3KeyPrefix?: string;
    publicRead: boolean;
    githubRepoBranch: string;
    cdkProjectPath: string;
    stackName?: string | undefined;
    s3BucketRegion?: string;
}): Promise<string>;
