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
                        'cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION',
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
                    'commands': [
                        'cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION',
                        options.installCommand,
                    ],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQnVpbGRzcGVjcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvY3JlYXRlQnVpbGRzcGVjcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBc0Q7QUFFdEQsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBWTtJQUMzQyxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsSUFBSSxPQUFPLENBQUMsb0JBQW9CLEVBQUU7UUFDL0QsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQzdGLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUN2QixDQUFDO1FBQ0YsSUFBSSx1QkFBdUIsRUFBRTtZQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQix1QkFBdUIsRUFBRSxDQUFDLENBQUM7U0FDOUQ7UUFDRCxPQUFPO1lBQ0wsZUFBZSxFQUFFLHlCQUFTLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLG1CQUFvQixDQUFDO1lBQzNFLGdCQUFnQixFQUFFLHlCQUFTLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLG9CQUFxQixDQUFDO1NBQzlFLENBQUM7S0FDSDtTQUFNLElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtRQUNqQyxNQUFNLGVBQWUsR0FBRyx5QkFBUyxDQUFDLFVBQVUsQ0FBQztZQUMzQyxPQUFPLEVBQUUsR0FBRztZQUNaLEdBQUcsRUFBRTtnQkFDSCxTQUFTLEVBQUU7b0JBQ1QsZ0JBQWdCLEVBQUUsMEJBQTBCO29CQUM1QyxZQUFZLEVBQUUsc0JBQXNCO29CQUNwQyxjQUFjLEVBQUUsd0JBQXdCO29CQUN4Qyx1QkFBdUIsRUFBRSxpQ0FBaUM7aUJBQzNEO2FBQ0Y7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFO29CQUNQLFlBQVksRUFBRSxPQUFPO29CQUNyQixrQkFBa0IsRUFBRTt3QkFDbEIsTUFBTSxFQUFFLEVBQUU7cUJBQ1g7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsT0FBTyxDQUFDLGNBQWM7cUJBQ3ZCO2lCQUNGO2dCQUNELFNBQVMsRUFBRTtvQkFDVCxZQUFZLEVBQUUsT0FBTztvQkFDckIsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsa0VBQWtFO3dCQUNsRSxPQUFPLENBQUMsZ0JBQWdCO3FCQUN6QjtpQkFDRjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsWUFBWSxFQUFFLE9BQU87b0JBQ3JCLFVBQVUsRUFBRTt3QkFDVix5Q0FBeUM7d0JBQ3pDLGtFQUFrRTt3QkFDbEUsT0FBTyxDQUFDLFlBQVk7d0JBQ3BCLE9BQU8sQ0FBQyxhQUFhO3FCQUN0QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBUyxDQUFDLFVBQVUsQ0FBQztZQUM1QyxPQUFPLEVBQUUsR0FBRztZQUNaLEdBQUcsRUFBRTtnQkFDSCxTQUFTLEVBQUU7b0JBQ1QsZ0JBQWdCLEVBQUUsMEJBQTBCO29CQUM1QyxZQUFZLEVBQUUsc0JBQXNCO29CQUNwQyxjQUFjLEVBQUUsd0JBQXdCO29CQUN4Qyx1QkFBdUIsRUFBRSxpQ0FBaUM7aUJBQzNEO2FBQ0Y7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFO29CQUNQLFlBQVksRUFBRSxPQUFPO29CQUNyQixrQkFBa0IsRUFBRTt3QkFDbEIsTUFBTSxFQUFFLEVBQUU7cUJBQ1g7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsT0FBTyxDQUFDLGNBQWM7cUJBQ3ZCO2lCQUNGO2dCQUNELEtBQUssRUFBRTtvQkFDTCxZQUFZLEVBQUUsT0FBTztvQkFDckIsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsa0VBQWtFO3dCQUNsRSxPQUFPLENBQUMsWUFBWTt3QkFDcEIsT0FBTyxDQUFDLGNBQWM7cUJBQ3ZCO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFDSCxPQUFPO1lBQ0wsZUFBZTtZQUNmLGdCQUFnQjtTQUNqQixDQUFDO0tBQ0g7U0FBTTtRQUNMLE9BQU87WUFDTCxlQUFlLEVBQUUsU0FBUztZQUMxQixnQkFBZ0IsRUFBRSxTQUFTO1NBQzVCLENBQUM7S0FDSDtBQUNILENBQUM7QUFoR0QsNENBZ0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnVpbGRTcGVjIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCdWlsZHNwZWNzKG9wdGlvbnM6IGFueSkge1xuICBpZiAob3B0aW9ucy5kZXBsb3lCdWlsZHNwZWNOYW1lIHx8IG9wdGlvbnMuZGVzdHJveUJ1aWxkc3BlY05hbWUpIHtcbiAgICBjb25zdCBwb3RlbnRpYWxNaXNzaW5nT3B0aW9ucyA9IFtvcHRpb25zLmRlcGxveUJ1aWxkc3BlY05hbWUsIG9wdGlvbnMuZGVwbG95QnVpbGRzcGVjTmFtZV0uZmluZChcbiAgICAgICh2KSA9PiB2ID09PSB1bmRlZmluZWQsXG4gICAgKTtcbiAgICBpZiAocG90ZW50aWFsTWlzc2luZ09wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBvcHRpb24gJHtwb3RlbnRpYWxNaXNzaW5nT3B0aW9uc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlcGxveUJ1aWxkc3BlYzogQnVpbGRTcGVjLmZyb21Tb3VyY2VGaWxlbmFtZShvcHRpb25zLmRlcGxveUJ1aWxkc3BlY05hbWUhKSxcbiAgICAgIGRlc3Ryb3lCdWlsZHNwZWM6IEJ1aWxkU3BlYy5mcm9tU291cmNlRmlsZW5hbWUob3B0aW9ucy5kZXN0cm95QnVpbGRzcGVjTmFtZSEpLFxuICAgIH07XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5pbnN0YWxsQ29tbWFuZCkge1xuICAgIGNvbnN0IGRlcGxveUJ1aWxkc3BlYyA9IEJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgIHZlcnNpb246IDAuMixcbiAgICAgIGVudjoge1xuICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICBDRk5fUkVTUE9OU0VfVVJMOiAnQ0ZOX1JFU1BPTlNFX1VSTF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fU1RBQ0tfSUQ6ICdDRk5fU1RBQ0tfSURfTk9UX1NFVCcsXG4gICAgICAgICAgQ0ZOX1JFUVVFU1RfSUQ6ICdDRk5fUkVRVUVTVF9JRF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRDogJ0NGTl9MT0dJQ0FMX1JFU09VUkNFX0lEX05PVF9TRVQnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBoYXNlczoge1xuICAgICAgICBpbnN0YWxsOiB7XG4gICAgICAgICAgJ29uLWZhaWx1cmUnOiAnQUJPUlQnLFxuICAgICAgICAgICdydW50aW1lLXZlcnNpb25zJzoge1xuICAgICAgICAgICAgbm9kZWpzOiAxNCxcbiAgICAgICAgICB9LFxuICAgICAgICAgICdjb21tYW5kcyc6IFtcbiAgICAgICAgICAgICdjZCAkQ09ERUJVSUxEX1NSQ19ESVIvJENES19BUFBfTE9DQVRJT04nLFxuICAgICAgICAgICAgb3B0aW9ucy5pbnN0YWxsQ29tbWFuZCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBwcmVfYnVpbGQ6IHtcbiAgICAgICAgICAnb24tZmFpbHVyZSc6ICdBQk9SVCcsXG4gICAgICAgICAgJ2NvbW1hbmRzJzogW1xuICAgICAgICAgICAgJ2NkICRDT0RFQlVJTERfU1JDX0RJUi8kQ0RLX0FQUF9MT0NBVElPTicsXG4gICAgICAgICAgICAnZXhwb3J0IEFXU19BQ0NPVU5UX0lEPSQoZWNobyAkQ09ERUJVSUxEX0JVSUxEX0FSTiB8IGN1dCAtZDogLWY1KScsXG4gICAgICAgICAgICBvcHRpb25zLmJvb3RzdHJhcENvbW1hbmQsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAnb24tZmFpbHVyZSc6ICdBQk9SVCcsXG4gICAgICAgICAgJ2NvbW1hbmRzJzogW1xuICAgICAgICAgICAgJ2NkICRDT0RFQlVJTERfU1JDX0RJUi8kQ0RLX0FQUF9MT0NBVElPTicsXG4gICAgICAgICAgICAnZXhwb3J0IEFXU19BQ0NPVU5UX0lEPSQoZWNobyAkQ09ERUJVSUxEX0JVSUxEX0FSTiB8IGN1dCAtZDogLWY1KScsXG4gICAgICAgICAgICBvcHRpb25zLmJ1aWxkQ29tbWFuZCxcbiAgICAgICAgICAgIG9wdGlvbnMuZGVwbG95Q29tbWFuZCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRlc3Ryb3lCdWlsZHNwZWMgPSBCdWlsZFNwZWMuZnJvbU9iamVjdCh7XG4gICAgICB2ZXJzaW9uOiAwLjIsXG4gICAgICBlbnY6IHtcbiAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgQ0ZOX1JFU1BPTlNFX1VSTDogJ0NGTl9SRVNQT05TRV9VUkxfTk9UX1NFVCcsXG4gICAgICAgICAgQ0ZOX1NUQUNLX0lEOiAnQ0ZOX1NUQUNLX0lEX05PVF9TRVQnLFxuICAgICAgICAgIENGTl9SRVFVRVNUX0lEOiAnQ0ZOX1JFUVVFU1RfSURfTk9UX1NFVCcsXG4gICAgICAgICAgQ0ZOX0xPR0lDQUxfUkVTT1VSQ0VfSUQ6ICdDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRF9OT1RfU0VUJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwaGFzZXM6IHtcbiAgICAgICAgaW5zdGFsbDoge1xuICAgICAgICAgICdvbi1mYWlsdXJlJzogJ0FCT1JUJyxcbiAgICAgICAgICAncnVudGltZS12ZXJzaW9ucyc6IHtcbiAgICAgICAgICAgIG5vZGVqczogMTQsXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnY29tbWFuZHMnOiBbXG4gICAgICAgICAgICAnY2QgJENPREVCVUlMRF9TUkNfRElSLyRDREtfQVBQX0xPQ0FUSU9OJyxcbiAgICAgICAgICAgIG9wdGlvbnMuaW5zdGFsbENvbW1hbmQsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAnb24tZmFpbHVyZSc6ICdBQk9SVCcsXG4gICAgICAgICAgJ2NvbW1hbmRzJzogW1xuICAgICAgICAgICAgJ2NkICRDT0RFQlVJTERfU1JDX0RJUi8kQ0RLX0FQUF9MT0NBVElPTicsXG4gICAgICAgICAgICAnZXhwb3J0IEFXU19BQ0NPVU5UX0lEPSQoZWNobyAkQ09ERUJVSUxEX0JVSUxEX0FSTiB8IGN1dCAtZDogLWY1KScsXG4gICAgICAgICAgICBvcHRpb25zLmJ1aWxkQ29tbWFuZCxcbiAgICAgICAgICAgIG9wdGlvbnMuZGVzdHJveUNvbW1hbmQsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlcGxveUJ1aWxkc3BlYyxcbiAgICAgIGRlc3Ryb3lCdWlsZHNwZWMsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVwbG95QnVpbGRzcGVjOiB1bmRlZmluZWQsXG4gICAgICBkZXN0cm95QnVpbGRzcGVjOiB1bmRlZmluZWQsXG4gICAgfTtcbiAgfVxufVxuIl19