"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateContentSpec = void 0;
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const cdk_standalone_deployer_setup_workshop_1 = require("./cdk-standalone-deployer-setup-workshop");
const getProjectFiles_1 = require("./getProjectFiles");
async function populateContentSpec(workshopRepoPath, mainRegion = 'us-east-1') {
    const files = getProjectFiles_1.getProjectFiles(workshopRepoPath);
    const isContentSpecExisting = files.find((f) => f === 'contentspec.yaml');
    if (!isContentSpecExisting) {
        throw new Error("contentspec.yaml doesn't exist. Are you sure of your Workshop repo path ?");
    }
    let contentspecString = fs.readFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), 'utf8');
    // parse  yaml string to typescript object
    let contentspec = YAML.parse(contentspecString);
    const cdkDeployerTemplateRef = {
        templateLocation: cdk_standalone_deployer_setup_workshop_1.CDK_DEPLOYER_TEMPLATE_PATH,
        label: 'CDK app deployer stack',
        parameters: [
            {
                templateParameter: 'CDKAppSourceCodeBucketName',
                defaultValue: '{{.AssetsBucketName}}',
            },
            {
                templateParameter: 'CDKAppSourceCodeBucketPrefix',
                defaultValue: '{{.AssetsBucketPrefix}}',
            },
        ],
    };
    if (contentspec.infrastructure &&
        contentspec.infrastructure.cloudformationTemplates &&
        contentspec.infrastructure.cloudformationTemplates.find((t) => t.templateLocation === cdk_standalone_deployer_setup_workshop_1.CDK_DEPLOYER_TEMPLATE_PATH)) {
        console.log('Template reference already found. skipping spec update.');
    }
    else {
        if (!contentspec.awsAccountConfig) {
            contentspec.awsAccountConfig = {
                accountSources: ['WorkshopStudio'],
                participantRole: { managedPolicies: ['arn:aws:iam::aws:policy/AdministratorAccess'] },
                regionConfiguration: {
                    minAccessibleRegions: 1,
                    maxAccessibleRegions: 3,
                    accessibleRegions: {
                        required: [
                            mainRegion
                        ],
                        recommended: [
                            mainRegion
                        ]
                    },
                    deployableRegions: {
                        required: [
                            mainRegion
                        ]
                    }
                }
            };
        }
        if (!contentspec.infrastructure) {
            contentspec.infrastructure = { cloudformationTemplates: [cdkDeployerTemplateRef] };
        }
        else {
            contentspec.infrastructure = {
                cloudformationTemplates: [...contentspec.infrastructure.cloudformationTemplates, cdkDeployerTemplateRef],
            };
        }
        contentspec.version = '2.0';
        await fs.writeFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), YAML.stringify(contentspec));
    }
}
exports.populateContentSpec = populateContentSpec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdWxhdGVDb250ZW50U3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvcG9wdWxhdGVDb250ZW50U3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QixxR0FBc0Y7QUFDdEYsdURBQW9EO0FBRTdDLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxnQkFBd0IsRUFBRSxhQUFxQixXQUFXO0lBQ2xHLE1BQU0sS0FBSyxHQUFHLGlDQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNoRCxNQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7S0FDOUY7SUFFRCxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2pHLDBDQUEwQztJQUMxQyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFaEQsTUFBTSxzQkFBc0IsR0FBRztRQUM3QixnQkFBZ0IsRUFBRSxtRUFBMEI7UUFDNUMsS0FBSyxFQUFFLHdCQUF3QjtRQUMvQixVQUFVLEVBQUU7WUFDVjtnQkFDRSxpQkFBaUIsRUFBRSw0QkFBNEI7Z0JBQy9DLFlBQVksRUFBRSx1QkFBdUI7YUFDdEM7WUFDRDtnQkFDRSxpQkFBaUIsRUFBRSw4QkFBOEI7Z0JBQ2pELFlBQVksRUFBRSx5QkFBeUI7YUFDeEM7U0FDRjtLQUNGLENBQUM7SUFFRixJQUNFLFdBQVcsQ0FBQyxjQUFjO1FBQzFCLFdBQVcsQ0FBQyxjQUFjLENBQUMsdUJBQXVCO1FBQ2xELFdBQVcsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUNyRCxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixLQUFLLG1FQUEwQixDQUM5RCxFQUNEO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO0tBQ3hFO1NBQU07UUFDTCxJQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFO1lBQ2hDLFdBQVcsQ0FBQyxnQkFBZ0IsR0FBRztnQkFDN0IsY0FBYyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ2xDLGVBQWUsRUFBRSxFQUFDLGVBQWUsRUFBRSxDQUFDLDZDQUE2QyxDQUFDLEVBQUM7Z0JBQ25GLG1CQUFtQixFQUFFO29CQUNuQixvQkFBb0IsRUFBRyxDQUFDO29CQUN4QixvQkFBb0IsRUFBRyxDQUFDO29CQUN4QixpQkFBaUIsRUFBRTt3QkFDakIsUUFBUSxFQUFFOzRCQUNSLFVBQVU7eUJBQ1g7d0JBQ0QsV0FBVyxFQUFFOzRCQUNYLFVBQVU7eUJBQ1g7cUJBQ0Y7b0JBQ0QsaUJBQWlCLEVBQUU7d0JBQ2pCLFFBQVEsRUFBRTs0QkFDUixVQUFVO3lCQUNYO3FCQUNGO2lCQUNGO2FBQ0YsQ0FBQTtTQUNGO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDL0IsV0FBVyxDQUFDLGNBQWMsR0FBRyxFQUFFLHVCQUF1QixFQUFFLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDO1NBQ3BGO2FBQU07WUFDTCxXQUFXLENBQUMsY0FBYyxHQUFHO2dCQUMzQix1QkFBdUIsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRSxzQkFBc0IsQ0FBQzthQUN6RyxDQUFDO1NBQ0g7UUFFRCxXQUFXLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUM1QixNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztLQUN0RztBQUNILENBQUM7QUFyRUQsa0RBcUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAneWFtbCc7XG5pbXBvcnQgeyBDREtfREVQTE9ZRVJfVEVNUExBVEVfUEFUSCB9IGZyb20gJy4vY2RrLXN0YW5kYWxvbmUtZGVwbG95ZXItc2V0dXAtd29ya3Nob3AnO1xuaW1wb3J0IHsgZ2V0UHJvamVjdEZpbGVzIH0gZnJvbSAnLi9nZXRQcm9qZWN0RmlsZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVDb250ZW50U3BlYyh3b3Jrc2hvcFJlcG9QYXRoOiBzdHJpbmcsIG1haW5SZWdpb246IHN0cmluZyA9ICd1cy1lYXN0LTEnKSB7XG4gIGNvbnN0IGZpbGVzID0gZ2V0UHJvamVjdEZpbGVzKHdvcmtzaG9wUmVwb1BhdGgpO1xuICBjb25zdCBpc0NvbnRlbnRTcGVjRXhpc3RpbmcgPSBmaWxlcy5maW5kKChmKSA9PiBmID09PSAnY29udGVudHNwZWMueWFtbCcpO1xuICBpZiAoIWlzQ29udGVudFNwZWNFeGlzdGluZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcImNvbnRlbnRzcGVjLnlhbWwgZG9lc24ndCBleGlzdC4gQXJlIHlvdSBzdXJlIG9mIHlvdXIgV29ya3Nob3AgcmVwbyBwYXRoID9cIik7XG4gIH1cblxuICBsZXQgY29udGVudHNwZWNTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHdvcmtzaG9wUmVwb1BhdGgsICdjb250ZW50c3BlYy55YW1sJyksICd1dGY4Jyk7XG4gIC8vIHBhcnNlICB5YW1sIHN0cmluZyB0byB0eXBlc2NyaXB0IG9iamVjdFxuICBsZXQgY29udGVudHNwZWMgPSBZQU1MLnBhcnNlKGNvbnRlbnRzcGVjU3RyaW5nKTtcblxuICBjb25zdCBjZGtEZXBsb3llclRlbXBsYXRlUmVmID0ge1xuICAgIHRlbXBsYXRlTG9jYXRpb246IENES19ERVBMT1lFUl9URU1QTEFURV9QQVRILFxuICAgIGxhYmVsOiAnQ0RLIGFwcCBkZXBsb3llciBzdGFjaycsXG4gICAgcGFyYW1ldGVyczogW1xuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVBhcmFtZXRlcjogJ0NES0FwcFNvdXJjZUNvZGVCdWNrZXROYW1lJyxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiAne3suQXNzZXRzQnVja2V0TmFtZX19JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlUGFyYW1ldGVyOiAnQ0RLQXBwU291cmNlQ29kZUJ1Y2tldFByZWZpeCcsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogJ3t7LkFzc2V0c0J1Y2tldFByZWZpeH19JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfTtcblxuICBpZiAoXG4gICAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUgJiZcbiAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZS5jbG91ZGZvcm1hdGlvblRlbXBsYXRlcyAmJlxuICAgIGNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlLmNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzLmZpbmQoXG4gICAgICAodDogYW55KSA9PiB0LnRlbXBsYXRlTG9jYXRpb24gPT09IENES19ERVBMT1lFUl9URU1QTEFURV9QQVRILFxuICAgIClcbiAgKSB7XG4gICAgY29uc29sZS5sb2coJ1RlbXBsYXRlIHJlZmVyZW5jZSBhbHJlYWR5IGZvdW5kLiBza2lwcGluZyBzcGVjIHVwZGF0ZS4nKTtcbiAgfSBlbHNlIHtcbiAgICBpZighY29udGVudHNwZWMuYXdzQWNjb3VudENvbmZpZykge1xuICAgICAgY29udGVudHNwZWMuYXdzQWNjb3VudENvbmZpZyA9IHtcbiAgICAgICAgYWNjb3VudFNvdXJjZXM6IFsnV29ya3Nob3BTdHVkaW8nXSxcbiAgICAgICAgcGFydGljaXBhbnRSb2xlOiB7bWFuYWdlZFBvbGljaWVzOiBbJ2Fybjphd3M6aWFtOjphd3M6cG9saWN5L0FkbWluaXN0cmF0b3JBY2Nlc3MnXX0sXG4gICAgICAgIHJlZ2lvbkNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICBtaW5BY2Nlc3NpYmxlUmVnaW9ucyA6IDEsXG4gICAgICAgICAgbWF4QWNjZXNzaWJsZVJlZ2lvbnMgOiAzLFxuICAgICAgICAgIGFjY2Vzc2libGVSZWdpb25zOiB7XG4gICAgICAgICAgICByZXF1aXJlZDogW1xuICAgICAgICAgICAgICBtYWluUmVnaW9uXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmVjb21tZW5kZWQ6IFtcbiAgICAgICAgICAgICAgbWFpblJlZ2lvblxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGVwbG95YWJsZVJlZ2lvbnM6IHtcbiAgICAgICAgICAgIHJlcXVpcmVkOiBbXG4gICAgICAgICAgICAgIG1haW5SZWdpb25cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZSkge1xuICAgICAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUgPSB7IGNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzOiBbY2RrRGVwbG95ZXJUZW1wbGF0ZVJlZl0gfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUgPSB7XG4gICAgICAgIGNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzOiBbLi4uY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUuY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXMsIGNka0RlcGxveWVyVGVtcGxhdGVSZWZdLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb250ZW50c3BlYy52ZXJzaW9uID0gJzIuMCc7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4od29ya3Nob3BSZXBvUGF0aCwgJ2NvbnRlbnRzcGVjLnlhbWwnKSwgWUFNTC5zdHJpbmdpZnkoY29udGVudHNwZWMpKTtcbiAgfVxufVxuIl19