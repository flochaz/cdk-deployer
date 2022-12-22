const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Florian Chazal',
  authorAddress: 'chazalf@amazon.com',
  cdkVersion: '2.55.1',
  defaultReleaseBranch: 'main',
  name: 'cdk-deployer',
  repositoryUrl: 'https://github.com/chazalf/cdk-deployer.git',
  bundledDeps: ['commander', 'inquirer@8', 'archiver', 'chalk@4', 'aws-sdk', 'yaml'],
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
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
  bin: { 'cdk-deployer': 'lib/cli.js' },
});

project.gitignore.include('!/lib/');

project.testTask.reset('jest --group=unit');

project.addTask('test:unit', {
  exec: 'jest --group=unit',
});

project.addTask('test:integ', {
  exec: 'jest --group=integ',
});

project.synth();
