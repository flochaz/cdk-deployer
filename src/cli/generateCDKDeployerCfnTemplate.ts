import { execSync } from 'child_process';
import * as path from 'path';

export async function generateCDKDeployerCfnTemplate(cdkProjectPath: string, workshopRepoPath: string) {
  execSync(`npx cdk synth CDKDeployer --output ${path.join(process.cwd(), workshopRepoPath, 'static')}`, {
    cwd: cdkProjectPath,
    encoding: 'utf8',
  });
}
