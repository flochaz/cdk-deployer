import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import chalk = require('chalk');

export async function createZip(archiveName: string, cdkProjectPath: string, files: string[]) {
  console.log(
    chalk.white(
      `Creating zip file ${archiveName} for project located at ${cdkProjectPath}`
    ),
  );
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(archiveName);

    const archive = archiver.create('zip', {});

    archive.on('error', (err) => {
      reject(err);
    });
    output.on('close', function () {
      resolve(archive.pointer());
    });

    archive.pipe(output);
    for (const filePath of files) {
      const joinedPath = path.join(cdkProjectPath, filePath);
      archive.file(joinedPath, { name: filePath });
    }
    void archive.finalize();
  });
  console.log(
    chalk.green(
      `zip file ${archiveName} for project located at ${cdkProjectPath} created`
    ),
  );
  return;
}
