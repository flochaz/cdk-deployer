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
        if (gitAddConfirmation.gitAddConfirmation) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0QWRkQW5kUHVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvZ2l0QWRkQW5kUHVzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBeUM7QUFDekMscUNBQXFDO0FBRTlCLEtBQUssVUFBVSxhQUFhLENBQUMsUUFBZ0IsRUFBRSxhQUFxQixFQUFFLEtBQWU7SUFDMUYsSUFBSTtRQUNGLDZCQUE2QjtRQUM3QixNQUFNLGtCQUFrQixHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMvQztnQkFDRSxJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixPQUFPLEVBQ0wseU9BQXlPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSzthQUMvUTtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksa0JBQWtCLENBQUMsa0JBQWtCLEVBQUU7WUFDekMsd0JBQVEsQ0FBQyxXQUFXLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFDckMsR0FBRyxFQUFFLFFBQVE7Z0JBQ2IsUUFBUSxFQUFFLE1BQU07YUFDakIsQ0FBQyxDQUFDO1lBQ0gsSUFBSTtnQkFDRix3QkFBUSxDQUFDLGtCQUFrQixhQUFhLEdBQUcsRUFBRTtvQkFDM0MsR0FBRyxFQUFFLFFBQVE7b0JBQ2IsUUFBUSxFQUFFLE1BQU07aUJBQ2pCLENBQUMsQ0FBQzthQUNKO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2FBQ25EO1lBRUQsd0JBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ25CLEdBQUcsRUFBRSxRQUFRO2dCQUNiLFFBQVEsRUFBRSxNQUFNO2FBQ2pCLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDbEM7S0FDRjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixNQUFNLElBQUksS0FBSyxDQUNiLGlKQUFpSixDQUNsSixDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBdENELHNDQXNDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBpbnF1aXJlciBmcm9tICdpbnF1aXJlcic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnaXRBZGRBbmRQdXNoKHJlcG9QYXRoOiBzdHJpbmcsIGNvbW1pdE1lc3NhZ2U6IHN0cmluZywgZmlsZXM6IHN0cmluZ1tdKSB7XG4gIHRyeSB7XG4gICAgLy8gRGlzcGxheSBmaWxlcyB0byBiZSBwdXNoZWRcbiAgICBjb25zdCBnaXRBZGRDb25maXJtYXRpb24gPSBhd2FpdCBpbnF1aXJlci5wcm9tcHQoW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICAgIG5hbWU6ICdnaXRBZGRDb25maXJtYXRpb24nLFxuICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgIGBBcmUgeW91IG9rIHRvIHB1c2ggdGhlIGZvbGxvd2luZyBsaXN0ZWQgZmlsZXMgPyAoaWYgeW91IGFuc3dlciBubywgeW91IHdpbGwgaGF2ZSB0byBkbyBpdCBtYW51YWxseSBmb3IgeW91ciBjaGFuZ2VzIHRvIGJlIHRha2VuIGludG8gYWNjb3VudCBieSB3b3Jrc2hvcCBzdHVkaW8gdXNpbmcgZ2l0IGFkZCwgY29tbWl0IGFuZCBwdXNoIGNvbW1hbmQuKSBcXG4gRmlsZXMgdG8gYmUgcHVzaGVkIDogXFxuXFxuICR7SlNPTi5zdHJpbmdpZnkoZmlsZXMsIG51bGwsIDIpfSBcXG5gLFxuICAgICAgfSxcbiAgICBdKTtcbiAgICBpZiAoZ2l0QWRkQ29uZmlybWF0aW9uLmdpdEFkZENvbmZpcm1hdGlvbikge1xuICAgICAgZXhlY1N5bmMoYGdpdCBhZGQgJHtmaWxlcy5qb2luKCcgJyl9YCwge1xuICAgICAgICBjd2Q6IHJlcG9QYXRoLFxuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgfSk7XG4gICAgICB0cnkge1xuICAgICAgICBleGVjU3luYyhgZ2l0IGNvbW1pdCAtbSBcIiR7Y29tbWl0TWVzc2FnZX1cImAsIHtcbiAgICAgICAgICBjd2Q6IHJlcG9QYXRoLFxuICAgICAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ05vdGhpbmcgdG8gY29tbWl0LCBza2lwcGluZyBjb21taXQnKTtcbiAgICAgIH1cblxuICAgICAgZXhlY1N5bmMoJ2dpdCBwdXNoJywge1xuICAgICAgICBjd2Q6IHJlcG9QYXRoLFxuICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdTa2lwcGluZyBnaXQgcHVzaCcpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnRmFpbGVkIHRvIHB1c2ggZmlsZXMgdG8gZ2l0IHJlcG8uIFlvdSBjYW4gZG8gaXQgbWFudWFsbHkgd2l0aCBgZ2l0IGFkZCAuICYmIGdpdCBjb21taXQgLW0gXCJjaG9yZTogQWRkIENES1N0YW5kYWxvbmVEZXBsb3llciBzdGFja1wiICYmIGdpdCBwdXNoYCcsXG4gICAgKTtcbiAgfVxufVxuIl19