# CDK app deployer

This construct enable to easily deploy an AWS CDK app without a local environment.
This construct will create a Cloud Formation template starting an AWS Code Build project which will run a `cdk bootstrap` and `cdk deploy` from the given source (being either a zip in an S3 bucket or a github repository).

It also come with a command line enabling to create a simple deploy link for your CDK app such as: 

[![click-to-deploy](https://img.shields.io/badge/Click%20to-CDK%20Deploy-blue)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=cdkDeployer&templateURL=https://cdk-depl-aws-samples-aws-cdk-examples-master-pz9.s3.amazonaws.com/cdk-standalone-deployer-cfn-template.json)

If you follow this link, it will deploy the example contains in the [aws-samples/aws-cdk-examples](https://github.com/aws-samples/aws-cdk-examples/tree/master/python/lambda-layer) repo `python/lambda-layer` folder (which consist of a simple Lambda layer CDK app) into your AWS account.

## Usage

* TypeScript example `bin/myCdkApp.ts`

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyCdkAppStack } from '../lib/my_cdk_app-stack';
import { CdkStandaloneDeployer } from 'cdk-standalone-deployer';

const app = new cdk.App();
const stackName = 'MyCdkAppStack';
new MyCdkAppStack(app, stackName, {});

new CdkStandaloneDeployer(app, {
  deployBuildSpec: BuildSpec.fromSourceFilename('buildspec-deploy.yml'),
  destroyBuildSpec: BuildSpec.fromSourceFilename('buildspec-destroy.yml'),
  githubRepository: 'aws-samples/aws-cdk-examples',
  cdkAppLocation: 'python/lambda-layer',
  }
);
```

For more details about the CDKStandaloneDeployer API check [API.md](./API.md)

## The CLI

It also comes with a command line interface (CLI) that enable you to quickly generate click to deploy link.

The CLI will take your CDK app repository name and public S3 bucket to publish the Deployer stack to. It will then synthesize and publish the template with the right configuration without any modification of your code.

### Getting started

Taking any of the [aws-samples/aws-cdk-examples](https://github.com/aws-samples/aws-cdk-examples), to create a click to deploy link you just have to run the following command:
```bash
npx cdk-standalone-deployer --github-repo-name aws-samples/aws-cdk-examples --cdk-project-path python/lambda-layer --public-read --github-repo-branch master

Check access permissions ...
Access granted !
Generating the deployer stack ...
Generating deployer for https://github.com/aws-samples/aws-cdk-examples/tree/master/python/lambda-layer CDK app ...
CDK Deployer CloudFormation template generated. Uploading it to S3 ...
? No S3 bucket specified, are you ok to create one with name 
cdk-depl-aws-samples-aws-cdk-examples-master-pz9 ? 
 WARNING: This bucket will be public, allowing anyone to deploy your app on its own account. Yes
{ s3CreateConfirmation: true }
Creating S3 bucket cdk-depl-aws-samples-aws-cdk-examples-master-pz9 ...
Uploading CDK Deployer CloudFormation template to S3 bucket cdk-depl-aws-samples-aws-cdk-examples-master-pz9/cdk-standalone-deployer-cfn-template.json ...
You can now add the following markdown to your README.md : https://img.shields.io/badge/Click%20to-CDK%20Deploy-blue)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=cdkDeployer&templateURL=https://cdk-depl-aws-samples-aws-cdk-examples-master-pz9.s3.amazonaws.com/cdk-standalone-deployer-cfn-template.json)
```

### Usage

```
npx cdk-standalone-deployer --help

Usage: cli [options]

A simple tool to make your CDK app deployable through a click to deploy button. 
 
 Prerequisite : Export AWS credentials !

Options:
  --github-repo-name <string>    Name of the repo example: "aws-samples/aws-cdk-examples"
  --s3-bucket-name <string>      S3 bucket to use to upload the CDK Deployer stack and potentially the zip
                                 file
  --s3-key-prefix <string>       S3 key prefix to use to upload the CDK Deployer stack and potentially the
                                 zip file
  --s3-bucket-region <string>    S3 bucket region to use to upload the CDK Deployer stack and potentially
                                 the zip file (default: "us-east-1")
  --public-read                  Make the S3 bucket public read (default: false)
  --github-repo-branch <string>  Branch to use (default: "main")
  --cdk-project-path <string>    Path to the cdk app (default: "./")
  --stack-name <string>          Name of the stack to deploy
  -h, --help                     display help for command
```


## TODO

- [ ] Add integ test for S3 source
- [ ] Add integ test for custom buildspec
- [ ] add CLI option for auto publish of s3 source
- [ ] add CLI option for parameters

## Credits

This package is largely inspired by @pahud work (https://github.com/pahud/lambda-url-demo)