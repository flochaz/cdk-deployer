import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { CDK_DEPLOYER_TEMPLATE_PATH } from './constants';
import { getProjectFiles } from './getProjectFiles';

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

export async function populateContentSpec(workshopRepoPath: string, mainRegion: string = 'us-east-1') {
  let initialContentSpecString = getInitialContentSpecContent(workshopRepoPath);
  const updatedContentSpecString = updateContentSpecString(initialContentSpecString, mainRegion);

  if (updatedContentSpecString) {
    await fs.writeFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), updatedContentSpecString);
  }
}

function getInitialContentSpecContent(workshopRepoPath: string) {
  const files = getProjectFiles(workshopRepoPath);
  const isContentSpecExisting = files.find((f) => f === 'contentspec.yaml');
  if (!isContentSpecExisting) {
    throw new Error("contentspec.yaml doesn't exist. Are you sure of your Workshop repo path ?");
  }

  let initialContentSpecString = fs.readFileSync(path.join(workshopRepoPath, 'contentspec.yaml'), 'utf8');
  return initialContentSpecString;
}

export function updateContentSpecString(initialContentSpecString: string, mainRegion: string) {
  // parse  yaml string to typescript object
  let contentspec = YAML.parse(initialContentSpecString);

  if (
    contentspec.infrastructure &&
  contentspec.infrastructure.cloudformationTemplates &&
  contentspec.infrastructure.cloudformationTemplates.find(
    (t: any) => t.templateLocation === CDK_DEPLOYER_TEMPLATE_PATH,
  )
  ) {
    console.log('Template reference already found. skipping spec update.');
    return '';
  } else {
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
    } else {
      contentspec.infrastructure = {
        cloudformationTemplates: [...contentspec.infrastructure.cloudformationTemplates, cdkDeployerTemplateRef],
      };
    }

    contentspec.version = '2.0';
    return YAML.stringify(contentspec);
  }
}
