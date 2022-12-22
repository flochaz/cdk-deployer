#!/usr/bin/env node

import * as path from 'path';
import * as chalk from 'chalk';
import { Command } from 'commander';
import { checkGenericAWSCredentials } from './checkCredentials';
import { createZip } from './createZip';
import { generateCDKDeployerCfnTemplate } from './generateCDKDeployerCfnTemplate';
import { getProjectFiles } from './getProjectFiles';
import { gitAddAndPush } from './gitAddAndPush';
import { populateContentSpec } from './populateContentSpec';
import { uploadCDKAppZip } from './uploadCDKAppZip';

export const ARCHIVE_NAME = 'cdk_app.zip';

async function run() {
  const program = new Command();

  program
    .description(
      'A simple tool to make your CDK app deployable through a click to deploy button. \n \n Prerequisite : Export AWS credentials from Workshop studio page !',
    )
    .option('-gh, --github-repo-name <string>', 'Name of the repo', 'aws-samples/aws-cdk-examples')
    .option('-b --s3-bucket-name <string>', 'S3 bucket to use to upload the CDK Deployer stack and potentially the zip file')
    .option('-kp --s3-key-prefix <string>', 'S3 key prefix to use to upload the CDK Deployer stack and potentially the zip file')
    .option('-b, --branch <string>', 'Branch to use', 'main')
    .option('-p, --cdk-project-path <string>', 'Path to the cdk app', './')
    .parse();

  const options = program.opts();


  try {
    await checkGenericAWSCredentials();

    if (!options.githubRepoName && options.s3BucketName && options.s3KeyPrefix) {
      console.log('No github repo name provided for the CDK app to deploy. Will then try to upload it as a zip file');

      console.log(chalk.white('Creating zip file for CDK app ...'));

      const files = getProjectFiles(options.cdkProjectPath);

      const isCDKAppRoot = files.find((f) => f === 'cdk.json');

      if (!isCDKAppRoot) {
        throw new Error(
          `No cdk.json file found running \`git ls-files\` in project located at ${process.cwd()}: \n\n did you add your cdk code to git ? are you sure you are on the root of the cdk project ?`,
        );
      }

      if (options.verbose) {
        console.log(chalk.grey(`Files : ${JSON.stringify(files, null, 2)}`));
      }

      await createZip(ARCHIVE_NAME, options.cdkProjectPath, files).catch((e) => {
        throw e;
      });
      await uploadCDKAppZip(options);
    }


    if (!options.skipTemplates) {
      console.log(chalk.white('Generating the deployer stack ...'));
      await generateCDKDeployerCfnTemplate(options.cdkProjectPath, options.workshopRepoPath);
      console.info(
        chalk.green.bold(
          `The cloudformation capable of deploying cdk app as part of Workshop studio event prorvisioning step has been created under ${path.join(options.workshopRepoPath, 'static')} folder`,
        ),
      );

      await populateContentSpec(options);
    }

    const filesToPush = [];
    !options.skipTemplates ? filesToPush.push('contentspec.yaml') : null;
    !options.skipTemplates ? filesToPush.push('static/CDKDeployer.template.json') : null;

    await gitAddAndPush(options.workshopRepoPath, 'chore: Add Deployer Stack static artifact', filesToPush);
    console.log(chalk.green.bold('You are all done !'));
  } catch (error) {
    console.error(chalk.red.bold((error as Error).message));
    process.exit(1);
  }
}

void run();
