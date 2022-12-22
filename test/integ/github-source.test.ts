// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CDK deployer with GitHub source
 *
 * @group integ/github-source
 */

import { App } from 'aws-cdk-lib';
import { CdkStandaloneDeployer } from '../../src/construct/cdk-standalone-deployer';
import { deployStack, destroyStack } from './utils';

jest.setTimeout(2000000);

const app: App = new App();
const stackUnderTest = new CdkStandaloneDeployer(app, {
  githubRepository: 'aws-samples/aws-cdk-examples',
  cdkAppLocation: 'python/lambda-layer',
});

describe('CdkStandaloneDeployer from github source', () => {
  it('Deploys a CDK app from GitHub successfully', async () => {

    await deployStack(app, stackUnderTest);
  }, 1000000);
});

afterAll(async () => {
  await destroyStack(app, stackUnderTest);
});
