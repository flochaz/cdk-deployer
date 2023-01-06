#!/usr/bin/env node

import { Command } from 'commander';

async function run() {
  const deployer = new Command('cdk-standalone-deployer')
    .description(
      'A simple tool to make your CDK app deployable through a click to deploy button or Workshop studio. \n \n Prerequisite : Export AWS credentials !'
    );
  deployer
    .command('generate-link', 'A simple tool to make your CDK app deployable through Through a link click.')
  deployer
    .command('setup-workshop', 'A simple tool to make your CDK app deployable through Through Workshop studio. (AWS internal only))')
  
    deployer.parse(process.argv);
}


void run();
