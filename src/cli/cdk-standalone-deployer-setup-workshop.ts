#!/usr/bin/env node

import * as fs from 'fs';
import * as chalk from 'chalk';
import { Command } from 'commander';
import { checkGenericAWSCredentials } from './checkCredentials';
import { ARCHIVE_NAME, CDK_DEPLOYER_TEMPLATE_PATH } from './constants';
import { createZip } from './createZip';
import { generateCDKStandaloneDeployerCfnTemplate } from './generateCDKDeployerCfnTemplate';
import { getProjectFiles } from './getProjectFiles';
import { gitAddAndPush } from './gitAddAndPush';
import { populateContentSpec } from './populateContentSpec';
import { uploadCDKAppZip } from './uploadCDKAppZip';

export type CLIOptions = {
  workshopId: string;
  cdkProjectPath: string;
  verbose: boolean;
  stackName?: string | undefined;
  deployBuildspecName?: string | undefined;
  destroyBuildspecName?: string | undefined;
  installCommand?: string | undefined;
  buildCommand?: string | undefined;
  deployCommand?: string | undefined;
  destroyCommand?: string | undefined;
  bootstrapCommand?: string | undefined;
  cdkQualifier?: string | undefined;
  cdkParameters?: [string] | undefined;
};


async function run() {
  const program = new Command()
    .description(
      'A simple tool to make your CDK app deployable through Through Workshop studio. \n \n Prerequisite : Export AWS credentials !',
    )
    .option('--workshop-id <string>', 'ID of the workshop')
    .option('--cdk-project-path <string>', 'Path to the cdk app. It needs to be commited into a git repository')
    .option('--stack-name <string>', 'Name of the stack to deploy')
    .option('--deploy-buildspec-name <string>', 'Name of the buildspec available in the cdk app to deploy the stack. (Required if --destroy-buildspec-name is provided)')
    .option('--destroy-buildspec-name <string>', 'Name of the buildspec available in the cdk app to destroy the stack. (Required if --deploy-buildspec-name is provided)')
    .option('--install-command <string>', 'Command to run to install dependencies')
    .option('--build-command <string>', 'Command to run to build the cdk app')
    .option('--bootstrap-command <string>', 'Command to run to build the cdk app', 'npx cdk bootstrap --qualifier $CDK_QUALIFIER --toolkit-stack-name CDKToolkit-$CDK_QUALIFIER')
    .option('--deploy-command <string>', 'Command to run to deploy the cdk app', 'npx cdk deploy $PARAMETERS --all --require-approval never -c @aws-cdk/core:bootstrapQualifier=$CDK_QUALIFIER')
    .option('--destroy-command <string>', 'Command to run to destroy the cdk app', 'npx cdk destroy --all --force -c @aws-cdk/core:bootstrapQualifier=$CDK_QUALIFIER')
    .option('--cdk-qualifier <string>', 'CDK qualifier to use', 'deployer')
    .option('--cdk-parameters [pair...]', 'add an entry (or several separated by a space) key=value that will be passed to the cdk app through context (--context)')
    .option('--verbose', 'Verbose mode')
    .parse();

  const options: any = program.opts();
  // console.log(JSON.stringify(options));
  // console.log('Remaining arguments: ', program.args);
  try {
    if (!options.workshopId || !options.cdkProjectPath) {
      throw new Error('Missing required option --workshop-id or --cdk-project-path');
    }
    await checkGenericAWSCredentials();

    const files = getProjectFiles(options.cdkProjectPath);

    const isCDKAppRoot = files.find((f) => f === 'cdk.json');

    if (!isCDKAppRoot) {
      throw new Error(
        `No cdk.json file found running \`git ls-files\` in project located at ${process.cwd()}: \n\n did you add your cdk code to git ? are you sure you are on the root of the cdk project ?`,
      );
    }

    await createZip(ARCHIVE_NAME, options.cdkProjectPath, files).catch((e) => {
      throw e;
    });

    await uploadCDKAppZip(ARCHIVE_NAME, 'ws-assets-us-east-1', `${options.workshopId}/${ARCHIVE_NAME}`, options.verbose);
    console.log(chalk.white('Generating the deployer stack ...'));
    const template = await generateCDKStandaloneDeployerCfnTemplate({ ...options, cdkAppSourceCodeZipName: ARCHIVE_NAME });
    console.log(chalk.green('Deployer stack generated !'));
    console.log(chalk.white('Writing the deployer stack to disk ...'));

    fs.writeFileSync(CDK_DEPLOYER_TEMPLATE_PATH, template);
    console.log(chalk.green('Deployer stack written at static/CDKDeployer.template.json !'));

    console.log(chalk.white('Populating Content Spec ...'));
    await populateContentSpec('./');
    console.log(chalk.green('contentspec.yaml now reference the static/CDKDeployer.template.json template !'));


    const filesToPush = [];
    filesToPush.push('contentspec.yaml');
    filesToPush.push(CDK_DEPLOYER_TEMPLATE_PATH);

    console.log(chalk.white('Pushing change to git ...'));
    await gitAddAndPush(options.workshopRepoPath, 'chore: Add Deployer Stack static artifact', filesToPush);
    console.log(chalk.green.bold('You are all done ! You can now test your workshop in the studio by pinning the build and clicking "create test event"!'));

  } catch (error) {
    console.error(chalk.red.bold((error as Error).message));
    process.exit(1);
  }
}
void run();
