"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCDKAppZip = exports.s3Client = void 0;
const fs = require("fs");
const aws_sdk_1 = require("aws-sdk");
const chalk = require("chalk");
const index_1 = require("./index");
exports.s3Client = new aws_sdk_1.S3({ region: 'us-east-1' });
async function uploadCDKAppZip(options) {
    const fileContent = fs.readFileSync(`${index_1.ARCHIVE_NAME}`);
    // Set the parameters
    const uploadParams = {
        Bucket: options.s3BucketName,
        // Add the required 'Key' parameter using the 'path' module.
        Key: `${options.s3KeyPrefix}/${index_1.ARCHIVE_NAME}`,
        // Add the required 'Body' parameter
        Body: fileContent,
    };
    try {
        console.log(chalk.white(`Uploading ${index_1.ARCHIVE_NAME} ${uploadParams.Bucket}${uploadParams.Key} to S3 ...`));
        const data = await exports.s3Client.upload(uploadParams).promise();
        if (options.verbose) {
            console.log(chalk.grey(data));
        }
        ;
        //clean up
        fs.rmSync(index_1.ARCHIVE_NAME);
    }
    catch (err) {
        if (options.verbose) {
            console.error(chalk.grey(err));
        }
        throw new Error('Fail to upload file :(');
    }
}
exports.uploadCDKAppZip = uploadCDKAppZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkQ0RLQXBwWmlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS91cGxvYWRDREtBcHBaaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLHFDQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IsbUNBQXVDO0FBRTFCLFFBQUEsUUFBUSxHQUFHLElBQUksWUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFHakQsS0FBSyxVQUFVLGVBQWUsQ0FBQyxPQUFZO0lBQ2hELE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxvQkFBWSxFQUFFLENBQUMsQ0FBQztJQUV2RCxxQkFBcUI7SUFDckIsTUFBTSxZQUFZLEdBQUc7UUFDbkIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZO1FBQzVCLDREQUE0RDtRQUM1RCxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLG9CQUFZLEVBQUU7UUFDN0Msb0NBQW9DO1FBQ3BDLElBQUksRUFBRSxXQUFXO0tBQ2xCLENBQUM7SUFDRixJQUFJO1FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsb0JBQVksSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDMUcsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUUzRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDL0I7UUFBQSxDQUFDO1FBRUYsVUFBVTtRQUNWLEVBQUUsQ0FBQyxNQUFNLENBQUMsb0JBQVksQ0FBQyxDQUFDO0tBRXpCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDbkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDaEM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUNiLHdCQUF3QixDQUN6QixDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBOUJELDBDQThCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IFMzIH0gZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgKiBhcyBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgeyBBUkNISVZFX05BTUUgfSBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNvbnN0IHMzQ2xpZW50ID0gbmV3IFMzKHsgcmVnaW9uOiAndXMtZWFzdC0xJyB9KTtcblxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBsb2FkQ0RLQXBwWmlwKG9wdGlvbnM6IGFueSkge1xuICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhgJHtBUkNISVZFX05BTUV9YCk7XG5cbiAgLy8gU2V0IHRoZSBwYXJhbWV0ZXJzXG4gIGNvbnN0IHVwbG9hZFBhcmFtcyA9IHtcbiAgICBCdWNrZXQ6IG9wdGlvbnMuczNCdWNrZXROYW1lLFxuICAgIC8vIEFkZCB0aGUgcmVxdWlyZWQgJ0tleScgcGFyYW1ldGVyIHVzaW5nIHRoZSAncGF0aCcgbW9kdWxlLlxuICAgIEtleTogYCR7b3B0aW9ucy5zM0tleVByZWZpeH0vJHtBUkNISVZFX05BTUV9YCxcbiAgICAvLyBBZGQgdGhlIHJlcXVpcmVkICdCb2R5JyBwYXJhbWV0ZXJcbiAgICBCb2R5OiBmaWxlQ29udGVudCxcbiAgfTtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgVXBsb2FkaW5nICR7QVJDSElWRV9OQU1FfSAke3VwbG9hZFBhcmFtcy5CdWNrZXR9JHt1cGxvYWRQYXJhbXMuS2V5fSB0byBTMyAuLi5gKSk7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHMzQ2xpZW50LnVwbG9hZCh1cGxvYWRQYXJhbXMpLnByb21pc2UoKTtcblxuICAgIGlmIChvcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZXkoZGF0YSkpO1xuICAgIH07XG5cbiAgICAvL2NsZWFuIHVwXG4gICAgZnMucm1TeW5jKEFSQ0hJVkVfTkFNRSk7XG5cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKG9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgY29uc29sZS5lcnJvcihjaGFsay5ncmV5KGVycikpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnRmFpbCB0byB1cGxvYWQgZmlsZSA6KCcsXG4gICAgKTtcbiAgfVxufVxuIl19