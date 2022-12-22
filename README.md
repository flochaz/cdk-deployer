# CDK app deployer

This construct enable to easily deploy an AWS CDK app without a local environment.
This construct will create a Cloud Formation template starting an AWS Code Build project which will run a `cdk bootstrap` and `cdk deploy` from the given source (being either a zip in an S3 bucket or a github repository).

This enable to create a simple deploy link for your CDK app.


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

