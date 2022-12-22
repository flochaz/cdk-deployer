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
        if (gitAddConfirmation) {
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
    }
    catch (error) {
        console.error(error);
        throw new Error('Failed to push files to git repo. You can do it manually with `git add . && git commit -m "chore: Add CDKStandaloneDeployer stack" && git push`');
    }
}
exports.gitAddAndPush = gitAddAndPush;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0QWRkQW5kUHVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvZ2l0QWRkQW5kUHVzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBeUM7QUFDekMscUNBQXFDO0FBRTlCLEtBQUssVUFBVSxhQUFhLENBQUMsUUFBZ0IsRUFBRSxhQUFxQixFQUFFLEtBQWU7SUFDMUYsSUFBSTtRQUNGLDZCQUE2QjtRQUM3QixNQUFNLGtCQUFrQixHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMvQztnQkFDRSxJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixPQUFPLEVBQ0wseU9BQXlPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSzthQUMvUTtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksa0JBQWtCLEVBQUU7WUFDdEIsd0JBQVEsQ0FBQyxXQUFXLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFDckMsR0FBRyxFQUFFLFFBQVE7Z0JBQ2IsUUFBUSxFQUFFLE1BQU07YUFDakIsQ0FBQyxDQUFDO1lBQ0gsSUFBSTtnQkFDRix3QkFBUSxDQUFDLGtCQUFrQixhQUFhLEdBQUcsRUFBRTtvQkFDM0MsR0FBRyxFQUFFLFFBQVE7b0JBQ2IsUUFBUSxFQUFFLE1BQU07aUJBQ2pCLENBQUMsQ0FBQzthQUNKO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2FBQ25EO1lBRUQsd0JBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ25CLEdBQUcsRUFBRSxRQUFRO2dCQUNiLFFBQVEsRUFBRSxNQUFNO2FBQ2pCLENBQUMsQ0FBQztTQUNKO0tBQ0Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsTUFBTSxJQUFJLEtBQUssQ0FDYixpSkFBaUosQ0FDbEosQ0FBQztLQUNIO0FBQ0gsQ0FBQztBQXBDRCxzQ0FvQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0ICogYXMgaW5xdWlyZXIgZnJvbSAnaW5xdWlyZXInO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2l0QWRkQW5kUHVzaChyZXBvUGF0aDogc3RyaW5nLCBjb21taXRNZXNzYWdlOiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSkge1xuICB0cnkge1xuICAgIC8vIERpc3BsYXkgZmlsZXMgdG8gYmUgcHVzaGVkXG4gICAgY29uc3QgZ2l0QWRkQ29uZmlybWF0aW9uID0gYXdhaXQgaW5xdWlyZXIucHJvbXB0KFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgICBuYW1lOiAnZ2l0QWRkQ29uZmlybWF0aW9uJyxcbiAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICBgQXJlIHlvdSBvayB0byBwdXNoIHRoZSBmb2xsb3dpbmcgbGlzdGVkIGZpbGVzID8gKGlmIHlvdSBhbnN3ZXIgbm8sIHlvdSB3aWxsIGhhdmUgdG8gZG8gaXQgbWFudWFsbHkgZm9yIHlvdXIgY2hhbmdlcyB0byBiZSB0YWtlbiBpbnRvIGFjY291bnQgYnkgd29ya3Nob3Agc3R1ZGlvIHVzaW5nIGdpdCBhZGQsIGNvbW1pdCBhbmQgcHVzaCBjb21tYW5kLikgXFxuIEZpbGVzIHRvIGJlIHB1c2hlZCA6IFxcblxcbiAke0pTT04uc3RyaW5naWZ5KGZpbGVzLCBudWxsLCAyKX0gXFxuYCxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgaWYgKGdpdEFkZENvbmZpcm1hdGlvbikge1xuICAgICAgZXhlY1N5bmMoYGdpdCBhZGQgJHtmaWxlcy5qb2luKCcgJyl9YCwge1xuICAgICAgICBjd2Q6IHJlcG9QYXRoLFxuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgfSk7XG4gICAgICB0cnkge1xuICAgICAgICBleGVjU3luYyhgZ2l0IGNvbW1pdCAtbSBcIiR7Y29tbWl0TWVzc2FnZX1cImAsIHtcbiAgICAgICAgICBjd2Q6IHJlcG9QYXRoLFxuICAgICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ05vdGhpbmcgdG8gY29tbWl0LCBza2lwcGluZyBjb21taXQnKTtcbiAgICAgIH1cblxuICAgICAgZXhlY1N5bmMoJ2dpdCBwdXNoJywge1xuICAgICAgICBjd2Q6IHJlcG9QYXRoLFxuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdGYWlsZWQgdG8gcHVzaCBmaWxlcyB0byBnaXQgcmVwby4gWW91IGNhbiBkbyBpdCBtYW51YWxseSB3aXRoIGBnaXQgYWRkIC4gJiYgZ2l0IGNvbW1pdCAtbSBcImNob3JlOiBBZGQgQ0RLU3RhbmRhbG9uZURlcGxveWVyIHN0YWNrXCIgJiYgZ2l0IHB1c2hgJyxcbiAgICApO1xuICB9XG59XG4iXX0=