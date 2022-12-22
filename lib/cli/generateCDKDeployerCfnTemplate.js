"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCDKStandaloneDeployerCfnTemplate = void 0;
const cdk = require("aws-cdk-lib");
const aws_sdk_1 = require("aws-sdk");
const chalk = require("chalk");
const inquirer = require("inquirer");
const cdk_standalone_deployer_1 = require("../construct/cdk-standalone-deployer");
async function generateCDKStandaloneDeployerCfnTemplate(options) {
    const deployer = new cdk.App();
    console.log(chalk.white(`Generating deployer for https://github.com/${options.githubRepoName}/tree/${options.githubRepoBranch}/${options.cdkProjectPath} CDK app ...`));
    const deployerStack = new cdk_standalone_deployer_1.CdkStandaloneDeployer(deployer, {
        githubRepository: options.githubRepoName,
        gitBranch: options.githubRepoBranch,
        cdkAppLocation: options.cdkProjectPath,
        stackName: options.stackName,
    });
    const synth = deployer.synth();
    const template = JSON.stringify(synth.getStackArtifact(deployerStack.artifactId).template);
    console.log(chalk.white('CDK Deployer CloudFormation template generated. Uploading it to S3 ...'));
    const s3Client = new aws_sdk_1.S3({ region: options.s3BucketRegion ?? 'us-east-1' });
    let params;
    if (!options.s3BucketName) {
        // generate random string of 7 letters
        const bucketName = `cdk-standalone-deployer-${options.githubRepoName.split('/').join('-')}-${options.githubRepoBranch ?? 'main'}-${Math.random().toString(36).substring(2, 7)}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVDREtEZXBsb3llckNmblRlbXBsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9nZW5lcmF0ZUNES0RlcGxveWVyQ2ZuVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFDQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IscUNBQXFDO0FBQ3JDLGtGQUE2RTtBQUV0RSxLQUFLLFVBQVUsd0NBQXdDLENBQUMsT0FTOUQ7SUFDQyxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUUvQixPQUFPLENBQUMsR0FBRyxDQUNULEtBQUssQ0FBQyxLQUFLLENBQ1QsOENBQThDLE9BQU8sQ0FBQyxjQUFjLFNBQVMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxjQUFjLGNBQWMsQ0FDOUksQ0FDRixDQUFDO0lBQ0YsTUFBTSxhQUFhLEdBQUcsSUFBSSwrQ0FBcUIsQ0FBQyxRQUFRLEVBQUU7UUFDeEQsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGNBQWM7UUFDeEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0I7UUFDbkMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO1FBQ3RDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztLQUU3QixDQUFDLENBQUM7SUFFSCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDLENBQUM7SUFDbkcsTUFBTSxRQUFRLEdBQUcsSUFBSSxZQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FB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YXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFMzIH0gZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgKiBhcyBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgKiBhcyBpbnF1aXJlciBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQgeyBDZGtTdGFuZGFsb25lRGVwbG95ZXIgfSBmcm9tICcuLi9jb25zdHJ1Y3QvY2RrLXN0YW5kYWxvbmUtZGVwbG95ZXInO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVDREtTdGFuZGFsb25lRGVwbG95ZXJDZm5UZW1wbGF0ZShvcHRpb25zOiB7XG4gIGdpdGh1YlJlcG9OYW1lOiBzdHJpbmc7XG4gIHMzQnVja2V0TmFtZT86IHN0cmluZztcbiAgczNLZXlQcmVmaXg/OiBzdHJpbmc7XG4gIHB1YmxpY1JlYWQ6IGJvb2xlYW47XG4gIGdpdGh1YlJlcG9CcmFuY2g6IHN0cmluZztcbiAgY2RrUHJvamVjdFBhdGg6IHN0cmluZztcbiAgc3RhY2tOYW1lPzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBzM0J1Y2tldFJlZ2lvbj86IHN0cmluZztcbn0pIHtcbiAgY29uc3QgZGVwbG95ZXIgPSBuZXcgY2RrLkFwcCgpO1xuXG4gIGNvbnNvbGUubG9nKFxuICAgIGNoYWxrLndoaXRlKFxuICAgICAgYEdlbmVyYXRpbmcgZGVwbG95ZXIgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS8ke29wdGlvbnMuZ2l0aHViUmVwb05hbWV9L3RyZWUvJHtvcHRpb25zLmdpdGh1YlJlcG9CcmFuY2h9LyR7b3B0aW9ucy5jZGtQcm9qZWN0UGF0aH0gQ0RLIGFwcCAuLi5gXG4gICAgKVxuICApO1xuICBjb25zdCBkZXBsb3llclN0YWNrID0gbmV3IENka1N0YW5kYWxvbmVEZXBsb3llcihkZXBsb3llciwge1xuICAgIGdpdGh1YlJlcG9zaXRvcnk6IG9wdGlvbnMuZ2l0aHViUmVwb05hbWUsXG4gICAgZ2l0QnJhbmNoOiBvcHRpb25zLmdpdGh1YlJlcG9CcmFuY2gsXG4gICAgY2RrQXBwTG9jYXRpb246IG9wdGlvbnMuY2RrUHJvamVjdFBhdGgsXG4gICAgc3RhY2tOYW1lOiBvcHRpb25zLnN0YWNrTmFtZSxcbiAgICAvLyBjZGtQYXJhbWV0ZXJzOiBvcHRpb25zLmNka1BhcmFtZXRlcnMsXG4gIH0pO1xuXG4gIGNvbnN0IHN5bnRoID0gZGVwbG95ZXIuc3ludGgoKTtcblxuICBjb25zdCB0ZW1wbGF0ZSA9IEpTT04uc3RyaW5naWZ5KHN5bnRoLmdldFN0YWNrQXJ0aWZhY3QoZGVwbG95ZXJTdGFjay5hcnRpZmFjdElkKS50ZW1wbGF0ZSk7XG5cbiAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoJ0NESyBEZXBsb3llciBDbG91ZEZvcm1hdGlvbiB0ZW1wbGF0ZSBnZW5lcmF0ZWQuIFVwbG9hZGluZyBpdCB0byBTMyAuLi4nKSk7XG4gIGNvbnN0IHMzQ2xpZW50ID0gbmV3IFMzKHsgcmVnaW9uOiBvcHRpb25zLnMzQnVja2V0UmVnaW9uID8/ICd1cy1lYXN0LTEnIH0pO1xuXG4gIGxldCBwYXJhbXM6IFMzLlR5cGVzLlB1dE9iamVjdFJlcXVlc3Q7XG4gIGlmICghb3B0aW9ucy5zM0J1Y2tldE5hbWUpIHtcbiAgICAvLyBnZW5lcmF0ZSByYW5kb20gc3RyaW5nIG9mIDcgbGV0dGVyc1xuICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBgY2RrLXN0YW5kYWxvbmUtZGVwbG95ZXItJHtvcHRpb25zLmdpdGh1YlJlcG9OYW1lLnNwbGl0KCcvJykuam9pbignLScpfS0ke1xuICAgICAgb3B0aW9ucy5naXRodWJSZXBvQnJhbmNoID8/ICdtYWluJ1xuICAgIH0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgNyl9YDtcbiAgICBjb25zdCBzM0NyZWF0ZUNvbmZpcm1hdGlvbiA9IGF3YWl0IGlucXVpcmVyLnByb21wdChbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgbmFtZTogJ3MzQ3JlYXRlQ29uZmlybWF0aW9uJyxcbiAgICAgICAgbWVzc2FnZTogYE5vIFMzIGJ1Y2tldCBzcGVjaWZpZWQsIGFyZSB5b3Ugb2sgdG8gY3JlYXRlIG9uZSB3aXRoIG5hbWUgJHtidWNrZXROYW1lfSA/IFxcbiAke2NoYWxrLnllbGxvdygnV0FSTklORycpfTogJHtcbiAgICAgICAgICBvcHRpb25zLnB1YmxpY1JlYWRcbiAgICAgICAgICAgID8gJ1RoaXMgYnVja2V0IHdpbGwgYmUgcHVibGljLCBhbGxvd2luZyBhbnlvbmUgdG8gZGVwbG95IHlvdXIgYXBwIG9uIGl0cyBvd24gYWNjb3VudC4nXG4gICAgICAgICAgICA6ICdUaGlzIGJ1Y2tldCB3aWxsIGJlIHByaXZhdGUgYW5kIHRoZXJlZm9yZSB3aWxsIG9ubHkgYWxsb3cgeW91IHRvIGRlcGxveSB5b3VyIGFwcC4nXG4gICAgICAgIH1gLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICBjb25zb2xlLmxvZyhzM0NyZWF0ZUNvbmZpcm1hdGlvbik7XG4gICAgaWYgKHMzQ3JlYXRlQ29uZmlybWF0aW9uLnMzQ3JlYXRlQ29uZmlybWF0aW9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgQ3JlYXRpbmcgUzMgYnVja2V0ICR7YnVja2V0TmFtZX0gLi4uYCkpO1xuICAgICAgLy8gY3JlYXRlIGFuIHMzIGJ1Y2tldCBhbGxvd2luZyBwdWJsaWMgcmVhZCBhY2Nlc3NcbiAgICAgIGNvbnN0IGNyZWF0ZUJ1Y2tldFBhcmFtczogUzMuVHlwZXMuQ3JlYXRlQnVja2V0UmVxdWVzdCA9IHtcbiAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgfTtcbiAgICAgIGlmIChvcHRpb25zLnB1YmxpY1JlYWQpIHtcbiAgICAgICAgY3JlYXRlQnVja2V0UGFyYW1zLkFDTCA9ICdwdWJsaWMtcmVhZCc7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBzM0NsaWVudC5jcmVhdGVCdWNrZXQoY3JlYXRlQnVja2V0UGFyYW1zKS5wcm9taXNlKCk7XG4gICAgICAgIHBhcmFtcyA9IHtcbiAgICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICAgICAgS2V5OiBvcHRpb25zLnMzS2V5UHJlZml4ID8/ICcnICsgJ2Nkay1zdGFuZGFsb25lLWRlcGxveWVyLWNmbi10ZW1wbGF0ZS5qc29uJyxcbiAgICAgICAgICBCb2R5OiB0ZW1wbGF0ZSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciBjcmVhdGluZyBTMyBidWNrZXQgJHtidWNrZXROYW1lfS4gJHtcbiAgICAgICAgICAgIG9wdGlvbnMucHVibGljUmVhZFxuICAgICAgICAgICAgICA/ICdZb3UgcHJvYmFibHkgYXJlIG5vdCBhbGxvd2VkIHRvIGNyZWF0ZSBidWNrZXQgd2l0aCBwdWJsaWMgcmVhZCBhY2Nlc3MgLi4uJ1xuICAgICAgICAgICAgICA6ICdZb3UgbWlnaHQgbm90IGhhdmUgcGVybWlzc2lvbiB0byBjcmVhdGUgYnVja2V0J1xuICAgICAgICAgIH1gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiTm8gUzMgYnVja2V0IHNwZWNpZmllZCBhbmQgdXNlciBkaWRuJ3Qgd2FudCB0byBjcmVhdGUgb25lLiBGZWVsIGZyZWUgdG8gY3JlYXRlIG9uZSBhbmQgcnVuIHRoZSBjb21tYW5kIGFnYWluIHdpdGggLS1zMy1idWNrZXQtbmFtZSBvcHRpb24uXCJcbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBhcmFtcyA9IHtcbiAgICAgIEJ1Y2tldDogb3B0aW9ucy5zM0J1Y2tldE5hbWUgPz8gJ3dzLWFzc2V0cy11cy1lYXN0LTEnLFxuICAgICAgS2V5OiBvcHRpb25zLnMzS2V5UHJlZml4ID8/ICcnICsgJ2Nkay1zdGFuZGFsb25lLWRlcGxveWVyLWNmbi10ZW1wbGF0ZS5qc29uJyxcbiAgICAgIEJvZHk6IHRlbXBsYXRlLFxuICAgIH07XG4gIH1cbiAgLy8gdXNlIGF3cy1zZGsgdG8gd3JpdGUgdGVtcGxhdGUgdG8gUzMgYnVja2V0XG5cbiAgY29uc29sZS5sb2coXG4gICAgY2hhbGsud2hpdGUoYFVwbG9hZGluZyBDREsgRGVwbG95ZXIgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGUgdG8gUzMgYnVja2V0ICR7cGFyYW1zLkJ1Y2tldH0vJHtwYXJhbXMuS2V5fSAuLi5gKVxuICApO1xuXG4gIGF3YWl0IHMzQ2xpZW50LnB1dE9iamVjdChwYXJhbXMpLnByb21pc2UoKTtcblxuICAvLyByZXR1cm4gdGhlIGxpbmtcbiAgcmV0dXJuIGBodHRwczovLyR7cGFyYW1zLkJ1Y2tldH0uczMuYW1hem9uYXdzLmNvbS8ke3BhcmFtcy5LZXl9YDtcbn1cbiJdfQ==