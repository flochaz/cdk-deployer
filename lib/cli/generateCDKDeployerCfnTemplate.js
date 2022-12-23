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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVDREtEZXBsb3llckNmblRlbXBsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9nZW5lcmF0ZUNES0RlcGxveWVyQ2ZuVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFDQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IscUNBQXFDO0FBQ3JDLGtGQUE2RTtBQUV0RSxLQUFLLFVBQVUsd0NBQXdDLENBQUMsT0FTOUQ7SUFDQyxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUUvQixPQUFPLENBQUMsR0FBRyxDQUNULEtBQUssQ0FBQyxLQUFLLENBQ1QsOENBQThDLE9BQU8sQ0FBQyxjQUFjLFNBQVMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxjQUFjLGNBQWMsQ0FDOUksQ0FDRixDQUFDO0lBQ0YsTUFBTSxhQUFhLEdBQUcsSUFBSSwrQ0FBcUIsQ0FBQyxRQUFRLEVBQUU7UUFDeEQsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGNBQWM7UUFDeEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0I7UUFDbkMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO1FBQ3RDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztLQUU3QixDQUFDLENBQUM7SUFFSCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDLENBQUM7SUFDbkcsTUFBTSxRQUFRLEdBQUcsSUFBSSxZQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FB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R0FBRyxFQUFFLENBQUM7QUFDbkUsQ0FBQztBQWxHRCw0RkFrR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgUzMgfSBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCAqIGFzIGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCAqIGFzIGlucXVpcmVyIGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCB7IENka1N0YW5kYWxvbmVEZXBsb3llciB9IGZyb20gJy4uL2NvbnN0cnVjdC9jZGstc3RhbmRhbG9uZS1kZXBsb3llcic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUNES1N0YW5kYWxvbmVEZXBsb3llckNmblRlbXBsYXRlKG9wdGlvbnM6IHtcbiAgZ2l0aHViUmVwb05hbWU6IHN0cmluZztcbiAgczNCdWNrZXROYW1lPzogc3RyaW5nO1xuICBzM0tleVByZWZpeD86IHN0cmluZztcbiAgcHVibGljUmVhZDogYm9vbGVhbjtcbiAgZ2l0aHViUmVwb0JyYW5jaDogc3RyaW5nO1xuICBjZGtQcm9qZWN0UGF0aDogc3RyaW5nO1xuICBzdGFja05hbWU/OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIHMzQnVja2V0UmVnaW9uPzogc3RyaW5nO1xufSkge1xuICBjb25zdCBkZXBsb3llciA9IG5ldyBjZGsuQXBwKCk7XG5cbiAgY29uc29sZS5sb2coXG4gICAgY2hhbGsud2hpdGUoXG4gICAgICBgR2VuZXJhdGluZyBkZXBsb3llciBmb3IgaHR0cHM6Ly9naXRodWIuY29tLyR7b3B0aW9ucy5naXRodWJSZXBvTmFtZX0vdHJlZS8ke29wdGlvbnMuZ2l0aHViUmVwb0JyYW5jaH0vJHtvcHRpb25zLmNka1Byb2plY3RQYXRofSBDREsgYXBwIC4uLmBcbiAgICApXG4gICk7XG4gIGNvbnN0IGRlcGxveWVyU3RhY2sgPSBuZXcgQ2RrU3RhbmRhbG9uZURlcGxveWVyKGRlcGxveWVyLCB7XG4gICAgZ2l0aHViUmVwb3NpdG9yeTogb3B0aW9ucy5naXRodWJSZXBvTmFtZSxcbiAgICBnaXRCcmFuY2g6IG9wdGlvbnMuZ2l0aHViUmVwb0JyYW5jaCxcbiAgICBjZGtBcHBMb2NhdGlvbjogb3B0aW9ucy5jZGtQcm9qZWN0UGF0aCxcbiAgICBzdGFja05hbWU6IG9wdGlvbnMuc3RhY2tOYW1lLFxuICAgIC8vIGNka1BhcmFtZXRlcnM6IG9wdGlvbnMuY2RrUGFyYW1ldGVycyxcbiAgfSk7XG5cbiAgY29uc3Qgc3ludGggPSBkZXBsb3llci5zeW50aCgpO1xuXG4gIGNvbnN0IHRlbXBsYXRlID0gSlNPTi5zdHJpbmdpZnkoc3ludGguZ2V0U3RhY2tBcnRpZmFjdChkZXBsb3llclN0YWNrLmFydGlmYWN0SWQpLnRlbXBsYXRlKTtcblxuICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZSgnQ0RLIERlcGxveWVyIENsb3VkRm9ybWF0aW9uIHRlbXBsYXRlIGdlbmVyYXRlZC4gVXBsb2FkaW5nIGl0IHRvIFMzIC4uLicpKTtcbiAgY29uc3QgczNDbGllbnQgPSBuZXcgUzMoeyByZWdpb246IG9wdGlvbnMuczNCdWNrZXRSZWdpb24gPz8gJ3VzLWVhc3QtMScgfSk7XG5cbiAgbGV0IHBhcmFtczogUzMuVHlwZXMuUHV0T2JqZWN0UmVxdWVzdDtcbiAgaWYgKCFvcHRpb25zLnMzQnVja2V0TmFtZSkge1xuICAgIC8vIGdlbmVyYXRlIHJhbmRvbSBzdHJpbmcgb2YgNyBsZXR0ZXJzXG4gICAgY29uc3QgYnVja2V0TmFtZSA9IGBjZGstZGVwbC0ke29wdGlvbnMuZ2l0aHViUmVwb05hbWUuc3BsaXQoJy8nKS5qb2luKCctJykuc3Vic3RyaW5nKDAsIDQwKX0tJHtcbiAgICAgIG9wdGlvbnMuZ2l0aHViUmVwb0JyYW5jaCA/PyAnbWFpbidcbiAgICB9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDUpfWAuc3Vic3RyaW5nKDAsIDYzKTtcbiAgICBjb25zdCBzM0NyZWF0ZUNvbmZpcm1hdGlvbiA9IGF3YWl0IGlucXVpcmVyLnByb21wdChbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgbmFtZTogJ3MzQ3JlYXRlQ29uZmlybWF0aW9uJyxcbiAgICAgICAgbWVzc2FnZTogYE5vIFMzIGJ1Y2tldCBzcGVjaWZpZWQsIGFyZSB5b3Ugb2sgdG8gY3JlYXRlIG9uZSB3aXRoIG5hbWUgJHtidWNrZXROYW1lfSA/IFxcbiAke2NoYWxrLnllbGxvdygnV0FSTklORycpfTogJHtcbiAgICAgICAgICBvcHRpb25zLnB1YmxpY1JlYWRcbiAgICAgICAgICAgID8gJ1RoaXMgYnVja2V0IHdpbGwgYmUgcHVibGljLCBhbGxvd2luZyBhbnlvbmUgdG8gZGVwbG95IHlvdXIgYXBwIG9uIGl0cyBvd24gYWNjb3VudC4nXG4gICAgICAgICAgICA6ICdUaGlzIGJ1Y2tldCB3aWxsIGJlIHByaXZhdGUgYW5kIHRoZXJlZm9yZSB3aWxsIG9ubHkgYWxsb3cgeW91IHRvIGRlcGxveSB5b3VyIGFwcC4nXG4gICAgICAgIH1gLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICBjb25zb2xlLmxvZyhzM0NyZWF0ZUNvbmZpcm1hdGlvbik7XG4gICAgaWYgKHMzQ3JlYXRlQ29uZmlybWF0aW9uLnMzQ3JlYXRlQ29uZmlybWF0aW9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgQ3JlYXRpbmcgUzMgYnVja2V0ICR7YnVja2V0TmFtZX0gLi4uYCkpO1xuICAgICAgLy8gY3JlYXRlIGFuIHMzIGJ1Y2tldCBhbGxvd2luZyBwdWJsaWMgcmVhZCBhY2Nlc3NcbiAgICAgIGNvbnN0IGNyZWF0ZUJ1Y2tldFBhcmFtczogUzMuVHlwZXMuQ3JlYXRlQnVja2V0UmVxdWVzdCA9IHtcbiAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgfTtcbiAgICAgIGlmIChvcHRpb25zLnB1YmxpY1JlYWQpIHtcbiAgICAgICAgY3JlYXRlQnVja2V0UGFyYW1zLkFDTCA9ICdwdWJsaWMtcmVhZCc7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBzM0NsaWVudC5jcmVhdGVCdWNrZXQoY3JlYXRlQnVja2V0UGFyYW1zKS5wcm9taXNlKCk7XG4gICAgICAgIHBhcmFtcyA9IHtcbiAgICAgICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICAgICAgS2V5OiBvcHRpb25zLnMzS2V5UHJlZml4ID8/ICcnICsgJ2Nkay1zdGFuZGFsb25lLWRlcGxveWVyLWNmbi10ZW1wbGF0ZS5qc29uJyxcbiAgICAgICAgICBCb2R5OiB0ZW1wbGF0ZSxcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciBjcmVhdGluZyBTMyBidWNrZXQgJHtidWNrZXROYW1lfS4gJHtcbiAgICAgICAgICAgIG9wdGlvbnMucHVibGljUmVhZFxuICAgICAgICAgICAgICA/ICdZb3UgcHJvYmFibHkgYXJlIG5vdCBhbGxvd2VkIHRvIGNyZWF0ZSBidWNrZXQgd2l0aCBwdWJsaWMgcmVhZCBhY2Nlc3MgLi4uJ1xuICAgICAgICAgICAgICA6ICdZb3UgbWlnaHQgbm90IGhhdmUgcGVybWlzc2lvbiB0byBjcmVhdGUgYnVja2V0J1xuICAgICAgICAgIH1gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiTm8gUzMgYnVja2V0IHNwZWNpZmllZCBhbmQgdXNlciBkaWRuJ3Qgd2FudCB0byBjcmVhdGUgb25lLiBGZWVsIGZyZWUgdG8gY3JlYXRlIG9uZSBhbmQgcnVuIHRoZSBjb21tYW5kIGFnYWluIHdpdGggLS1zMy1idWNrZXQtbmFtZSBvcHRpb24uXCJcbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBhcmFtcyA9IHtcbiAgICAgIEJ1Y2tldDogb3B0aW9ucy5zM0J1Y2tldE5hbWUgPz8gJ3dzLWFzc2V0cy11cy1lYXN0LTEnLFxuICAgICAgS2V5OiBvcHRpb25zLnMzS2V5UHJlZml4ID8/ICcnICsgJ2Nkay1zdGFuZGFsb25lLWRlcGxveWVyLWNmbi10ZW1wbGF0ZS5qc29uJyxcbiAgICAgIEJvZHk6IHRlbXBsYXRlLFxuICAgIH07XG4gIH1cbiAgLy8gdXNlIGF3cy1zZGsgdG8gd3JpdGUgdGVtcGxhdGUgdG8gUzMgYnVja2V0XG5cbiAgY29uc29sZS5sb2coXG4gICAgY2hhbGsud2hpdGUoYFVwbG9hZGluZyBDREsgRGVwbG95ZXIgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGUgdG8gUzMgYnVja2V0ICR7cGFyYW1zLkJ1Y2tldH0vJHtwYXJhbXMuS2V5fSAuLi5gKVxuICApO1xuXG4gIGF3YWl0IHMzQ2xpZW50LnB1dE9iamVjdChwYXJhbXMpLnByb21pc2UoKTtcblxuICAvLyByZXR1cm4gdGhlIGxpbmtcbiAgcmV0dXJuIGBodHRwczovLyR7cGFyYW1zLkJ1Y2tldH0uczMuYW1hem9uYXdzLmNvbS8ke3BhcmFtcy5LZXl9YDtcbn1cbiJdfQ==