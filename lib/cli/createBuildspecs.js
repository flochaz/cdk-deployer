"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuildspecs = void 0;
const aws_codebuild_1 = require("aws-cdk-lib/aws-codebuild");
function createBuildspecs(options) {
    if (options.deployBuildspecName || options.destroyBuildspecName) {
        const potentialMissingOptions = [options.deployBuildspecName, options.deployBuildspecName].find((v) => v === undefined);
        if (potentialMissingOptions) {
            throw new Error(`Missing option ${potentialMissingOptions}`);
        }
        return {
            deployBuildspec: aws_codebuild_1.BuildSpec.fromSourceFilename(options.deployBuildspecName),
            destroyBuildspec: aws_codebuild_1.BuildSpec.fromSourceFilename(options.destroyBuildspecName),
        };
    }
    else if (options.installCommand) {
        const deployBuildspec = aws_codebuild_1.BuildSpec.fromObject({
            version: 0.2,
            env: {
                variables: {
                    CFN_RESPONSE_URL: 'CFN_RESPONSE_URL_NOT_SET',
                    CFN_STACK_ID: 'CFN_STACK_ID_NOT_SET',
                    CFN_REQUEST_ID: 'CFN_REQUEST_ID_NOT_SET',
                    CFN_LOGICAL_RESOURCE_ID: 'CFN_LOGICAL_RESOURCE_ID_NOT_SET',
                },
            },
            phases: {
                install: {
                    'on-failure': 'ABORT',
                    'runtime-versions': {
                        nodejs: 14,
                    },
                    'commands': [
                        `cd $CODEBUILD_SRC_DIR/${options.cdkProjectPath}`,
                        options.installCommand,
                    ],
                },
                pre_build: {
                    'on-failure': 'ABORT',
                    'commands': [
                        'cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION',
                        'export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)',
                        options.bootstrapCommand,
                    ],
                },
                build: {
                    'on-failure': 'ABORT',
                    'commands': [
                        'cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION',
                        'export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)',
                        options.buildCommand,
                        options.deployCommand,
                    ],
                },
            },
        });
        const destroyBuildspec = aws_codebuild_1.BuildSpec.fromObject({
            version: 0.2,
            env: {
                variables: {
                    CFN_RESPONSE_URL: 'CFN_RESPONSE_URL_NOT_SET',
                    CFN_STACK_ID: 'CFN_STACK_ID_NOT_SET',
                    CFN_REQUEST_ID: 'CFN_REQUEST_ID_NOT_SET',
                    CFN_LOGICAL_RESOURCE_ID: 'CFN_LOGICAL_RESOURCE_ID_NOT_SET',
                },
            },
            phases: {
                install: {
                    'on-failure': 'ABORT',
                    'runtime-versions': {
                        nodejs: 14,
                    },
                    'commands': [`cd $CODEBUILD_SRC_DIR/${options.cdkProjectPath}`, options.installCommand],
                },
                build: {
                    'on-failure': 'ABORT',
                    'commands': [
                        'cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION',
                        'export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)',
                        options.buildCommand,
                        options.destroyCommand,
                    ],
                },
            },
        });
        return {
            deployBuildspec,
            destroyBuildspec,
        };
    }
    else {
        return {
            deployBuildspec: undefined,
            destroyBuildspec: undefined,
        };
    }
}
exports.createBuildspecs = createBuildspecs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQnVpbGRzcGVjcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvY3JlYXRlQnVpbGRzcGVjcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBc0Q7QUFHdEQsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBbUI7SUFDbEQsSUFBSSxPQUFPLENBQUMsbUJBQW1CLElBQUksT0FBTyxDQUFDLG9CQUFvQixFQUFFO1FBQy9ELE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUM3RixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FDdkIsQ0FBQztRQUNGLElBQUksdUJBQXVCLEVBQUU7WUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO1NBQzlEO1FBQ0QsT0FBTztZQUNMLGVBQWUsRUFBRSx5QkFBUyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxtQkFBb0IsQ0FBQztZQUMzRSxnQkFBZ0IsRUFBRSx5QkFBUyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxvQkFBcUIsQ0FBQztTQUM5RSxDQUFDO0tBQ0g7U0FBTSxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7UUFDakMsTUFBTSxlQUFlLEdBQUcseUJBQVMsQ0FBQyxVQUFVLENBQUM7WUFDM0MsT0FBTyxFQUFFLEdBQUc7WUFDWixHQUFHLEVBQUU7Z0JBQ0gsU0FBUyxFQUFFO29CQUNULGdCQUFnQixFQUFFLDBCQUEwQjtvQkFDNUMsWUFBWSxFQUFFLHNCQUFzQjtvQkFDcEMsY0FBYyxFQUFFLHdCQUF3QjtvQkFDeEMsdUJBQXVCLEVBQUUsaUNBQWlDO2lCQUMzRDthQUNGO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLE9BQU8sRUFBRTtvQkFDUCxZQUFZLEVBQUUsT0FBTztvQkFDckIsa0JBQWtCLEVBQUU7d0JBQ2xCLE1BQU0sRUFBRSxFQUFFO3FCQUNYO29CQUNELFVBQVUsRUFBRTt3QkFDVix5QkFBeUIsT0FBTyxDQUFDLGNBQWMsRUFBRTt3QkFDakQsT0FBTyxDQUFDLGNBQWM7cUJBQ3ZCO2lCQUNGO2dCQUNELFNBQVMsRUFBRTtvQkFDVCxZQUFZLEVBQUUsT0FBTztvQkFDckIsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsa0VBQWtFO3dCQUNsRSxPQUFPLENBQUMsZ0JBQWdCO3FCQUN6QjtpQkFDRjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsWUFBWSxFQUFFLE9BQU87b0JBQ3JCLFVBQVUsRUFBRTt3QkFDVix5Q0FBeUM7d0JBQ3pDLGtFQUFrRTt3QkFDbEUsT0FBTyxDQUFDLFlBQVk7d0JBQ3BCLE9BQU8sQ0FBQyxhQUFhO3FCQUN0QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBUyxDQUFDLFVBQVUsQ0FBQztZQUM1QyxPQUFPLEVBQUUsR0FBRztZQUNaLEdBQUcsRUFBRTtnQkFDSCxTQUFTLEVBQUU7b0JBQ1QsZ0JBQWdCLEVBQUUsMEJBQTBCO29CQUM1QyxZQUFZLEVBQUUsc0JBQXNCO29CQUNwQyxjQUFjLEVBQUUsd0JBQXdCO29CQUN4Qyx1QkFBdUIsRUFBRSxpQ0FBaUM7aUJBQzNEO2FBQ0Y7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFO29CQUNQLFlBQVksRUFBRSxPQUFPO29CQUNyQixrQkFBa0IsRUFBRTt3QkFDbEIsTUFBTSxFQUFFLEVBQUU7cUJBQ1g7b0JBQ0QsVUFBVSxFQUFFLENBQUMseUJBQXlCLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDO2lCQUN4RjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsWUFBWSxFQUFFLE9BQU87b0JBQ3JCLFVBQVUsRUFBRTt3QkFDVix5Q0FBeUM7d0JBQ3pDLGtFQUFrRTt3QkFDbEUsT0FBTyxDQUFDLFlBQVk7d0JBQ3BCLE9BQU8sQ0FBQyxjQUFjO3FCQUN2QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsT0FBTztZQUNMLGVBQWU7WUFDZixnQkFBZ0I7U0FDakIsQ0FBQztLQUNIO1NBQU07UUFDTCxPQUFPO1lBQ0wsZUFBZSxFQUFFLFNBQVM7WUFDMUIsZ0JBQWdCLEVBQUUsU0FBUztTQUM1QixDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBN0ZELDRDQTZGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1aWxkU3BlYyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlYnVpbGQnO1xuaW1wb3J0IHsgQ0xJT3B0aW9ucyB9IGZyb20gJy4vJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJ1aWxkc3BlY3Mob3B0aW9uczogQ0xJT3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5kZXBsb3lCdWlsZHNwZWNOYW1lIHx8IG9wdGlvbnMuZGVzdHJveUJ1aWxkc3BlY05hbWUpIHtcbiAgICBjb25zdCBwb3RlbnRpYWxNaXNzaW5nT3B0aW9ucyA9IFtvcHRpb25zLmRlcGxveUJ1aWxkc3BlY05hbWUsIG9wdGlvbnMuZGVwbG95QnVpbGRzcGVjTmFtZV0uZmluZChcbiAgICAgICh2KSA9PiB2ID09PSB1bmRlZmluZWQsXG4gICAgKTtcbiAgICBpZiAocG90ZW50aWFsTWlzc2luZ09wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBvcHRpb24gJHtwb3RlbnRpYWxNaXNzaW5nT3B0aW9uc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlcGxveUJ1aWxkc3BlYzogQnVpbGRTcGVjLmZyb21Tb3VyY2VGaWxlbmFtZShvcHRpb25zLmRlcGxveUJ1aWxkc3BlY05hbWUhKSxcbiAgICAgIGRlc3Ryb3lCdWlsZHNwZWM6IEJ1aWxkU3BlYy5mcm9tU291cmNlRmlsZW5hbWUob3B0aW9ucy5kZXN0cm95QnVpbGRzcGVjTmFtZSEpLFxuICAgIH07XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5pbnN0YWxsQ29tbWFuZCkge1xuICAgIGNvbnN0IGRlcGxveUJ1aWxkc3BlYyA9IEJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgIHZlcnNpb246IDAuMixcbiAgICAgIGVudjoge1xuICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICBDRk5fUkVTUE9OU0VfVVJMOiAnQ0ZOX1JFU1BPTlNFX1VSTF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fU1RBQ0tfSUQ6ICdDRk5fU1RBQ0tfSURfTk9UX1NFVCcsXG4gICAgICAgICAgQ0ZOX1JFUVVFU1RfSUQ6ICdDRk5fUkVRVUVTVF9JRF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRDogJ0NGTl9MT0dJQ0FMX1JFU09VUkNFX0lEX05PVF9TRVQnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBoYXNlczoge1xuICAgICAgICBpbnN0YWxsOiB7XG4gICAgICAgICAgJ29uLWZhaWx1cmUnOiAnQUJPUlQnLFxuICAgICAgICAgICdydW50aW1lLXZlcnNpb25zJzoge1xuICAgICAgICAgICAgbm9kZWpzOiAxNCxcbiAgICAgICAgICB9LFxuICAgICAgICAgICdjb21tYW5kcyc6IFtcbiAgICAgICAgICAgIGBjZCAkQ09ERUJVSUxEX1NSQ19ESVIvJHtvcHRpb25zLmNka1Byb2plY3RQYXRofWAsXG4gICAgICAgICAgICBvcHRpb25zLmluc3RhbGxDb21tYW5kLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHByZV9idWlsZDoge1xuICAgICAgICAgICdvbi1mYWlsdXJlJzogJ0FCT1JUJyxcbiAgICAgICAgICAnY29tbWFuZHMnOiBbXG4gICAgICAgICAgICAnY2QgJENPREVCVUlMRF9TUkNfRElSLyRDREtfQVBQX0xPQ0FUSU9OJyxcbiAgICAgICAgICAgICdleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpJyxcbiAgICAgICAgICAgIG9wdGlvbnMuYm9vdHN0cmFwQ29tbWFuZCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBidWlsZDoge1xuICAgICAgICAgICdvbi1mYWlsdXJlJzogJ0FCT1JUJyxcbiAgICAgICAgICAnY29tbWFuZHMnOiBbXG4gICAgICAgICAgICAnY2QgJENPREVCVUlMRF9TUkNfRElSLyRDREtfQVBQX0xPQ0FUSU9OJyxcbiAgICAgICAgICAgICdleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpJyxcbiAgICAgICAgICAgIG9wdGlvbnMuYnVpbGRDb21tYW5kLFxuICAgICAgICAgICAgb3B0aW9ucy5kZXBsb3lDb21tYW5kLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGVzdHJveUJ1aWxkc3BlYyA9IEJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgIHZlcnNpb246IDAuMixcbiAgICAgIGVudjoge1xuICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICBDRk5fUkVTUE9OU0VfVVJMOiAnQ0ZOX1JFU1BPTlNFX1VSTF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fU1RBQ0tfSUQ6ICdDRk5fU1RBQ0tfSURfTk9UX1NFVCcsXG4gICAgICAgICAgQ0ZOX1JFUVVFU1RfSUQ6ICdDRk5fUkVRVUVTVF9JRF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRDogJ0NGTl9MT0dJQ0FMX1JFU09VUkNFX0lEX05PVF9TRVQnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBoYXNlczoge1xuICAgICAgICBpbnN0YWxsOiB7XG4gICAgICAgICAgJ29uLWZhaWx1cmUnOiAnQUJPUlQnLFxuICAgICAgICAgICdydW50aW1lLXZlcnNpb25zJzoge1xuICAgICAgICAgICAgbm9kZWpzOiAxNCxcbiAgICAgICAgICB9LFxuICAgICAgICAgICdjb21tYW5kcyc6IFtgY2QgJENPREVCVUlMRF9TUkNfRElSLyR7b3B0aW9ucy5jZGtQcm9qZWN0UGF0aH1gLCBvcHRpb25zLmluc3RhbGxDb21tYW5kXSxcbiAgICAgICAgfSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAnb24tZmFpbHVyZSc6ICdBQk9SVCcsXG4gICAgICAgICAgJ2NvbW1hbmRzJzogW1xuICAgICAgICAgICAgJ2NkICRDT0RFQlVJTERfU1JDX0RJUi8kQ0RLX0FQUF9MT0NBVElPTicsXG4gICAgICAgICAgICAnZXhwb3J0IEFXU19BQ0NPVU5UX0lEPSQoZWNobyAkQ09ERUJVSUxEX0JVSUxEX0FSTiB8IGN1dCAtZDogLWY1KScsXG4gICAgICAgICAgICBvcHRpb25zLmJ1aWxkQ29tbWFuZCxcbiAgICAgICAgICAgIG9wdGlvbnMuZGVzdHJveUNvbW1hbmQsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlcGxveUJ1aWxkc3BlYyxcbiAgICAgIGRlc3Ryb3lCdWlsZHNwZWMsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVwbG95QnVpbGRzcGVjOiB1bmRlZmluZWQsXG4gICAgICBkZXN0cm95QnVpbGRzcGVjOiB1bmRlZmluZWQsXG4gICAgfTtcbiAgfVxufVxuIl19