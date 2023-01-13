/*
*
* @group unit/construct/cdk-standalone-deployer
*/

import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const rootBinPath = path.join(__dirname, '../../src/cli/cli.ts');
const setupWorkshopBinPath = path.join(__dirname, '../../src/cli/cdk-standalone-deployer-setup-workshop.ts');
const generateLinkBinPath = path.join(__dirname, '../../src/cli/cdk-standalone-deployer-generate-link.ts');

const testTimeout = 60000;
describe('cdk-standalone-deployer', () => {
  it('should return a valid help', async () => {
    const { stdout } = await execAsync(`npx ts-node ${rootBinPath} --help`);
    expect(stdout).toMatch(/Usage: cdk-standalone-deployer/);
  }, testTimeout);
});

describe('cdk-standalone-deployer setup-workshop', () => {
  it('should return a valid help', async () => {
    const { stdout } = await execAsync(`npx ts-node ${setupWorkshopBinPath} --help`);
    expect(stdout).toMatch(/Usage: cdk-standalone-deployer-setup-workshop/);
  }, testTimeout);

  it('should throw an error if --workshop-id is missing', async () => {
    try {
      await execAsync(`npx ts-node ${setupWorkshopBinPath} --cdk-project-path ./`);
    } catch (e) {
      expect((e as Error).message).toMatch(/Missing required option --workshop-id or --cdk-project-path/);
    }
  }, testTimeout);

  it('should throw an error if  --cdk-project-path is missing', async () => {
    try {
      await execAsync(`npx ts-node ${setupWorkshopBinPath} --workshop-id 1`);
    } catch (e) {
      expect((e as Error).message).toMatch(/Missing required option --workshop-id or --cdk-project-path/);
    }
  }, testTimeout);

  it('should throw an error if credentials are invalid', async () => {
    try {
      await execAsync(`npx ts-node ${setupWorkshopBinPath} --workshop-id 1 --cdk-project-path ./`);
      fail('Should have thrown an error');
    } catch (e) {
      expect((e as Error).message).toMatch(/Credentials expired or not set, please export the credentials/);
    }
  }, testTimeout);
});

describe('cdk-standalone-deployer generate-link', () => {
  it('should return a valid help', async () => {
    const { stdout } = await execAsync(`npx ts-node ${generateLinkBinPath} --help`);
    expect(stdout).toMatch(/Usage: cdk-standalone-deployer-generate-link/);
  }, testTimeout);

  it('should throw an error if credentials are invalid', async () => {
    try {
      await execAsync(`npx ts-node ${generateLinkBinPath}`);
      fail('Should have thrown an error');
    } catch (e) {
      expect((e as Error).message).toMatch(/Credentials expired or not set, please export the credentials/);
    }
  }, testTimeout);
});
