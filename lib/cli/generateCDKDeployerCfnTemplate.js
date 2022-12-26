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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVDREtEZXBsb3llckNmblRlbXBsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9nZW5lcmF0ZUNES0RlcGxveWVyQ2ZuVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFDQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IscUNBQXFDO0FBQ3JDLGtGQUE2RTtBQUU3RSx5REFBc0Q7QUFFL0MsS0FBSyxVQUFVLHdDQUF3QyxDQUFDLE9BQW1CO0lBQ2hGLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRS9CLE9BQU8sQ0FBQyxHQUFHLENBQ1QsS0FBSyxDQUFDLEtBQUssQ0FDVCw4Q0FBOEMsT0FBTyxDQUFDLGNBQWMsU0FBUyxPQUFPLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLGNBQWMsY0FBYyxDQUM5SSxDQUNGLENBQUM7SUFDRixNQUFNLFVBQVUsR0FBRyxtQ0FBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLCtDQUFxQixDQUFDLFFBQVEsRUFBRTtRQUN4RCxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsY0FBYztRQUN4QyxTQUFTLEVBQUUsT0FBTyxDQUFDLGdCQUFnQjtRQUNuQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7UUFDdEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1FBQzVCLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZTtRQUMzQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsZ0JBQWdCO1FBQzdDLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtRQUNsQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO0tBQzdGLENBQUMsQ0FBQztJQUVILE1BQU0sS0FB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U0FDZixDQUFDO0tBQ0g7SUFDRCw2Q0FBNkM7SUFFN0MsT0FBTyxDQUFDLEdBQUcsQ0FDVCxLQUFLLENBQUMsS0FBSyxDQUFDLCtEQUErRCxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUM5RyxDQUFDO0lBRUYsTUFBTSxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRTNDLGtCQUFrQjtJQUNsQixPQUFPLFdBQVcsTUFBTSxDQUFDLE1BQU0scUJBQXFCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuRSxDQUFDO0FBN0ZELDRGQTZGQztBQUNELFNBQVMsa0JBQWtCLENBQUMsYUFBdUI7SUFDakQsTUFBTSxNQUFNLEdBQThDLEVBQUUsQ0FBQztJQUM3RCxLQUFLLE1BQU0sWUFBWSxJQUFJLGFBQWEsRUFBRTtRQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixZQUFZLDBDQUEwQyxDQUFDLENBQUM7U0FDbEc7UUFDRCxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixZQUFZLDBDQUEwQyxDQUFDLENBQUM7U0FDbEc7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDYixJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxLQUFLO1NBQ2YsQ0FBQztLQUNIO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBTMyB9IGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0ICogYXMgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0ICogYXMgaW5xdWlyZXIgZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHsgQ2RrU3RhbmRhbG9uZURlcGxveWVyIH0gZnJvbSAnLi4vY29uc3RydWN0L2Nkay1zdGFuZGFsb25lLWRlcGxveWVyJztcbmltcG9ydCB7IENMSU9wdGlvbnMgfSBmcm9tICcuLyc7XG5pbXBvcnQgeyBjcmVhdGVCdWlsZHNwZWNzIH0gZnJvbSAnLi9jcmVhdGVCdWlsZHNwZWNzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQ0RLU3RhbmRhbG9uZURlcGxveWVyQ2ZuVGVtcGxhdGUob3B0aW9uczogQ0xJT3B0aW9ucykge1xuICBjb25zdCBkZXBsb3llciA9IG5ldyBjZGsuQXBwKCk7XG5cbiAgY29uc29sZS5sb2coXG4gICAgY2hhbGsud2hpdGUoXG4gICAgICBgR2VuZXJhdGluZyBkZXBsb3llciBmb3IgaHR0cHM6Ly9naXRodWIuY29tLyR7b3B0aW9ucy5naXRodWJSZXBvTmFtZX0vdHJlZS8ke29wdGlvbnMuZ2l0aHViUmVwb0JyYW5jaH0vJHtvcHRpb25zLmNka1Byb2plY3RQYXRofSBDREsgYXBwIC4uLmBcbiAgICApLFxuICApO1xuICBjb25zdCBidWlsZHNwZWNzID0gY3JlYXRlQnVpbGRzcGVjcyhvcHRpb25zKTtcbiAgY29uc3QgZGVwbG95ZXJTdGFjayA9IG5ldyBDZGtTdGFuZGFsb25lRGVwbG95ZXIoZGVwbG95ZXIsIHtcbiAgICBnaXRodWJSZXBvc2l0b3J5OiBvcHRpb25zLmdpdGh1YlJlcG9OYW1lLFxuICAgIGdpdEJyYW5jaDogb3B0aW9ucy5naXRodWJSZXBvQnJhbmNoLFxuICAgIGNka0FwcExvY2F0aW9uOiBvcHRpb25zLmNka1Byb2plY3RQYXRoLFxuICAgIHN0YWNrTmFtZTogb3B0aW9ucy5zdGFja05hbWUsXG4gICAgZGVwbG95QnVpbGRTcGVjOiBidWlsZHNwZWNzLmRlcGxveUJ1aWxkc3BlYyxcbiAgICBkZXN0cm95QnVpbGRTcGVjOiBidWlsZHNwZWNzLmRlc3Ryb3lCdWlsZHNwZWMsXG4gICAgY2RrUXVhbGlmaWVyOiBvcHRpb25zLmNka1F1YWxpZmllcixcbiAgICBjZGtQYXJhbWV0ZXJzOiBvcHRpb25zLmNka1BhcmFtZXRlcnMgPyBwYXJzZUNES1BhcmFtZXRlcnMob3B0aW9ucy5jZGtQYXJhbWV0ZXJzKSA6IHVuZGVmaW5lZCxcbiAgfSk7XG5cbiAgY29uc3Qgc3ludGggPSBkZXBsb3llci5zeW50aCgpO1xuXG4gIGNvbnN0IHRlbXBsYXRlID0gSlNPTi5zdHJpbmdpZnkoc3ludGguZ2V0U3RhY2tBcnRpZmFjdChkZXBsb3llclN0YWNrLmFydGlmYWN0SWQpLnRlbXBsYXRlKTtcblxuICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZSgnQ0RLIERlcGxveWVyIENsb3VkRm9ybWF0aW9uIHRlbXBsYXRlIGdlbmVyYXRlZC4gVXBsb2FkaW5nIGl0IHRvIFMzIC4uLicpKTtcbiAgY29uc3QgczNDbGllbnQgPSBuZXcgUzMoeyByZWdpb246IG9wdGlvbnMuczNCdWNrZXRSZWdpb24gPz8gJ3VzLWVhc3QtMScgfSk7XG5cbiAgbGV0IHBhcmFtczogUzMuVHlwZXMuUHV0T2JqZWN0UmVxdWVzdDtcbiAgaWYgKCFvcHRpb25zLnMzQnVja2V0TmFtZSkge1xuICAgIC8vIGdlbmVyYXRlIHJhbmRvbSBzdHJpbmcgb2YgNyBsZXR0ZXJzXG4gICAgY29uc3QgYnVja2V0TmFtZSA9IGBjZGstZGVwbC0ke29wdGlvbnMuZ2l0aHViUmVwb05hbWUuc3BsaXQoJy8nKS5qb2luKCctJykuc3Vic3RyaW5nKDAsIDQwKX0tJHtcbiAgICAgIG9wdGlvbnMuZ2l0aHViUmVwb0JyYW5jaCA/PyAnbWFpbidcbiAgICB9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDUpfWAuc3Vic3RyaW5nKDAsIDYzKTtcbiAgICBjb25zdCBzM0NyZWF0ZUNvbmZpcm1hdGlvbiA9IGF3YWl0IGlucXVpcmVyLnByb21wdChbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgbmFtZTogJ3MzQ3JlYXRlQ29uZmlybWF0aW9uJyxcbiAgICAgICAgbWVzc2FnZTogYE5vIFMzIGJ1Y2tldCBzcGVjaWZpZWQsIGFyZSB5b3Ugb2sgdG8gY3JlYXRlIG9uZSB3aXRoIG5hbWUgJHtidWNrZXROYW1lfSA/IFxcbiAke2NoYWxrLnllbGxvdygnV0FSTklORycpfTogJHtcbiAgICAgICAgICBvcHRpb25zLnB1YmxpY1JlYWRcbiAgICAgICAgICAgID8gJ1RoaXMgYnVja2V0IHdpbGwgYmUgcHVibGljLCBhbGxvd2luZyBhbnlvbmUgdG8gZGVwbG95IHlvdXIgYXBwIG9uIGl0cyBvd24gYWNjb3VudC4nXG4gICAgICAgICAgICA6ICdUaGlzIGJ1Y2tldCB3aWxsIGJlIHByaXZhdGUgYW5kIHRoZXJlZm9yZSB3aWxsIG9ubHkgYWxsb3cgeW91IHRvIGRlcGxveSB5b3VyIGFwcC4nXG4gICAgICAgIH1gLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICBjb25zb2xlLmxvZyhzM0NyZWF0ZUNvbmZpcm1hdGlvbik7XG4gICAgaWYgKHMzQ3JlYXRlQ29uZmlybWF0aW9uLnMzQ3JlYXRlQ29uZmlybWF0aW9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgQ3JlYXRpbmcgUzMgYnVja2V0ICR7YnVja2V0TmFtZX0gLi4uYCkpO1xuICAgICAgLy8gY3JlYXRlIGFuIHMzIGJ1Y2tldCBhbGxvd2luZyBwdWJsaWMgcmVhZCBhY2Nlc3NcbiAgICAgIGNvbnN0IGNyZWF0ZUJ1Y2tldFBhcmFtczogUzMuVHlwZXMuQ3JlYXRlQnVja2V0UmVxdWVzdCA9IHtcbiAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgfTtcbiAgICAgIGlmIChvcHRpb25zLnB1YmxpY1JlYWQpIHtcbiAgICAgICAgY3JlYXRlQnVja2V0UGFyYW1zLkFDTCA9ICdwdWJsaWMtcmVhZCc7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBzM0NsaWVudC5jcmVhdGVCdWNrZXQoY3JlYXRlQnVja2V0UGFyYW1zKS5wcm9taXNlKCk7XG4gICAgICAgIHBhcmFtcyA9IHtcbiAgICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICAgICAgS2V5OiBvcHRpb25zLnMzS2V5UHJlZml4ID8/ICcnICsgJ2Nkay1zdGFuZGFsb25lLWRlcGxveWVyLWNmbi10ZW1wbGF0ZS5qc29uJyxcbiAgICAgICAgICBCb2R5OiB0ZW1wbGF0ZSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciBjcmVhdGluZyBTMyBidWNrZXQgJHtidWNrZXROYW1lfS4gJHtcbiAgICAgICAgICAgIG9wdGlvbnMucHVibGljUmVhZFxuICAgICAgICAgICAgICA/ICdZb3UgcHJvYmFibHkgYXJlIG5vdCBhbGxvd2VkIHRvIGNyZWF0ZSBidWNrZXQgd2l0aCBwdWJsaWMgcmVhZCBhY2Nlc3MgLi4uJ1xuICAgICAgICAgICAgICA6ICdZb3UgbWlnaHQgbm90IGhhdmUgcGVybWlzc2lvbiB0byBjcmVhdGUgYnVja2V0J1xuICAgICAgICAgIH1gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiTm8gUzMgYnVja2V0IHNwZWNpZmllZCBhbmQgdXNlciBkaWRuJ3Qgd2FudCB0byBjcmVhdGUgb25lLiBGZWVsIGZyZWUgdG8gY3JlYXRlIG9uZSBhbmQgcnVuIHRoZSBjb21tYW5kIGFnYWluIHdpdGggLS1zMy1idWNrZXQtbmFtZSBvcHRpb24uXCJcbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBhcmFtcyA9IHtcbiAgICAgIEJ1Y2tldDogb3B0aW9ucy5zM0J1Y2tldE5hbWUgPz8gJ3dzLWFzc2V0cy11cy1lYXN0LTEnLFxuICAgICAgS2V5OiBvcHRpb25zLnMzS2V5UHJlZml4ID8/ICcnICsgJ2Nkay1zdGFuZGFsb25lLWRlcGxveWVyLWNmbi10ZW1wbGF0ZS5qc29uJyxcbiAgICAgIEJvZHk6IHRlbXBsYXRlLFxuICAgIH07XG4gIH1cbiAgLy8gdXNlIGF3cy1zZGsgdG8gd3JpdGUgdGVtcGxhdGUgdG8gUzMgYnVja2V0XG5cbiAgY29uc29sZS5sb2coXG4gICAgY2hhbGsud2hpdGUoYFVwbG9hZGluZyBDREsgRGVwbG95ZXIgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGUgdG8gUzMgYnVja2V0ICR7cGFyYW1zLkJ1Y2tldH0vJHtwYXJhbXMuS2V5fSAuLi5gKVxuICApO1xuXG4gIGF3YWl0IHMzQ2xpZW50LnB1dE9iamVjdChwYXJhbXMpLnByb21pc2UoKTtcblxuICAvLyByZXR1cm4gdGhlIGxpbmtcbiAgcmV0dXJuIGBodHRwczovLyR7cGFyYW1zLkJ1Y2tldH0uczMuYW1hem9uYXdzLmNvbS8ke3BhcmFtcy5LZXl9YDtcbn1cbmZ1bmN0aW9uIHBhcnNlQ0RLUGFyYW1ldGVycyhjZGtQYXJhbWV0ZXJzOiBbc3RyaW5nXSk6IHsgW25hbWU6IHN0cmluZ106IGNkay5DZm5QYXJhbWV0ZXJQcm9wcyB9IHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgcmVzdWx0OiB7IFtuYW1lOiBzdHJpbmddOiBjZGsuQ2ZuUGFyYW1ldGVyUHJvcHMgfSA9IHt9O1xuICBmb3IgKGNvbnN0IGNka1BhcmFtZXRlciBvZiBjZGtQYXJhbWV0ZXJzKSB7XG4gICAgaWYgKCFjZGtQYXJhbWV0ZXIuaW5jbHVkZXMoJz0nKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIENESyBwYXJhbWV0ZXIgJHtjZGtQYXJhbWV0ZXJ9LiBJdCBzaG91bGQgYmUgaW4gdGhlIGZvcm0gb2YgbmFtZT12YWx1ZWApO1xuICAgIH1cbiAgICBjb25zdCBbbmFtZSwgdmFsdWVdID0gY2RrUGFyYW1ldGVyLnNwbGl0KCc9Jyk7XG4gICAgaWYgKCFuYW1lIHx8ICF2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIENESyBwYXJhbWV0ZXIgJHtjZGtQYXJhbWV0ZXJ9LiBJdCBzaG91bGQgYmUgaW4gdGhlIGZvcm0gb2YgbmFtZT12YWx1ZWApO1xuICAgIH1cbiAgICByZXN1bHRbbmFtZV0gPSB7XG4gICAgICB0eXBlOiAnU3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6IHZhbHVlLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuIl19