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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQnVpbGRzcGVjcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvY3JlYXRlQnVpbGRzcGVjcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBc0Q7QUFFdEQsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBWTtJQUMzQyxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsSUFBSSxPQUFPLENBQUMsb0JBQW9CLEVBQUU7UUFDL0QsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQzdGLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUN2QixDQUFDO1FBQ0YsSUFBSSx1QkFBdUIsRUFBRTtZQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQix1QkFBdUIsRUFBRSxDQUFDLENBQUM7U0FDOUQ7UUFDRCxPQUFPO1lBQ0wsZUFBZSxFQUFFLHlCQUFTLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLG1CQUFvQixDQUFDO1lBQzNFLGdCQUFnQixFQUFFLHlCQUFTLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLG9CQUFxQixDQUFDO1NBQzlFLENBQUM7S0FDSDtTQUFNLElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtRQUNqQyxNQUFNLGVBQWUsR0FBRyx5QkFBUyxDQUFDLFVBQVUsQ0FBQztZQUMzQyxPQUFPLEVBQUUsR0FBRztZQUNaLEdBQUcsRUFBRTtnQkFDSCxTQUFTLEVBQUU7b0JBQ1QsZ0JBQWdCLEVBQUUsMEJBQTBCO29CQUM1QyxZQUFZLEVBQUUsc0JBQXNCO29CQUNwQyxjQUFjLEVBQUUsd0JBQXdCO29CQUN4Qyx1QkFBdUIsRUFBRSxpQ0FBaUM7aUJBQzNEO2FBQ0Y7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFO29CQUNQLFlBQVksRUFBRSxPQUFPO29CQUNyQixrQkFBa0IsRUFBRTt3QkFDbEIsTUFBTSxFQUFFLEVBQUU7cUJBQ1g7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLHlCQUF5QixPQUFPLENBQUMsY0FBYyxFQUFFO3dCQUNqRCxPQUFPLENBQUMsY0FBYztxQkFDdkI7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULFlBQVksRUFBRSxPQUFPO29CQUNyQixVQUFVLEVBQUU7d0JBQ1YseUNBQXlDO3dCQUN6QyxrRUFBa0U7d0JBQ2xFLE9BQU8sQ0FBQyxnQkFBZ0I7cUJBQ3pCO2lCQUNGO2dCQUNELEtBQUssRUFBRTtvQkFDTCxZQUFZLEVBQUUsT0FBTztvQkFDckIsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsa0VBQWtFO3dCQUNsRSxPQUFPLENBQUMsWUFBWTt3QkFDcEIsT0FBTyxDQUFDLGFBQWE7cUJBQ3RCO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLGdCQUFnQixHQUFHLHlCQUFTLENBQUMsVUFBVSxDQUFDO1lBQzVDLE9BQU8sRUFBRSxHQUFHO1lBQ1osR0FBRyxFQUFFO2dCQUNILFNBQVMsRUFBRTtvQkFDVCxnQkFBZ0IsRUFBRSwwQkFBMEI7b0JBQzVDLFlBQVksRUFBRSxzQkFBc0I7b0JBQ3BDLGNBQWMsRUFBRSx3QkFBd0I7b0JBQ3hDLHVCQUF1QixFQUFFLGlDQUFpQztpQkFDM0Q7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUU7b0JBQ1AsWUFBWSxFQUFFLE9BQU87b0JBQ3JCLGtCQUFrQixFQUFFO3dCQUNsQixNQUFNLEVBQUUsRUFBRTtxQkFDWDtvQkFDRCxVQUFVLEVBQUUsQ0FBQyx5QkFBeUIsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUM7aUJBQ3hGO2dCQUNELEtBQUssRUFBRTtvQkFDTCxZQUFZLEVBQUUsT0FBTztvQkFDckIsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsa0VBQWtFO3dCQUNsRSxPQUFPLENBQUMsWUFBWTt3QkFDcEIsT0FBTyxDQUFDLGNBQWM7cUJBQ3ZCO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFDSCxPQUFPO1lBQ0wsZUFBZTtZQUNmLGdCQUFnQjtTQUNqQixDQUFDO0tBQ0g7U0FBTTtRQUNMLE9BQU87WUFDTCxlQUFlLEVBQUUsU0FBUztZQUMxQixnQkFBZ0IsRUFBRSxTQUFTO1NBQzVCLENBQUM7S0FDSDtBQUNILENBQUM7QUE3RkQsNENBNkZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnVpbGRTcGVjIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCdWlsZHNwZWNzKG9wdGlvbnM6IGFueSkge1xuICBpZiAob3B0aW9ucy5kZXBsb3lCdWlsZHNwZWNOYW1lIHx8IG9wdGlvbnMuZGVzdHJveUJ1aWxkc3BlY05hbWUpIHtcbiAgICBjb25zdCBwb3RlbnRpYWxNaXNzaW5nT3B0aW9ucyA9IFtvcHRpb25zLmRlcGxveUJ1aWxkc3BlY05hbWUsIG9wdGlvbnMuZGVwbG95QnVpbGRzcGVjTmFtZV0uZmluZChcbiAgICAgICh2KSA9PiB2ID09PSB1bmRlZmluZWQsXG4gICAgKTtcbiAgICBpZiAocG90ZW50aWFsTWlzc2luZ09wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBvcHRpb24gJHtwb3RlbnRpYWxNaXNzaW5nT3B0aW9uc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlcGxveUJ1aWxkc3BlYzogQnVpbGRTcGVjLmZyb21Tb3VyY2VGaWxlbmFtZShvcHRpb25zLmRlcGxveUJ1aWxkc3BlY05hbWUhKSxcbiAgICAgIGRlc3Ryb3lCdWlsZHNwZWM6IEJ1aWxkU3BlYy5mcm9tU291cmNlRmlsZW5hbWUob3B0aW9ucy5kZXN0cm95QnVpbGRzcGVjTmFtZSEpLFxuICAgIH07XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5pbnN0YWxsQ29tbWFuZCkge1xuICAgIGNvbnN0IGRlcGxveUJ1aWxkc3BlYyA9IEJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgIHZlcnNpb246IDAuMixcbiAgICAgIGVudjoge1xuICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICBDRk5fUkVTUE9OU0VfVVJMOiAnQ0ZOX1JFU1BPTlNFX1VSTF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fU1RBQ0tfSUQ6ICdDRk5fU1RBQ0tfSURfTk9UX1NFVCcsXG4gICAgICAgICAgQ0ZOX1JFUVVFU1RfSUQ6ICdDRk5fUkVRVUVTVF9JRF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRDogJ0NGTl9MT0dJQ0FMX1JFU09VUkNFX0lEX05PVF9TRVQnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBoYXNlczoge1xuICAgICAgICBpbnN0YWxsOiB7XG4gICAgICAgICAgJ29uLWZhaWx1cmUnOiAnQUJPUlQnLFxuICAgICAgICAgICdydW50aW1lLXZlcnNpb25zJzoge1xuICAgICAgICAgICAgbm9kZWpzOiAxNCxcbiAgICAgICAgICB9LFxuICAgICAgICAgICdjb21tYW5kcyc6IFtcbiAgICAgICAgICAgIGBjZCAkQ09ERUJVSUxEX1NSQ19ESVIvJHtvcHRpb25zLmNka1Byb2plY3RQYXRofWAsXG4gICAgICAgICAgICBvcHRpb25zLmluc3RhbGxDb21tYW5kLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHByZV9idWlsZDoge1xuICAgICAgICAgICdvbi1mYWlsdXJlJzogJ0FCT1JUJyxcbiAgICAgICAgICAnY29tbWFuZHMnOiBbXG4gICAgICAgICAgICAnY2QgJENPREVCVUlMRF9TUkNfRElSLyRDREtfQVBQX0xPQ0FUSU9OJyxcbiAgICAgICAgICAgICdleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpJyxcbiAgICAgICAgICAgIG9wdGlvbnMuYm9vdHN0cmFwQ29tbWFuZCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBidWlsZDoge1xuICAgICAgICAgICdvbi1mYWlsdXJlJzogJ0FCT1JUJyxcbiAgICAgICAgICAnY29tbWFuZHMnOiBbXG4gICAgICAgICAgICAnY2QgJENPREVCVUlMRF9TUkNfRElSLyRDREtfQVBQX0xPQ0FUSU9OJyxcbiAgICAgICAgICAgICdleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpJyxcbiAgICAgICAgICAgIG9wdGlvbnMuYnVpbGRDb21tYW5kLFxuICAgICAgICAgICAgb3B0aW9ucy5kZXBsb3lDb21tYW5kLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGVzdHJveUJ1aWxkc3BlYyA9IEJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgIHZlcnNpb246IDAuMixcbiAgICAgIGVudjoge1xuICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICBDRk5fUkVTUE9OU0VfVVJMOiAnQ0ZOX1JFU1BPTlNFX1VSTF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fU1RBQ0tfSUQ6ICdDRk5fU1RBQ0tfSURfTk9UX1NFVCcsXG4gICAgICAgICAgQ0ZOX1JFUVVFU1RfSUQ6ICdDRk5fUkVRVUVTVF9JRF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRDogJ0NGTl9MT0dJQ0FMX1JFU09VUkNFX0lEX05PVF9TRVQnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBoYXNlczoge1xuICAgICAgICBpbnN0YWxsOiB7XG4gICAgICAgICAgJ29uLWZhaWx1cmUnOiAnQUJPUlQnLFxuICAgICAgICAgICdydW50aW1lLXZlcnNpb25zJzoge1xuICAgICAgICAgICAgbm9kZWpzOiAxNCxcbiAgICAgICAgICB9LFxuICAgICAgICAgICdjb21tYW5kcyc6IFtgY2QgJENPREVCVUlMRF9TUkNfRElSLyR7b3B0aW9ucy5jZGtQcm9qZWN0UGF0aH1gLCBvcHRpb25zLmluc3RhbGxDb21tYW5kXSxcbiAgICAgICAgfSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAnb24tZmFpbHVyZSc6ICdBQk9SVCcsXG4gICAgICAgICAgJ2NvbW1hbmRzJzogW1xuICAgICAgICAgICAgJ2NkICRDT0RFQlVJTERfU1JDX0RJUi8kQ0RLX0FQUF9MT0NBVElPTicsXG4gICAgICAgICAgICAnZXhwb3J0IEFXU19BQ0NPVU5UX0lEPSQoZWNobyAkQ09ERUJVSUxEX0JVSUxEX0FSTiB8IGN1dCAtZDogLWY1KScsXG4gICAgICAgICAgICBvcHRpb25zLmJ1aWxkQ29tbWFuZCxcbiAgICAgICAgICAgIG9wdGlvbnMuZGVzdHJveUNvbW1hbmQsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlcGxveUJ1aWxkc3BlYyxcbiAgICAgIGRlc3Ryb3lCdWlsZHNwZWMsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVwbG95QnVpbGRzcGVjOiB1bmRlZmluZWQsXG4gICAgICBkZXN0cm95QnVpbGRzcGVjOiB1bmRlZmluZWQsXG4gICAgfTtcbiAgfVxufVxuIl19