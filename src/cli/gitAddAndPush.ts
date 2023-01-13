import { execSync } from 'child_process';
import * as inquirer from 'inquirer';

export async function gitAddAndPush(repoPath: string, commitMessage: string, files: string[]) {
  try {
    // Display files to be pushed
    const gitAddConfirmation = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'gitAddConfirmation',
        message:
          `Are you ok to push the following listed files ? (if you answer no, you will have to do it manually for your changes to be taken into account by workshop studio using git add, commit and push command.) \n Files to be pushed : \n\n ${JSON.stringify(files, null, 2)} \n`,
      },
    ]);
    if (!gitAddConfirmation) {
      execSync(`git add ${files.join(' ')}`, {
        cwd: repoPath,
        encoding: 'utf8',
      });
      try {
        execSync(`git commit -m "${commitMessage}"`, {
          cwd: repoPath,
          encoding: 'utf8',
        });
      } catch (error) {
        console.log('Nothing to commit, skipping commit');
      }

      execSync('git push', {
        cwd: repoPath,
        encoding: 'utf8',
      });
    } else {
      console.log('Skipping git push');
    }
  } catch (error) {
    console.error(error);
    throw new Error(
      'Failed to push files to git repo. You can do it manually with `git add . && git commit -m "chore: Add CDKStandaloneDeployer stack" && git push`',
    );
  }
}
