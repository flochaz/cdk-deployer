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
  devDeps: ['cdk-nag'],
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();