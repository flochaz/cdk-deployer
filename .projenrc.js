const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Florian Chazal',
  authorAddress: 'chazalf@amazon.com',
  cdkVersion: '2.55.1',
  defaultReleaseBranch: 'main',
  name: 'cdk-deployer',
  repositoryUrl: 'https://github.com/chazalf/cdk-deployer.git',

  // deps: [],                /* Runtime dependencies of this module. */
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
  ],
  // packageName: undefined,  /* The "name" in package.json. */

  jestOptions: {
    jestConfig: {
      runner: 'groups',
    },
  },
});

project.testTask.reset('jest --group=unit');

project.addTask('test:unit', {
  exec: 'jest --group=unit',
});

project.addTask('test:integ', {
  exec: 'jest --group=integ',
});

project.synth();
