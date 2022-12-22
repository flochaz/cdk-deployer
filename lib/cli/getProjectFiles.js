"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectFiles = void 0;
const child_process_1 = require("child_process");
function getProjectFiles(cdkAppPath) {
    try {
        const files = child_process_1.execSync('git ls-files', {
            cwd: cdkAppPath,
            encoding: 'utf8',
        })
            .split('\n')
            .slice(0, -1);
        return files;
    }
    catch (error) {
        throw new Error(`Can't find git config in ${process.cwd()}. Your project need to be a git project to get the right files to upload. try run \`git init\``);
    }
}
exports.getProjectFiles = getProjectFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UHJvamVjdEZpbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9nZXRQcm9qZWN0RmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaURBQXlDO0FBRXpDLFNBQWdCLGVBQWUsQ0FBQyxVQUFrQjtJQUNoRCxJQUFJO1FBQ0YsTUFBTSxLQUFLLEdBQUcsd0JBQVEsQ0FBQyxjQUFjLEVBQUU7WUFDckMsR0FBRyxFQUFFLFVBQVU7WUFDZixRQUFRLEVBQUUsTUFBTTtTQUNqQixDQUFDO2FBQ0MsS0FBSyxDQUFDLElBQUksQ0FBQzthQUNYLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVoQixPQUFPLEtBQUssQ0FBQztLQUNkO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFFZCxNQUFNLElBQUksS0FBSyxDQUNiLDRCQUE0QixPQUFPLENBQUMsR0FBRyxFQUFFLGdHQUFnRyxDQUFDLENBQUM7S0FDOUk7QUFDSCxDQUFDO0FBZkQsMENBZUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvamVjdEZpbGVzKGNka0FwcFBhdGg6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IGZpbGVzID0gZXhlY1N5bmMoJ2dpdCBscy1maWxlcycsIHtcbiAgICAgIGN3ZDogY2RrQXBwUGF0aCxcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSlcbiAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgIC5zbGljZSgwLCAtMSk7XG5cbiAgICByZXR1cm4gZmlsZXM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQ2FuJ3QgZmluZCBnaXQgY29uZmlnIGluICR7cHJvY2Vzcy5jd2QoKX0uIFlvdXIgcHJvamVjdCBuZWVkIHRvIGJlIGEgZ2l0IHByb2plY3QgdG8gZ2V0IHRoZSByaWdodCBmaWxlcyB0byB1cGxvYWQuIHRyeSBydW4gXFxgZ2l0IGluaXRcXGBgKTtcbiAgfVxufVxuIl19