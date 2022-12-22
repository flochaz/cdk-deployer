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
import { CdkDeployer, DeploymentType } from 'cdk-deployer';

const app = new cdk.App();
const stackName = 'MyCdkAppStack';
new MyCdkAppStack(app, stackName, {});

new CdkDeployer(app, {
  deploymentType: DeploymentType.WORKSHOP_STUDIO,
  deployBuildSpec: BuildSpec.fromSourceFilename('buildspec-deploy.yml'),
  destroyBuildSpec: BuildSpec.fromSourceFilename('buildspec-destroy.yml'),
  cdkParameters: {
    queueName: {
      type: 'String',
      default: 'my-queue',
    },
  }
});

```

* Python example `app.py`
```python
#!/usr/bin/env python3
import os

import aws_cdk as cdk

from als_ara.als_ara_stack import AlsAraStack
from cdk_deployer import CDKDeployer

app = cdk.App()
stackName = 'AlsAraStack'
AlsAraStack(app, stackName,)

CdkDeployer( app,
    deployment_type=ara.DeploymentType.WORKSHOP_STUDIO,
    stack_name=stackName,
)

app.synth()
```

For more details about the CDKDeployer API check [API.md](./API.md)
