// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests CdkStandaloneDeployer
*
* @group unit/construct/cdk-standalone-deployer
*/


import { App, Aspects } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { CdkStandaloneDeployer } from '../../src/construct/cdk-standalone-deployer';

const mockApp = new App();

const stack = new CdkStandaloneDeployer(mockApp, {
  githubRepository: 'aws-samples/aws-analytics-reference-architecture',
  cdkAppLocation: 'refarch/aws-native',
  cdkParameters: {
    Foo: {
      default: 'no-value',
      type: 'String',
    },
    Bar: {
      default: 'some-value',
      type: 'String',
    },
  },
});

Aspects.of(stack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKStandaloneDeployer/StartBuildFunction/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Latest version of NodeJS runtime (18) dropped aws-sdk dependency, fallbacking to NodeJS 16' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKStandaloneDeployer/ReportBuildFunction/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Latest version of NodeJS runtime (18) dropped aws-sdk dependency, fallbacking to NodeJS 16' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKStandaloneDeployer/CdkBuildPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wildcard required because the CDKToolkit ID is not know and random' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKStandaloneDeployer/CodeBuildRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'DefaultPolicy provided by CodeBuild Project L2 CDK construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKStandaloneDeployer/ReportBuildRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Provided by the Custom Resource framework of CDK' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKStandaloneDeployer/StartBuildRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Provided by the Custom Resource framework of CDK' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(stack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(stack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});
