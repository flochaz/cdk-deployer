import * as AWS from 'aws-sdk';
import * as chalk from 'chalk';

export async function checkAWSWorkshopStudioCredentials(workshopId: string) {
  console.log(chalk.white(`Check access permissions for ${workshopId} ...`));
  // Call STS getCallerIdentity to check if the credentials are valid and use role WSDataPlaneContentCreatorRole
  const sts = new AWS.STS();
  try {
    const data = await sts.getCallerIdentity().promise();

    if (data && data.Arn && data.Arn.includes('WSDataPlaneContentCreatorRole')) {
      console.log(chalk.green('Access granted !'));
    } else {
      throw {
        name: 'WrongToken',
        message: 'Wrong credentials found, make sure to export the credentials given by Workshop Studio',
      };
    }
  } catch (error) {
    // If error of type ExpiredTokenException, enhance the error message with a link to the documentation
    if ((error as Error).name != 'WrongToken') {
      throw new Error(
        `Credentials expired or not set, please export the credentials given by Workshop Studio by clicking on the "Credentials" button in the top right corner of the page https://studio.us-east-1.prod.workshops.aws/workshops/${workshopId}`,
      );
    } else {
      throw error;
    }
  }
}
export async function checkGenericAWSCredentials() {
  console.log(chalk.white('Check access permissions ...'));
  // Call STS getCallerIdentity to check if the credentials are valid and use role WSDataPlaneContentCreatorRole
  const sts = new AWS.STS();
  try {
    await sts.getCallerIdentity().promise();
    console.log(chalk.green('Access granted !'));
  } catch (error) {
    // If error of type ExpiredTokenException, enhance the error message with a link to the documentation
    if ((error as Error).name != 'WrongToken') {
      throw new Error(
        'Credentials expired or not set, please export the credentials',
      );
    } else {
      throw error;
    }
  }
}
