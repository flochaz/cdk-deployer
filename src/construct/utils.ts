// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DefaultStackSynthesizer, Fn, Stack } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * Utilities class used across the different resources
 */
export class Utils {

  /**
   * Import the default IAM role used by CDK
   * @param {Construct} scope the scope to import the role into
   * @param {string} id the ID of the role in the stack
   */
  public static getCdkExecRole(scope: Construct, id: string, customQualifier?: string) {
    const cdkExecutionRoleArn = Fn.sub(
      DefaultStackSynthesizer.DEFAULT_CLOUDFORMATION_ROLE_ARN,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Qualifier: customQualifier ?? DefaultStackSynthesizer.DEFAULT_QUALIFIER,
      },
    );
    // Makes the CDK execution role LF admin so it can create databases
    return Role.fromRoleArn(Stack.of(scope), `${id}Role`, cdkExecutionRoleArn);
  }

  /**
   * Import the default IAM role used for CDK deploy
   * @param {Construct} scope the scope to import the role into
   * @param {string} id the ID of the role in the stack
   */
  public static getCdkDeployRole(scope: Construct, id: string, customQualifier?: string) {
    const cdkDeployRoleArn = Fn.sub(
      DefaultStackSynthesizer.DEFAULT_DEPLOY_ROLE_ARN,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Qualifier: customQualifier ?? DefaultStackSynthesizer.DEFAULT_QUALIFIER,
      },
    );
    // Makes the CDK execution role LF admin so it can create databases
    return Role.fromRoleArn(Stack.of(scope), `${id}Role`, cdkDeployRoleArn);
  }

  /**
   * Import the default IAM role used for CDK file publishing
   * @param {Construct} scope the scope to import the role into
   * @param {string} id the ID of the role in the stack
   */
  public static getCdkFilePublishRole(scope: Construct, id: string, customQualifier?: string) {
    const cdkDeployRoleArn = Fn.sub(
      DefaultStackSynthesizer.DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Qualifier: customQualifier ?? DefaultStackSynthesizer.DEFAULT_QUALIFIER,
      },
    );
      // Makes the CDK execution role LF admin so it can create databases
    return Role.fromRoleArn(Stack.of(scope), `${id}Role`, cdkDeployRoleArn);
  }

  /**
   * Import the default IAM role used for CDK image publishing
   * @param {Construct} scope the scope to import the role into
   * @param {string} id the ID of the role in the stack
   */
  public static getCdkImagePublishRole(scope: Construct, id: string, customQualifier?: string) {
    const cdkRoleArn = Fn.sub(
      DefaultStackSynthesizer.DEFAULT_IMAGE_ASSET_PUBLISHING_ROLE_ARN,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Qualifier: customQualifier ?? DefaultStackSynthesizer.DEFAULT_QUALIFIER,
      },
    );
    // Makes the CDK execution role LF admin so it can create databases
    return Role.fromRoleArn(Stack.of(scope), `${id}Role`, cdkRoleArn);
  }
}
