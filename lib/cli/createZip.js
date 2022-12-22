"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZip = void 0;
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
async function createZip(archiveName, cdkProjectPath, files) {
    return new Promise((resolve, reject) => {
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
}
exports.createZip = createZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlWmlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9jcmVhdGVaaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixxQ0FBcUM7QUFFOUIsS0FBSyxVQUFVLFNBQVMsQ0FBQyxXQUFtQixFQUFFLGNBQXNCLEVBQUUsS0FBZTtJQUMxRixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVqRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUUzQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7WUFDakIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQixLQUFLLE1BQU0sUUFBUSxJQUFJLEtBQUssRUFBRTtZQUM1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsS0FBSyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBcEJELDhCQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBhcmNoaXZlciBmcm9tICdhcmNoaXZlcic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVaaXAoYXJjaGl2ZU5hbWU6IHN0cmluZywgY2RrUHJvamVjdFBhdGg6IHN0cmluZywgZmlsZXM6IHN0cmluZ1tdKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgb3V0cHV0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oYXJjaGl2ZU5hbWUpO1xuXG4gICAgY29uc3QgYXJjaGl2ZSA9IGFyY2hpdmVyLmNyZWF0ZSgnemlwJywge30pO1xuXG4gICAgYXJjaGl2ZS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgICBvdXRwdXQub24oJ2Nsb3NlJywgZnVuY3Rpb24gKCkge1xuICAgICAgcmVzb2x2ZShhcmNoaXZlLnBvaW50ZXIoKSk7XG4gICAgfSk7XG5cbiAgICBhcmNoaXZlLnBpcGUob3V0cHV0KTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVzKSB7XG4gICAgICBjb25zdCBqb2luZWRQYXRoID0gcGF0aC5qb2luKGNka1Byb2plY3RQYXRoLCBmaWxlUGF0aCk7XG4gICAgICBhcmNoaXZlLmZpbGUoam9pbmVkUGF0aCwgeyBuYW1lOiBmaWxlUGF0aCB9KTtcbiAgICB9XG4gICAgdm9pZCBhcmNoaXZlLmZpbmFsaXplKCk7XG4gIH0pO1xufVxuIl19