"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContentSpecString = exports.populateContentSpec = void 0;
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const constants_1 = require("./constants");
const getProjectFiles_1 = require("./getProjectFiles");
const cdkDeployerTemplateRef = {
    templateLocation: constants_1.CDK_DEPLOYER_TEMPLATE_PATH,
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
async function populateContentSpec(workshopRepoPath, mainRegion = 'us-east-1') {
    let initialContentSpecString = getInitialContentSpecContent(workshopRepoPath);
    const updatedContentSpecString = updateContentSpecString(initialContentSpecString, mainRegion);
    if (updatedContentSpecString) {
        await fs.writeFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), updatedContentSpecString);
    }
}
exports.populateContentSpec = populateContentSpec;
function getInitialContentSpecContent(workshopRepoPath) {
    const files = getProjectFiles_1.getProjectFiles(workshopRepoPath);
    const isContentSpecExisting = files.find((f) => f === 'contentspec.yaml');
    if (!isContentSpecExisting) {
        throw new Error("contentspec.yaml doesn't exist. Are you sure of your Workshop repo path ?");
    }
    let initialContentSpecString = fs.readFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), 'utf8');
    return initialContentSpecString;
}
function updateContentSpecString(initialContentSpecString, mainRegion) {
    // parse  yaml string to typescript object
    let contentspec = YAML.parse(initialContentSpecString);
    if (contentspec.infrastructure &&
        contentspec.infrastructure.cloudformationTemplates &&
        contentspec.infrastructure.cloudformationTemplates.find((t) => t.templateLocation === constants_1.CDK_DEPLOYER_TEMPLATE_PATH)) {
        console.log('Template reference already found. skipping spec update.');
        return '';
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
                            mainRegion,
                        ],
                        recommended: [
                            mainRegion,
                        ],
                    },
                    deployableRegions: {
                        required: [
                            mainRegion,
                        ],
                    },
                },
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
        return YAML.stringify(contentspec);
    }
}
exports.updateContentSpecString = updateContentSpecString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdWxhdGVDb250ZW50U3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvcG9wdWxhdGVDb250ZW50U3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QiwyQ0FBeUQ7QUFDekQsdURBQW9EO0FBRXBELE1BQU0sc0JBQXNCLEdBQUc7SUFDN0IsZ0JBQWdCLEVBQUUsc0NBQTBCO0lBQzVDLEtBQUssRUFBRSx3QkFBd0I7SUFDL0IsVUFBVSxFQUFFO1FBQ1Y7WUFDRSxpQkFBaUIsRUFBRSw0QkFBNEI7WUFDL0MsWUFBWSxFQUFFLHVCQUF1QjtTQUN0QztRQUNEO1lBQ0UsaUJBQWlCLEVBQUUsOEJBQThCO1lBQ2pELFlBQVksRUFBRSx5QkFBeUI7U0FDeEM7S0FDRjtDQUNGLENBQUM7QUFFSyxLQUFLLFVBQVUsbUJBQW1CLENBQUMsZ0JBQXdCLEVBQUUsYUFBcUIsV0FBVztJQUNsRyxJQUFJLHdCQUF3QixHQUFHLDRCQUE0QixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDOUUsTUFBTSx3QkFBd0IsR0FBRyx1QkFBdUIsQ0FBQyx3QkFBd0IsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUUvRixJQUFJLHdCQUF3QixFQUFFO1FBQzVCLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztLQUNuRztBQUNILENBQUM7QUFQRCxrREFPQztBQUVELFNBQVMsNEJBQTRCLENBQUMsZ0JBQXdCO0lBQzVELE1BQU0sS0FBSyxHQUFHLGlDQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNoRCxNQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7S0FDOUY7SUFFRCxJQUFJLHdCQUF3QixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hHLE9BQU8sd0JBQXdCLENBQUM7QUFDbEMsQ0FBQztBQUVELFNBQWdCLHVCQUF1QixDQUFDLHdCQUFnQyxFQUFFLFVBQWtCO0lBQzFGLDBDQUEwQztJQUMxQyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFFdkQsSUFDRSxXQUFXLENBQUMsY0FBYztRQUM1QixXQUFXLENBQUMsY0FBYyxDQUFDLHVCQUF1QjtRQUNsRCxXQUFXLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FDckQsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyxzQ0FBMEIsQ0FDOUQsRUFDQztRQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMseURBQXlELENBQUMsQ0FBQztRQUN2RSxPQUFPLEVBQUUsQ0FBQztLQUNYO1NBQU07UUFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFO1lBQ2pDLFdBQVcsQ0FBQyxnQkFBZ0IsR0FBRztnQkFDN0IsY0FBYyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ2xDLGVBQWUsRUFBRSxFQUFFLGVBQWUsRUFBRSxDQUFDLDZDQUE2QyxDQUFDLEVBQUU7Z0JBQ3JGLG1CQUFtQixFQUFFO29CQUNuQixvQkFBb0IsRUFBRSxDQUFDO29CQUN2QixvQkFBb0IsRUFBRSxDQUFDO29CQUN2QixpQkFBaUIsRUFBRTt3QkFDakIsUUFBUSxFQUFFOzRCQUNSLFVBQVU7eUJBQ1g7d0JBQ0QsV0FBVyxFQUFFOzRCQUNYLFVBQVU7eUJBQ1g7cUJBQ0Y7b0JBQ0QsaUJBQWlCLEVBQUU7d0JBQ2pCLFFBQVEsRUFBRTs0QkFDUixVQUFVO3lCQUNYO3FCQUNGO2lCQUNGO2FBQ0YsQ0FBQztTQUNIO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDL0IsV0FBVyxDQUFDLGNBQWMsR0FBRyxFQUFFLHVCQUF1QixFQUFFLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDO1NBQ3BGO2FBQU07WUFDTCxXQUFXLENBQUMsY0FBYyxHQUFHO2dCQUMzQix1QkFBdUIsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRSxzQkFBc0IsQ0FBQzthQUN6RyxDQUFDO1NBQ0g7UUFFRCxXQUFXLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUM1QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDcEM7QUFDSCxDQUFDO0FBaERELDBEQWdEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBZQU1MIGZyb20gJ3lhbWwnO1xuaW1wb3J0IHsgQ0RLX0RFUExPWUVSX1RFTVBMQVRFX1BBVEggfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBnZXRQcm9qZWN0RmlsZXMgfSBmcm9tICcuL2dldFByb2plY3RGaWxlcyc7XG5cbmNvbnN0IGNka0RlcGxveWVyVGVtcGxhdGVSZWYgPSB7XG4gIHRlbXBsYXRlTG9jYXRpb246IENES19ERVBMT1lFUl9URU1QTEFURV9QQVRILFxuICBsYWJlbDogJ0NESyBhcHAgZGVwbG95ZXIgc3RhY2snLFxuICBwYXJhbWV0ZXJzOiBbXG4gICAge1xuICAgICAgdGVtcGxhdGVQYXJhbWV0ZXI6ICdDREtBcHBTb3VyY2VDb2RlQnVja2V0TmFtZScsXG4gICAgICBkZWZhdWx0VmFsdWU6ICd7ey5Bc3NldHNCdWNrZXROYW1lfX0nLFxuICAgIH0sXG4gICAge1xuICAgICAgdGVtcGxhdGVQYXJhbWV0ZXI6ICdDREtBcHBTb3VyY2VDb2RlQnVja2V0UHJlZml4JyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogJ3t7LkFzc2V0c0J1Y2tldFByZWZpeH19JyxcbiAgICB9LFxuICBdLFxufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlQ29udGVudFNwZWMod29ya3Nob3BSZXBvUGF0aDogc3RyaW5nLCBtYWluUmVnaW9uOiBzdHJpbmcgPSAndXMtZWFzdC0xJykge1xuICBsZXQgaW5pdGlhbENvbnRlbnRTcGVjU3RyaW5nID0gZ2V0SW5pdGlhbENvbnRlbnRTcGVjQ29udGVudCh3b3Jrc2hvcFJlcG9QYXRoKTtcbiAgY29uc3QgdXBkYXRlZENvbnRlbnRTcGVjU3RyaW5nID0gdXBkYXRlQ29udGVudFNwZWNTdHJpbmcoaW5pdGlhbENvbnRlbnRTcGVjU3RyaW5nLCBtYWluUmVnaW9uKTtcblxuICBpZiAodXBkYXRlZENvbnRlbnRTcGVjU3RyaW5nKSB7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4od29ya3Nob3BSZXBvUGF0aCwgJ2NvbnRlbnRzcGVjLnlhbWwnKSwgdXBkYXRlZENvbnRlbnRTcGVjU3RyaW5nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsQ29udGVudFNwZWNDb250ZW50KHdvcmtzaG9wUmVwb1BhdGg6IHN0cmluZykge1xuICBjb25zdCBmaWxlcyA9IGdldFByb2plY3RGaWxlcyh3b3Jrc2hvcFJlcG9QYXRoKTtcbiAgY29uc3QgaXNDb250ZW50U3BlY0V4aXN0aW5nID0gZmlsZXMuZmluZCgoZikgPT4gZiA9PT0gJ2NvbnRlbnRzcGVjLnlhbWwnKTtcbiAgaWYgKCFpc0NvbnRlbnRTcGVjRXhpc3RpbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb250ZW50c3BlYy55YW1sIGRvZXNuJ3QgZXhpc3QuIEFyZSB5b3Ugc3VyZSBvZiB5b3VyIFdvcmtzaG9wIHJlcG8gcGF0aCA/XCIpO1xuICB9XG5cbiAgbGV0IGluaXRpYWxDb250ZW50U3BlY1N0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4od29ya3Nob3BSZXBvUGF0aCwgJ2NvbnRlbnRzcGVjLnlhbWwnKSwgJ3V0ZjgnKTtcbiAgcmV0dXJuIGluaXRpYWxDb250ZW50U3BlY1N0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNvbnRlbnRTcGVjU3RyaW5nKGluaXRpYWxDb250ZW50U3BlY1N0cmluZzogc3RyaW5nLCBtYWluUmVnaW9uOiBzdHJpbmcpIHtcbiAgLy8gcGFyc2UgIHlhbWwgc3RyaW5nIHRvIHR5cGVzY3JpcHQgb2JqZWN0XG4gIGxldCBjb250ZW50c3BlYyA9IFlBTUwucGFyc2UoaW5pdGlhbENvbnRlbnRTcGVjU3RyaW5nKTtcblxuICBpZiAoXG4gICAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUgJiZcbiAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUuY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXMgJiZcbiAgY29udGVudHNwZWMuaW5mcmFzdHJ1Y3R1cmUuY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXMuZmluZChcbiAgICAodDogYW55KSA9PiB0LnRlbXBsYXRlTG9jYXRpb24gPT09IENES19ERVBMT1lFUl9URU1QTEFURV9QQVRILFxuICApXG4gICkge1xuICAgIGNvbnNvbGUubG9nKCdUZW1wbGF0ZSByZWZlcmVuY2UgYWxyZWFkeSBmb3VuZC4gc2tpcHBpbmcgc3BlYyB1cGRhdGUuJyk7XG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2Uge1xuICAgIGlmICghY29udGVudHNwZWMuYXdzQWNjb3VudENvbmZpZykge1xuICAgICAgY29udGVudHNwZWMuYXdzQWNjb3VudENvbmZpZyA9IHtcbiAgICAgICAgYWNjb3VudFNvdXJjZXM6IFsnV29ya3Nob3BTdHVkaW8nXSxcbiAgICAgICAgcGFydGljaXBhbnRSb2xlOiB7IG1hbmFnZWRQb2xpY2llczogWydhcm46YXdzOmlhbTo6YXdzOnBvbGljeS9BZG1pbmlzdHJhdG9yQWNjZXNzJ10gfSxcbiAgICAgICAgcmVnaW9uQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgIG1pbkFjY2Vzc2libGVSZWdpb25zOiAxLFxuICAgICAgICAgIG1heEFjY2Vzc2libGVSZWdpb25zOiAzLFxuICAgICAgICAgIGFjY2Vzc2libGVSZWdpb25zOiB7XG4gICAgICAgICAgICByZXF1aXJlZDogW1xuICAgICAgICAgICAgICBtYWluUmVnaW9uLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJlY29tbWVuZGVkOiBbXG4gICAgICAgICAgICAgIG1haW5SZWdpb24sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGVwbG95YWJsZVJlZ2lvbnM6IHtcbiAgICAgICAgICAgIHJlcXVpcmVkOiBbXG4gICAgICAgICAgICAgIG1haW5SZWdpb24sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAoIWNvbnRlbnRzcGVjLmluZnJhc3RydWN0dXJlKSB7XG4gICAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZSA9IHsgY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXM6IFtjZGtEZXBsb3llclRlbXBsYXRlUmVmXSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZSA9IHtcbiAgICAgICAgY2xvdWRmb3JtYXRpb25UZW1wbGF0ZXM6IFsuLi5jb250ZW50c3BlYy5pbmZyYXN0cnVjdHVyZS5jbG91ZGZvcm1hdGlvblRlbXBsYXRlcywgY2RrRGVwbG95ZXJUZW1wbGF0ZVJlZl0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnRlbnRzcGVjLnZlcnNpb24gPSAnMi4wJztcbiAgICByZXR1cm4gWUFNTC5zdHJpbmdpZnkoY29udGVudHNwZWMpO1xuICB9XG59XG4iXX0=