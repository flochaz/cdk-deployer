"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZip = void 0;
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const chalk = require("chalk");
async function createZip(archiveName, cdkProjectPath, files) {
    console.log(chalk.white(`Creating zip file ${archiveName} for project located at ${cdkProjectPath}`));
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
    console.log(chalk.green(`zip file ${archiveName} for project located at ${cdkProjectPath} created`));
    return;
}
exports.createZip = createZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlWmlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9jcmVhdGVaaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixxQ0FBcUM7QUFDckMsK0JBQWdDO0FBRXpCLEtBQUssVUFBVSxTQUFTLENBQUMsV0FBbUIsRUFBRSxjQUFzQixFQUFFLEtBQWU7SUFDMUYsT0FBTyxDQUFDLEdBQUcsQ0FDVCxLQUFLLENBQUMsS0FBSyxDQUNULHFCQUFxQixXQUFXLDJCQUEyQixjQUFjLEVBQUUsQ0FDNUUsQ0FDRixDQUFDO0lBQ0YsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNwQyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFakQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFM0MsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUMxQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO1lBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsS0FBSyxNQUFNLFFBQVEsSUFBSSxLQUFLLEVBQUU7WUFDNUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdkQsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUM5QztRQUNELEtBQUssT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FDVCxLQUFLLENBQUMsS0FBSyxDQUNULFlBQVksV0FBVywyQkFBMkIsY0FBYyxVQUFVLENBQzNFLENBQ0YsQ0FBQztJQUNGLE9BQU87QUFDVCxDQUFDO0FBL0JELDhCQStCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBhcmNoaXZlciBmcm9tICdhcmNoaXZlcic7XG5pbXBvcnQgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlWmlwKGFyY2hpdmVOYW1lOiBzdHJpbmcsIGNka1Byb2plY3RQYXRoOiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSkge1xuICBjb25zb2xlLmxvZyhcbiAgICBjaGFsay53aGl0ZShcbiAgICAgIGBDcmVhdGluZyB6aXAgZmlsZSAke2FyY2hpdmVOYW1lfSBmb3IgcHJvamVjdCBsb2NhdGVkIGF0ICR7Y2RrUHJvamVjdFBhdGh9YFxuICAgICksXG4gICk7XG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBvdXRwdXQgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShhcmNoaXZlTmFtZSk7XG5cbiAgICBjb25zdCBhcmNoaXZlID0gYXJjaGl2ZXIuY3JlYXRlKCd6aXAnLCB7fSk7XG5cbiAgICBhcmNoaXZlLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0pO1xuICAgIG91dHB1dC5vbignY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXNvbHZlKGFyY2hpdmUucG9pbnRlcigpKTtcbiAgICB9KTtcblxuICAgIGFyY2hpdmUucGlwZShvdXRwdXQpO1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZmlsZXMpIHtcbiAgICAgIGNvbnN0IGpvaW5lZFBhdGggPSBwYXRoLmpvaW4oY2RrUHJvamVjdFBhdGgsIGZpbGVQYXRoKTtcbiAgICAgIGFyY2hpdmUuZmlsZShqb2luZWRQYXRoLCB7IG5hbWU6IGZpbGVQYXRoIH0pO1xuICAgIH1cbiAgICB2b2lkIGFyY2hpdmUuZmluYWxpemUoKTtcbiAgfSk7XG4gIGNvbnNvbGUubG9nKFxuICAgIGNoYWxrLmdyZWVuKFxuICAgICAgYHppcCBmaWxlICR7YXJjaGl2ZU5hbWV9IGZvciBwcm9qZWN0IGxvY2F0ZWQgYXQgJHtjZGtQcm9qZWN0UGF0aH0gY3JlYXRlZGBcbiAgICApLFxuICApO1xuICByZXR1cm47XG59XG4iXX0=