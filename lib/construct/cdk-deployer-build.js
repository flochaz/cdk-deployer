"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportBuild = exports.startBuild = void 0;
const defaultDestroyBuildSpec = `
version: 0.2
env:
  variables:
    CFN_RESPONSE_URL: CFN_RESPONSE_URL_NOT_SET
    CFN_STACK_ID: CFN_STACK_ID_NOT_SET
    CFN_REQUEST_ID: CFN_REQUEST_ID_NOT_SET
    CFN_LOGICAL_RESOURCE_ID: CFN_LOGICAL_RESOURCE_ID_NOT_SET
phases:
  pre_build:
    on-failure: ABORT
    commands:
      - echo "Default destroy buildspec"
      - cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION
      - npm install -g aws-cdk && sudo apt-get install python3 && python -m
        ensurepip --upgrade && python -m pip install --upgrade pip && python -m
        pip install -r requirements.txt
      - \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\"
      - 'echo \"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\"'
      - cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION
  build:
    on-failure: ABORT
    commands:
      - \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\"
      - 'echo \"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\"'
      - cdk destroy --force --all --require-approval never
`;
const defaultDeployBuildSpec = `
version: 0.2
env:
  variables:
    CFN_RESPONSE_URL: CFN_RESPONSE_URL_NOT_SET
    CFN_STACK_ID: CFN_STACK_ID_NOT_SET
    CFN_REQUEST_ID: CFN_REQUEST_ID_NOT_SET
    CFN_LOGICAL_RESOURCE_ID: CFN_LOGICAL_RESOURCE_ID_NOT_SET
    PARAMETERS: PARAMETERS_NOT_SET
    STACKNAME: STACKNAME_NOT_SET
phases:
  pre_build:
    on-failure: ABORT
    commands:
      - echo "Default deploy buildspec"
      - cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION
      - npm install -g aws-cdk && sudo apt-get install python3 && python -m
        ensurepip --upgrade && python -m pip install --upgrade pip && python -m
        pip install -r requirements.txt
      - \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\"
      - 'echo \"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\"'
      - cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION
  build:
    on-failure: ABORT
    commands:
      - \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\"
      - 'echo \"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\"'
      - cdk deploy $STACKNAME $PARAMETERS --require-approval=never
`;
// workaround to get a Lambda function with inline code and packaged into the ARA library
// We need inline code to ensure it's deployable via a CloudFormation template
// TODO modify the PreBundledFunction to allow for inline Lambda in addtion to asset based Lambda
exports.startBuild = (deployBuildSpec, destroyBuildSpec) => {
    return `
const respond = async function(event, context, responseStatus, responseData, physicalResourceId, noEcho) {
  return new Promise((resolve, reject) => {
    var responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: \"See the details in CloudWatch Log Stream: \" + context.logGroupName + \" \" + context.logStreamName,
      PhysicalResourceId: physicalResourceId || context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      NoEcho: noEcho || false,
      Data: responseData
    });
    
    console.log(\"Response body:\", responseBody);
    
    var https = require(\"https\");
    var url = require(\"url\");
    
    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: \"PUT\",
      headers: {
        \"content-type\": \"\",
        \"content-length\": responseBody.length
      }
    };
    
    var request = https.request(options, function(response) {
      console.log(\"Status code: \" + response.statusCode);
      console.log(\"Status message: \" + response.statusMessage);
      resolve();
    });
    
    request.on(\"error\", function(error) {
      console.log(\"respond(..) failed executing https.request(..): \" + error);
      resolve();
    });
    
    request.write(responseBody);
    request.end();
  });
};

const AWS = require('aws-sdk');

exports.handler = async function (event, context) {
  console.log(JSON.stringify(event, null, 4));
  try {
    const projectName = event.ResourceProperties.ProjectName;
    const codebuild = new AWS.CodeBuild();
    
    console.log(\`Starting new build of project \${projectName}\`);
    
    const { build } = await codebuild.startBuild({
      projectName,
      // Pass CFN related parameters through the build for extraction by the
      // completion handler.
      buildspecOverride: event.RequestType === 'Delete' ? \`${destroyBuildSpec ? `${destroyBuildSpec.toBuildSpec()}` : defaultDestroyBuildSpec}\` : \`${deployBuildSpec ? `${deployBuildSpec.toBuildSpec()}` : defaultDeployBuildSpec}\`,
      environmentVariablesOverride: [
        {
          name: 'CFN_RESPONSE_URL',
          value: event.ResponseURL
        },
        {
          name: 'CFN_STACK_ID',
          value: event.StackId
        },
        {
          name: 'CFN_REQUEST_ID',
          value: event.RequestId
        },
        {
          name: 'CFN_LOGICAL_RESOURCE_ID',
          value: event.LogicalResourceId
        },
        {
          name: 'BUILD_ROLE_ARN',
          value: event.ResourceProperties.BuildRoleArn
        }
      ]
    }).promise();
    console.log(\`Build id \${build.id} started - resource completion handled by EventBridge\`);
  } catch(error) {
    console.error(error);
    await respond(event, context, 'FAILED', { Error: error });
  }
};
`;
};
exports.reportBuild = `
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const respond = async function(event, context, responseStatus, responseData, physicalResourceId, noEcho) {
  return new Promise((resolve, reject) => {
    var responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: "See the details in CloudWatch Log Stream: " + context.logGroupName + " " + context.logStreamName,
      PhysicalResourceId: physicalResourceId || context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      NoEcho: noEcho || false,
      Data: responseData
    });
    
    console.log("Response body:\
    ", responseBody);
    
    var https = require("https");
    var url = require("url");
    
    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: "PUT",
      headers: {
        "content-type": "",
        "content-length": responseBody.length
      }
    };
    
    var request = https.request(options, function(response) {
      console.log("Status code: " + response.statusCode);
      console.log("Status message: " + response.statusMessage);
      resolve();
    });
    
    request.on("error", function(error) {
      console.log("respond(..) failed executing https.request(..): " + error);
      resolve();
    });
    
    request.write(responseBody);
    request.end();
  });
};

const AWS = require('aws-sdk');

exports.handler = async function (event, context) {
  console.log(JSON.stringify(event, null, 4));
  
  const projectName = event['detail']['project-name'];
  
  const codebuild = new AWS.CodeBuild();
  
  const buildId = event['detail']['build-id'];
  const { builds } = await codebuild.batchGetBuilds({
    ids: [ buildId ]
  }).promise();
  
  console.log(JSON.stringify(builds, null, 4));
  
  const build = builds[0];
  // Fetch the CFN resource and response parameters from the build environment.
  const environment = {};
  build.environment.environmentVariables.forEach(e => environment[e.name] = e.value);
  
  const response = {
    ResponseURL: environment.CFN_RESPONSE_URL,
    StackId: environment.CFN_STACK_ID,
    LogicalResourceId: environment.CFN_LOGICAL_RESOURCE_ID,
    RequestId: environment.CFN_REQUEST_ID
  };
  
  if (event['detail']['build-status'] === 'SUCCEEDED') {
    await respond(response, context, 'SUCCESS', { BuildStatus: 'SUCCESS'}, 'build');
  } else {
    await respond(response, context, 'FAILED', { Error: 'Build failed' });
  }
};
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWRlcGxveWVyLWJ1aWxkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnN0cnVjdC9jZGstZGVwbG95ZXItYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFFQUFxRTtBQUNyRSxpQ0FBaUM7OztBQUlqQyxNQUFNLHVCQUF1QixHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTBCL0IsQ0FBQztBQUVGLE1BQU0sc0JBQXNCLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E0QjlCLENBQUM7QUFFRix5RkFBeUY7QUFDekYsOEVBQThFO0FBQzlFLGlHQUFpRztBQUNwRixRQUFBLFVBQVUsR0FBRyxDQUFDLGVBQTJCLEVBQUUsZ0JBQTRCLEVBQUUsRUFBRTtJQUN0RixPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzhEQTZEcUQsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLFVBQVUsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThCcE8sQ0FBQztBQUNGLENBQUMsQ0FBQztBQUVXLFFBQUEsV0FBVyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUYxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4vLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlULTBcblxuaW1wb3J0IHsgQnVpbGRTcGVjIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZCc7XG5cbmNvbnN0IGRlZmF1bHREZXN0cm95QnVpbGRTcGVjID0gYFxudmVyc2lvbjogMC4yXG5lbnY6XG4gIHZhcmlhYmxlczpcbiAgICBDRk5fUkVTUE9OU0VfVVJMOiBDRk5fUkVTUE9OU0VfVVJMX05PVF9TRVRcbiAgICBDRk5fU1RBQ0tfSUQ6IENGTl9TVEFDS19JRF9OT1RfU0VUXG4gICAgQ0ZOX1JFUVVFU1RfSUQ6IENGTl9SRVFVRVNUX0lEX05PVF9TRVRcbiAgICBDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRDogQ0ZOX0xPR0lDQUxfUkVTT1VSQ0VfSURfTk9UX1NFVFxucGhhc2VzOlxuICBwcmVfYnVpbGQ6XG4gICAgb24tZmFpbHVyZTogQUJPUlRcbiAgICBjb21tYW5kczpcbiAgICAgIC0gZWNobyBcIkRlZmF1bHQgZGVzdHJveSBidWlsZHNwZWNcIlxuICAgICAgLSBjZCAkQ09ERUJVSUxEX1NSQ19ESVIvJENES19BUFBfTE9DQVRJT05cbiAgICAgIC0gbnBtIGluc3RhbGwgLWcgYXdzLWNkayAmJiBzdWRvIGFwdC1nZXQgaW5zdGFsbCBweXRob24zICYmIHB5dGhvbiAtbVxuICAgICAgICBlbnN1cmVwaXAgLS11cGdyYWRlICYmIHB5dGhvbiAtbSBwaXAgaW5zdGFsbCAtLXVwZ3JhZGUgcGlwICYmIHB5dGhvbiAtbVxuICAgICAgICBwaXAgaW5zdGFsbCAtciByZXF1aXJlbWVudHMudHh0XG4gICAgICAtIFxcXCJleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpXFxcIlxuICAgICAgLSAnZWNobyBcXFwiQVdTX0FDQ09VTlRfSUQ6ICRBV1NfQUNDT1VOVF9JRFxcXCInXG4gICAgICAtIGNkayBib290c3RyYXAgYXdzOi8vJEFXU19BQ0NPVU5UX0lELyRBV1NfUkVHSU9OXG4gIGJ1aWxkOlxuICAgIG9uLWZhaWx1cmU6IEFCT1JUXG4gICAgY29tbWFuZHM6XG4gICAgICAtIFxcXCJleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpXFxcIlxuICAgICAgLSAnZWNobyBcXFwiQVdTX0FDQ09VTlRfSUQ6ICRBV1NfQUNDT1VOVF9JRFxcXCInXG4gICAgICAtIGNkayBkZXN0cm95IC0tZm9yY2UgLS1hbGwgLS1yZXF1aXJlLWFwcHJvdmFsIG5ldmVyXG5gO1xuXG5jb25zdCBkZWZhdWx0RGVwbG95QnVpbGRTcGVjID0gYFxudmVyc2lvbjogMC4yXG5lbnY6XG4gIHZhcmlhYmxlczpcbiAgICBDRk5fUkVTUE9OU0VfVVJMOiBDRk5fUkVTUE9OU0VfVVJMX05PVF9TRVRcbiAgICBDRk5fU1RBQ0tfSUQ6IENGTl9TVEFDS19JRF9OT1RfU0VUXG4gICAgQ0ZOX1JFUVVFU1RfSUQ6IENGTl9SRVFVRVNUX0lEX05PVF9TRVRcbiAgICBDRk5fTE9HSUNBTF9SRVNPVVJDRV9JRDogQ0ZOX0xPR0lDQUxfUkVTT1VSQ0VfSURfTk9UX1NFVFxuICAgIFBBUkFNRVRFUlM6IFBBUkFNRVRFUlNfTk9UX1NFVFxuICAgIFNUQUNLTkFNRTogU1RBQ0tOQU1FX05PVF9TRVRcbnBoYXNlczpcbiAgcHJlX2J1aWxkOlxuICAgIG9uLWZhaWx1cmU6IEFCT1JUXG4gICAgY29tbWFuZHM6XG4gICAgICAtIGVjaG8gXCJEZWZhdWx0IGRlcGxveSBidWlsZHNwZWNcIlxuICAgICAgLSBjZCAkQ09ERUJVSUxEX1NSQ19ESVIvJENES19BUFBfTE9DQVRJT05cbiAgICAgIC0gbnBtIGluc3RhbGwgLWcgYXdzLWNkayAmJiBzdWRvIGFwdC1nZXQgaW5zdGFsbCBweXRob24zICYmIHB5dGhvbiAtbVxuICAgICAgICBlbnN1cmVwaXAgLS11cGdyYWRlICYmIHB5dGhvbiAtbSBwaXAgaW5zdGFsbCAtLXVwZ3JhZGUgcGlwICYmIHB5dGhvbiAtbVxuICAgICAgICBwaXAgaW5zdGFsbCAtciByZXF1aXJlbWVudHMudHh0XG4gICAgICAtIFxcXCJleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpXFxcIlxuICAgICAgLSAnZWNobyBcXFwiQVdTX0FDQ09VTlRfSUQ6ICRBV1NfQUNDT1VOVF9JRFxcXCInXG4gICAgICAtIGNkayBib290c3RyYXAgYXdzOi8vJEFXU19BQ0NPVU5UX0lELyRBV1NfUkVHSU9OXG4gIGJ1aWxkOlxuICAgIG9uLWZhaWx1cmU6IEFCT1JUXG4gICAgY29tbWFuZHM6XG4gICAgICAtIFxcXCJleHBvcnQgQVdTX0FDQ09VTlRfSUQ9JChlY2hvICRDT0RFQlVJTERfQlVJTERfQVJOIHwgY3V0IC1kOiAtZjUpXFxcIlxuICAgICAgLSAnZWNobyBcXFwiQVdTX0FDQ09VTlRfSUQ6ICRBV1NfQUNDT1VOVF9JRFxcXCInXG4gICAgICAtIGNkayBkZXBsb3kgJFNUQUNLTkFNRSAkUEFSQU1FVEVSUyAtLXJlcXVpcmUtYXBwcm92YWw9bmV2ZXJcbmA7XG5cbi8vIHdvcmthcm91bmQgdG8gZ2V0IGEgTGFtYmRhIGZ1bmN0aW9uIHdpdGggaW5saW5lIGNvZGUgYW5kIHBhY2thZ2VkIGludG8gdGhlIEFSQSBsaWJyYXJ5XG4vLyBXZSBuZWVkIGlubGluZSBjb2RlIHRvIGVuc3VyZSBpdCdzIGRlcGxveWFibGUgdmlhIGEgQ2xvdWRGb3JtYXRpb24gdGVtcGxhdGVcbi8vIFRPRE8gbW9kaWZ5IHRoZSBQcmVCdW5kbGVkRnVuY3Rpb24gdG8gYWxsb3cgZm9yIGlubGluZSBMYW1iZGEgaW4gYWRkdGlvbiB0byBhc3NldCBiYXNlZCBMYW1iZGFcbmV4cG9ydCBjb25zdCBzdGFydEJ1aWxkID0gKGRlcGxveUJ1aWxkU3BlYz86IEJ1aWxkU3BlYywgZGVzdHJveUJ1aWxkU3BlYz86IEJ1aWxkU3BlYykgPT4ge1xuICByZXR1cm4gYFxuY29uc3QgcmVzcG9uZCA9IGFzeW5jIGZ1bmN0aW9uKGV2ZW50LCBjb250ZXh0LCByZXNwb25zZVN0YXR1cywgcmVzcG9uc2VEYXRhLCBwaHlzaWNhbFJlc291cmNlSWQsIG5vRWNobykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHZhciByZXNwb25zZUJvZHkgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBTdGF0dXM6IHJlc3BvbnNlU3RhdHVzLFxuICAgICAgUmVhc29uOiBcXFwiU2VlIHRoZSBkZXRhaWxzIGluIENsb3VkV2F0Y2ggTG9nIFN0cmVhbTogXFxcIiArIGNvbnRleHQubG9nR3JvdXBOYW1lICsgXFxcIiBcXFwiICsgY29udGV4dC5sb2dTdHJlYW1OYW1lLFxuICAgICAgUGh5c2ljYWxSZXNvdXJjZUlkOiBwaHlzaWNhbFJlc291cmNlSWQgfHwgY29udGV4dC5sb2dTdHJlYW1OYW1lLFxuICAgICAgU3RhY2tJZDogZXZlbnQuU3RhY2tJZCxcbiAgICAgIFJlcXVlc3RJZDogZXZlbnQuUmVxdWVzdElkLFxuICAgICAgTG9naWNhbFJlc291cmNlSWQ6IGV2ZW50LkxvZ2ljYWxSZXNvdXJjZUlkLFxuICAgICAgTm9FY2hvOiBub0VjaG8gfHwgZmFsc2UsXG4gICAgICBEYXRhOiByZXNwb25zZURhdGFcbiAgICB9KTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhcXFwiUmVzcG9uc2UgYm9keTpcXFwiLCByZXNwb25zZUJvZHkpO1xuICAgIFxuICAgIHZhciBodHRwcyA9IHJlcXVpcmUoXFxcImh0dHBzXFxcIik7XG4gICAgdmFyIHVybCA9IHJlcXVpcmUoXFxcInVybFxcXCIpO1xuICAgIFxuICAgIHZhciBwYXJzZWRVcmwgPSB1cmwucGFyc2UoZXZlbnQuUmVzcG9uc2VVUkwpO1xuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgaG9zdG5hbWU6IHBhcnNlZFVybC5ob3N0bmFtZSxcbiAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgIHBhdGg6IHBhcnNlZFVybC5wYXRoLFxuICAgICAgbWV0aG9kOiBcXFwiUFVUXFxcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXFxcImNvbnRlbnQtdHlwZVxcXCI6IFxcXCJcXFwiLFxuICAgICAgICBcXFwiY29udGVudC1sZW5ndGhcXFwiOiByZXNwb25zZUJvZHkubGVuZ3RoXG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICB2YXIgcmVxdWVzdCA9IGh0dHBzLnJlcXVlc3Qob3B0aW9ucywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKFxcXCJTdGF0dXMgY29kZTogXFxcIiArIHJlc3BvbnNlLnN0YXR1c0NvZGUpO1xuICAgICAgY29uc29sZS5sb2coXFxcIlN0YXR1cyBtZXNzYWdlOiBcXFwiICsgcmVzcG9uc2Uuc3RhdHVzTWVzc2FnZSk7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gICAgXG4gICAgcmVxdWVzdC5vbihcXFwiZXJyb3JcXFwiLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgY29uc29sZS5sb2coXFxcInJlc3BvbmQoLi4pIGZhaWxlZCBleGVjdXRpbmcgaHR0cHMucmVxdWVzdCguLik6IFxcXCIgKyBlcnJvcik7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gICAgXG4gICAgcmVxdWVzdC53cml0ZShyZXNwb25zZUJvZHkpO1xuICAgIHJlcXVlc3QuZW5kKCk7XG4gIH0pO1xufTtcblxuY29uc3QgQVdTID0gcmVxdWlyZSgnYXdzLXNkaycpO1xuXG5leHBvcnRzLmhhbmRsZXIgPSBhc3luYyBmdW5jdGlvbiAoZXZlbnQsIGNvbnRleHQpIHtcbiAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZXZlbnQsIG51bGwsIDQpKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9qZWN0TmFtZSA9IGV2ZW50LlJlc291cmNlUHJvcGVydGllcy5Qcm9qZWN0TmFtZTtcbiAgICBjb25zdCBjb2RlYnVpbGQgPSBuZXcgQVdTLkNvZGVCdWlsZCgpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKFxcYFN0YXJ0aW5nIG5ldyBidWlsZCBvZiBwcm9qZWN0IFxcJHtwcm9qZWN0TmFtZX1cXGApO1xuICAgIFxuICAgIGNvbnN0IHsgYnVpbGQgfSA9IGF3YWl0IGNvZGVidWlsZC5zdGFydEJ1aWxkKHtcbiAgICAgIHByb2plY3ROYW1lLFxuICAgICAgLy8gUGFzcyBDRk4gcmVsYXRlZCBwYXJhbWV0ZXJzIHRocm91Z2ggdGhlIGJ1aWxkIGZvciBleHRyYWN0aW9uIGJ5IHRoZVxuICAgICAgLy8gY29tcGxldGlvbiBoYW5kbGVyLlxuICAgICAgYnVpbGRzcGVjT3ZlcnJpZGU6IGV2ZW50LlJlcXVlc3RUeXBlID09PSAnRGVsZXRlJyA/IFxcYCR7ZGVzdHJveUJ1aWxkU3BlYyA/IGAke2Rlc3Ryb3lCdWlsZFNwZWMudG9CdWlsZFNwZWMoKX1gIDogZGVmYXVsdERlc3Ryb3lCdWlsZFNwZWN9XFxgIDogXFxgJHtkZXBsb3lCdWlsZFNwZWMgPyBgJHtkZXBsb3lCdWlsZFNwZWMudG9CdWlsZFNwZWMoKX1gIDogZGVmYXVsdERlcGxveUJ1aWxkU3BlY31cXGAsXG4gICAgICBlbnZpcm9ubWVudFZhcmlhYmxlc092ZXJyaWRlOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ0ZOX1JFU1BPTlNFX1VSTCcsXG4gICAgICAgICAgdmFsdWU6IGV2ZW50LlJlc3BvbnNlVVJMXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ0ZOX1NUQUNLX0lEJyxcbiAgICAgICAgICB2YWx1ZTogZXZlbnQuU3RhY2tJZFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NGTl9SRVFVRVNUX0lEJyxcbiAgICAgICAgICB2YWx1ZTogZXZlbnQuUmVxdWVzdElkXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ0ZOX0xPR0lDQUxfUkVTT1VSQ0VfSUQnLFxuICAgICAgICAgIHZhbHVlOiBldmVudC5Mb2dpY2FsUmVzb3VyY2VJZFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0JVSUxEX1JPTEVfQVJOJyxcbiAgICAgICAgICB2YWx1ZTogZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkJ1aWxkUm9sZUFyblxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkucHJvbWlzZSgpO1xuICAgIGNvbnNvbGUubG9nKFxcYEJ1aWxkIGlkIFxcJHtidWlsZC5pZH0gc3RhcnRlZCAtIHJlc291cmNlIGNvbXBsZXRpb24gaGFuZGxlZCBieSBFdmVudEJyaWRnZVxcYCk7XG4gIH0gY2F0Y2goZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICBhd2FpdCByZXNwb25kKGV2ZW50LCBjb250ZXh0LCAnRkFJTEVEJywgeyBFcnJvcjogZXJyb3IgfSk7XG4gIH1cbn07XG5gO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlcG9ydEJ1aWxkID0gYFxuLy8gQ29weXJpZ2h0IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4vLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlULTBcblxuY29uc3QgcmVzcG9uZCA9IGFzeW5jIGZ1bmN0aW9uKGV2ZW50LCBjb250ZXh0LCByZXNwb25zZVN0YXR1cywgcmVzcG9uc2VEYXRhLCBwaHlzaWNhbFJlc291cmNlSWQsIG5vRWNobykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHZhciByZXNwb25zZUJvZHkgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBTdGF0dXM6IHJlc3BvbnNlU3RhdHVzLFxuICAgICAgUmVhc29uOiBcIlNlZSB0aGUgZGV0YWlscyBpbiBDbG91ZFdhdGNoIExvZyBTdHJlYW06IFwiICsgY29udGV4dC5sb2dHcm91cE5hbWUgKyBcIiBcIiArIGNvbnRleHQubG9nU3RyZWFtTmFtZSxcbiAgICAgIFBoeXNpY2FsUmVzb3VyY2VJZDogcGh5c2ljYWxSZXNvdXJjZUlkIHx8IGNvbnRleHQubG9nU3RyZWFtTmFtZSxcbiAgICAgIFN0YWNrSWQ6IGV2ZW50LlN0YWNrSWQsXG4gICAgICBSZXF1ZXN0SWQ6IGV2ZW50LlJlcXVlc3RJZCxcbiAgICAgIExvZ2ljYWxSZXNvdXJjZUlkOiBldmVudC5Mb2dpY2FsUmVzb3VyY2VJZCxcbiAgICAgIE5vRWNobzogbm9FY2hvIHx8IGZhbHNlLFxuICAgICAgRGF0YTogcmVzcG9uc2VEYXRhXG4gICAgfSk7XG4gICAgXG4gICAgY29uc29sZS5sb2coXCJSZXNwb25zZSBib2R5OlxcXG4gICAgXCIsIHJlc3BvbnNlQm9keSk7XG4gICAgXG4gICAgdmFyIGh0dHBzID0gcmVxdWlyZShcImh0dHBzXCIpO1xuICAgIHZhciB1cmwgPSByZXF1aXJlKFwidXJsXCIpO1xuICAgIFxuICAgIHZhciBwYXJzZWRVcmwgPSB1cmwucGFyc2UoZXZlbnQuUmVzcG9uc2VVUkwpO1xuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgaG9zdG5hbWU6IHBhcnNlZFVybC5ob3N0bmFtZSxcbiAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgIHBhdGg6IHBhcnNlZFVybC5wYXRoLFxuICAgICAgbWV0aG9kOiBcIlBVVFwiLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcIlwiLFxuICAgICAgICBcImNvbnRlbnQtbGVuZ3RoXCI6IHJlc3BvbnNlQm9keS5sZW5ndGhcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIHZhciByZXF1ZXN0ID0gaHR0cHMucmVxdWVzdChvcHRpb25zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgY29uc29sZS5sb2coXCJTdGF0dXMgY29kZTogXCIgKyByZXNwb25zZS5zdGF0dXNDb2RlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiU3RhdHVzIG1lc3NhZ2U6IFwiICsgcmVzcG9uc2Uuc3RhdHVzTWVzc2FnZSk7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gICAgXG4gICAgcmVxdWVzdC5vbihcImVycm9yXCIsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInJlc3BvbmQoLi4pIGZhaWxlZCBleGVjdXRpbmcgaHR0cHMucmVxdWVzdCguLik6IFwiICsgZXJyb3IpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICAgIFxuICAgIHJlcXVlc3Qud3JpdGUocmVzcG9uc2VCb2R5KTtcbiAgICByZXF1ZXN0LmVuZCgpO1xuICB9KTtcbn07XG5cbmNvbnN0IEFXUyA9IHJlcXVpcmUoJ2F3cy1zZGsnKTtcblxuZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgZnVuY3Rpb24gKGV2ZW50LCBjb250ZXh0KSB7XG4gIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGV2ZW50LCBudWxsLCA0KSk7XG4gIFxuICBjb25zdCBwcm9qZWN0TmFtZSA9IGV2ZW50WydkZXRhaWwnXVsncHJvamVjdC1uYW1lJ107XG4gIFxuICBjb25zdCBjb2RlYnVpbGQgPSBuZXcgQVdTLkNvZGVCdWlsZCgpO1xuICBcbiAgY29uc3QgYnVpbGRJZCA9IGV2ZW50WydkZXRhaWwnXVsnYnVpbGQtaWQnXTtcbiAgY29uc3QgeyBidWlsZHMgfSA9IGF3YWl0IGNvZGVidWlsZC5iYXRjaEdldEJ1aWxkcyh7XG4gICAgaWRzOiBbIGJ1aWxkSWQgXVxuICB9KS5wcm9taXNlKCk7XG4gIFxuICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShidWlsZHMsIG51bGwsIDQpKTtcbiAgXG4gIGNvbnN0IGJ1aWxkID0gYnVpbGRzWzBdO1xuICAvLyBGZXRjaCB0aGUgQ0ZOIHJlc291cmNlIGFuZCByZXNwb25zZSBwYXJhbWV0ZXJzIGZyb20gdGhlIGJ1aWxkIGVudmlyb25tZW50LlxuICBjb25zdCBlbnZpcm9ubWVudCA9IHt9O1xuICBidWlsZC5lbnZpcm9ubWVudC5lbnZpcm9ubWVudFZhcmlhYmxlcy5mb3JFYWNoKGUgPT4gZW52aXJvbm1lbnRbZS5uYW1lXSA9IGUudmFsdWUpO1xuICBcbiAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgUmVzcG9uc2VVUkw6IGVudmlyb25tZW50LkNGTl9SRVNQT05TRV9VUkwsXG4gICAgU3RhY2tJZDogZW52aXJvbm1lbnQuQ0ZOX1NUQUNLX0lELFxuICAgIExvZ2ljYWxSZXNvdXJjZUlkOiBlbnZpcm9ubWVudC5DRk5fTE9HSUNBTF9SRVNPVVJDRV9JRCxcbiAgICBSZXF1ZXN0SWQ6IGVudmlyb25tZW50LkNGTl9SRVFVRVNUX0lEXG4gIH07XG4gIFxuICBpZiAoZXZlbnRbJ2RldGFpbCddWydidWlsZC1zdGF0dXMnXSA9PT0gJ1NVQ0NFRURFRCcpIHtcbiAgICBhd2FpdCByZXNwb25kKHJlc3BvbnNlLCBjb250ZXh0LCAnU1VDQ0VTUycsIHsgQnVpbGRTdGF0dXM6ICdTVUNDRVNTJ30sICdidWlsZCcpO1xuICB9IGVsc2Uge1xuICAgIGF3YWl0IHJlc3BvbmQocmVzcG9uc2UsIGNvbnRleHQsICdGQUlMRUQnLCB7IEVycm9yOiAnQnVpbGQgZmFpbGVkJyB9KTtcbiAgfVxufTtcbmA7XG4iXX0=