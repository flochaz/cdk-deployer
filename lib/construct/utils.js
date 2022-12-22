"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
/**
 * Utilities class used across the different resources
 */
class Utils {
    /**
     * Import the default IAM role used by CDK
     * @param {Construct} scope the scope to import the role into
     * @param {string} id the ID of the role in the stack
     */
    static getCdkExecRole(scope, id) {
        const cdkExecutionRoleArn = aws_cdk_lib_1.Fn.sub(aws_cdk_lib_1.DefaultStackSynthesizer.DEFAULT_CLOUDFORMATION_ROLE_ARN, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Qualifier: aws_cdk_lib_1.DefaultStackSynthesizer.DEFAULT_QUALIFIER,
        });
        // Makes the CDK execution role LF admin so it can create databases
        return aws_iam_1.Role.fromRoleArn(aws_cdk_lib_1.Stack.of(scope), `${id}Role`, cdkExecutionRoleArn);
    }
    /**
     * Import the default IAM role used for CDK deploy
     * @param {Construct} scope the scope to import the role into
     * @param {string} id the ID of the role in the stack
     */
    static getCdkDeployRole(scope, id) {
        const cdkDeployRoleArn = aws_cdk_lib_1.Fn.sub(aws_cdk_lib_1.DefaultStackSynthesizer.DEFAULT_DEPLOY_ROLE_ARN, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Qualifier: aws_cdk_lib_1.DefaultStackSynthesizer.DEFAULT_QUALIFIER,
        });
        // Makes the CDK execution role LF admin so it can create databases
        return aws_iam_1.Role.fromRoleArn(aws_cdk_lib_1.Stack.of(scope), `${id}Role`, cdkDeployRoleArn);
    }
    /**
     * Import the default IAM role used for CDK file publishing
     * @param {Construct} scope the scope to import the role into
     * @param {string} id the ID of the role in the stack
     */
    static getCdkFilePublishRole(scope, id) {
        const cdkDeployRoleArn = aws_cdk_lib_1.Fn.sub(aws_cdk_lib_1.DefaultStackSynthesizer.DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Qualifier: aws_cdk_lib_1.DefaultStackSynthesizer.DEFAULT_QUALIFIER,
        });
        // Makes the CDK execution role LF admin so it can create databases
        return aws_iam_1.Role.fromRoleArn(aws_cdk_lib_1.Stack.of(scope), `${id}Role`, cdkDeployRoleArn);
    }
}
exports.Utils = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uc3RydWN0L3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxRUFBcUU7QUFDckUsaUNBQWlDOzs7QUFFakMsNkNBQWlFO0FBQ2pFLGlEQUEyQztBQUczQzs7R0FFRztBQUNILE1BQWEsS0FBSztJQUVoQjs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFnQixFQUFFLEVBQVU7UUFDdkQsTUFBTSxtQkFBbUIsR0FBRyxnQkFBRSxDQUFDLEdBQUcsQ0FDaEMscUNBQXVCLENBQUMsK0JBQStCLEVBQ3ZEO1lBQ0UsZ0VBQWdFO1lBQ2hFLFNBQVMsRUFBRSxxQ0FBdUIsQ0FBQyxpQkFBaUI7U0FDckQsQ0FDRixDQUFDO1FBQ0YsbUVBQW1FO1FBQ25FLE9BQU8sY0FBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FBZ0IsRUFBRSxFQUFVO1FBQ3pELE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQUUsQ0FBQyxHQUFHLENBQzdCLHFDQUF1QixDQUFDLHVCQUF1QixFQUMvQztZQUNFLGdFQUFnRTtZQUNoRSxTQUFTLEVBQUUscUNBQXVCLENBQUMsaUJBQWlCO1NBQ3JELENBQ0YsQ0FBQztRQUNGLG1FQUFtRTtRQUNuRSxPQUFPLGNBQUksQ0FBQyxXQUFXLENBQUMsbUJBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLHFCQUFxQixDQUFDLEtBQWdCLEVBQUUsRUFBVTtRQUM5RCxNQUFNLGdCQUFnQixHQUFHLGdCQUFFLENBQUMsR0FBRyxDQUM3QixxQ0FBdUIsQ0FBQyxzQ0FBc0MsRUFDOUQ7WUFDRSxnRUFBZ0U7WUFDaEUsU0FBUyxFQUFFLHFDQUF1QixDQUFDLGlCQUFpQjtTQUNyRCxDQUNGLENBQUM7UUFDQSxtRUFBbUU7UUFDckUsT0FBTyxjQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUMxRSxDQUFDO0NBQ0Y7QUFwREQsc0JBb0RDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4vLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlULTBcblxuaW1wb3J0IHsgRGVmYXVsdFN0YWNrU3ludGhlc2l6ZXIsIEZuLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG4vKipcbiAqIFV0aWxpdGllcyBjbGFzcyB1c2VkIGFjcm9zcyB0aGUgZGlmZmVyZW50IHJlc291cmNlc1xuICovXG5leHBvcnQgY2xhc3MgVXRpbHMge1xuXG4gIC8qKlxuICAgKiBJbXBvcnQgdGhlIGRlZmF1bHQgSUFNIHJvbGUgdXNlZCBieSBDREtcbiAgICogQHBhcmFtIHtDb25zdHJ1Y3R9IHNjb3BlIHRoZSBzY29wZSB0byBpbXBvcnQgdGhlIHJvbGUgaW50b1xuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdGhlIElEIG9mIHRoZSByb2xlIGluIHRoZSBzdGFja1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXRDZGtFeGVjUm9sZShzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nKSB7XG4gICAgY29uc3QgY2RrRXhlY3V0aW9uUm9sZUFybiA9IEZuLnN1YihcbiAgICAgIERlZmF1bHRTdGFja1N5bnRoZXNpemVyLkRFRkFVTFRfQ0xPVURGT1JNQVRJT05fUk9MRV9BUk4sXG4gICAgICB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICAgICAgUXVhbGlmaWVyOiBEZWZhdWx0U3RhY2tTeW50aGVzaXplci5ERUZBVUxUX1FVQUxJRklFUixcbiAgICAgIH0sXG4gICAgKTtcbiAgICAvLyBNYWtlcyB0aGUgQ0RLIGV4ZWN1dGlvbiByb2xlIExGIGFkbWluIHNvIGl0IGNhbiBjcmVhdGUgZGF0YWJhc2VzXG4gICAgcmV0dXJuIFJvbGUuZnJvbVJvbGVBcm4oU3RhY2sub2Yoc2NvcGUpLCBgJHtpZH1Sb2xlYCwgY2RrRXhlY3V0aW9uUm9sZUFybik7XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0IHRoZSBkZWZhdWx0IElBTSByb2xlIHVzZWQgZm9yIENESyBkZXBsb3lcbiAgICogQHBhcmFtIHtDb25zdHJ1Y3R9IHNjb3BlIHRoZSBzY29wZSB0byBpbXBvcnQgdGhlIHJvbGUgaW50b1xuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdGhlIElEIG9mIHRoZSByb2xlIGluIHRoZSBzdGFja1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXRDZGtEZXBsb3lSb2xlKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjZGtEZXBsb3lSb2xlQXJuID0gRm4uc3ViKFxuICAgICAgRGVmYXVsdFN0YWNrU3ludGhlc2l6ZXIuREVGQVVMVF9ERVBMT1lfUk9MRV9BUk4sXG4gICAgICB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICAgICAgUXVhbGlmaWVyOiBEZWZhdWx0U3RhY2tTeW50aGVzaXplci5ERUZBVUxUX1FVQUxJRklFUixcbiAgICAgIH0sXG4gICAgKTtcbiAgICAvLyBNYWtlcyB0aGUgQ0RLIGV4ZWN1dGlvbiByb2xlIExGIGFkbWluIHNvIGl0IGNhbiBjcmVhdGUgZGF0YWJhc2VzXG4gICAgcmV0dXJuIFJvbGUuZnJvbVJvbGVBcm4oU3RhY2sub2Yoc2NvcGUpLCBgJHtpZH1Sb2xlYCwgY2RrRGVwbG95Um9sZUFybik7XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0IHRoZSBkZWZhdWx0IElBTSByb2xlIHVzZWQgZm9yIENESyBmaWxlIHB1Ymxpc2hpbmdcbiAgICogQHBhcmFtIHtDb25zdHJ1Y3R9IHNjb3BlIHRoZSBzY29wZSB0byBpbXBvcnQgdGhlIHJvbGUgaW50b1xuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgdGhlIElEIG9mIHRoZSByb2xlIGluIHRoZSBzdGFja1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXRDZGtGaWxlUHVibGlzaFJvbGUoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGNka0RlcGxveVJvbGVBcm4gPSBGbi5zdWIoXG4gICAgICBEZWZhdWx0U3RhY2tTeW50aGVzaXplci5ERUZBVUxUX0ZJTEVfQVNTRVRfUFVCTElTSElOR19ST0xFX0FSTixcbiAgICAgIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuICAgICAgICBRdWFsaWZpZXI6IERlZmF1bHRTdGFja1N5bnRoZXNpemVyLkRFRkFVTFRfUVVBTElGSUVSLFxuICAgICAgfSxcbiAgICApO1xuICAgICAgLy8gTWFrZXMgdGhlIENESyBleGVjdXRpb24gcm9sZSBMRiBhZG1pbiBzbyBpdCBjYW4gY3JlYXRlIGRhdGFiYXNlc1xuICAgIHJldHVybiBSb2xlLmZyb21Sb2xlQXJuKFN0YWNrLm9mKHNjb3BlKSwgYCR7aWR9Um9sZWAsIGNka0RlcGxveVJvbGVBcm4pO1xuICB9XG59XG4iXX0=