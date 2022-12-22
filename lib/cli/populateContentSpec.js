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
        templateLocation: 'static/CDKDeployer.template.json',
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
        contentspec.infrastructure.cloudformationTemplates.find((t) => t.templateLocation === 'static/CDKDeployer.template.json')) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdWxhdGVDb250ZW50U3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvcG9wdWxhdGVDb250ZW50U3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3Qix1REFBb0Q7QUFFN0MsS0FBSyxVQUFVLG1CQUFtQixDQUFDLE9BQVk7SUFDcEQsTUFBTSxLQUFLLEdBQUcsaUNBQWUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN4RCxNQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7S0FDOUY7SUFFRCxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RywwQ0FBMEM7SUFDMUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRWhELE1BQU0sc0JBQXNCLEdBQUc7UUFDN0IsZ0JBQWdCLEVBQUUsa0NBQWtDO1FBQ3BELEtBQUssRUFBRSx3QkFBd0I7UUFDL0IsVUFBVSxFQUFFO1lBQ1Y7Z0JBQ0UsaUJBQWlCLEVBQUUsNEJBQTRCO2dCQUMvQyxZQUFZLEVBQUUsdUJBQXVCO2FBQ3RDO1lBQ0Q7Z0JBQ0UsaUJBQWlCLEVBQUUsOEJBQThCO2dCQUNqRCxZQUFZLEVBQUUseUJBQXlCO2FBQ3hDO1NBQ0Y7S0FDRixDQUFDO0lBRUYsSUFDRSxXQUFXLENBQUMsY0FBYztRQUMxQixXQUFXLENBQUMsY0FBYyxDQUFDLHVCQUF1QjtRQUNsRCxXQUFXLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FDckQsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyxrQ0FBa0MsQ0FDdEUsRUFDRDtRQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMseURBQXlELENBQUMsQ0FBQztLQUN4RTtTQUFNO1FBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDL0IsV0FBVyxHQUFHO2dCQUNaLE9BQU8sRUFBRSxLQUFLO2dCQUNkLGlCQUFpQixFQUFFLE9BQU87Z0JBQzFCLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsZUFBZSxFQUFFO29CQUNmO3dCQUNFLEtBQUssRUFBRSw0QkFBNEI7d0JBQ25DLElBQUksRUFBRSw4QkFBOEI7cUJBQ3JDO2lCQUNGO2dCQUNELGdCQUFnQixFQUFFO29CQUNoQixjQUFjLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQztvQkFDdEQsZUFBZSxFQUFFO3dCQUNmLGVBQWUsRUFBRSxDQUFDLDZDQUE2QyxDQUFDO3FCQUNqRTtvQkFDRCxVQUFVLEVBQUUsS0FBSztvQkFDakIsbUJBQW1CLEVBQUU7d0JBQ25CLG9CQUFvQixFQUFFLENBQUM7d0JBQ3ZCLG9CQUFvQixFQUFFLENBQUM7d0JBQ3ZCLGlCQUFpQixFQUFFOzRCQUNqQixRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUM7NEJBQ3ZCLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQzt5QkFDM0I7d0JBQ0QsaUJBQWlCLEVBQUU7NEJBQ2pCLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQzs0QkFDdkIsV0FBVyxFQUFFLENBQUMsV0FBVyxDQUFDO3lCQUMzQjtxQkFDRjtpQkFDRjtnQkFDRCxjQUFjLEVBQUU7b0JBQ2QsdUJBQXVCLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztpQkFDbEQ7YUFDRixDQUFDO1NBQ0g7YUFBTTtZQUNMLFdBQVcsQ0FBQyxjQUFjLEdBQUc7Z0JBQzNCLHVCQUF1QixFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLHVCQUF1QixFQUFFLHNCQUFzQixDQUFDO2FBQ3pHLENBQUM7U0FDSDtRQUNELE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztLQUM5RztBQUNILENBQUM7QUE1RUQsa0RBNEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAneWFtbCc7XG5pbXBvcnQgeyBnZXRQcm9qZWN0RmlsZXMgfSBmcm9tICcuL2dldFByb2plY3RGaWxlcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3B1bGF0ZUNvbnRlbnRTcGVjKG9wdGlvbnM6IGFueSkge1xuICBjb25zdCBmaWxlcyA9IGdldFByb2plY3RGaWxlcyhvcHRpb25zLndvcmtzaG9wUmVwb1BhdGgpO1xuICBjb25zdCBpc0NvbnRlbnRTcGVjRXhpc3RpbmcgPSBmaWxlcy5maW5kKChmKSA9PiBmID09PSAnY29udGVudHNwZWMueWFtbCcpO1xuICBpZiAoIWlzQ29udGVudFNwZWNFeGlzdGluZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcImNvbnRlbnRzcGVjLnlhbWwgZG9lc24ndCBleGlzdC4gQXJlIHlvdSBzdXJlIG9mIHlvdXIgV29ya3Nob3AgcmVwbyBwYXRoID9cIik7XG4gIH1cblxuICBsZXQgY29udGVudHNwZWNTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKG9wdGlvbnMud29ya3Nob3BSZXBvUGF0aCwgJ2NvbnRlbnRzcGVjLnlhbWwnKSwgJ3V0ZjgnKTtcbiAgLy8gcGFyc2UgIHlhbWwgc3RyaW5nIHRvIHR5cGVzY3JpcHQgb2JqZWN0XG4gIGxldCBjb250ZW50c3BlYyA9IFlBTUwucGFyc2UoY29udGVudHNwZWNTdHJpbmcpO1xuXG4gIGNvbnN0IGNka0RlcGxveWVyVGVtcGxhdGVSZWYgPSB7XG4gICAgdGVtcGxhdGVMb2NhdGlvbjogJ3N0YXRpYy9DREtEZXBsb3llci50ZW1wbGF0ZS5qc29uJyxcbiAgICBsYWJlbDogJ0NESyBhcHAgZGVwbG95ZXIgc3RhY2snLFxuICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVQYXJhbWV0ZXI6ICdDREtBcHBTb3VyY2VDb2RlQnVja2V0TmFtZScsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogJ3t7LkFzc2V0c0J1Y2tldE5hbWV9fScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVBhcmFtZXRlcjogJ0NES0FwcFNvdXJjZUNvZGVCdWNrZXRQcmVmaXgnLFxuICAgICAgICBkZWZhdWx0VmFsdWU6ICd7ey5Bc3NldHNCdWNrZXRQcmVmaXh9fScsXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG5cbiAgaWYgKFxuICAgIGNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlICYmXG4gICAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUuY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXMgJiZcbiAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZS5jbG91ZGZvcm1hdGlvblRlbXBsYXRlcy5maW5kKFxuICAgICAgKHQ6IGFueSkgPT4gdC50ZW1wbGF0ZUxvY2F0aW9uID09PSAnc3RhdGljL0NES0RlcGxveWVyLnRlbXBsYXRlLmpzb24nLFxuICAgIClcbiAgKSB7XG4gICAgY29uc29sZS5sb2coJ1RlbXBsYXRlIHJlZmVyZW5jZSBhbHJlYWR5IGZvdW5kLiBza2lwcGluZyBzcGVjIHVwZGF0ZS4nKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlKSB7XG4gICAgICBjb250ZW50c3BlYyA9IHtcbiAgICAgICAgdmVyc2lvbjogJzIuMCcsXG4gICAgICAgIGRlZmF1bHRMb2NhbGVDb2RlOiAnZW4tVVMnLFxuICAgICAgICBsb2NhbGVDb2RlczogWydlbi1VUyddLFxuICAgICAgICBhZGRpdGlvbmFsTGlua3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aXRsZTogJ0FXUyBEb2N1bWVudGF0aW9uIEhvbWVwYWdlJyxcbiAgICAgICAgICAgIGxpbms6ICdodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBhd3NBY2NvdW50Q29uZmlnOiB7XG4gICAgICAgICAgYWNjb3VudFNvdXJjZXM6IFsnV29ya3Nob3BTdHVkaW8nLCAnQ3VzdG9tZXJQcm92aWRlZCddLFxuICAgICAgICAgIHBhcnRpY2lwYW50Um9sZToge1xuICAgICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbJ2Fybjphd3M6aWFtOjphd3M6cG9saWN5L0FkbWluaXN0cmF0b3JBY2Nlc3MnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVjMktleVBhaXI6IGZhbHNlLFxuICAgICAgICAgIHJlZ2lvbkNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgIG1pbkFjY2Vzc2libGVSZWdpb25zOiAxLFxuICAgICAgICAgICAgbWF4QWNjZXNzaWJsZVJlZ2lvbnM6IDMsXG4gICAgICAgICAgICBhY2Nlc3NpYmxlUmVnaW9uczoge1xuICAgICAgICAgICAgICByZXF1aXJlZDogWyd1cy1lYXN0LTEnXSxcbiAgICAgICAgICAgICAgcmVjb21tZW5kZWQ6IFsndXMtZWFzdC0xJ10sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVwbG95YWJsZVJlZ2lvbnM6IHtcbiAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsndXMtZWFzdC0xJ10sXG4gICAgICAgICAgICAgIHJlY29tbWVuZGVkOiBbJ3VzLWVhc3QtMSddLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBpbmZyYXN0cnVjdHVyZToge1xuICAgICAgICAgIGNsb3VkZm9ybWF0aW9uVGVtcGxhdGVzOiBbY2RrRGVwbG95ZXJUZW1wbGF0ZVJlZl0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZSA9IHtcbiAgICAgICAgY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXM6IFsuLi5jb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZS5jbG91ZGZvcm1hdGlvblRlbXBsYXRlcywgY2RrRGVwbG95ZXJUZW1wbGF0ZVJlZl0sXG4gICAgICB9O1xuICAgIH1cbiAgICBhd2FpdCBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvcHRpb25zLndvcmtzaG9wUmVwb1BhdGgsICdjb250ZW50c3BlYy55YW1sJyksIFlBTUwuc3RyaW5naWZ5KGNvbnRlbnRzcGVjKSk7XG4gIH1cbn1cbiJdfQ==