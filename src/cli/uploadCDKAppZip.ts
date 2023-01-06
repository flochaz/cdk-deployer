import * as fs from 'fs';
import { S3 } from 'aws-sdk';
import * as chalk from 'chalk';

export const s3Client = new S3({ region: 'us-east-1' });


export async function uploadCDKAppZip(archivePath: string, s3BucketName: string, s3Key: string, verbose: boolean) {
  const fileContent = fs.readFileSync(archivePath);

  // Set the parameters
  const uploadParams = {
    Bucket: s3BucketName,
    // Add the required 'Key' parameter using the 'path' module.
    Key: s3Key,
    // Add the required 'Body' parameter
    Body: fileContent,
  };
  try {
    console.log(chalk.white(`Uploading ${archivePath} ${uploadParams.Bucket}/${uploadParams.Key} to S3 ...`));
    const data = await s3Client.upload(uploadParams).promise();

    if (verbose) {
      console.log(chalk.grey(data));
    };

    //clean up
    fs.rmSync(archivePath);

    console.log(
      chalk.green(
        `Successfully uploaded ${archivePath} to S3 bucket ${uploadParams.Bucket}`
      ),
    );
  } catch (err) {
    if (verbose) {
      console.error(chalk.grey(err));
    }
    throw new Error(
      'Fail to upload file :(',
    );
  }
}
