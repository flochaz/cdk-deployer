import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { getProjectFiles } from './getProjectFiles';

export async function populateContentSpec(options: any) {
  const files = getProjectFiles(options.workshopRepoPath);
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

  if (
    contentspec.infrastructure &&
    contentspec.infrastructure.cloudformationTemplates &&
    contentspec.infrastructure.cloudformationTemplates.find(
      (t: any) => t.templateLocation === 'static/CDKStandaloneDeployer.template.json',
    )
  ) {
    console.log('Template reference already found. skipping spec update.');
  } else {
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
    } else {
      contentspec.infrastructure = {
        cloudformationTemplates: [...contentspec.infrastructure.cloudformationTemplates, cdkDeployerTemplateRef],
      };
    }
    await fs.writeFileSync(path.join(options.workshopRepoPath, 'contentspec.yaml'), YAML.stringify(contentspec));
  }
}
