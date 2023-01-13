const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Florian Chazal',
  authorAddress: 'chazalf@amazon.com',
  cdkVersion: '2.55.1',
  defaultReleaseBranch: 'main',
  name: 'cdk-standalone-deployer',
  releaseToNpm: true,
  repositoryUrl: 'https://github.com/flochaz/cdk-standalone-deployer.git',
  bundledDeps: [
    'commander',
    'inquirer@8',
    'archiver',
    'chalk@4',
    'aws-sdk',
    'yaml@1',
    'aws-cdk',
    'cdk-assets',
    '@aws-cdk/cx-api',
    '@aws-cdk/cloudformation-diff',
    'promptly',
    'proxy-agent',
    '@types/archiver',
    '@types/inquirer@8',
  ],
  deps: ['aws-cdk-lib', 'constructs'],
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    'ts-node',
    'cdk-nag',
    'jest-runner-groups',
    'aws-cdk',
    'cdk-assets',
    '@aws-cdk/cx-api',
    '@aws-cdk/cloudformation-diff',
    'promptly',
    'proxy-agent',
    '@types/archiver',
    '@types/inquirer@8',
  ],
  // packageName: undefined,  /* The "name" in package.json. */

  jestOptions: {
    jestConfig: {
      runner: 'groups',
    },
  },
  bin: { 'cdk-standalone-deployer': 'lib/cli/cli.js' },
});

project.gitignore.include('!/lib/cli/');
project.gitignore.exclude('/lib/construct/');

project.testTask.reset('jest --group=unit');

project.addTask('test:unit', {
  exec: 'jest --group=unit',
});

project.addTask('test:integ', {
  exec: 'jest --group=integ',
});

project.synth();
