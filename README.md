# CDK app deployer

This construct enable to easily deploy an AWS CDK app without a local environment.
This construct will create a Cloud Formation template starting an AWS Code Build project which will run a `cdk bootstrap` and `cdk deploy` from the given source (being either a zip in an S3 bucket or a github repository).

This enable to create a simple deploy link for your CDK app such as: 

[![click-to-deploy](https://img.shields.io/badge/Click%20to-CDK%20Deploy-blue)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=click2deploy-controller&templateURL=https://click2deploy-bucket.s3.amazonaws.com/file-asset-prefix/latest/cdk-click2deploy-dev.template.json)

Which, if you click, will deploy the example contains in this repo `sample-cdk-app` folder (which consist of a simple SQS queue) into your AWS account.

## Usage

* TypeScript example `bin/myCdkApp.ts`

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyCdkAppStack } from '../lib/my_cdk_app-stack';
import { CdkDeployer } from 'cdk-deployer';

const app = new cdk.App();
const stackName = 'MyCdkAppStack';
new MyCdkAppStack(app, stackName, {});

new CdkDeployer(app, {
  deployBuildSpec: BuildSpec.fromSourceFilename('buildspec-deploy.yml'),
  destroyBuildSpec: BuildSpec.fromSourceFilename('buildspec-destroy.yml'),
  githubRepository: 'aws-samples/aws-cdk-examples',
  cdkAppLocation: 'python/lambda-layer',
  }
);
```

For more details about the CDKDeployer API check [API.md](./API.md)


## TODO

- [ ] Add integ test for S3 source
- [ ] Add integ test for custom buildspec
- [ ] Add CLI for auto publish of CDK Deployer CFN template to a S3
- [ ] add CLI for auto publish of CDK app zip to S3