"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitAddAndPush = void 0;
const child_process_1 = require("child_process");
const inquirer = require("inquirer");
async function gitAddAndPush(repoPath, commitMessage, files) {
    try {
        // Display files to be pushed
        const gitAddConfirmation = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'gitAddConfirmation',
                message: `Are you ok to push the following listed files ? (if you answer no, you will have to do it manually for your changes to be taken into account by workshop studio using git add, commit and push command.) \n Files to be pushed : \n\n ${JSON.stringify(files, null, 2)} \n`,
            },
        ]);
        if (!gitAddConfirmation) {
            child_process_1.execSync(`git add ${files.join(' ')}`, {
                cwd: repoPath,
                encoding: 'utf8',
            });
            try {
                child_process_1.execSync(`git commit -m "${commitMessage}"`, {
                    cwd: repoPath,
                    encoding: 'utf8',
                });
            }
            catch (error) {
                console.log('Nothing to commit, skipping commit');
            }
            child_process_1.execSync('git push', {
                cwd: repoPath,
                encoding: 'utf8',
            });
        }
        else {
            console.log('Skipping git push');
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Failed to push files to git repo. You can do it manually with `git add . && git commit -m "chore: Add CDKStandaloneDeployer stack" && git push`');
    }
}
exports.gitAddAndPush = gitAddAndPush;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0QWRkQW5kUHVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvZ2l0QWRkQW5kUHVzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBeUM7QUFDekMscUNBQXFDO0FBRTlCLEtBQUssVUFBVSxhQUFhLENBQUMsUUFBZ0IsRUFBRSxhQUFxQixFQUFFLEtBQWU7SUFDMUYsSUFBSTtRQUNGLDZCQUE2QjtRQUM3QixNQUFNLGtCQUFrQixHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMvQztnQkFDRSxJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixPQUFPLEVBQ0wseU9BQXlPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSzthQUMvUTtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUN2Qix3QkFBUSxDQUFDLFdBQVcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFO2dCQUNyQyxHQUFHLEVBQUUsUUFBUTtnQkFDYixRQUFRLEVBQUUsTUFBTTthQUNqQixDQUFDLENBQUM7WUFDSCxJQUFJO2dCQUNGLHdCQUFRLENBQUMsa0JBQWtCLGFBQWEsR0FBRyxFQUFFO29CQUMzQyxHQUFHLEVBQUUsUUFBUTtvQkFDYixRQUFRLEVBQUUsTUFBTTtpQkFDakIsQ0FBQyxDQUFDO2FBQ0o7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7YUFDbkQ7WUFFRCx3QkFBUSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsR0FBRyxFQUFFLFFBQVE7Z0JBQ2IsUUFBUSxFQUFFLE1BQU07YUFDakIsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUNsQztLQUNGO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQ2IsaUpBQWlKLENBQ2xKLENBQUM7S0FDSDtBQUNILENBQUM7QUF0Q0Qsc0NBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIGlucXVpcmVyIGZyb20gJ2lucXVpcmVyJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdpdEFkZEFuZFB1c2gocmVwb1BhdGg6IHN0cmluZywgY29tbWl0TWVzc2FnZTogc3RyaW5nLCBmaWxlczogc3RyaW5nW10pIHtcbiAgdHJ5IHtcbiAgICAvLyBEaXNwbGF5IGZpbGVzIHRvIGJlIHB1c2hlZFxuICAgIGNvbnN0IGdpdEFkZENvbmZpcm1hdGlvbiA9IGF3YWl0IGlucXVpcmVyLnByb21wdChbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgbmFtZTogJ2dpdEFkZENvbmZpcm1hdGlvbicsXG4gICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgYEFyZSB5b3Ugb2sgdG8gcHVzaCB0aGUgZm9sbG93aW5nIGxpc3RlZCBmaWxlcyA/IChpZiB5b3UgYW5zd2VyIG5vLCB5b3Ugd2lsbCBoYXZlIHRvIGRvIGl0IG1hbnVhbGx5IGZvciB5b3VyIGNoYW5nZXMgdG8gYmUgdGFrZW4gaW50byBhY2NvdW50IGJ5IHdvcmtzaG9wIHN0dWRpbyB1c2luZyBnaXQgYWRkLCBjb21taXQgYW5kIHB1c2ggY29tbWFuZC4pIFxcbiBGaWxlcyB0byBiZSBwdXNoZWQgOiBcXG5cXG4gJHtKU09OLnN0cmluZ2lmeShmaWxlcywgbnVsbCwgMil9IFxcbmAsXG4gICAgICB9LFxuICAgIF0pO1xuICAgIGlmICghZ2l0QWRkQ29uZmlybWF0aW9uKSB7XG4gICAgICBleGVjU3luYyhgZ2l0IGFkZCAke2ZpbGVzLmpvaW4oJyAnKX1gLCB7XG4gICAgICAgIGN3ZDogcmVwb1BhdGgsXG4gICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICB9KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGV4ZWNTeW5jKGBnaXQgY29tbWl0IC1tIFwiJHtjb21taXRNZXNzYWdlfVwiYCwge1xuICAgICAgICAgIGN3ZDogcmVwb1BhdGgsXG4gICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjb21taXQsIHNraXBwaW5nIGNvbW1pdCcpO1xuICAgICAgfVxuXG4gICAgICBleGVjU3luYygnZ2l0IHB1c2gnLCB7XG4gICAgICAgIGN3ZDogcmVwb1BhdGgsXG4gICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ1NraXBwaW5nIGdpdCBwdXNoJyk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdGYWlsZWQgdG8gcHVzaCBmaWxlcyB0byBnaXQgcmVwby4gWW91IGNhbiBkbyBpdCBtYW51YWxseSB3aXRoIGBnaXQgYWRkIC4gJiYgZ2l0IGNvbW1pdCAtbSBcImNob3JlOiBBZGQgQ0RLU3RhbmRhbG9uZURlcGxveWVyIHN0YWNrXCIgJiYgZ2l0IHB1c2hgJyxcbiAgICApO1xuICB9XG59XG4iXX0=