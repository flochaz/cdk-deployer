"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCDKStandaloneDeployerCfnTemplate = void 0;
const cdk = require("aws-cdk-lib");
const aws_sdk_1 = require("aws-sdk");
const chalk = require("chalk");
const inquirer = require("inquirer");
const cdk_standalone_deployer_1 = require("../construct/cdk-standalone-deployer");
const createBuildspecs_1 = require("./createBuildspecs");
async function generateCDKStandaloneDeployerCfnTemplate(options) {
    const deployer = new cdk.App();
    console.log(chalk.white(`Generating deployer for https://github.com/${options.githubRepoName}/tree/${options.githubRepoBranch}/${options.cdkProjectPath} CDK app ...`));
    const buildspecs = createBuildspecs_1.createBuildspecs(options);
    const deployerStack = new cdk_standalone_deployer_1.CdkStandaloneDeployer(deployer, {
        githubRepository: options.githubRepoName,
        gitBranch: options.githubRepoBranch,
        cdkAppLocation: options.cdkProjectPath,
        stackName: options.stackName,
        deployBuildSpec: buildspecs.deployBuildspec,
        destroyBuildSpec: buildspecs.destroyBuildspec,
        cdkQualifier: options.cdkQualifier,
        cdkParameters: options.cdkParameters ? parseCDKParameters(options.cdkParameters) : undefined,
    });
    const synth = deployer.synth();
    const template = JSON.stringify(synth.getStackArtifact(deployerStack.artifactId).template);
    console.log(chalk.white('CDK Deployer CloudFormation template generated. Uploading it to S3 ...'));
    const s3Client = new aws_sdk_1.S3({ region: options.s3BucketRegion ?? process.env.AWS_REGION });
    let params;
    if (!options.s3BucketName) {
        // generate random string of 7 letters
        const bucketName = `cdk-depl-${options.githubRepoName.split('/').join('-').substring(0, 40)}-${options.githubRepoBranch ?? 'main'}-${Math.random().toString(36).substring(2, 5)}`.substring(0, 63);
        const s3CreateConfirmation = await inquirer.prompt([
            {
                type: 'confirm',
                name: 's3CreateConfirmation',
                message: `No S3 bucket specified, are you ok to create one with name ${bucketName} ? \n ${chalk.yellow('WARNING')}: ${options.publicRead
                    ? 'This bucket will be public, allowing anyone to deploy your app on its own account.'
                    : 'This bucket will be private and therefore will only allow you to deploy your app.'}`,
            },
        ]);
        console.log(s3CreateConfirmation);
        if (s3CreateConfirmation.s3CreateConfirmation) {
            console.log(chalk.white(`Creating S3 bucket ${bucketName} ...`));
            // create an s3 bucket allowing public read access
            const createBucketParams = {
                Bucket: bucketName,
            };
            if (options.publicRead) {
                createBucketParams.ACL = 'public-read';
            }
            try {
                await s3Client.createBucket(createBucketParams).promise();
                params = {
                    Bucket: bucketName,
                    Key: options.s3KeyPrefix ?? '' + 'cdk-standalone-deployer-cfn-template.json',
                    Body: template,
                };
            }
            catch (error) {
                console.log(error);
                throw new Error(`Error creating S3 bucket ${bucketName}. ${options.publicRead
                    ? 'You probably are not allowed to create bucket with public read access ...'
                    : 'You might not have permission to create bucket'}`);
            }
        }
        else {
            throw new Error("No S3 bucket specified and user didn't want to create one. Feel free to create one and run the command again with --s3-bucket-name option.");
        }
    }
    else {
        params = {
            Bucket: options.s3BucketName ?? 'ws-assets-us-east-1',
            Key: options.s3KeyPrefix ?? '' + 'cdk-standalone-deployer-cfn-template.json',
            Body: template,
        };
    }
    // use aws-sdk to write template to S3 bucket
    console.log(chalk.white(`Uploading CDK Deployer CloudFormation template to S3 bucket ${params.Bucket}/${params.Key} ...`));
    await s3Client.putObject(params).promise();
    // return the link
    return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
}
exports.generateCDKStandaloneDeployerCfnTemplate = generateCDKStandaloneDeployerCfnTemplate;
function parseCDKParameters(cdkParameters) {
    const result = {};
    for (const cdkParameter of cdkParameters) {
        if (!cdkParameter.includes('=')) {
            throw new Error(`Invalid CDK parameter ${cdkParameter}. It should be in the form of name=value`);
        }
        const [name, value] = cdkParameter.split('=');
        if (!name || !value) {
            throw new Error(`Invalid CDK parameter ${cdkParameter}. It should be in the form of name=value`);
        }
        result[name] = {
            type: 'String',
            default: value,
        };
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVDREtEZXBsb3llckNmblRlbXBsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9nZW5lcmF0ZUNES0RlcGxveWVyQ2ZuVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFDQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IscUNBQXFDO0FBQ3JDLGtGQUE2RTtBQUU3RSx5REFBc0Q7QUFFL0MsS0FBSyxVQUFVLHdDQUF3QyxDQUFDLE9BQW1CO0lBQ2hGLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRS9CLE9BQU8sQ0FBQyxHQUFHLENBQ1QsS0FBSyxDQUFDLEtBQUssQ0FDVCw4Q0FBOEMsT0FBTyxDQUFDLGNBQWMsU0FBUyxPQUFPLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLGNBQWMsY0FBYyxDQUM5SSxDQUNGLENBQUM7SUFDRixNQUFNLFVBQVUsR0FBRyxtQ0FBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLCtDQUFxQixDQUFDLFFBQVEsRUFBRTtRQUN4RCxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsY0FBYztRQUN4QyxTQUFTLEVBQUUsT0FBTyxDQUFDLGdCQUFnQjtRQUNuQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7UUFDdEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1FBQzVCLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZTtRQUMzQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsZ0JBQWdCO1FBQzdDLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtRQUNsQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO0tBQzdGLENBQUMsQ0FBQztJQUVILE1BQU0sS0FB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QUM1RSxJQUFJLEVBQUUsUUFBUTtTQUNmLENBQUM7S0FDSDtJQUNELDZDQUE2QztJQUU3QyxPQUFPLENBQUMsR0FBRyxDQUNULEtBQUssQ0FBQyxLQUFLLENBQUMsK0RBQStELE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQzlHLENBQUM7SUFFRixNQUFNLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFM0Msa0JBQWtCO0lBQ2xCLE9BQU8sV0FBVyxNQUFNLENBQUMsTUFBTSxxQkFBcUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ25FLENBQUM7QUE3RkQsNEZBNkZDO0FBQ0QsU0FBUyxrQkFBa0IsQ0FBQyxhQUF1QjtJQUNqRCxNQUFNLE1BQU0sR0FBOEMsRUFBRSxDQUFDO0lBQzdELEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFO1FBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLFlBQVksMENBQTBDLENBQUMsQ0FBQztTQUNsRztRQUNELE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLFlBQVksMENBQTBDLENBQUMsQ0FBQztTQUNsRztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRztZQUNiLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFDO0tBQ0g7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFMzIH0gZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgKiBhcyBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgKiBhcyBpbnF1aXJlciBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQgeyBDZGtTdGFuZGFsb25lRGVwbG95ZXIgfSBmcm9tICcuLi9jb25zdHJ1Y3QvY2RrLXN0YW5kYWxvbmUtZGVwbG95ZXInO1xuaW1wb3J0IHsgQ0xJT3B0aW9ucyB9IGZyb20gJy4vJztcbmltcG9ydCB7IGNyZWF0ZUJ1aWxkc3BlY3MgfSBmcm9tICcuL2NyZWF0ZUJ1aWxkc3BlY3MnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVDREtTdGFuZGFsb25lRGVwbG95ZXJDZm5UZW1wbGF0ZShvcHRpb25zOiBDTElPcHRpb25zKSB7XG4gIGNvbnN0IGRlcGxveWVyID0gbmV3IGNkay5BcHAoKTtcblxuICBjb25zb2xlLmxvZyhcbiAgICBjaGFsay53aGl0ZShcbiAgICAgIGBHZW5lcmF0aW5nIGRlcGxveWVyIGZvciBodHRwczovL2dpdGh1Yi5jb20vJHtvcHRpb25zLmdpdGh1YlJlcG9OYW1lfS90cmVlLyR7b3B0aW9ucy5naXRodWJSZXBvQnJhbmNofS8ke29wdGlvbnMuY2RrUHJvamVjdFBhdGh9IENESyBhcHAgLi4uYFxuICAgICksXG4gICk7XG4gIGNvbnN0IGJ1aWxkc3BlY3MgPSBjcmVhdGVCdWlsZHNwZWNzKG9wdGlvbnMpO1xuICBjb25zdCBkZXBsb3llclN0YWNrID0gbmV3IENka1N0YW5kYWxvbmVEZXBsb3llcihkZXBsb3llciwge1xuICAgIGdpdGh1YlJlcG9zaXRvcnk6IG9wdGlvbnMuZ2l0aHViUmVwb05hbWUsXG4gICAgZ2l0QnJhbmNoOiBvcHRpb25zLmdpdGh1YlJlcG9CcmFuY2gsXG4gICAgY2RrQXBwTG9jYXRpb246IG9wdGlvbnMuY2RrUHJvamVjdFBhdGgsXG4gICAgc3RhY2tOYW1lOiBvcHRpb25zLnN0YWNrTmFtZSxcbiAgICBkZXBsb3lCdWlsZFNwZWM6IGJ1aWxkc3BlY3MuZGVwbG95QnVpbGRzcGVjLFxuICAgIGRlc3Ryb3lCdWlsZFNwZWM6IGJ1aWxkc3BlY3MuZGVzdHJveUJ1aWxkc3BlYyxcbiAgICBjZGtRdWFsaWZpZXI6IG9wdGlvbnMuY2RrUXVhbGlmaWVyLFxuICAgIGNka1BhcmFtZXRlcnM6IG9wdGlvbnMuY2RrUGFyYW1ldGVycyA/IHBhcnNlQ0RLUGFyYW1ldGVycyhvcHRpb25zLmNka1BhcmFtZXRlcnMpIDogdW5kZWZpbmVkLFxuICB9KTtcblxuICBjb25zdCBzeW50aCA9IGRlcGxveWVyLnN5bnRoKCk7XG5cbiAgY29uc3QgdGVtcGxhdGUgPSBKU09OLnN0cmluZ2lmeShzeW50aC5nZXRTdGFja0FydGlmYWN0KGRlcGxveWVyU3RhY2suYXJ0aWZhY3RJZCkudGVtcGxhdGUpO1xuXG4gIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKCdDREsgRGVwbG95ZXIgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGUgZ2VuZXJhdGVkLiBVcGxvYWRpbmcgaXQgdG8gUzMgLi4uJykpO1xuICBjb25zdCBzM0NsaWVudCA9IG5ldyBTMyh7IHJlZ2lvbjogb3B0aW9ucy5zM0J1Y2tldFJlZ2lvbiA/PyBwcm9jZXNzLmVudi5BV1NfUkVHSU9OIH0pO1xuXG4gIGxldCBwYXJhbXM6IFMzLlR5cGVzLlB1dE9iamVjdFJlcXVlc3Q7XG4gIGlmICghb3B0aW9ucy5zM0J1Y2tldE5hbWUpIHtcbiAgICAvLyBnZW5lcmF0ZSByYW5kb20gc3RyaW5nIG9mIDcgbGV0dGVyc1xuICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBgY2RrLWRlcGwtJHtvcHRpb25zLmdpdGh1YlJlcG9OYW1lLnNwbGl0KCcvJykuam9pbignLScpLnN1YnN0cmluZygwLCA0MCl9LSR7XG4gICAgICBvcHRpb25zLmdpdGh1YlJlcG9CcmFuY2ggPz8gJ21haW4nXG4gICAgfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA1KX1gLnN1YnN0cmluZygwLCA2Myk7XG4gICAgY29uc3QgczNDcmVhdGVDb25maXJtYXRpb24gPSBhd2FpdCBpbnF1aXJlci5wcm9tcHQoW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICAgIG5hbWU6ICdzM0NyZWF0ZUNvbmZpcm1hdGlvbicsXG4gICAgICAgIG1lc3NhZ2U6IGBObyBTMyBidWNrZXQgc3BlY2lmaWVkLCBhcmUgeW91IG9rIHRvIGNyZWF0ZSBvbmUgd2l0aCBuYW1lICR7YnVja2V0TmFtZX0gPyBcXG4gJHtjaGFsay55ZWxsb3coJ1dBUk5JTkcnKX06ICR7XG4gICAgICAgICAgb3B0aW9ucy5wdWJsaWNSZWFkXG4gICAgICAgICAgICA/ICdUaGlzIGJ1Y2tldCB3aWxsIGJlIHB1YmxpYywgYWxsb3dpbmcgYW55b25lIHRvIGRlcGxveSB5b3VyIGFwcCBvbiBpdHMgb3duIGFjY291bnQuJ1xuICAgICAgICAgICAgOiAnVGhpcyBidWNrZXQgd2lsbCBiZSBwcml2YXRlIGFuZCB0aGVyZWZvcmUgd2lsbCBvbmx5IGFsbG93IHlvdSB0byBkZXBsb3kgeW91ciBhcHAuJ1xuICAgICAgICB9YCxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgY29uc29sZS5sb2coczNDcmVhdGVDb25maXJtYXRpb24pO1xuICAgIGlmIChzM0NyZWF0ZUNvbmZpcm1hdGlvbi5zM0NyZWF0ZUNvbmZpcm1hdGlvbikge1xuICAgICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYENyZWF0aW5nIFMzIGJ1Y2tldCAke2J1Y2tldE5hbWV9IC4uLmApKTtcbiAgICAgIC8vIGNyZWF0ZSBhbiBzMyBidWNrZXQgYWxsb3dpbmcgcHVibGljIHJlYWQgYWNjZXNzXG4gICAgICBjb25zdCBjcmVhdGVCdWNrZXRQYXJhbXM6IFMzLlR5cGVzLkNyZWF0ZUJ1Y2tldFJlcXVlc3QgPSB7XG4gICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcbiAgICAgIH07XG4gICAgICBpZiAob3B0aW9ucy5wdWJsaWNSZWFkKSB7XG4gICAgICAgIGNyZWF0ZUJ1Y2tldFBhcmFtcy5BQ0wgPSAncHVibGljLXJlYWQnO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgczNDbGllbnQuY3JlYXRlQnVja2V0KGNyZWF0ZUJ1Y2tldFBhcmFtcykucHJvbWlzZSgpO1xuICAgICAgICBwYXJhbXMgPSB7XG4gICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgIEtleTogb3B0aW9ucy5zM0tleVByZWZpeCA/PyAnJyArICdjZGstc3RhbmRhbG9uZS1kZXBsb3llci1jZm4tdGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgQm9keTogdGVtcGxhdGUsXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXJyb3IgY3JlYXRpbmcgUzMgYnVja2V0ICR7YnVja2V0TmFtZX0uICR7XG4gICAgICAgICAgICBvcHRpb25zLnB1YmxpY1JlYWRcbiAgICAgICAgICAgICAgPyAnWW91IHByb2JhYmx5IGFyZSBub3QgYWxsb3dlZCB0byBjcmVhdGUgYnVja2V0IHdpdGggcHVibGljIHJlYWQgYWNjZXNzIC4uLidcbiAgICAgICAgICAgICAgOiAnWW91IG1pZ2h0IG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gY3JlYXRlIGJ1Y2tldCdcbiAgICAgICAgICB9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIk5vIFMzIGJ1Y2tldCBzcGVjaWZpZWQgYW5kIHVzZXIgZGlkbid0IHdhbnQgdG8gY3JlYXRlIG9uZS4gRmVlbCBmcmVlIHRvIGNyZWF0ZSBvbmUgYW5kIHJ1biB0aGUgY29tbWFuZCBhZ2FpbiB3aXRoIC0tczMtYnVja2V0LW5hbWUgb3B0aW9uLlwiXG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwYXJhbXMgPSB7XG4gICAgICBCdWNrZXQ6IG9wdGlvbnMuczNCdWNrZXROYW1lID8/ICd3cy1hc3NldHMtdXMtZWFzdC0xJyxcbiAgICAgIEtleTogb3B0aW9ucy5zM0tleVByZWZpeCA/PyAnJyArICdjZGstc3RhbmRhbG9uZS1kZXBsb3llci1jZm4tdGVtcGxhdGUuanNvbicsXG4gICAgICBCb2R5OiB0ZW1wbGF0ZSxcbiAgICB9O1xuICB9XG4gIC8vIHVzZSBhd3Mtc2RrIHRvIHdyaXRlIHRlbXBsYXRlIHRvIFMzIGJ1Y2tldFxuXG4gIGNvbnNvbGUubG9nKFxuICAgIGNoYWxrLndoaXRlKGBVcGxvYWRpbmcgQ0RLIERlcGxveWVyIENsb3VkRm9ybWF0aW9uIHRlbXBsYXRlIHRvIFMzIGJ1Y2tldCAke3BhcmFtcy5CdWNrZXR9LyR7cGFyYW1zLktleX0gLi4uYClcbiAgKTtcblxuICBhd2FpdCBzM0NsaWVudC5wdXRPYmplY3QocGFyYW1zKS5wcm9taXNlKCk7XG5cbiAgLy8gcmV0dXJuIHRoZSBsaW5rXG4gIHJldHVybiBgaHR0cHM6Ly8ke3BhcmFtcy5CdWNrZXR9LnMzLmFtYXpvbmF3cy5jb20vJHtwYXJhbXMuS2V5fWA7XG59XG5mdW5jdGlvbiBwYXJzZUNES1BhcmFtZXRlcnMoY2RrUGFyYW1ldGVyczogW3N0cmluZ10pOiB7IFtuYW1lOiBzdHJpbmddOiBjZGsuQ2ZuUGFyYW1ldGVyUHJvcHMgfSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHJlc3VsdDogeyBbbmFtZTogc3RyaW5nXTogY2RrLkNmblBhcmFtZXRlclByb3BzIH0gPSB7fTtcbiAgZm9yIChjb25zdCBjZGtQYXJhbWV0ZXIgb2YgY2RrUGFyYW1ldGVycykge1xuICAgIGlmICghY2RrUGFyYW1ldGVyLmluY2x1ZGVzKCc9JykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBDREsgcGFyYW1ldGVyICR7Y2RrUGFyYW1ldGVyfS4gSXQgc2hvdWxkIGJlIGluIHRoZSBmb3JtIG9mIG5hbWU9dmFsdWVgKTtcbiAgICB9XG4gICAgY29uc3QgW25hbWUsIHZhbHVlXSA9IGNka1BhcmFtZXRlci5zcGxpdCgnPScpO1xuICAgIGlmICghbmFtZSB8fCAhdmFsdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBDREsgcGFyYW1ldGVyICR7Y2RrUGFyYW1ldGVyfS4gSXQgc2hvdWxkIGJlIGluIHRoZSBmb3JtIG9mIG5hbWU9dmFsdWVgKTtcbiAgICB9XG4gICAgcmVzdWx0W25hbWVdID0ge1xuICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICBkZWZhdWx0OiB2YWx1ZSxcbiAgICB9O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbiJdfQ==