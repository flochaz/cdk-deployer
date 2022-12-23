#!/usr/bin/env node

import * as chalk from 'chalk';
import { Command } from 'commander';
import { checkGenericAWSCredentials } from './checkCredentials';
import { createZip } from './createZip';
import { generateCDKStandaloneDeployerCfnTemplate } from './generateCDKDeployerCfnTemplate';
import { getProjectFiles } from './getProjectFiles';
import { uploadCDKAppZip } from './uploadCDKAppZip';

export const ARCHIVE_NAME = 'cdk_app.zip';

export type CLIOptions = {
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

async function run() {
  const program = new Command()
    .description(
      'A simple tool to make your CDK app deployable through a click to deploy button. \n \n Prerequisite : Export AWS credentials !',
    )
    .option('--github-repo-name <string>', 'Name of the repo example: "aws-samples/aws-cdk-examples"')
    .option(
      '--s3-bucket-name <string>',
      'S3 bucket to use to upload the CDK Deployer stack and potentially the zip file. If not provided, one will be created for you after approval.',
    )
    .option(
      '--s3-key-prefix <string>',
      'S3 key prefix to use to upload the CDK Deployer stack and potentially the zip file', '',
    )
    .option(
      '--s3-bucket-region <string>',
      'S3 bucket region to use to upload the CDK Deployer stack and potentially the zip file',
      'us-east-1',
    )
    .option('--public-read', 'Make the S3 bucket public read', false)
    .option('--github-repo-branch <string>', 'Branch to use', 'main')
    .option('--cdk-project-path <string>', 'Path to the cdk app', './')
    .option('--stack-name <string>', 'Name of the stack to deploy')
    .option('--deploy-buildspec-name <string>', 'Name of the buildspec available in the cdk app to deploy the stack. (Required if --destroy-buildspec-name is provided)')
    .option('--destroy-buildspec-name <string>', 'Name of the buildspec available in the cdk app to destroy the stack. (Required if --deploy-buildspec-name is provided)')
    .option('--install-command <string>', 'Command to run to install dependencies')
    .option('--build-command <string>', 'Command to run to build the cdk app')
    .option('--bootstrap-command <string>', 'Command to run to build the cdk app', 'npx cdk bootstrap')
    .option('--deploy-command <string>', 'Command to run to deploy the cdk app', 'npx cdk deploy --all --require-approval never')
    .option('--destroy-command <string>', 'Command to run to destroy the cdk app', 'npx cdk destroy --all --force')
    .parse();
  // .option('--cdk-parameters [{<string>:<string>}]', 'CDK parameters to pass to the CDK app. Needs to be provided as an array of tuple, the key being the parmater name and value the parameter value');

  const options: CLIOptions = program.opts();

  try {
    await checkGenericAWSCredentials();

    if (!options.githubRepoName && options.s3BucketName && options.s3KeyPrefix) {
      console.log('No github repo name provided for the CDK app to deploy. Will then try to upload it as a zip file');

      console.log(chalk.white('Creating zip file for CDK app ...'));

      const files = getProjectFiles(options.cdkProjectPath);

      const isCDKAppRoot = files.find((f) => f === 'cdk.json');

      if (!isCDKAppRoot) {
        throw new Error(
          `No cdk.json file found running \`git ls-files\` in project located at ${process.cwd()}: \n\n did you add your cdk code to git ? are you sure you are on the root of the cdk project ?`
        );
      }

      await createZip(ARCHIVE_NAME, options.cdkProjectPath, files).catch((e) => {
        throw e;
      });
      await uploadCDKAppZip(options);
    }

    console.log(chalk.white('Generating the deployer stack ...'));
    const link = await generateCDKStandaloneDeployerCfnTemplate(options);
    console.info(
      chalk.green.bold(
        `You can now add the following markdown to your README.md : [![click-to-deploy](https://img.shields.io/badge/Click%20to-CDK%20Deploy-blue)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=cdkDeployer&templateURL=${link})`,
      ),
    );
  } catch (error) {
    console.error(chalk.red.bold((error as Error).message));
    process.exit(1);
  }
}

void run();
