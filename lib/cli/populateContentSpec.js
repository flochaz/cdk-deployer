"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateContentSpec = void 0;
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const getProjectFiles_1 = require("./getProjectFiles");
async function populateContentSpec(options) {
    const files = getProjectFiles_1.getProjectFiles(options.workshopRepoPath);
    const isContentSpecExisting = files.find((f) => f === 'contentspec.yaml');
    if (!isContentSpecExisting) {
        throw new Error("contentspec.yaml doesn't exist. Are you sure of your Workshop repo path ?");
    }
    let contentspecString = fs.readFileSync(path.join(options.workshopRepoPath, 'contentspec.yaml'), 'utf8');
    // parse  yaml string to typescript object
    let contentspec = YAML.parse(contentspecString);
    const cdkDeployerTemplateRef = {
        templateLocation: 'static/CDKStandaloneDeployer.template.json',
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
        contentspec.infrastructure.cloudformationTemplates.find((t) => t.templateLocation === 'static/CDKStandaloneDeployer.template.json')) {
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
        await fs.writeFileSync(path.join(options.workshopRepoPath, 'contentspec.yaml'), YAML.stringify(contentspec));
    }
}
exports.populateContentSpec = populateContentSpec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdWxhdGVDb250ZW50U3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvcG9wdWxhdGVDb250ZW50U3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3Qix1REFBb0Q7QUFFN0MsS0FBSyxVQUFVLG1CQUFtQixDQUFDLE9BQVk7SUFDcEQsTUFBTSxLQUFLLEdBQUcsaUNBQWUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN4RCxNQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7S0FDOUY7SUFFRCxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RywwQ0FBMEM7SUFDMUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRWhELE1BQU0sc0JBQXNCLEdBQUc7UUFDN0IsZ0JBQWdCLEVBQUUsNENBQTRDO1FBQzlELEtBQUssRUFBRSx3QkFBd0I7UUFDL0IsVUFBVSxFQUFFO1lBQ1Y7Z0JBQ0UsaUJBQWlCLEVBQUUsNEJBQTRCO2dCQUMvQyxZQUFZLEVBQUUsdUJBQXVCO2FBQ3RDO1lBQ0Q7Z0JBQ0UsaUJBQWlCLEVBQUUsOEJBQThCO2dCQUNqRCxZQUFZLEVBQUUseUJBQXlCO2FBQ3hDO1NBQ0Y7S0FDRixDQUFDO0lBRUYsSUFDRSxXQUFXLENBQUMsY0FBYztRQUMxQixXQUFXLENBQUMsY0FBYyxDQUFDLHVCQUF1QjtRQUNsRCxXQUFXLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FDckQsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyw0Q0FBNEMsQ0FDaEYsRUFDRDtRQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMseURBQXlELENBQUMsQ0FBQztLQUN4RTtTQUFNO1FBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDL0IsV0FBVyxHQUFHO2dCQUNaLE9BQU8sRUFBRSxLQUFLO2dCQUNkLGlCQUFpQixFQUFFLE9BQU87Z0JBQzFCLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsZUFBZSxFQUFFO29CQUNmO3dCQUNFLEtBQUssRUFBRSw0QkFBNEI7d0JBQ25DLElBQUksRUFBRSw4QkFBOEI7cUJBQ3JDO2lCQUNGO2dCQUNELGdCQUFnQixFQUFFO29CQUNoQixjQUFjLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQztvQkFDdEQsZUFBZSxFQUFFO3dCQUNmLGVBQWUsRUFBRSxDQUFDLDZDQUE2QyxDQUFDO3FCQUNqRTtvQkFDRCxVQUFVLEVBQUUsS0FBSztvQkFDakIsbUJBQW1CLEVBQUU7d0JBQ25CLG9CQUFvQixFQUFFLENBQUM7d0JBQ3ZCLG9CQUFvQixFQUFFLENBQUM7d0JBQ3ZCLGlCQUFpQixFQUFFOzRCQUNqQixRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUM7NEJBQ3ZCLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQzt5QkFDM0I7d0JBQ0QsaUJBQWlCLEVBQUU7NEJBQ2pCLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQzs0QkFDdkIsV0FBVyxFQUFFLENBQUMsV0FBVyxDQUFDO3lCQUMzQjtxQkFDRjtpQkFDRjtnQkFDRCxjQUFjLEVBQUU7b0JBQ2QsdUJBQXVCLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztpQkFDbEQ7YUFDRixDQUFDO1NBQ0g7YUFBTTtZQUNMLFdBQVcsQ0FBQyxjQUFjLEdBQUc7Z0JBQzNCLHVCQUF1QixFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLHVCQUF1QixFQUFFLHNCQUFzQixDQUFDO2FBQ3pHLENBQUM7U0FDSDtRQUNELE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztLQUM5RztBQUNILENBQUM7QUE1RUQsa0RBNEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAneWFtbCc7XG5pbXBvcnQgeyBnZXRQcm9qZWN0RmlsZXMgfSBmcm9tICcuL2dldFByb2plY3RGaWxlcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3B1bGF0ZUNvbnRlbnRTcGVjKG9wdGlvbnM6IGFueSkge1xuICBjb25zdCBmaWxlcyA9IGdldFByb2plY3RGaWxlcyhvcHRpb25zLndvcmtzaG9wUmVwb1BhdGgpO1xuICBjb25zdCBpc0NvbnRlbnRTcGVjRXhpc3RpbmcgPSBmaWxlcy5maW5kKChmKSA9PiBmID09PSAnY29udGVudHNwZWMueWFtbCcpO1xuICBpZiAoIWlzQ29udGVudFNwZWNFeGlzdGluZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcImNvbnRlbnRzcGVjLnlhbWwgZG9lc24ndCBleGlzdC4gQXJlIHlvdSBzdXJlIG9mIHlvdXIgV29ya3Nob3AgcmVwbyBwYXRoID9cIik7XG4gIH1cblxuICBsZXQgY29udGVudHNwZWNTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKG9wdGlvbnMud29ya3Nob3BSZXBvUGF0aCwgJ2NvbnRlbnRzcGVjLnlhbWwnKSwgJ3V0ZjgnKTtcbiAgLy8gcGFyc2UgIHlhbWwgc3RyaW5nIHRvIHR5cGVzY3JpcHQgb2JqZWN0XG4gIGxldCBjb250ZW50c3BlYyA9IFlBTUwucGFyc2UoY29udGVudHNwZWNTdHJpbmcpO1xuXG4gIGNvbnN0IGNka0RlcGxveWVyVGVtcGxhdGVSZWYgPSB7XG4gICAgdGVtcGxhdGVMb2NhdGlvbjogJ3N0YXRpYy9DREtTdGFuZGFsb25lRGVwbG95ZXIudGVtcGxhdGUuanNvbicsXG4gICAgbGFiZWw6ICdDREsgYXBwIGRlcGxveWVyIHN0YWNrJyxcbiAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlUGFyYW1ldGVyOiAnQ0RLQXBwU291cmNlQ29kZUJ1Y2tldE5hbWUnLFxuICAgICAgICBkZWZhdWx0VmFsdWU6ICd7ey5Bc3NldHNCdWNrZXROYW1lfX0nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVQYXJhbWV0ZXI6ICdDREtBcHBTb3VyY2VDb2RlQnVja2V0UHJlZml4JyxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiAne3suQXNzZXRzQnVja2V0UHJlZml4fX0nLFxuICAgICAgfSxcbiAgICBdLFxuICB9O1xuXG4gIGlmIChcbiAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZSAmJlxuICAgIGNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlLmNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzICYmXG4gICAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUuY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXMuZmluZChcbiAgICAgICh0OiBhbnkpID0+IHQudGVtcGxhdGVMb2NhdGlvbiA9PT0gJ3N0YXRpYy9DREtTdGFuZGFsb25lRGVwbG95ZXIudGVtcGxhdGUuanNvbicsXG4gICAgKVxuICApIHtcbiAgICBjb25zb2xlLmxvZygnVGVtcGxhdGUgcmVmZXJlbmNlIGFscmVhZHkgZm91bmQuIHNraXBwaW5nIHNwZWMgdXBkYXRlLicpO1xuICB9IGVsc2Uge1xuICAgIGlmICghY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUpIHtcbiAgICAgIGNvbnRlbnRzcGVjID0ge1xuICAgICAgICB2ZXJzaW9uOiAnMi4wJyxcbiAgICAgICAgZGVmYXVsdExvY2FsZUNvZGU6ICdlbi1VUycsXG4gICAgICAgIGxvY2FsZUNvZGVzOiBbJ2VuLVVTJ10sXG4gICAgICAgIGFkZGl0aW9uYWxMaW5rczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRpdGxlOiAnQVdTIERvY3VtZW50YXRpb24gSG9tZXBhZ2UnLFxuICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS8nLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIGF3c0FjY291bnRDb25maWc6IHtcbiAgICAgICAgICBhY2NvdW50U291cmNlczogWydXb3Jrc2hvcFN0dWRpbycsICdDdXN0b21lclByb3ZpZGVkJ10sXG4gICAgICAgICAgcGFydGljaXBhbnRSb2xlOiB7XG4gICAgICAgICAgICBtYW5hZ2VkUG9saWNpZXM6IFsnYXJuOmF3czppYW06OmF3czpwb2xpY3kvQWRtaW5pc3RyYXRvckFjY2VzcyddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZWMyS2V5UGFpcjogZmFsc2UsXG4gICAgICAgICAgcmVnaW9uQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgbWluQWNjZXNzaWJsZVJlZ2lvbnM6IDEsXG4gICAgICAgICAgICBtYXhBY2Nlc3NpYmxlUmVnaW9uczogMyxcbiAgICAgICAgICAgIGFjY2Vzc2libGVSZWdpb25zOiB7XG4gICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3VzLWVhc3QtMSddLFxuICAgICAgICAgICAgICByZWNvbW1lbmRlZDogWyd1cy1lYXN0LTEnXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXBsb3lhYmxlUmVnaW9uczoge1xuICAgICAgICAgICAgICByZXF1aXJlZDogWyd1cy1lYXN0LTEnXSxcbiAgICAgICAgICAgICAgcmVjb21tZW5kZWQ6IFsndXMtZWFzdC0xJ10sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGluZnJhc3RydWN0dXJlOiB7XG4gICAgICAgICAgY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXM6IFtjZGtEZXBsb3llclRlbXBsYXRlUmVmXSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlID0ge1xuICAgICAgICBjbG91ZGZvcm1hdGlvblRlbXBsYXRlczogWy4uLmNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlLmNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzLCBjZGtEZXBsb3llclRlbXBsYXRlUmVmXSxcbiAgICAgIH07XG4gICAgfVxuICAgIGF3YWl0IGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG9wdGlvbnMud29ya3Nob3BSZXBvUGF0aCwgJ2NvbnRlbnRzcGVjLnlhbWwnKSwgWUFNTC5zdHJpbmdpZnkoY29udGVudHNwZWMpKTtcbiAgfVxufVxuIl19