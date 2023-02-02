import * as cdk from 'aws-cdk-lib';
import { CdkStandaloneDeployer } from '../construct/cdk-standalone-deployer';
import { createBuildspecs } from './createBuildspecs';

export async function generateCDKStandaloneDeployerCfnTemplate(options: any) {
  const deployer = new cdk.App();

  const buildspecs = createBuildspecs(options);
  const deployerStack = new CdkStandaloneDeployer(deployer, {
    githubRepository: options.githubRepoName,
    gitBranch: options.githubRepoBranch,
    cdkAppLocation: options.cdkAppSourceCodeZipName ? '' : options.cdkProjectPath,
    stackName: options.stackName,
    deployBuildSpec: buildspecs.deployBuildspec,
    destroyBuildSpec: buildspecs.destroyBuildspec,
    cdkQualifier: options.cdkQualifier,
    cdkAppSourceCodeZipName: options.cdkAppSourceCodeZipName,
    cdkParameters: options.cdkParameters ? parseCDKParameters(options.cdkParameters) : undefined,
    enableDocker: options.enableDocker,
  });

  const synth = deployer.synth();

  return JSON.stringify(synth.getStackArtifact(deployerStack.artifactId).template);
}
function parseCDKParameters(cdkParameters: [string]): { [name: string]: cdk.CfnParameterProps } | undefined {
  const result: { [name: string]: cdk.CfnParameterProps } = {};
  for (const cdkParameter of cdkParameters) {
    if (!cdkParameter.includes('=')) {
      throw new Error(`Invalid CDK parameter ${cdkParameter}. It should be in the form of name=value`);
    }
    const [name, value] = cdkParameter.split('=');
    if (!name || !value) {
      throw new Error(`Invalid CDK parameter ${cdkParameter}. It should be in the form of name=value`);
    }
    result[name] = {
      type: 'String',
      default: value,
    };
  }
  return result;
}

