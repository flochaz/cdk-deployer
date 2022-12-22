import { execSync } from 'child_process';

export function getProjectFiles(cdkAppPath: string) {
  try {
    const files = execSync('git ls-files', {
      cwd: cdkAppPath,
      encoding: 'utf8',
    })
      .split('\n')
      .slice(0, -1);

    return files;
  } catch (error) {

    throw new Error(
      `Can't find git config in ${process.cwd()}. Your project need to be a git project to get the right files to upload. try run \`git init\``);
  }
}
