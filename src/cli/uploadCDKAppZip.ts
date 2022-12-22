import * as fs from 'fs';
import { S3 } from 'aws-sdk';
import * as chalk from 'chalk';
import { ARCHIVE_NAME } from './index';

export const s3Client = new S3({ region: 'us-east-1' });


export async function uploadCDKAppZip(options: any) {
  const fileContent = fs.readFileSync(`${ARCHIVE_NAME}`);

  // Set the parameters
  const uploadParams = {
    Bucket: options.s3BucketName,
    // Add the required 'Key' parameter using the 'path' module.
    Key: `${options.s3KeyPrefix}/${ARCHIVE_NAME}`,
    // Add the required 'Body' parameter
    Body: fileContent,
  };
  try {
    console.log(chalk.white(`Uploading ${ARCHIVE_NAME} ${uploadParams.Bucket}${uploadParams.Key} to S3 ...`));
    const data = await s3Client.upload(uploadParams).promise();

    if (options.verbose) {
      console.log(chalk.grey(data));
    };

    //clean up
    fs.rmSync(ARCHIVE_NAME);

  } catch (err) {
    if (options.verbose) {
      console.error(chalk.grey(err));
    }
    throw new Error(
      'Fail to upload file :(',
    );
  }
}
