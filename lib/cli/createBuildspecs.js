"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuildspecs = void 0;
const aws_codebuild_1 = require("aws-cdk-lib/aws-codebuild");
function createBuildspecs(options) {
    let runtimeName = options.runtimeName?.toString();
    let runtimeVersion = options.runtimeVersion?.toString();
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
                        [runtimeName]: runtimeVersion
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
                        [runtimeName]: runtimeVersion
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQnVpbGRzcGVjcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvY3JlYXRlQnVpbGRzcGVjcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBc0Q7QUFFdEQsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBWTtJQUMzQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQ2xELElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDeEQsSUFBSSxPQUFPLENBQUMsbUJBQW1CLElBQUksT0FBTyxDQUFDLG9CQUFvQixFQUFFO1FBQy9ELE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUM3RixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FDdkIsQ0FBQztRQUNGLElBQUksdUJBQXVCLEVBQUU7WUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO1NBQzlEO1FBQ0QsT0FBTztZQUNMLGVBQWUsRUFBRSx5QkFBUyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxtQkFBb0IsQ0FBQztZQUMzRSxnQkFBZ0IsRUFBRSx5QkFBUyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxvQkFBcUIsQ0FBQztTQUM5RSxDQUFDO0tBQ0g7U0FBTSxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7UUFDakMsTUFBTSxlQUFlLEdBQUcseUJBQVMsQ0FBQyxVQUFVLENBQUM7WUFDM0MsT0FBTyxFQUFFLEdBQUc7WUFDWixHQUFHLEVBQUU7Z0JBQ0gsU0FBUyxFQUFFO29CQUNULGdCQUFnQixFQUFFLDBCQUEwQjtvQkFDNUMsWUFBWSxFQUFFLHNCQUFzQjtvQkFDcEMsY0FBYyxFQUFFLHdCQUF3QjtvQkFDeEMsdUJBQXVCLEVBQUUsaUNBQWlDO2lCQUMzRDthQUNGO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLE9BQU8sRUFBRTtvQkFDUCxZQUFZLEVBQUUsT0FBTztvQkFDckIsa0JBQWtCLEVBQUU7d0JBQ2xCLENBQUMsV0FBVyxDQUFDLEVBQUUsY0FBYztxQkFDOUI7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsT0FBTyxDQUFDLGNBQWM7cUJBQ3ZCO2lCQUNGO2dCQUNELFNBQVMsRUFBRTtvQkFDVCxZQUFZLEVBQUUsT0FBTztvQkFDckIsVUFBVSxFQUFFO3dCQUNWLHlDQUF5Qzt3QkFDekMsa0VBQWtFO3dCQUNsRSxPQUFPLENBQUMsZ0JBQWdCO3FCQUN6QjtpQkFDRjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsWUFBWSxFQUFFLE9BQU87b0JBQ3JCLFVBQVUsRUFBRTt3QkFDVix5Q0FBeUM7d0JBQ3pDLGtFQUFrRTt3QkFDbEUsT0FBTyxDQUFDLFlBQVk7d0JBQ3BCLE9BQU8sQ0FBQyxhQUFhO3FCQUN0QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBUyxDQUFDLFVBQVUsQ0FBQztZQUM1QyxPQUFPLEVBQUUsR0FBRztZQUNaLEdBQUcsRUFBRTtnQkFDSCxTQUFTLEVBQUU7b0JBQ1QsZ0JBQWdCLEVBQUUsMEJBQTBCO29CQUM1QyxZQUFZLEVBQUUsc0JBQXNCO29CQUNwQyxjQUFjLEVBQUUsd0JBQXdCO29CQUN4Qyx1QkFBdUIsRUFBRSxpQ0FBaUM7aUJBQzNEO2FBQ0Y7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFO29CQUNQLFlBQVksRUFBRSxPQUFPO29CQUNyQixrQkFBa0IsRUFBRTt3QkFDbEIsQ0FBQyxXQUFXLENBQUMsRUFBRSxjQUFjO3FCQUM5QjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1YseUNBQXlDO3dCQUN6QyxPQUFPLENBQUMsY0FBYztxQkFDdkI7aUJBQ0Y7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBRSxPQUFPO29CQUNyQixVQUFVLEVBQUU7d0JBQ1YseUNBQXlDO3dCQUN6QyxrRUFBa0U7d0JBQ2xFLE9BQU8sQ0FBQyxZQUFZO3dCQUNwQixPQUFPLENBQUMsY0FBYztxQkFDdkI7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUNILE9BQU87WUFDTCxlQUFlO1lBQ2YsZ0JBQWdCO1NBQ2pCLENBQUM7S0FDSDtTQUFNO1FBQ0wsT0FBTztZQUNMLGVBQWUsRUFBRSxTQUFTO1lBQzFCLGdCQUFnQixFQUFFLFNBQVM7U0FDNUIsQ0FBQztLQUNIO0FBQ0gsQ0FBQztBQWxHRCw0Q0FrR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWlsZFNwZWMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29kZWJ1aWxkJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJ1aWxkc3BlY3Mob3B0aW9uczogYW55KSB7XG4gIGxldCBydW50aW1lTmFtZSA9IG9wdGlvbnMucnVudGltZU5hbWU/LnRvU3RyaW5nKCk7XG4gIGxldCBydW50aW1lVmVyc2lvbiA9IG9wdGlvbnMucnVudGltZVZlcnNpb24/LnRvU3RyaW5nKCk7XG4gIGlmIChvcHRpb25zLmRlcGxveUJ1aWxkc3BlY05hbWUgfHwgb3B0aW9ucy5kZXN0cm95QnVpbGRzcGVjTmFtZSkge1xuICAgIGNvbnN0IHBvdGVudGlhbE1pc3NpbmdPcHRpb25zID0gW29wdGlvbnMuZGVwbG95QnVpbGRzcGVjTmFtZSwgb3B0aW9ucy5kZXBsb3lCdWlsZHNwZWNOYW1lXS5maW5kKFxuICAgICAgKHYpID0+IHYgPT09IHVuZGVmaW5lZCxcbiAgICApO1xuICAgIGlmIChwb3RlbnRpYWxNaXNzaW5nT3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIG9wdGlvbiAke3BvdGVudGlhbE1pc3NpbmdPcHRpb25zfWApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZGVwbG95QnVpbGRzcGVjOiBCdWlsZFNwZWMuZnJvbVNvdXJjZUZpbGVuYW1lKG9wdGlvbnMuZGVwbG95QnVpbGRzcGVjTmFtZSEpLFxuICAgICAgZGVzdHJveUJ1aWxkc3BlYzogQnVpbGRTcGVjLmZyb21Tb3VyY2VGaWxlbmFtZShvcHRpb25zLmRlc3Ryb3lCdWlsZHNwZWNOYW1lISksXG4gICAgfTtcbiAgfSBlbHNlIGlmIChvcHRpb25zLmluc3RhbGxDb21tYW5kKSB7XG4gICAgY29uc3QgZGVwbG95QnVpbGRzcGVjID0gQnVpbGRTcGVjLmZyb21PYmplY3Qoe1xuICAgICAgdmVyc2lvbjogMC4yLFxuICAgICAgZW52OiB7XG4gICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgIENGTl9SRVNQT05TRV9VUkw6ICdDRk5fUkVTUE9OU0VfVVJMX05PVF9TRVQnLFxuICAgICAgICAgIENGTl9TVEFDS19JRDogJ0NGTl9TVEFDS19JRF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fUkVRVUVTVF9JRDogJ0NGTl9SRVFVRVNUX0lEX05PVF9TRVQnLFxuICAgICAgICAgIENGTl9MT0dJQ0FMX1JFU09VUkNFX0lEOiAnQ0ZOX0xPR0lDQUxfUkVTT1VSQ0VfSURfTk9UX1NFVCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGhhc2VzOiB7XG4gICAgICAgIGluc3RhbGw6IHtcbiAgICAgICAgICAnb24tZmFpbHVyZSc6ICdBQk9SVCcsXG4gICAgICAgICAgJ3J1bnRpbWUtdmVyc2lvbnMnOiB7XG4gICAgICAgICAgICBbcnVudGltZU5hbWVdOiBydW50aW1lVmVyc2lvblxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ2NvbW1hbmRzJzogW1xuICAgICAgICAgICAgJ2NkICRDT0RFQlVJTERfU1JDX0RJUi8kQ0RLX0FQUF9MT0NBVElPTicsXG4gICAgICAgICAgICBvcHRpb25zLmluc3RhbGxDb21tYW5kLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHByZV9idWlsZDoge1xuICAgICAgICAgICdvbi1mYWlsdXJlJzogJ0FCT1JUJyxcbiAgICAgICAgICAnY29tbWFuZHMnOiBbXG4gICAgICAgICAgICAnY2QgJENPREVCVUlMRF9TUkNfRElSLyRDREtfQVBQX0xPQ0FUSU9OJyxcbiAgICAgICAgICAgICdleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpJyxcbiAgICAgICAgICAgIG9wdGlvbnMuYm9vdHN0cmFwQ29tbWFuZCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBidWlsZDoge1xuICAgICAgICAgICdvbi1mYWlsdXJlJzogJ0FCT1JUJyxcbiAgICAgICAgICAnY29tbWFuZHMnOiBbXG4gICAgICAgICAgICAnY2QgJENPREVCVUlMRF9TUkNfRElSLyRDREtfQVBQX0xPQ0FUSU9OJyxcbiAgICAgICAgICAgICdleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpJyxcbiAgICAgICAgICAgIG9wdGlvbnMuYnVpbGRDb21tYW5kLFxuICAgICAgICAgICAgb3B0aW9ucy5kZXBsb3lDb21tYW5kLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGVzdHJveUJ1aWxkc3BlYyA9IEJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgIHZlcnNpb246IDAuMixcbiAgICAgIGVudjoge1xuICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICBDRk5fUkVTUE9OU0VfVVJMOiAnQ0ZOX1JFU1BPTlNFX1VSTF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fU1RBQ0tfSUQ6ICdDRk5fU1RBQ0tfSURfTk9UX1NFVCcsXG4gICAgICAgICAgQ0ZOX1JFUVVFU1RfSUQ6ICdDRk5fUkVRVUVTVF9JRF9OT1RfU0VUJyxcbiAgICAgICAgICBDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRDogJ0NGTl9MT0dJQ0FMX1JFU09VUkNFX0lEX05PVF9TRVQnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBoYXNlczoge1xuICAgICAgICBpbnN0YWxsOiB7XG4gICAgICAgICAgJ29uLWZhaWx1cmUnOiAnQUJPUlQnLFxuICAgICAgICAgICdydW50aW1lLXZlcnNpb25zJzoge1xuICAgICAgICAgICAgW3J1bnRpbWVOYW1lXTogcnVudGltZVZlcnNpb25cbiAgICAgICAgICB9LFxuICAgICAgICAgICdjb21tYW5kcyc6IFtcbiAgICAgICAgICAgICdjZCAkQ09ERUJVSUxEX1NSQ19ESVIvJENES19BUFBfTE9DQVRJT04nLFxuICAgICAgICAgICAgb3B0aW9ucy5pbnN0YWxsQ29tbWFuZCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBidWlsZDoge1xuICAgICAgICAgICdvbi1mYWlsdXJlJzogJ0FCT1JUJyxcbiAgICAgICAgICAnY29tbWFuZHMnOiBbXG4gICAgICAgICAgICAnY2QgJENPREVCVUlMRF9TUkNfRElSLyRDREtfQVBQX0xPQ0FUSU9OJyxcbiAgICAgICAgICAgICdleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpJyxcbiAgICAgICAgICAgIG9wdGlvbnMuYnVpbGRDb21tYW5kLFxuICAgICAgICAgICAgb3B0aW9ucy5kZXN0cm95Q29tbWFuZCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgZGVwbG95QnVpbGRzcGVjLFxuICAgICAgZGVzdHJveUJ1aWxkc3BlYyxcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBkZXBsb3lCdWlsZHNwZWM6IHVuZGVmaW5lZCxcbiAgICAgIGRlc3Ryb3lCdWlsZHNwZWM6IHVuZGVmaW5lZCxcbiAgICB9O1xuICB9XG59XG4iXX0=