import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';

export function createBuildspecs(options: any) {
  let runtimeName = options.runtimeName?.toString();
  let runtimeVersion = options.runtimeVersion?.toString();
  if (options.deployBuildspecName || options.destroyBuildspecName) {
    const potentialMissingOptions = [options.deployBuildspecName, options.deployBuildspecName].find(
      (v) => v === undefined,
    );
    if (potentialMissingOptions) {
      throw new Error(`Missing option ${potentialMissingOptions}`);
    }
    return {
      deployBuildspec: BuildSpec.fromSourceFilename(options.deployBuildspecName!),
      destroyBuildspec: BuildSpec.fromSourceFilename(options.destroyBuildspecName!),
    };
  } else if (options.installCommand) {
    const deployBuildspec = BuildSpec.fromObject({
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

    const destroyBuildspec = BuildSpec.fromObject({
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
  } else {
    return {
      deployBuildspec: undefined,
      destroyBuildspec: undefined,
    };
  }
}
