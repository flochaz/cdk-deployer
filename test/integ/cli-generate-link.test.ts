// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CDK deployer CLI to generate a link
 *
 * @group integ/cli/generate-link
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const generateLinkBinPath = path.join(__dirname, '../../src/cli/cdk-standalone-deployer-generate-link.ts');

const testTimeout = 1000000;


describe('cdk-standalone-deployer generate-link', () => {
  it('should create a proper link', async () => {
    const options = [
      '--github-repo-name aws-samples/aws-cdk-examples',
      '--cdk-project-path typescript/lambda-layer',
      '--github-repo-branch master',
      '--install-command "npm install"',
      '--build-command "npm run build"',
      '--cdk-parameters test=toto tot=eww',
      '--s3-bucket-name local-integ-test-cdk-standalone-deployer',
      '--verbose',
    ];
    const { stdout } = await execAsync(`npx ts-node ${generateLinkBinPath} ${options.join(' ')}`);
    expect(stdout).toMatch(/You can now add the following markdown to your README.md/);
    // read file from resources/generate-link.snapshot.json and check the content is in output
    const snapshot = fs.readFileSync(path.join(__dirname, './resources/generate-link.snapshot.json'), 'utf8');
    expect(stdout).toMatch(snapshot);
  }, testTimeout);
});
