import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { CDK_DEPLOYER_TEMPLATE_PATH } from './cdk-standalone-deployer-setup-workshop';
import { getProjectFiles } from './getProjectFiles';

export async function populateContentSpec(workshopRepoPath: string, mainRegion: string = 'us-east-1') {
  const files = getProjectFiles(workshopRepoPath);
  const isContentSpecExisting = files.find((f) => f === 'contentspec.yaml');
  if (!isContentSpecExisting) {
    throw new Error("contentspec.yaml doesn't exist. Are you sure of your Workshop repo path ?");
  }

  let contentspecString = fs.readFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), 'utf8');
  // parse  yaml string to typescript object
  let contentspec = YAML.parse(contentspecString);

  const cdkDeployerTemplateRef = {
    templateLocation: CDK_DEPLOYER_TEMPLATE_PATH,
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

  if (
    contentspec.infrastructure &&
    contentspec.infrastructure.cloudformationTemplates &&
    contentspec.infrastructure.cloudformationTemplates.find(
      (t: any) => t.templateLocation === CDK_DEPLOYER_TEMPLATE_PATH,
    )
  ) {
    console.log('Template reference already found. skipping spec update.');
  } else {
    if(!contentspec.awsAccountConfig) {
      contentspec.awsAccountConfig = {
        accountSources: ['WorkshopStudio'],
        participantRole: {managedPolicies: ['arn:aws:iam::aws:policy/AdministratorAccess']},
        regionConfiguration: {
          minAccessibleRegions : 1,
          maxAccessibleRegions : 3,
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
      }
    }
    if (!contentspec.infrastructure) {
      contentspec.infrastructure = { cloudformationTemplates: [cdkDeployerTemplateRef] };
    } else {
      contentspec.infrastructure = {
        cloudformationTemplates: [...contentspec.infrastructure.cloudformationTemplates, cdkDeployerTemplateRef],
      };
    }

    contentspec.version = '2.0';
    await fs.writeFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), YAML.stringify(contentspec));
  }
}
