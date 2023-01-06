import { S3 } from 'aws-sdk';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';

export async function uploadCDKDeployerCfnTemplate(template: string, options: any) {
  
  console.log(chalk.white('CDK Deployer CloudFormation template generated. Uploading it to S3 ...'));
  const s3Client = new S3({ region: options.s3BucketRegion ?? process.env.AWS_REGION });

  let params: S3.Types.PutObjectRequest;
  if (!options.s3BucketName) {
    // generate random string of 7 letters
    const bucketName = `cdk-depl-${options.githubRepoName.split('/').join('-').substring(0, 40)}-${
      options.githubRepoBranch ?? 'main'
    }-${Math.random().toString(36).substring(2, 5)}`.substring(0, 63);
    const s3CreateConfirmation = await inquirer.prompt([
      {
        type: 'confirm',
        name: 's3CreateConfirmation',
        message: `No S3 bucket specified, are you ok to create one with name ${bucketName} ? \n ${chalk.yellow('WARNING')}: ${
          options.publicRead
            ? 'This bucket will be public, allowing anyone to deploy your app on its own account.'
            : 'This bucket will be private and therefore will only allow you to deploy your app.'
        }`,
      },
    ]);
    console.log(s3CreateConfirmation);
    if (s3CreateConfirmation.s3CreateConfirmation) {
      console.log(chalk.white(`Creating S3 bucket ${bucketName} ...`));
      // create an s3 bucket allowing public read access
      const createBucketParams: S3.Types.CreateBucketRequest = {
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
      } catch (error) {
        console.log(error);
        throw new Error(
          `Error creating S3 bucket ${bucketName}. ${
            options.publicRead
              ? 'You probably are not allowed to create bucket with public read access ...'
              : 'You might not have permission to create bucket'
          }`,
        );
      }
    } else {
      throw new Error(
        "No S3 bucket specified and user didn't want to create one. Feel free to create one and run the command again with --s3-bucket-name option."
      );
    }
  } else {
    params = {
      Bucket: options.s3BucketName ?? 'ws-assets-us-east-1',
      Key: options.s3KeyPrefix ?? '' + 'cdk-standalone-deployer-cfn-template.json',
      Body: template,
      GrantRead: options.publicRead ? 'uri="http://acs.amazonaws.com/groups/global/AllUsers"' : undefined,
    };
  }
  // use aws-sdk to write template to S3 bucket

  console.log(
    chalk.white(`Uploading CDK Deployer CloudFormation template to S3 bucket ${params.Bucket}/${params.Key} ...`)
  );

  await s3Client.putObject(params).promise();

  console.log(
    chalk.green(`${params.Key} successfully uploaded to S3 bucket ${params.Bucket}.}`)
  );
  // return the link
  return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
}