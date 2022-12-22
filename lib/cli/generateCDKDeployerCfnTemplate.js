"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCDKDeployerCfnTemplate = void 0;
const cdk = require("aws-cdk-lib");
const aws_sdk_1 = require("aws-sdk");
const chalk = require("chalk");
const inquirer = require("inquirer");
const cdk_deployer_1 = require("../construct/cdk-deployer");
async function generateCDKDeployerCfnTemplate(options) {
    const deployer = new cdk.App();
    console.log(chalk.white(`Generating deployer for https://github.com/${options.githubRepoName}/tree/${options.githubRepoBranch}/${options.cdkProjectPath} CDK app ...`));
    const deployerStack = new cdk_deployer_1.CdkDeployer(deployer, {
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
        const bucketName = `cdk-deployer-${options.githubRepoName.split('/').join('-')}-${options.githubRepoBranch ?? 'main'}-${Math.random().toString(36).substring(2, 7)}`;
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
                    Key: options.s3KeyPrefix ?? '' + 'cdk-deployer-cfn-template.json',
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
            Key: options.s3KeyPrefix ?? '' + 'cdk-deployer-cfn-template.json',
            Body: template,
        };
    }
    // use aws-sdk to write template to S3 bucket
    console.log(chalk.white(`Uploading CDK Deployer CloudFormation template to S3 bucket ${params.Bucket}/${params.Key} ...`));
    await s3Client.putObject(params).promise();
    // return the link
    return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
}
exports.generateCDKDeployerCfnTemplate = generateCDKDeployerCfnTemplate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVDREtEZXBsb3llckNmblRlbXBsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9nZW5lcmF0ZUNES0RlcGxveWVyQ2ZuVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFDQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IscUNBQXFDO0FBQ3JDLDREQUF3RDtBQUVqRCxLQUFLLFVBQVUsOEJBQThCLENBQUMsT0FTcEQ7SUFDQyxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUUvQixPQUFPLENBQUMsR0FBRyxDQUNULEtBQUssQ0FBQyxLQUFLLENBQ1QsOENBQThDLE9BQU8sQ0FBQyxjQUFjLFNBQVMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxjQUFjLGNBQWMsQ0FDOUksQ0FDRixDQUFDO0lBQ0YsTUFBTSxhQUFhLEdBQUcsSUFBSSwwQkFBVyxDQUFDLFFBQVEsRUFBRTtRQUM5QyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsY0FBYztRQUN4QyxTQUFTLEVBQUUsT0FBTyxDQUFDLGdCQUFnQjtRQUNuQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7UUFDdEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO0tBRTdCLENBQUMsQ0FBQztJQUVILE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUUvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFM0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUMsQ0FBQztJQUNuRyxNQUFNLFFBQVEsR0FBRyxJQUFJLFlBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFP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cyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgUzMgfSBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCAqIGFzIGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCAqIGFzIGlucXVpcmVyIGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCB7IENka0RlcGxveWVyIH0gZnJvbSAnLi4vY29uc3RydWN0L2Nkay1kZXBsb3llcic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUNES0RlcGxveWVyQ2ZuVGVtcGxhdGUob3B0aW9uczoge1xuICBnaXRodWJSZXBvTmFtZTogc3RyaW5nO1xuICBzM0J1Y2tldE5hbWU/OiBzdHJpbmc7XG4gIHMzS2V5UHJlZml4Pzogc3RyaW5nO1xuICBwdWJsaWNSZWFkOiBib29sZWFuO1xuICBnaXRodWJSZXBvQnJhbmNoOiBzdHJpbmc7XG4gIGNka1Byb2plY3RQYXRoOiBzdHJpbmc7XG4gIHN0YWNrTmFtZT86IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgczNCdWNrZXRSZWdpb24/OiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IGRlcGxveWVyID0gbmV3IGNkay5BcHAoKTtcblxuICBjb25zb2xlLmxvZyhcbiAgICBjaGFsay53aGl0ZShcbiAgICAgIGBHZW5lcmF0aW5nIGRlcGxveWVyIGZvciBodHRwczovL2dpdGh1Yi5jb20vJHtvcHRpb25zLmdpdGh1YlJlcG9OYW1lfS90cmVlLyR7b3B0aW9ucy5naXRodWJSZXBvQnJhbmNofS8ke29wdGlvbnMuY2RrUHJvamVjdFBhdGh9IENESyBhcHAgLi4uYFxuICAgIClcbiAgKTtcbiAgY29uc3QgZGVwbG95ZXJTdGFjayA9IG5ldyBDZGtEZXBsb3llcihkZXBsb3llciwge1xuICAgIGdpdGh1YlJlcG9zaXRvcnk6IG9wdGlvbnMuZ2l0aHViUmVwb05hbWUsXG4gICAgZ2l0QnJhbmNoOiBvcHRpb25zLmdpdGh1YlJlcG9CcmFuY2gsXG4gICAgY2RrQXBwTG9jYXRpb246IG9wdGlvbnMuY2RrUHJvamVjdFBhdGgsXG4gICAgc3RhY2tOYW1lOiBvcHRpb25zLnN0YWNrTmFtZSxcbiAgICAvLyBjZGtQYXJhbWV0ZXJzOiBvcHRpb25zLmNka1BhcmFtZXRlcnMsXG4gIH0pO1xuXG4gIGNvbnN0IHN5bnRoID0gZGVwbG95ZXIuc3ludGgoKTtcblxuICBjb25zdCB0ZW1wbGF0ZSA9IEpTT04uc3RyaW5naWZ5KHN5bnRoLmdldFN0YWNrQXJ0aWZhY3QoZGVwbG95ZXJTdGFjay5hcnRpZmFjdElkKS50ZW1wbGF0ZSk7XG5cbiAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoJ0NESyBEZXBsb3llciBDbG91ZEZvcm1hdGlvbiB0ZW1wbGF0ZSBnZW5lcmF0ZWQuIFVwbG9hZGluZyBpdCB0byBTMyAuLi4nKSk7XG4gIGNvbnN0IHMzQ2xpZW50ID0gbmV3IFMzKHsgcmVnaW9uOiBvcHRpb25zLnMzQnVja2V0UmVnaW9uID8/ICd1cy1lYXN0LTEnIH0pO1xuXG4gIGxldCBwYXJhbXM6IFMzLlR5cGVzLlB1dE9iamVjdFJlcXVlc3Q7XG4gIGlmICghb3B0aW9ucy5zM0J1Y2tldE5hbWUpIHtcbiAgICAvLyBnZW5lcmF0ZSByYW5kb20gc3RyaW5nIG9mIDcgbGV0dGVyc1xuICAgIGNvbnN0IGJ1Y2tldE5hbWUgPSBgY2RrLWRlcGxveWVyLSR7b3B0aW9ucy5naXRodWJSZXBvTmFtZS5zcGxpdCgnLycpLmpvaW4oJy0nKX0tJHtcbiAgICAgIG9wdGlvbnMuZ2l0aHViUmVwb0JyYW5jaCA/PyAnbWFpbidcbiAgICB9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDcpfWA7XG4gICAgY29uc3QgczNDcmVhdGVDb25maXJtYXRpb24gPSBhd2FpdCBpbnF1aXJlci5wcm9tcHQoW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICAgIG5hbWU6ICdzM0NyZWF0ZUNvbmZpcm1hdGlvbicsXG4gICAgICAgIG1lc3NhZ2U6IGBObyBTMyBidWNrZXQgc3BlY2lmaWVkLCBhcmUgeW91IG9rIHRvIGNyZWF0ZSBvbmUgd2l0aCBuYW1lICR7YnVja2V0TmFtZX0gPyBcXG4gJHtjaGFsay55ZWxsb3coJ1dBUk5JTkcnKX06ICR7XG4gICAgICAgICAgb3B0aW9ucy5wdWJsaWNSZWFkXG4gICAgICAgICAgICA/ICdUaGlzIGJ1Y2tldCB3aWxsIGJlIHB1YmxpYywgYWxsb3dpbmcgYW55b25lIHRvIGRlcGxveSB5b3VyIGFwcCBvbiBpdHMgb3duIGFjY291bnQuJ1xuICAgICAgICAgICAgOiAnVGhpcyBidWNrZXQgd2lsbCBiZSBwcml2YXRlIGFuZCB0aGVyZWZvcmUgd2lsbCBvbmx5IGFsbG93IHlvdSB0byBkZXBsb3kgeW91ciBhcHAuJ1xuICAgICAgICB9YCxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgY29uc29sZS5sb2coczNDcmVhdGVDb25maXJtYXRpb24pO1xuICAgIGlmIChzM0NyZWF0ZUNvbmZpcm1hdGlvbi5zM0NyZWF0ZUNvbmZpcm1hdGlvbikge1xuICAgICAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoYENyZWF0aW5nIFMzIGJ1Y2tldCAke2J1Y2tldE5hbWV9IC4uLmApKTtcbiAgICAgIC8vIGNyZWF0ZSBhbiBzMyBidWNrZXQgYWxsb3dpbmcgcHVibGljIHJlYWQgYWNjZXNzXG4gICAgICBjb25zdCBjcmVhdGVCdWNrZXRQYXJhbXM6IFMzLlR5cGVzLkNyZWF0ZUJ1Y2tldFJlcXVlc3QgPSB7XG4gICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcbiAgICAgIH07XG4gICAgICBpZiAob3B0aW9ucy5wdWJsaWNSZWFkKSB7XG4gICAgICAgIGNyZWF0ZUJ1Y2tldFBhcmFtcy5BQ0wgPSAncHVibGljLXJlYWQnO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgczNDbGllbnQuY3JlYXRlQnVja2V0KGNyZWF0ZUJ1Y2tldFBhcmFtcykucHJvbWlzZSgpO1xuICAgICAgICBwYXJhbXMgPSB7XG4gICAgICAgICAgQnVja2V0OiBidWNrZXROYW1lLFxuICAgICAgICAgIEtleTogb3B0aW9ucy5zM0tleVByZWZpeCA/PyAnJyArICdjZGstZGVwbG95ZXItY2ZuLXRlbXBsYXRlLmpzb24nLFxuICAgICAgICAgIEJvZHk6IHRlbXBsYXRlLFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEVycm9yIGNyZWF0aW5nIFMzIGJ1Y2tldCAke2J1Y2tldE5hbWV9LiAke1xuICAgICAgICAgICAgb3B0aW9ucy5wdWJsaWNSZWFkXG4gICAgICAgICAgICAgID8gJ1lvdSBwcm9iYWJseSBhcmUgbm90IGFsbG93ZWQgdG8gY3JlYXRlIGJ1Y2tldCB3aXRoIHB1YmxpYyByZWFkIGFjY2VzcyAuLi4nXG4gICAgICAgICAgICAgIDogJ1lvdSBtaWdodCBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGNyZWF0ZSBidWNrZXQnXG4gICAgICAgICAgfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJObyBTMyBidWNrZXQgc3BlY2lmaWVkIGFuZCB1c2VyIGRpZG4ndCB3YW50IHRvIGNyZWF0ZSBvbmUuIEZlZWwgZnJlZSB0byBjcmVhdGUgb25lIGFuZCBydW4gdGhlIGNvbW1hbmQgYWdhaW4gd2l0aCAtLXMzLWJ1Y2tldC1uYW1lIG9wdGlvbi5cIlxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFyYW1zID0ge1xuICAgICAgQnVja2V0OiBvcHRpb25zLnMzQnVja2V0TmFtZSA/PyAnd3MtYXNzZXRzLXVzLWVhc3QtMScsXG4gICAgICBLZXk6IG9wdGlvbnMuczNLZXlQcmVmaXggPz8gJycgKyAnY2RrLWRlcGxveWVyLWNmbi10ZW1wbGF0ZS5qc29uJyxcbiAgICAgIEJvZHk6IHRlbXBsYXRlLFxuICAgIH07XG4gIH1cbiAgLy8gdXNlIGF3cy1zZGsgdG8gd3JpdGUgdGVtcGxhdGUgdG8gUzMgYnVja2V0XG5cbiAgY29uc29sZS5sb2coXG4gICAgY2hhbGsud2hpdGUoYFVwbG9hZGluZyBDREsgRGVwbG95ZXIgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGUgdG8gUzMgYnVja2V0ICR7cGFyYW1zLkJ1Y2tldH0vJHtwYXJhbXMuS2V5fSAuLi5gKVxuICApO1xuXG4gIGF3YWl0IHMzQ2xpZW50LnB1dE9iamVjdChwYXJhbXMpLnByb21pc2UoKTtcblxuICAvLyByZXR1cm4gdGhlIGxpbmtcbiAgcmV0dXJuIGBodHRwczovLyR7cGFyYW1zLkJ1Y2tldH0uczMuYW1hem9uYXdzLmNvbS8ke3BhcmFtcy5LZXl9YDtcbn1cbiJdfQ==