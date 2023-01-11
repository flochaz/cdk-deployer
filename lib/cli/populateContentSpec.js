"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateContentSpec = void 0;
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const cdk_standalone_deployer_setup_workshop_1 = require("./cdk-standalone-deployer-setup-workshop");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdWxhdGVDb250ZW50U3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvcG9wdWxhdGVDb250ZW50U3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QixxR0FBc0Y7QUFDdEYsdURBQW9EO0FBRTdDLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxnQkFBd0I7SUFDaEUsTUFBTSxLQUFLLEdBQUcsaUNBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2hELE1BQU0scUJBQXFCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLGtCQUFrQixDQUFDLENBQUM7SUFDMUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1FBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztLQUM5RjtJQUVELElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDakcsMENBQTBDO0lBQzFDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVoRCxNQUFNLHNCQUFzQixHQUFHO1FBQzdCLGdCQUFnQixFQUFFLG1FQUEwQjtRQUM1QyxLQUFLLEVBQUUsd0JBQXdCO1FBQy9CLFVBQVUsRUFBRTtZQUNWO2dCQUNFLGlCQUFpQixFQUFFLDRCQUE0QjtnQkFDL0MsWUFBWSxFQUFFLHVCQUF1QjthQUN0QztZQUNEO2dCQUNFLGlCQUFpQixFQUFFLDhCQUE4QjtnQkFDakQsWUFBWSxFQUFFLHlCQUF5QjthQUN4QztTQUNGO0tBQ0YsQ0FBQztJQUVGLElBQ0UsV0FBVyxDQUFDLGNBQWM7UUFDMUIsV0FBVyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUI7UUFDbEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQ3JELENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEtBQUssbUVBQTBCLENBQzlELEVBQ0Q7UUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7S0FDeEU7U0FBTTtRQUNMLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFO1lBQy9CLFdBQVcsR0FBRztnQkFDWixPQUFPLEVBQUUsS0FBSztnQkFDZCxpQkFBaUIsRUFBRSxPQUFPO2dCQUMxQixXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RCLGVBQWUsRUFBRTtvQkFDZjt3QkFDRSxLQUFLLEVBQUUsNEJBQTRCO3dCQUNuQyxJQUFJLEVBQUUsOEJBQThCO3FCQUNyQztpQkFDRjtnQkFDRCxnQkFBZ0IsRUFBRTtvQkFDaEIsY0FBYyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUM7b0JBQ3RELGVBQWUsRUFBRTt3QkFDZixlQUFlLEVBQUUsQ0FBQyw2Q0FBNkMsQ0FBQztxQkFDakU7b0JBQ0QsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLG1CQUFtQixFQUFFO3dCQUNuQixvQkFBb0IsRUFBRSxDQUFDO3dCQUN2QixvQkFBb0IsRUFBRSxDQUFDO3dCQUN2QixpQkFBaUIsRUFBRTs0QkFDakIsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDOzRCQUN2QixXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUM7eUJBQzNCO3dCQUNELGlCQUFpQixFQUFFOzRCQUNqQixRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUM7NEJBQ3ZCLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQzt5QkFDM0I7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsY0FBYyxFQUFFO29CQUNkLHVCQUF1QixFQUFFLENBQUMsc0JBQXNCLENBQUM7aUJBQ2xEO2FBQ0YsQ0FBQztTQUNIO2FBQU07WUFDTCxXQUFXLENBQUMsY0FBYyxHQUFHO2dCQUMzQix1QkFBdUIsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRSxzQkFBc0IsQ0FBQzthQUN6RyxDQUFDO1NBQ0g7UUFDRCxNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztLQUN0RztBQUNILENBQUM7QUE1RUQsa0RBNEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAneWFtbCc7XG5pbXBvcnQgeyBDREtfREVQTE9ZRVJfVEVNUExBVEVfUEFUSCB9IGZyb20gJy4vY2RrLXN0YW5kYWxvbmUtZGVwbG95ZXItc2V0dXAtd29ya3Nob3AnO1xuaW1wb3J0IHsgZ2V0UHJvamVjdEZpbGVzIH0gZnJvbSAnLi9nZXRQcm9qZWN0RmlsZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVDb250ZW50U3BlYyh3b3Jrc2hvcFJlcG9QYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgZmlsZXMgPSBnZXRQcm9qZWN0RmlsZXMod29ya3Nob3BSZXBvUGF0aCk7XG4gIGNvbnN0IGlzQ29udGVudFNwZWNFeGlzdGluZyA9IGZpbGVzLmZpbmQoKGYpID0+IGYgPT09ICdjb250ZW50c3BlYy55YW1sJyk7XG4gIGlmICghaXNDb250ZW50U3BlY0V4aXN0aW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiY29udGVudHNwZWMueWFtbCBkb2Vzbid0IGV4aXN0LiBBcmUgeW91IHN1cmUgb2YgeW91ciBXb3Jrc2hvcCByZXBvIHBhdGggP1wiKTtcbiAgfVxuXG4gIGxldCBjb250ZW50c3BlY1N0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4od29ya3Nob3BSZXBvUGF0aCwgJ2NvbnRlbnRzcGVjLnlhbWwnKSwgJ3V0ZjgnKTtcbiAgLy8gcGFyc2UgIHlhbWwgc3RyaW5nIHRvIHR5cGVzY3JpcHQgb2JqZWN0XG4gIGxldCBjb250ZW50c3BlYyA9IFlBTUwucGFyc2UoY29udGVudHNwZWNTdHJpbmcpO1xuXG4gIGNvbnN0IGNka0RlcGxveWVyVGVtcGxhdGVSZWYgPSB7XG4gICAgdGVtcGxhdGVMb2NhdGlvbjogQ0RLX0RFUExPWUVSX1RFTVBMQVRFX1BBVEgsXG4gICAgbGFiZWw6ICdDREsgYXBwIGRlcGxveWVyIHN0YWNrJyxcbiAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlUGFyYW1ldGVyOiAnQ0RLQXBwU291cmNlQ29kZUJ1Y2tldE5hbWUnLFxuICAgICAgICBkZWZhdWx0VmFsdWU6ICd7ey5Bc3NldHNCdWNrZXROYW1lfX0nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVQYXJhbWV0ZXI6ICdDREtBcHBTb3VyY2VDb2RlQnVja2V0UHJlZml4JyxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiAne3suQXNzZXRzQnVja2V0UHJlZml4fX0nLFxuICAgICAgfSxcbiAgICBdLFxuICB9O1xuXG4gIGlmIChcbiAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZSAmJlxuICAgIGNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlLmNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzICYmXG4gICAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUuY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXMuZmluZChcbiAgICAgICh0OiBhbnkpID0+IHQudGVtcGxhdGVMb2NhdGlvbiA9PT0gQ0RLX0RFUExPWUVSX1RFTVBMQVRFX1BBVEgsXG4gICAgKVxuICApIHtcbiAgICBjb25zb2xlLmxvZygnVGVtcGxhdGUgcmVmZXJlbmNlIGFscmVhZHkgZm91bmQuIHNraXBwaW5nIHNwZWMgdXBkYXRlLicpO1xuICB9IGVsc2Uge1xuICAgIGlmICghY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUpIHtcbiAgICAgIGNvbnRlbnRzcGVjID0ge1xuICAgICAgICB2ZXJzaW9uOiAnMi4wJyxcbiAgICAgICAgZGVmYXVsdExvY2FsZUNvZGU6ICdlbi1VUycsXG4gICAgICAgIGxvY2FsZUNvZGVzOiBbJ2VuLVVTJ10sXG4gICAgICAgIGFkZGl0aW9uYWxMaW5rczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRpdGxlOiAnQVdTIERvY3VtZW50YXRpb24gSG9tZXBhZ2UnLFxuICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS8nLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIGF3c0FjY291bnRDb25maWc6IHtcbiAgICAgICAgICBhY2NvdW50U291cmNlczogWydXb3Jrc2hvcFN0dWRpbycsICdDdXN0b21lclByb3ZpZGVkJ10sXG4gICAgICAgICAgcGFydGljaXBhbnRSb2xlOiB7XG4gICAgICAgICAgICBtYW5hZ2VkUG9saWNpZXM6IFsnYXJuOmF3czppYW06OmF3czpwb2xpY3kvQWRtaW5pc3RyYXRvckFjY2VzcyddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZWMyS2V5UGFpcjogZmFsc2UsXG4gICAgICAgICAgcmVnaW9uQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgbWluQWNjZXNzaWJsZVJlZ2lvbnM6IDEsXG4gICAgICAgICAgICBtYXhBY2Nlc3NpYmxlUmVnaW9uczogMyxcbiAgICAgICAgICAgIGFjY2Vzc2libGVSZWdpb25zOiB7XG4gICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3VzLWVhc3QtMSddLFxuICAgICAgICAgICAgICByZWNvbW1lbmRlZDogWyd1cy1lYXN0LTEnXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXBsb3lhYmxlUmVnaW9uczoge1xuICAgICAgICAgICAgICByZXF1aXJlZDogWyd1cy1lYXN0LTEnXSxcbiAgICAgICAgICAgICAgcmVjb21tZW5kZWQ6IFsndXMtZWFzdC0xJ10sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGluZnJhc3RydWN0dXJlOiB7XG4gICAgICAgICAgY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXM6IFtjZGtEZXBsb3llclRlbXBsYXRlUmVmXSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlID0ge1xuICAgICAgICBjbG91ZGZvcm1hdGlvblRlbXBsYXRlczogWy4uLmNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlLmNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzLCBjZGtEZXBsb3llclRlbXBsYXRlUmVmXSxcbiAgICAgIH07XG4gICAgfVxuICAgIGF3YWl0IGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHdvcmtzaG9wUmVwb1BhdGgsICdjb250ZW50c3BlYy55YW1sJyksIFlBTUwuc3RyaW5naWZ5KGNvbnRlbnRzcGVjKSk7XG4gIH1cbn1cbiJdfQ==