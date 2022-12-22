"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGenericAWSCredentials = exports.checkAWSWorkshopStudioCredentials = void 0;
const AWS = require("aws-sdk");
const chalk = require("chalk");
async function checkAWSWorkshopStudioCredentials(workshopId) {
    console.log(chalk.white(`Check access permissions for ${workshopId} ...`));
    // Call STS getCallerIdentity to check if the credentials are valid and use role WSDataPlaneContentCreatorRole
    const sts = new AWS.STS();
    try {
        const data = await sts.getCallerIdentity().promise();
        if (data && data.Arn && data.Arn.includes('WSDataPlaneContentCreatorRole')) {
            console.log(chalk.green('Access granted !'));
        }
        else {
            throw {
                name: 'WrongToken',
                message: 'Wrong credentials found, make sure to export the credentials given by Workshop Studio',
            };
        }
    }
    catch (error) {
        // If error of type ExpiredTokenException, enhance the error message with a link to the documentation
        if (error.name != 'WrongToken') {
            throw new Error(`Credentials expired or not set, please export the credentials given by Workshop Studio by clicking on the "Credentials" button in the top right corner of the page https://studio.us-east-1.prod.workshops.aws/workshops/${workshopId}`);
        }
        else {
            throw error;
        }
    }
}
exports.checkAWSWorkshopStudioCredentials = checkAWSWorkshopStudioCredentials;
async function checkGenericAWSCredentials() {
    console.log(chalk.white('Check access permissions ...'));
    // Call STS getCallerIdentity to check if the credentials are valid and use role WSDataPlaneContentCreatorRole
    const sts = new AWS.STS();
    try {
        await sts.getCallerIdentity().promise();
        console.log(chalk.green('Access granted !'));
    }
    catch (error) {
        // If error of type ExpiredTokenException, enhance the error message with a link to the documentation
        if (error.name != 'WrongToken') {
            throw new Error('Credentials expired or not set, please export the credentials');
        }
        else {
            throw error;
        }
    }
}
exports.checkGenericAWSCredentials = checkGenericAWSCredentials;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tDcmVkZW50aWFscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvY2hlY2tDcmVkZW50aWFscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBK0I7QUFDL0IsK0JBQStCO0FBRXhCLEtBQUssVUFBVSxpQ0FBaUMsQ0FBQyxVQUFrQjtJQUN4RSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLFVBQVUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMzRSw4R0FBOEc7SUFDOUcsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUIsSUFBSTtRQUNGLE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFckQsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsQ0FBQyxFQUFFO1lBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7U0FDOUM7YUFBTTtZQUNMLE1BQU07Z0JBQ0osSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLE9BQU8sRUFBRSx1RkFBdUY7YUFDakcsQ0FBQztTQUNIO0tBQ0Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLHFHQUFxRztRQUNyRyxJQUFLLEtBQWUsQ0FBQyxJQUFJLElBQUksWUFBWSxFQUFFO1lBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQ2IsNE5BQTROLFVBQVUsRUFBRSxDQUN6TyxDQUFDO1NBQ0g7YUFBTTtZQUNMLE1BQU0sS0FBSyxDQUFDO1NBQ2I7S0FDRjtBQUNILENBQUM7QUF6QkQsOEVBeUJDO0FBQ00sS0FBSyxVQUFVLDBCQUEwQjtJQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO0lBQ3pELDhHQUE4RztJQUM5RyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxQixJQUFJO1FBQ0YsTUFBTSxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0tBQzlDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxxR0FBcUc7UUFDckcsSUFBSyxLQUFlLENBQUMsSUFBSSxJQUFJLFlBQVksRUFBRTtZQUN6QyxNQUFNLElBQUksS0FBSyxDQUNiLCtEQUErRCxDQUNoRSxDQUFDO1NBQ0g7YUFBTTtZQUNMLE1BQU0sS0FBSyxDQUFDO1NBQ2I7S0FDRjtBQUNILENBQUM7QUFqQkQsZ0VBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0ICogYXMgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tBV1NXb3Jrc2hvcFN0dWRpb0NyZWRlbnRpYWxzKHdvcmtzaG9wSWQ6IHN0cmluZykge1xuICBjb25zb2xlLmxvZyhjaGFsay53aGl0ZShgQ2hlY2sgYWNjZXNzIHBlcm1pc3Npb25zIGZvciAke3dvcmtzaG9wSWR9IC4uLmApKTtcbiAgLy8gQ2FsbCBTVFMgZ2V0Q2FsbGVySWRlbnRpdHkgdG8gY2hlY2sgaWYgdGhlIGNyZWRlbnRpYWxzIGFyZSB2YWxpZCBhbmQgdXNlIHJvbGUgV1NEYXRhUGxhbmVDb250ZW50Q3JlYXRvclJvbGVcbiAgY29uc3Qgc3RzID0gbmV3IEFXUy5TVFMoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RzLmdldENhbGxlcklkZW50aXR5KCkucHJvbWlzZSgpO1xuXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5Bcm4gJiYgZGF0YS5Bcm4uaW5jbHVkZXMoJ1dTRGF0YVBsYW5lQ29udGVudENyZWF0b3JSb2xlJykpIHtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKCdBY2Nlc3MgZ3JhbnRlZCAhJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB7XG4gICAgICAgIG5hbWU6ICdXcm9uZ1Rva2VuJyxcbiAgICAgICAgbWVzc2FnZTogJ1dyb25nIGNyZWRlbnRpYWxzIGZvdW5kLCBtYWtlIHN1cmUgdG8gZXhwb3J0IHRoZSBjcmVkZW50aWFscyBnaXZlbiBieSBXb3Jrc2hvcCBTdHVkaW8nLFxuICAgICAgfTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWYgZXJyb3Igb2YgdHlwZSBFeHBpcmVkVG9rZW5FeGNlcHRpb24sIGVuaGFuY2UgdGhlIGVycm9yIG1lc3NhZ2Ugd2l0aCBhIGxpbmsgdG8gdGhlIGRvY3VtZW50YXRpb25cbiAgICBpZiAoKGVycm9yIGFzIEVycm9yKS5uYW1lICE9ICdXcm9uZ1Rva2VuJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgQ3JlZGVudGlhbHMgZXhwaXJlZCBvciBub3Qgc2V0LCBwbGVhc2UgZXhwb3J0IHRoZSBjcmVkZW50aWFscyBnaXZlbiBieSBXb3Jrc2hvcCBTdHVkaW8gYnkgY2xpY2tpbmcgb24gdGhlIFwiQ3JlZGVudGlhbHNcIiBidXR0b24gaW4gdGhlIHRvcCByaWdodCBjb3JuZXIgb2YgdGhlIHBhZ2UgaHR0cHM6Ly9zdHVkaW8udXMtZWFzdC0xLnByb2Qud29ya3Nob3BzLmF3cy93b3Jrc2hvcHMvJHt3b3Jrc2hvcElkfWAsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0dlbmVyaWNBV1NDcmVkZW50aWFscygpIHtcbiAgY29uc29sZS5sb2coY2hhbGsud2hpdGUoJ0NoZWNrIGFjY2VzcyBwZXJtaXNzaW9ucyAuLi4nKSk7XG4gIC8vIENhbGwgU1RTIGdldENhbGxlcklkZW50aXR5IHRvIGNoZWNrIGlmIHRoZSBjcmVkZW50aWFscyBhcmUgdmFsaWQgYW5kIHVzZSByb2xlIFdTRGF0YVBsYW5lQ29udGVudENyZWF0b3JSb2xlXG4gIGNvbnN0IHN0cyA9IG5ldyBBV1MuU1RTKCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgc3RzLmdldENhbGxlcklkZW50aXR5KCkucHJvbWlzZSgpO1xuICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKCdBY2Nlc3MgZ3JhbnRlZCAhJykpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElmIGVycm9yIG9mIHR5cGUgRXhwaXJlZFRva2VuRXhjZXB0aW9uLCBlbmhhbmNlIHRoZSBlcnJvciBtZXNzYWdlIHdpdGggYSBsaW5rIHRvIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgaWYgKChlcnJvciBhcyBFcnJvcikubmFtZSAhPSAnV3JvbmdUb2tlbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0NyZWRlbnRpYWxzIGV4cGlyZWQgb3Igbm90IHNldCwgcGxlYXNlIGV4cG9ydCB0aGUgY3JlZGVudGlhbHMnLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG59XG4iXX0=