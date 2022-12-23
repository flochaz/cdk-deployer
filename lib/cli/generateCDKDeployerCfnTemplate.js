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
    });
    const synth = deployer.synth();
    const template = JSON.stringify(synth.getStackArtifact(deployerStack.artifactId).template);
    console.log(chalk.white('CDK Deployer CloudFormation template generated. Uploading it to S3 ...'));
    const s3Client = new aws_sdk_1.S3({ region: options.s3BucketRegion ?? 'us-east-1' });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVDREtEZXBsb3llckNmblRlbXBsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9nZW5lcmF0ZUNES0RlcGxveWVyQ2ZuVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFDQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IscUNBQXFDO0FBQ3JDLGtGQUE2RTtBQUU3RSx5REFBc0Q7QUFFL0MsS0FBSyxVQUFVLHdDQUF3QyxDQUFDLE9BQW1CO0lBQ2hGLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRS9CLE9BQU8sQ0FBQyxHQUFHLENBQ1QsS0FBSyxDQUFDLEtBQUssQ0FDVCw4Q0FBOEMsT0FBTyxDQUFDLGNBQWMsU0FBUyxPQUFPLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLGNBQWMsY0FBYyxDQUM5SSxDQUNGLENBQUM7SUFDRixNQUFNLFVBQVUsR0FBRyxtQ0FBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLCtDQUFxQixDQUFDLFFBQVEsRUFBRTtRQUN4RCxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsY0FBYztRQUN4QyxTQUFTLEVBQUUsT0FBTyxDQUFDLGdCQUFnQjtRQUNuQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7UUFDdEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1FBQzVCLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZTtRQUMzQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsZ0JBQWdCO0tBRTlDLENBQUMsQ0FBQztJQUVILE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUUvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFD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RyxDQUFDO0lBRUYsTUFBTSxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRTNDLGtCQUFrQjtJQUNsQixPQUFPLFdBQVcsTUFBTSxDQUFDLE1BQU0scUJBQXFCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuRSxDQUFDO0FBNUZELDRGQTRGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBTMyB9IGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0ICogYXMgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0ICogYXMgaW5xdWlyZXIgZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHsgQ2RrU3RhbmRhbG9uZURlcGxveWVyIH0gZnJvbSAnLi4vY29uc3RydWN0L2Nkay1zdGFuZGFsb25lLWRlcGxveWVyJztcbmltcG9ydCB7IENMSU9wdGlvbnMgfSBmcm9tICcuLyc7XG5pbXBvcnQgeyBjcmVhdGVCdWlsZHNwZWNzIH0gZnJvbSAnLi9jcmVhdGVCdWlsZHNwZWNzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQ0RLU3RhbmRhbG9uZURlcGxveWVyQ2ZuVGVtcGxhdGUob3B0aW9uczogQ0xJT3B0aW9ucykge1xuICBjb25zdCBkZXBsb3llciA9IG5ldyBjZGsuQXBwKCk7XG5cbiAgY29uc29sZS5sb2coXG4gICAgY2hhbGsud2hpdGUoXG4gICAgICBgR2VuZXJhdGluZyBkZXBsb3llciBmb3IgaHR0cHM6Ly9naXRodWIuY29tLyR7b3B0aW9ucy5naXRodWJSZXBvTmFtZX0vdHJlZS8ke29wdGlvbnMuZ2l0aHViUmVwb0JyYW5jaH0vJHtvcHRpb25zLmNka1Byb2plY3RQYXRofSBDREsgYXBwIC4uLmBcbiAgICApLFxuICApO1xuICBjb25zdCBidWlsZHNwZWNzID0gY3JlYXRlQnVpbGRzcGVjcyhvcHRpb25zKTtcbiAgY29uc3QgZGVwbG95ZXJTdGFjayA9IG5ldyBDZGtTdGFuZGFsb25lRGVwbG95ZXIoZGVwbG95ZXIsIHtcbiAgICBnaXRodWJSZXBvc2l0b3J5OiBvcHRpb25zLmdpdGh1YlJlcG9OYW1lLFxuICAgIGdpdEJyYW5jaDogb3B0aW9ucy5naXRodWJSZXBvQnJhbmNoLFxuICAgIGNka0FwcExvY2F0aW9uOiBvcHRpb25zLmNka1Byb2plY3RQYXRoLFxuICAgIHN0YWNrTmFtZTogb3B0aW9ucy5zdGFja05hbWUsXG4gICAgZGVwbG95QnVpbGRTcGVjOiBidWlsZHNwZWNzLmRlcGxveUJ1aWxkc3BlYyxcbiAgICBkZXN0cm95QnVpbGRTcGVjOiBidWlsZHNwZWNzLmRlc3Ryb3lCdWlsZHNwZWMsXG4gICAgLy8gY2RrUGFyYW1ldGVyczogb3B0aW9ucy5jZGtQYXJhbWV0ZXJzLFxuICB9KTtcblxuICBjb25zdCBzeW50aCA9IGRlcGxveWVyLnN5bnRoKCk7XG5cbiAgY29uc3QgdGVtcGxhdGUgPSBKU09OLnN0cmluZ2lmeShzeW50aC5nZXRTdGFja0FydGlmYWN0KGRlcGxveWVyU3RhY2suYXJ0aWZhY3RJZCkudGVtcGxhdGUpO1xuXG4gIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKCdDREsgRGVwbG95ZXIgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGUgZ2VuZXJhdGVkLiBVcGxvYWRpbmcgaXQgdG8gUzMgLi4uJykpO1xuICBjb25zdCBzM0NsaWVudCA9IG5ldyBTMyh7IHJlZ2lvbjogb3B0aW9ucy5zM0J1Y2tldFJlZ2lvbiA/PyAndXMtZWFzdC0xJyB9KTtcblxuICBsZXQgcGFyYW1zOiBTMy5UeXBlcy5QdXRPYmplY3RSZXF1ZXN0O1xuICBpZiAoIW9wdGlvbnMuczNCdWNrZXROYW1lKSB7XG4gICAgLy8gZ2VuZXJhdGUgcmFuZG9tIHN0cmluZyBvZiA3IGxldHRlcnNcbiAgICBjb25zdCBidWNrZXROYW1lID0gYGNkay1kZXBsLSR7b3B0aW9ucy5naXRodWJSZXBvTmFtZS5zcGxpdCgnLycpLmpvaW4oJy0nKS5zdWJzdHJpbmcoMCwgNDApfS0ke1xuICAgICAgb3B0aW9ucy5naXRodWJSZXBvQnJhbmNoID8/ICdtYWluJ1xuICAgIH0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgNSl9YC5zdWJzdHJpbmcoMCwgNjMpO1xuICAgIGNvbnN0IHMzQ3JlYXRlQ29uZmlybWF0aW9uID0gYXdhaXQgaW5xdWlyZXIucHJvbXB0KFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgICBuYW1lOiAnczNDcmVhdGVDb25maXJtYXRpb24nLFxuICAgICAgICBtZXNzYWdlOiBgTm8gUzMgYnVja2V0IHNwZWNpZmllZCwgYXJlIHlvdSBvayB0byBjcmVhdGUgb25lIHdpdGggbmFtZSAke2J1Y2tldE5hbWV9ID8gXFxuICR7Y2hhbGsueWVsbG93KCdXQVJOSU5HJyl9OiAke1xuICAgICAgICAgIG9wdGlvbnMucHVibGljUmVhZFxuICAgICAgICAgICAgPyAnVGhpcyBidWNrZXQgd2lsbCBiZSBwdWJsaWMsIGFsbG93aW5nIGFueW9uZSB0byBkZXBsb3kgeW91ciBhcHAgb24gaXRzIG93biBhY2NvdW50LidcbiAgICAgICAgICAgIDogJ1RoaXMgYnVja2V0IHdpbGwgYmUgcHJpdmF0ZSBhbmQgdGhlcmVmb3JlIHdpbGwgb25seSBhbGxvdyB5b3UgdG8gZGVwbG95IHlvdXIgYXBwLidcbiAgICAgICAgfWAsXG4gICAgICB9LFxuICAgIF0pO1xuICAgIGNvbnNvbGUubG9nKHMzQ3JlYXRlQ29uZmlybWF0aW9uKTtcbiAgICBpZiAoczNDcmVhdGVDb25maXJtYXRpb24uczNDcmVhdGVDb25maXJtYXRpb24pIHtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLndoaXRlKGBDcmVhdGluZyBTMyBidWNrZXQgJHtidWNrZXROYW1lfSAuLi5gKSk7XG4gICAgICAvLyBjcmVhdGUgYW4gczMgYnVja2V0IGFsbG93aW5nIHB1YmxpYyByZWFkIGFjY2Vzc1xuICAgICAgY29uc3QgY3JlYXRlQnVja2V0UGFyYW1zOiBTMy5UeXBlcy5DcmVhdGVCdWNrZXRSZXF1ZXN0ID0ge1xuICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICB9O1xuICAgICAgaWYgKG9wdGlvbnMucHVibGljUmVhZCkge1xuICAgICAgICBjcmVhdGVCdWNrZXRQYXJhbXMuQUNMID0gJ3B1YmxpYy1yZWFkJztcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHMzQ2xpZW50LmNyZWF0ZUJ1Y2tldChjcmVhdGVCdWNrZXRQYXJhbXMpLnByb21pc2UoKTtcbiAgICAgICAgcGFyYW1zID0ge1xuICAgICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcbiAgICAgICAgICBLZXk6IG9wdGlvbnMuczNLZXlQcmVmaXggPz8gJycgKyAnY2RrLXN0YW5kYWxvbmUtZGVwbG95ZXItY2ZuLXRlbXBsYXRlLmpzb24nLFxuICAgICAgICAgIEJvZHk6IHRlbXBsYXRlLFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEVycm9yIGNyZWF0aW5nIFMzIGJ1Y2tldCAke2J1Y2tldE5hbWV9LiAke1xuICAgICAgICAgICAgb3B0aW9ucy5wdWJsaWNSZWFkXG4gICAgICAgICAgICAgID8gJ1lvdSBwcm9iYWJseSBhcmUgbm90IGFsbG93ZWQgdG8gY3JlYXRlIGJ1Y2tldCB3aXRoIHB1YmxpYyByZWFkIGFjY2VzcyAuLi4nXG4gICAgICAgICAgICAgIDogJ1lvdSBtaWdodCBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGNyZWF0ZSBidWNrZXQnXG4gICAgICAgICAgfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJObyBTMyBidWNrZXQgc3BlY2lmaWVkIGFuZCB1c2VyIGRpZG4ndCB3YW50IHRvIGNyZWF0ZSBvbmUuIEZlZWwgZnJlZSB0byBjcmVhdGUgb25lIGFuZCBydW4gdGhlIGNvbW1hbmQgYWdhaW4gd2l0aCAtLXMzLWJ1Y2tldC1uYW1lIG9wdGlvbi5cIlxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFyYW1zID0ge1xuICAgICAgQnVja2V0OiBvcHRpb25zLnMzQnVja2V0TmFtZSA/PyAnd3MtYXNzZXRzLXVzLWVhc3QtMScsXG4gICAgICBLZXk6IG9wdGlvbnMuczNLZXlQcmVmaXggPz8gJycgKyAnY2RrLXN0YW5kYWxvbmUtZGVwbG95ZXItY2ZuLXRlbXBsYXRlLmpzb24nLFxuICAgICAgQm9keTogdGVtcGxhdGUsXG4gICAgfTtcbiAgfVxuICAvLyB1c2UgYXdzLXNkayB0byB3cml0ZSB0ZW1wbGF0ZSB0byBTMyBidWNrZXRcblxuICBjb25zb2xlLmxvZyhcbiAgICBjaGFsay53aGl0ZShgVXBsb2FkaW5nIENESyBEZXBsb3llciBDbG91ZEZvcm1hdGlvbiB0ZW1wbGF0ZSB0byBTMyBidWNrZXQgJHtwYXJhbXMuQnVja2V0fS8ke3BhcmFtcy5LZXl9IC4uLmApXG4gICk7XG5cbiAgYXdhaXQgczNDbGllbnQucHV0T2JqZWN0KHBhcmFtcykucHJvbWlzZSgpO1xuXG4gIC8vIHJldHVybiB0aGUgbGlua1xuICByZXR1cm4gYGh0dHBzOi8vJHtwYXJhbXMuQnVja2V0fS5zMy5hbWF6b25hd3MuY29tLyR7cGFyYW1zLktleX1gO1xufVxuIl19