"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCDKAppZip = exports.s3Client = void 0;
const fs = require("fs");
const aws_sdk_1 = require("aws-sdk");
const chalk = require("chalk");
exports.s3Client = new aws_sdk_1.S3({ region: 'us-east-1' });
async function uploadCDKAppZip(archivePath, s3BucketName, s3Key, verbose) {
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
        const data = await exports.s3Client.upload(uploadParams).promise();
        if (verbose) {
            console.log(chalk.grey(data));
        }
        ;
        //clean up
        fs.rmSync(archivePath);
        console.log(chalk.green(`Successfully uploaded ${archivePath} to S3 bucket ${uploadParams.Bucket}`));
    }
    catch (err) {
        if (verbose) {
            console.error(chalk.grey(err));
        }
        throw new Error('Fail to upload file :(');
    }
}
exports.uploadCDKAppZip = uploadCDKAppZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkQ0RLQXBwWmlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS91cGxvYWRDREtBcHBaaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLHFDQUE2QjtBQUM3QiwrQkFBK0I7QUFFbEIsUUFBQSxRQUFRLEdBQUcsSUFBSSxZQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUdqRCxLQUFLLFVBQVUsZUFBZSxDQUFDLFdBQW1CLEVBQUUsWUFBb0IsRUFBRSxLQUFhLEVBQUUsT0FBZ0I7SUFDOUcsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVqRCxxQkFBcUI7SUFDckIsTUFBTSxZQUFZLEdBQUc7UUFDbkIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsNERBQTREO1FBQzVELEdBQUcsRUFBRSxLQUFLO1FBQ1Ysb0NBQW9DO1FBQ3BDLElBQUksRUFBRSxXQUFXO0tBQ2xCLENBQUM7SUFDRixJQUFJO1FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsV0FBVyxJQUFJLFlBQVksQ0FBQyxNQUFNLElBQUksWUFBWSxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMxRyxNQUFNLElBQUksR0FBRyxNQUFNLGdCQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTNELElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDL0I7UUFBQSxDQUFDO1FBRUYsVUFBVTtRQUNWLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FDVCxLQUFLLENBQUMsS0FBSyxDQUNULHlCQUF5QixXQUFXLGlCQUFpQixZQUFZLENBQUMsTUFBTSxFQUFFLENBQzNFLENBQ0YsQ0FBQztLQUNIO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLE9BQU8sRUFBRTtZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FDYix3QkFBd0IsQ0FDekIsQ0FBQztLQUNIO0FBQ0gsQ0FBQztBQW5DRCwwQ0FtQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBTMyB9IGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0ICogYXMgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5leHBvcnQgY29uc3QgczNDbGllbnQgPSBuZXcgUzMoeyByZWdpb246ICd1cy1lYXN0LTEnIH0pO1xuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGxvYWRDREtBcHBaaXAoYXJjaGl2ZVBhdGg6IHN0cmluZywgczNCdWNrZXROYW1lOiBzdHJpbmcsIHMzS2V5OiBzdHJpbmcsIHZlcmJvc2U6IGJvb2xlYW4pIHtcbiAgY29uc3QgZmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoYXJjaGl2ZVBhdGgpO1xuXG4gIC8vIFNldCB0aGUgcGFyYW1ldGVyc1xuICBjb25zdCB1cGxvYWRQYXJhbXMgPSB7XG4gICAgQnVja2V0OiBzM0J1Y2tldE5hbWUsXG4gICAgLy8gQWRkIHRoZSByZXF1aXJlZCAnS2V5JyBwYXJhbWV0ZXIgdXNpbmcgdGhlICdwYXRoJyBtb2R1bGUuXG4gICAgS2V5OiBzM0tleSxcbiAgICAvLyBBZGQgdGhlIHJlcXVpcmVkICdCb2R5JyBwYXJhbWV0ZXJcbiAgICBCb2R5OiBmaWxlQ29udGVudCxcbiAgfTtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgVXBsb2FkaW5nICR7YXJjaGl2ZVBhdGh9ICR7dXBsb2FkUGFyYW1zLkJ1Y2tldH0vJHt1cGxvYWRQYXJhbXMuS2V5fSB0byBTMyAuLi5gKSk7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHMzQ2xpZW50LnVwbG9hZCh1cGxvYWRQYXJhbXMpLnByb21pc2UoKTtcblxuICAgIGlmICh2ZXJib3NlKSB7XG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmV5KGRhdGEpKTtcbiAgICB9O1xuXG4gICAgLy9jbGVhbiB1cFxuICAgIGZzLnJtU3luYyhhcmNoaXZlUGF0aCk7XG5cbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGNoYWxrLmdyZWVuKFxuICAgICAgICBgU3VjY2Vzc2Z1bGx5IHVwbG9hZGVkICR7YXJjaGl2ZVBhdGh9IHRvIFMzIGJ1Y2tldCAke3VwbG9hZFBhcmFtcy5CdWNrZXR9YFxuICAgICAgKSxcbiAgICApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodmVyYm9zZSkge1xuICAgICAgY29uc29sZS5lcnJvcihjaGFsay5ncmV5KGVycikpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnRmFpbCB0byB1cGxvYWQgZmlsZSA6KCcsXG4gICAgKTtcbiAgfVxufVxuIl19