"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateContentSpec = void 0;
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const cli_setup_workshop_1 = require("./cli-setup-workshop");
const getProjectFiles_1 = require("./getProjectFiles");
async function populateContentSpec(workshopRepoPath) {
    const files = getProjectFiles_1.getProjectFiles(workshopRepoPath);
    const isContentSpecExisting = files.find((f) => f === 'contentspec.yaml');
    if (!isContentSpecExisting) {
        throw new Error("contentspec.yaml doesn't exist. Are you sure of your Workshop repo path ?");
    }
    let contentspecString = fs.readFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), 'utf8');
    // parse  yaml string to typescript object
    let contentspec = YAML.parse(contentspecString);
    const cdkDeployerTemplateRef = {
        templateLocation: cli_setup_workshop_1.CDK_DEPLOYER_TEMPLATE_PATH,
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
        contentspec.infrastructure.cloudformationTemplates.find((t) => t.templateLocation === cli_setup_workshop_1.CDK_DEPLOYER_TEMPLATE_PATH)) {
        console.log('Template reference already found. skipping spec update.');
    }
    else {
        if (!contentspec.infrastructure) {
            contentspec = {
                version: '2.0',
                defaultLocaleCode: 'en-US',
                localeCodes: ['en-US'],
                additionalLinks: [
                    {
                        title: 'AWS Documentation Homepage',
                        link: 'https://docs.aws.amazon.com/',
                    },
                ],
                awsAccountConfig: {
                    accountSources: ['WorkshopStudio', 'CustomerProvided'],
                    participantRole: {
                        managedPolicies: ['arn:aws:iam::aws:policy/AdministratorAccess'],
                    },
                    ec2KeyPair: false,
                    regionConfiguration: {
                        minAccessibleRegions: 1,
                        maxAccessibleRegions: 3,
                        accessibleRegions: {
                            required: ['us-east-1'],
                            recommended: ['us-east-1'],
                        },
                        deployableRegions: {
                            required: ['us-east-1'],
                            recommended: ['us-east-1'],
                        },
                    },
                },
                infrastructure: {
                    cloudformationTemplates: [cdkDeployerTemplateRef],
                },
            };
        }
        else {
            contentspec.infrastructure = {
                cloudformationTemplates: [...contentspec.infrastructure.cloudformationTemplates, cdkDeployerTemplateRef],
            };
        }
        await fs.writeFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), YAML.stringify(contentspec));
    }
}
exports.populateContentSpec = populateContentSpec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdWxhdGVDb250ZW50U3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvcG9wdWxhdGVDb250ZW50U3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3Qiw2REFBa0U7QUFDbEUsdURBQW9EO0FBRTdDLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxnQkFBd0I7SUFDaEUsTUFBTSxLQUFLLEdBQUcsaUNBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2hELE1BQU0scUJBQXFCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLGtCQUFrQixDQUFDLENBQUM7SUFDMUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1FBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztLQUM5RjtJQUVELElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDakcsMENBQTBDO0lBQzFDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVoRCxNQUFNLHNCQUFzQixHQUFHO1FBQzdCLGdCQUFnQixFQUFFLCtDQUEwQjtRQUM1QyxLQUFLLEVBQUUsd0JBQXdCO1FBQy9CLFVBQVUsRUFBRTtZQUNWO2dCQUNFLGlCQUFpQixFQUFFLDRCQUE0QjtnQkFDL0MsWUFBWSxFQUFFLHVCQUF1QjthQUN0QztZQUNEO2dCQUNFLGlCQUFpQixFQUFFLDhCQUE4QjtnQkFDakQsWUFBWSxFQUFFLHlCQUF5QjthQUN4QztTQUNGO0tBQ0YsQ0FBQztJQUVGLElBQ0UsV0FBVyxDQUFDLGNBQWM7UUFDMUIsV0FBVyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUI7UUFDbEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQ3JELENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEtBQUssK0NBQTBCLENBQzlELEVBQ0Q7UUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7S0FDeEU7U0FBTTtRQUNMLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFO1lBQy9CLFdBQVcsR0FBRztnQkFDWixPQUFPLEVBQUUsS0FBSztnQkFDZCxpQkFBaUIsRUFBRSxPQUFPO2dCQUMxQixXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RCLGVBQWUsRUFBRTtvQkFDZjt3QkFDRSxLQUFLLEVBQUUsNEJBQTRCO3dCQUNuQyxJQUFJLEVBQUUsOEJBQThCO3FCQUNyQztpQkFDRjtnQkFDRCxnQkFBZ0IsRUFBRTtvQkFDaEIsY0FBYyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUM7b0JBQ3RELGVBQWUsRUFBRTt3QkFDZixlQUFlLEVBQUUsQ0FBQyw2Q0FBNkMsQ0FBQztxQkFDakU7b0JBQ0QsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLG1CQUFtQixFQUFFO3dCQUNuQixvQkFBb0IsRUFBRSxDQUFDO3dCQUN2QixvQkFBb0IsRUFBRSxDQUFDO3dCQUN2QixpQkFBaUIsRUFBRTs0QkFDakIsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDOzRCQUN2QixXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUM7eUJBQzNCO3dCQUNELGlCQUFpQixFQUFFOzRCQUNqQixRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUM7NEJBQ3ZCLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQzt5QkFDM0I7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsY0FBYyxFQUFFO29CQUNkLHVCQUF1QixFQUFFLENBQUMsc0JBQXNCLENBQUM7aUJBQ2xEO2FBQ0YsQ0FBQztTQUNIO2FBQU07WUFDTCxXQUFXLENBQUMsY0FBYyxHQUFHO2dCQUMzQix1QkFBdUIsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRSxzQkFBc0IsQ0FBQzthQUN6RyxDQUFDO1NBQ0g7UUFDRCxNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztLQUN0RztBQUNILENBQUM7QUE1RUQsa0RBNEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAneWFtbCc7XG5pbXBvcnQgeyBDREtfREVQTE9ZRVJfVEVNUExBVEVfUEFUSCB9IGZyb20gJy4vY2xpLXNldHVwLXdvcmtzaG9wJztcbmltcG9ydCB7IGdldFByb2plY3RGaWxlcyB9IGZyb20gJy4vZ2V0UHJvamVjdEZpbGVzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlQ29udGVudFNwZWMod29ya3Nob3BSZXBvUGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IGZpbGVzID0gZ2V0UHJvamVjdEZpbGVzKHdvcmtzaG9wUmVwb1BhdGgpO1xuICBjb25zdCBpc0NvbnRlbnRTcGVjRXhpc3RpbmcgPSBmaWxlcy5maW5kKChmKSA9PiBmID09PSAnY29udGVudHNwZWMueWFtbCcpO1xuICBpZiAoIWlzQ29udGVudFNwZWNFeGlzdGluZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcImNvbnRlbnRzcGVjLnlhbWwgZG9lc24ndCBleGlzdC4gQXJlIHlvdSBzdXJlIG9mIHlvdXIgV29ya3Nob3AgcmVwbyBwYXRoID9cIik7XG4gIH1cblxuICBsZXQgY29udGVudHNwZWNTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHdvcmtzaG9wUmVwb1BhdGgsICdjb250ZW50c3BlYy55YW1sJyksICd1dGY4Jyk7XG4gIC8vIHBhcnNlICB5YW1sIHN0cmluZyB0byB0eXBlc2NyaXB0IG9iamVjdFxuICBsZXQgY29udGVudHNwZWMgPSBZQU1MLnBhcnNlKGNvbnRlbnRzcGVjU3RyaW5nKTtcblxuICBjb25zdCBjZGtEZXBsb3llclRlbXBsYXRlUmVmID0ge1xuICAgIHRlbXBsYXRlTG9jYXRpb246IENES19ERVBMT1lFUl9URU1QTEFURV9QQVRILFxuICAgIGxhYmVsOiAnQ0RLIGFwcCBkZXBsb3llciBzdGFjaycsXG4gICAgcGFyYW1ldGVyczogW1xuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVBhcmFtZXRlcjogJ0NES0FwcFNvdXJjZUNvZGVCdWNrZXROYW1lJyxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiAne3suQXNzZXRzQnVja2V0TmFtZX19JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlUGFyYW1ldGVyOiAnQ0RLQXBwU291cmNlQ29kZUJ1Y2tldFByZWZpeCcsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogJ3t7LkFzc2V0c0J1Y2tldFByZWZpeH19JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfTtcblxuICBpZiAoXG4gICAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUgJiZcbiAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZS5jbG91ZGZvcm1hdGlvblRlbXBsYXRlcyAmJlxuICAgIGNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlLmNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzLmZpbmQoXG4gICAgICAodDogYW55KSA9PiB0LnRlbXBsYXRlTG9jYXRpb24gPT09IENES19ERVBMT1lFUl9URU1QTEFURV9QQVRILFxuICAgIClcbiAgKSB7XG4gICAgY29uc29sZS5sb2coJ1RlbXBsYXRlIHJlZmVyZW5jZSBhbHJlYWR5IGZvdW5kLiBza2lwcGluZyBzcGVjIHVwZGF0ZS4nKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlKSB7XG4gICAgICBjb250ZW50c3BlYyA9IHtcbiAgICAgICAgdmVyc2lvbjogJzIuMCcsXG4gICAgICAgIGRlZmF1bHRMb2NhbGVDb2RlOiAnZW4tVVMnLFxuICAgICAgICBsb2NhbGVDb2RlczogWydlbi1VUyddLFxuICAgICAgICBhZGRpdGlvbmFsTGlua3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aXRsZTogJ0FXUyBEb2N1bWVudGF0aW9uIEhvbWVwYWdlJyxcbiAgICAgICAgICAgIGxpbms6ICdodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBhd3NBY2NvdW50Q29uZmlnOiB7XG4gICAgICAgICAgYWNjb3VudFNvdXJjZXM6IFsnV29ya3Nob3BTdHVkaW8nLCAnQ3VzdG9tZXJQcm92aWRlZCddLFxuICAgICAgICAgIHBhcnRpY2lwYW50Um9sZToge1xuICAgICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbJ2Fybjphd3M6aWFtOjphd3M6cG9saWN5L0FkbWluaXN0cmF0b3JBY2Nlc3MnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVjMktleVBhaXI6IGZhbHNlLFxuICAgICAgICAgIHJlZ2lvbkNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgIG1pbkFjY2Vzc2libGVSZWdpb25zOiAxLFxuICAgICAgICAgICAgbWF4QWNjZXNzaWJsZVJlZ2lvbnM6IDMsXG4gICAgICAgICAgICBhY2Nlc3NpYmxlUmVnaW9uczoge1xuICAgICAgICAgICAgICByZXF1aXJlZDogWyd1cy1lYXN0LTEnXSxcbiAgICAgICAgICAgICAgcmVjb21tZW5kZWQ6IFsndXMtZWFzdC0xJ10sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVwbG95YWJsZVJlZ2lvbnM6IHtcbiAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsndXMtZWFzdC0xJ10sXG4gICAgICAgICAgICAgIHJlY29tbWVuZGVkOiBbJ3VzLWVhc3QtMSddLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBpbmZyYXN0cnVjdHVyZToge1xuICAgICAgICAgIGNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzOiBbY2RrRGVwbG95ZXJUZW1wbGF0ZVJlZl0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZSA9IHtcbiAgICAgICAgY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXM6IFsuLi5jb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZS5jbG91ZGZvcm1hdGlvblRlbXBsYXRlcywgY2RrRGVwbG95ZXJUZW1wbGF0ZVJlZl0sXG4gICAgICB9O1xuICAgIH1cbiAgICBhd2FpdCBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbih3b3Jrc2hvcFJlcG9QYXRoLCAnY29udGVudHNwZWMueWFtbCcpLCBZQU1MLnN0cmluZ2lmeShjb250ZW50c3BlYykpO1xuICB9XG59XG4iXX0=