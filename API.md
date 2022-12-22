# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### CdkDeployer <a name="CdkDeployer" id="cdk-deployer.CdkDeployer"></a>

A custom CDK Stack that can be synthetized as a CloudFormation Stack to deploy a CDK application hosted on GitHub.

This stack is self contained and can be one-click deployed to any AWS account.
It can be used for workshop or blog AWS CDK examples easy deployment.
The stack supports passing the CDK application stack name to deploy (in case there are multiple stacks in the CDK app) and CDK parameters.

It contains the necessary resources to synchronously deploy a CDK application from a GitHub repository:
  * A CodeBuild project to effectively deploy the CDK application
  * A StartBuild custom resource to synchronously trigger the build using a callback pattern based on Event Bridge
  * The necessary roles

The StartBuild CFN custom resource is using the callback pattern to wait for the build completion:
  1. a Lambda function starts the build but doesn't return any value to the CFN callback URL. Instead, the callback URL is passed to the build project.
  2. the completion of the build trigger an Event and a second Lambda function which checks the result of the build and send information to the CFN callback URL

  * Usage example:
```typescript
new CdkDeployer(AwsNativeRefArchApp, {
  githubRepository: 'aws-samples/aws-analytics-reference-architecture',
  cdkAppLocation: 'refarch/aws-native',
  cdkParameters: {
    QuickSightUsername: {
      default: 'myuser',
      type: 'String',
    },
    QuickSightIdentityRegion: {
      default: 'us-east-1',
      type: 'String',
    },
  },
});
```

#### Initializers <a name="Initializers" id="cdk-deployer.CdkDeployer.Initializer"></a>

```typescript
import { CdkDeployer } from 'cdk-deployer'

new CdkDeployer(scope: Construct, props: CdkDeployerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployer.CdkDeployer.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#cdk-deployer.CdkDeployer.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-deployer.CdkDeployerProps">CdkDeployerProps</a></code> | the CdkDeployer [properties]{@link CdkDeployerProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-deployer.CdkDeployer.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-deployer.CdkDeployer.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-deployer.CdkDeployerProps">CdkDeployerProps</a>

the CdkDeployer [properties]{@link CdkDeployerProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-deployer.CdkDeployer.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-deployer.CdkDeployer.addDependency">addDependency</a></code> | Add a dependency between this stack and another stack. |
| <code><a href="#cdk-deployer.CdkDeployer.addMetadata">addMetadata</a></code> | Adds an arbitary key-value pair, with information you want to record about the stack. |
| <code><a href="#cdk-deployer.CdkDeployer.addTransform">addTransform</a></code> | Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template. |
| <code><a href="#cdk-deployer.CdkDeployer.exportStringListValue">exportStringListValue</a></code> | Create a CloudFormation Export for a string list value. |
| <code><a href="#cdk-deployer.CdkDeployer.exportValue">exportValue</a></code> | Create a CloudFormation Export for a string value. |
| <code><a href="#cdk-deployer.CdkDeployer.formatArn">formatArn</a></code> | Creates an ARN from components. |
| <code><a href="#cdk-deployer.CdkDeployer.getLogicalId">getLogicalId</a></code> | Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource. |
| <code><a href="#cdk-deployer.CdkDeployer.regionalFact">regionalFact</a></code> | Look up a fact value for the given fact for the region of this stack. |
| <code><a href="#cdk-deployer.CdkDeployer.renameLogicalId">renameLogicalId</a></code> | Rename a generated logical identities. |
| <code><a href="#cdk-deployer.CdkDeployer.reportMissingContextKey">reportMissingContextKey</a></code> | Indicate that a context key was expected. |
| <code><a href="#cdk-deployer.CdkDeployer.resolve">resolve</a></code> | Resolve a tokenized value in the context of the current stack. |
| <code><a href="#cdk-deployer.CdkDeployer.splitArn">splitArn</a></code> | Splits the provided ARN into its components. |
| <code><a href="#cdk-deployer.CdkDeployer.toJsonString">toJsonString</a></code> | Convert an object, potentially containing tokens, to a JSON string. |

---

##### `toString` <a name="toString" id="cdk-deployer.CdkDeployer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addDependency` <a name="addDependency" id="cdk-deployer.CdkDeployer.addDependency"></a>

```typescript
public addDependency(target: Stack, reason?: string): void
```

Add a dependency between this stack and another stack.

This can be used to define dependencies between any two stacks within an
app, and also supports nested stacks.

###### `target`<sup>Required</sup> <a name="target" id="cdk-deployer.CdkDeployer.addDependency.parameter.target"></a>

- *Type:* aws-cdk-lib.Stack

---

###### `reason`<sup>Optional</sup> <a name="reason" id="cdk-deployer.CdkDeployer.addDependency.parameter.reason"></a>

- *Type:* string

---

##### `addMetadata` <a name="addMetadata" id="cdk-deployer.CdkDeployer.addMetadata"></a>

```typescript
public addMetadata(key: string, value: any): void
```

Adds an arbitary key-value pair, with information you want to record about the stack.

These get translated to the Metadata section of the generated template.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html)

###### `key`<sup>Required</sup> <a name="key" id="cdk-deployer.CdkDeployer.addMetadata.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="cdk-deployer.CdkDeployer.addMetadata.parameter.value"></a>

- *Type:* any

---

##### `addTransform` <a name="addTransform" id="cdk-deployer.CdkDeployer.addTransform"></a>

```typescript
public addTransform(transform: string): void
```

Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template.

Duplicate values are removed when stack is synthesized.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html)

*Example*

```typescript
declare const stack: Stack;

stack.addTransform('AWS::Serverless-2016-10-31')
```


###### `transform`<sup>Required</sup> <a name="transform" id="cdk-deployer.CdkDeployer.addTransform.parameter.transform"></a>

- *Type:* string

The transform to add.

---

##### `exportStringListValue` <a name="exportStringListValue" id="cdk-deployer.CdkDeployer.exportStringListValue"></a>

```typescript
public exportStringListValue(exportedValue: any, options?: ExportValueOptions): string[]
```

Create a CloudFormation Export for a string list value.

Returns a string list representing the corresponding `Fn.importValue()`
expression for this Export. The export expression is automatically wrapped with an
`Fn::Join` and the import value with an `Fn::Split`, since CloudFormation can only
export strings. You can control the name for the export by passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

# See `exportValue` for an example of this process.

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="cdk-deployer.CdkDeployer.exportStringListValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="cdk-deployer.CdkDeployer.exportStringListValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `exportValue` <a name="exportValue" id="cdk-deployer.CdkDeployer.exportValue"></a>

```typescript
public exportValue(exportedValue: any, options?: ExportValueOptions): string
```

Create a CloudFormation Export for a string value.

Returns a string representing the corresponding `Fn.importValue()`
expression for this Export. You can control the name for the export by
passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

## Example

Here is how the process works. Let's say there are two stacks,
`producerStack` and `consumerStack`, and `producerStack` has a bucket
called `bucket`, which is referenced by `consumerStack` (perhaps because
an AWS Lambda Function writes into it, or something like that).

It is not safe to remove `producerStack.bucket` because as the bucket is being
deleted, `consumerStack` might still be using it.

Instead, the process takes two deployments:

### Deployment 1: break the relationship

- Make sure `consumerStack` no longer references `bucket.bucketName` (maybe the consumer
   stack now uses its own bucket, or it writes to an AWS DynamoDB table, or maybe you just
   remove the Lambda Function altogether).
- In the `ProducerStack` class, call `this.exportValue(this.bucket.bucketName)`. This
   will make sure the CloudFormation Export continues to exist while the relationship
   between the two stacks is being broken.
- Deploy (this will effectively only change the `consumerStack`, but it's safe to deploy both).

### Deployment 2: remove the bucket resource

- You are now free to remove the `bucket` resource from `producerStack`.
- Don't forget to remove the `exportValue()` call as well.
- Deploy again (this time only the `producerStack` will be changed -- the bucket will be deleted).

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="cdk-deployer.CdkDeployer.exportValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="cdk-deployer.CdkDeployer.exportValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `formatArn` <a name="formatArn" id="cdk-deployer.CdkDeployer.formatArn"></a>

```typescript
public formatArn(components: ArnComponents): string
```

Creates an ARN from components.

If `partition`, `region` or `account` are not specified, the stack's
partition, region and account will be used.

If any component is the empty string, an empty string will be inserted
into the generated ARN at the location that component corresponds to.

The ARN will be formatted as follows:

   arn:{partition}:{service}:{region}:{account}:{resource}{sep}{resource-name}

The required ARN pieces that are omitted will be taken from the stack that
the 'scope' is attached to. If all ARN pieces are supplied, the supplied scope
can be 'undefined'.

###### `components`<sup>Required</sup> <a name="components" id="cdk-deployer.CdkDeployer.formatArn.parameter.components"></a>

- *Type:* aws-cdk-lib.ArnComponents

---

##### `getLogicalId` <a name="getLogicalId" id="cdk-deployer.CdkDeployer.getLogicalId"></a>

```typescript
public getLogicalId(element: CfnElement): string
```

Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource.

This method is called when a `CfnElement` is created and used to render the
initial logical identity of resources. Logical ID renames are applied at
this stage.

This method uses the protected method `allocateLogicalId` to render the
logical ID for an element. To modify the naming scheme, extend the `Stack`
class and override this method.

###### `element`<sup>Required</sup> <a name="element" id="cdk-deployer.CdkDeployer.getLogicalId.parameter.element"></a>

- *Type:* aws-cdk-lib.CfnElement

The CloudFormation element for which a logical identity is needed.

---

##### `regionalFact` <a name="regionalFact" id="cdk-deployer.CdkDeployer.regionalFact"></a>

```typescript
public regionalFact(factName: string, defaultValue?: string): string
```

Look up a fact value for the given fact for the region of this stack.

Will return a definite value only if the region of the current stack is resolved.
If not, a lookup map will be added to the stack and the lookup will be done at
CDK deployment time.

What regions will be included in the lookup map is controlled by the
`@aws-cdk/core:target-partitions` context value: it must be set to a list
of partitions, and only regions from the given partitions will be included.
If no such context key is set, all regions will be included.

This function is intended to be used by construct library authors. Application
builders can rely on the abstractions offered by construct libraries and do
not have to worry about regional facts.

If `defaultValue` is not given, it is an error if the fact is unknown for
the given region.

###### `factName`<sup>Required</sup> <a name="factName" id="cdk-deployer.CdkDeployer.regionalFact.parameter.factName"></a>

- *Type:* string

---

###### `defaultValue`<sup>Optional</sup> <a name="defaultValue" id="cdk-deployer.CdkDeployer.regionalFact.parameter.defaultValue"></a>

- *Type:* string

---

##### `renameLogicalId` <a name="renameLogicalId" id="cdk-deployer.CdkDeployer.renameLogicalId"></a>

```typescript
public renameLogicalId(oldId: string, newId: string): void
```

Rename a generated logical identities.

To modify the naming scheme strategy, extend the `Stack` class and
override the `allocateLogicalId` method.

###### `oldId`<sup>Required</sup> <a name="oldId" id="cdk-deployer.CdkDeployer.renameLogicalId.parameter.oldId"></a>

- *Type:* string

---

###### `newId`<sup>Required</sup> <a name="newId" id="cdk-deployer.CdkDeployer.renameLogicalId.parameter.newId"></a>

- *Type:* string

---

##### `reportMissingContextKey` <a name="reportMissingContextKey" id="cdk-deployer.CdkDeployer.reportMissingContextKey"></a>

```typescript
public reportMissingContextKey(report: MissingContext): void
```

Indicate that a context key was expected.

Contains instructions which will be emitted into the cloud assembly on how
the key should be supplied.

###### `report`<sup>Required</sup> <a name="report" id="cdk-deployer.CdkDeployer.reportMissingContextKey.parameter.report"></a>

- *Type:* aws-cdk-lib.cloud_assembly_schema.MissingContext

The set of parameters needed to obtain the context.

---

##### `resolve` <a name="resolve" id="cdk-deployer.CdkDeployer.resolve"></a>

```typescript
public resolve(obj: any): any
```

Resolve a tokenized value in the context of the current stack.

###### `obj`<sup>Required</sup> <a name="obj" id="cdk-deployer.CdkDeployer.resolve.parameter.obj"></a>

- *Type:* any

---

##### `splitArn` <a name="splitArn" id="cdk-deployer.CdkDeployer.splitArn"></a>

```typescript
public splitArn(arn: string, arnFormat: ArnFormat): ArnComponents
```

Splits the provided ARN into its components.

Works both if 'arn' is a string like 'arn:aws:s3:::bucket',
and a Token representing a dynamic CloudFormation expression
(in which case the returned components will also be dynamic CloudFormation expressions,
encoded as Tokens).

###### `arn`<sup>Required</sup> <a name="arn" id="cdk-deployer.CdkDeployer.splitArn.parameter.arn"></a>

- *Type:* string

the ARN to split into its components.

---

###### `arnFormat`<sup>Required</sup> <a name="arnFormat" id="cdk-deployer.CdkDeployer.splitArn.parameter.arnFormat"></a>

- *Type:* aws-cdk-lib.ArnFormat

the expected format of 'arn' - depends on what format the service 'arn' represents uses.

---

##### `toJsonString` <a name="toJsonString" id="cdk-deployer.CdkDeployer.toJsonString"></a>

```typescript
public toJsonString(obj: any, space?: number): string
```

Convert an object, potentially containing tokens, to a JSON string.

###### `obj`<sup>Required</sup> <a name="obj" id="cdk-deployer.CdkDeployer.toJsonString.parameter.obj"></a>

- *Type:* any

---

###### `space`<sup>Optional</sup> <a name="space" id="cdk-deployer.CdkDeployer.toJsonString.parameter.space"></a>

- *Type:* number

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-deployer.CdkDeployer.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#cdk-deployer.CdkDeployer.isStack">isStack</a></code> | Return whether the given object is a Stack. |
| <code><a href="#cdk-deployer.CdkDeployer.of">of</a></code> | Looks up the first stack scope in which `construct` is defined. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-deployer.CdkDeployer.isConstruct"></a>

```typescript
import { CdkDeployer } from 'cdk-deployer'

CdkDeployer.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-deployer.CdkDeployer.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isStack` <a name="isStack" id="cdk-deployer.CdkDeployer.isStack"></a>

```typescript
import { CdkDeployer } from 'cdk-deployer'

CdkDeployer.isStack(x: any)
```

Return whether the given object is a Stack.

We do attribute detection since we can't reliably use 'instanceof'.

###### `x`<sup>Required</sup> <a name="x" id="cdk-deployer.CdkDeployer.isStack.parameter.x"></a>

- *Type:* any

---

##### `of` <a name="of" id="cdk-deployer.CdkDeployer.of"></a>

```typescript
import { CdkDeployer } from 'cdk-deployer'

CdkDeployer.of(construct: IConstruct)
```

Looks up the first stack scope in which `construct` is defined.

Fails if there is no stack up the tree.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk-deployer.CdkDeployer.of.parameter.construct"></a>

- *Type:* constructs.IConstruct

The construct to start the search from.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployer.CdkDeployer.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-deployer.CdkDeployer.property.account">account</a></code> | <code>string</code> | The AWS account into which this stack will be deployed. |
| <code><a href="#cdk-deployer.CdkDeployer.property.artifactId">artifactId</a></code> | <code>string</code> | The ID of the cloud assembly artifact for this stack. |
| <code><a href="#cdk-deployer.CdkDeployer.property.availabilityZones">availabilityZones</a></code> | <code>string[]</code> | Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack. |
| <code><a href="#cdk-deployer.CdkDeployer.property.bundlingRequired">bundlingRequired</a></code> | <code>boolean</code> | Indicates whether the stack requires bundling or not. |
| <code><a href="#cdk-deployer.CdkDeployer.property.dependencies">dependencies</a></code> | <code>aws-cdk-lib.Stack[]</code> | Return the stacks this stack depends on. |
| <code><a href="#cdk-deployer.CdkDeployer.property.environment">environment</a></code> | <code>string</code> | The environment coordinates in which this stack is deployed. |
| <code><a href="#cdk-deployer.CdkDeployer.property.nested">nested</a></code> | <code>boolean</code> | Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent. |
| <code><a href="#cdk-deployer.CdkDeployer.property.notificationArns">notificationArns</a></code> | <code>string[]</code> | Returns the list of notification Amazon Resource Names (ARNs) for the current stack. |
| <code><a href="#cdk-deployer.CdkDeployer.property.partition">partition</a></code> | <code>string</code> | The partition in which this stack is defined. |
| <code><a href="#cdk-deployer.CdkDeployer.property.region">region</a></code> | <code>string</code> | The AWS region into which this stack will be deployed (e.g. `us-west-2`). |
| <code><a href="#cdk-deployer.CdkDeployer.property.stackId">stackId</a></code> | <code>string</code> | The ID of the stack. |
| <code><a href="#cdk-deployer.CdkDeployer.property.stackName">stackName</a></code> | <code>string</code> | The concrete CloudFormation physical stack name. |
| <code><a href="#cdk-deployer.CdkDeployer.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method for this stack. |
| <code><a href="#cdk-deployer.CdkDeployer.property.tags">tags</a></code> | <code>aws-cdk-lib.TagManager</code> | Tags to be applied to the stack. |
| <code><a href="#cdk-deployer.CdkDeployer.property.templateFile">templateFile</a></code> | <code>string</code> | The name of the CloudFormation template file emitted to the output directory during synthesis. |
| <code><a href="#cdk-deployer.CdkDeployer.property.templateOptions">templateOptions</a></code> | <code>aws-cdk-lib.ITemplateOptions</code> | Options for CloudFormation template (like version, transform, description). |
| <code><a href="#cdk-deployer.CdkDeployer.property.urlSuffix">urlSuffix</a></code> | <code>string</code> | The Amazon domain suffix for the region in which this stack is defined. |
| <code><a href="#cdk-deployer.CdkDeployer.property.nestedStackParent">nestedStackParent</a></code> | <code>aws-cdk-lib.Stack</code> | If this is a nested stack, returns it's parent stack. |
| <code><a href="#cdk-deployer.CdkDeployer.property.nestedStackResource">nestedStackResource</a></code> | <code>aws-cdk-lib.CfnResource</code> | If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource. |
| <code><a href="#cdk-deployer.CdkDeployer.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether termination protection is enabled for this stack. |
| <code><a href="#cdk-deployer.CdkDeployer.property.deployResult">deployResult</a></code> | <code>string</code> | The result of the deloyment. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-deployer.CdkDeployer.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `account`<sup>Required</sup> <a name="account" id="cdk-deployer.CdkDeployer.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

The AWS account into which this stack will be deployed.

This value is resolved according to the following rules:

1. The value provided to `env.account` when the stack is defined. This can
    either be a concrete account (e.g. `585695031111`) or the
    `Aws.ACCOUNT_ID` token.
3. `Aws.ACCOUNT_ID`, which represents the CloudFormation intrinsic reference
    `{ "Ref": "AWS::AccountId" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concerete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.account)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **account-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `artifactId`<sup>Required</sup> <a name="artifactId" id="cdk-deployer.CdkDeployer.property.artifactId"></a>

```typescript
public readonly artifactId: string;
```

- *Type:* string

The ID of the cloud assembly artifact for this stack.

---

##### `availabilityZones`<sup>Required</sup> <a name="availabilityZones" id="cdk-deployer.CdkDeployer.property.availabilityZones"></a>

```typescript
public readonly availabilityZones: string[];
```

- *Type:* string[]

Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack.

If the stack is environment-agnostic (either account and/or region are
tokens), this property will return an array with 2 tokens that will resolve
at deploy-time to the first two availability zones returned from CloudFormation's
`Fn::GetAZs` intrinsic function.

If they are not available in the context, returns a set of dummy values and
reports them as missing, and let the CLI resolve them by calling EC2
`DescribeAvailabilityZones` on the target environment.

To specify a different strategy for selecting availability zones override this method.

---

##### `bundlingRequired`<sup>Required</sup> <a name="bundlingRequired" id="cdk-deployer.CdkDeployer.property.bundlingRequired"></a>

```typescript
public readonly bundlingRequired: boolean;
```

- *Type:* boolean

Indicates whether the stack requires bundling or not.

---

##### `dependencies`<sup>Required</sup> <a name="dependencies" id="cdk-deployer.CdkDeployer.property.dependencies"></a>

```typescript
public readonly dependencies: Stack[];
```

- *Type:* aws-cdk-lib.Stack[]

Return the stacks this stack depends on.

---

##### `environment`<sup>Required</sup> <a name="environment" id="cdk-deployer.CdkDeployer.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

The environment coordinates in which this stack is deployed.

In the form
`aws://account/region`. Use `stack.account` and `stack.region` to obtain
the specific values, no need to parse.

You can use this value to determine if two stacks are targeting the same
environment.

If either `stack.account` or `stack.region` are not concrete values (e.g.
`Aws.ACCOUNT_ID` or `Aws.REGION`) the special strings `unknown-account` and/or
`unknown-region` will be used respectively to indicate this stack is
region/account-agnostic.

---

##### `nested`<sup>Required</sup> <a name="nested" id="cdk-deployer.CdkDeployer.property.nested"></a>

```typescript
public readonly nested: boolean;
```

- *Type:* boolean

Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent.

---

##### `notificationArns`<sup>Required</sup> <a name="notificationArns" id="cdk-deployer.CdkDeployer.property.notificationArns"></a>

```typescript
public readonly notificationArns: string[];
```

- *Type:* string[]

Returns the list of notification Amazon Resource Names (ARNs) for the current stack.

---

##### `partition`<sup>Required</sup> <a name="partition" id="cdk-deployer.CdkDeployer.property.partition"></a>

```typescript
public readonly partition: string;
```

- *Type:* string

The partition in which this stack is defined.

---

##### `region`<sup>Required</sup> <a name="region" id="cdk-deployer.CdkDeployer.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

The AWS region into which this stack will be deployed (e.g. `us-west-2`).

This value is resolved according to the following rules:

1. The value provided to `env.region` when the stack is defined. This can
    either be a concerete region (e.g. `us-west-2`) or the `Aws.REGION`
    token.
3. `Aws.REGION`, which is represents the CloudFormation intrinsic reference
    `{ "Ref": "AWS::Region" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concerete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.region)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **region-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `stackId`<sup>Required</sup> <a name="stackId" id="cdk-deployer.CdkDeployer.property.stackId"></a>

```typescript
public readonly stackId: string;
```

- *Type:* string

The ID of the stack.

---

*Example*

```typescript
// After resolving, looks like
'arn:aws:cloudformation:us-west-2:123456789012:stack/teststack/51af3dc0-da77-11e4-872e-1234567db123'
```


##### `stackName`<sup>Required</sup> <a name="stackName" id="cdk-deployer.CdkDeployer.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string

The concrete CloudFormation physical stack name.

This is either the name defined explicitly in the `stackName` prop or
allocated based on the stack's location in the construct tree. Stacks that
are directly defined under the app use their construct `id` as their stack
name. Stacks that are defined deeper within the tree will use a hashed naming
scheme based on the construct path to ensure uniqueness.

If you wish to obtain the deploy-time AWS::StackName intrinsic,
you can use `Aws.STACK_NAME` directly.

---

##### `synthesizer`<sup>Required</sup> <a name="synthesizer" id="cdk-deployer.CdkDeployer.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer

Synthesis method for this stack.

---

##### `tags`<sup>Required</sup> <a name="tags" id="cdk-deployer.CdkDeployer.property.tags"></a>

```typescript
public readonly tags: TagManager;
```

- *Type:* aws-cdk-lib.TagManager

Tags to be applied to the stack.

---

##### `templateFile`<sup>Required</sup> <a name="templateFile" id="cdk-deployer.CdkDeployer.property.templateFile"></a>

```typescript
public readonly templateFile: string;
```

- *Type:* string

The name of the CloudFormation template file emitted to the output directory during synthesis.

Example value: `MyStack.template.json`

---

##### `templateOptions`<sup>Required</sup> <a name="templateOptions" id="cdk-deployer.CdkDeployer.property.templateOptions"></a>

```typescript
public readonly templateOptions: ITemplateOptions;
```

- *Type:* aws-cdk-lib.ITemplateOptions

Options for CloudFormation template (like version, transform, description).

---

##### `urlSuffix`<sup>Required</sup> <a name="urlSuffix" id="cdk-deployer.CdkDeployer.property.urlSuffix"></a>

```typescript
public readonly urlSuffix: string;
```

- *Type:* string

The Amazon domain suffix for the region in which this stack is defined.

---

##### `nestedStackParent`<sup>Optional</sup> <a name="nestedStackParent" id="cdk-deployer.CdkDeployer.property.nestedStackParent"></a>

```typescript
public readonly nestedStackParent: Stack;
```

- *Type:* aws-cdk-lib.Stack

If this is a nested stack, returns it's parent stack.

---

##### `nestedStackResource`<sup>Optional</sup> <a name="nestedStackResource" id="cdk-deployer.CdkDeployer.property.nestedStackResource"></a>

```typescript
public readonly nestedStackResource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource.

`undefined` for top-level (non-nested) stacks.

---

##### `terminationProtection`<sup>Optional</sup> <a name="terminationProtection" id="cdk-deployer.CdkDeployer.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean

Whether termination protection is enabled for this stack.

---

##### `deployResult`<sup>Required</sup> <a name="deployResult" id="cdk-deployer.CdkDeployer.property.deployResult"></a>

```typescript
public readonly deployResult: string;
```

- *Type:* string

The result of the deloyment.

---


## Structs <a name="Structs" id="Structs"></a>

### CdkDeployerProps <a name="CdkDeployerProps" id="cdk-deployer.CdkDeployerProps"></a>

The properties for the CdkDeployer construct.

#### Initializer <a name="Initializer" id="cdk-deployer.CdkDeployerProps.Initializer"></a>

```typescript
import { CdkDeployerProps } from 'cdk-deployer'

const cdkDeployerProps: CdkDeployerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.analyticsReporting">analyticsReporting</a></code> | <code>boolean</code> | Include runtime versioning information in this Stack. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.crossRegionReferences">crossRegionReferences</a></code> | <code>boolean</code> | Enable this flag to allow native cross region stack references. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.description">description</a></code> | <code>string</code> | A description of the stack. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.env">env</a></code> | <code>aws-cdk-lib.Environment</code> | The AWS environment (account/region) where this stack will be deployed. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.permissionsBoundary">permissionsBoundary</a></code> | <code>aws-cdk-lib.PermissionsBoundary</code> | Options for applying a permissions boundary to all IAM Roles and Users created within this Stage. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.stackName">stackName</a></code> | <code>string</code> | Name to deploy the stack with. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method to use while deploying this stack. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | Stack tags that will be applied to all the taggable resources and the stack itself. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether to enable termination protection for this stack. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.cdkAppLocation">cdkAppLocation</a></code> | <code>string</code> | The location of the CDK application in the Github repository. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.cdkAppSourceCodeBucketName">cdkAppSourceCodeBucketName</a></code> | <code>string</code> | The name of the S3 bucket where the CDK application source code zip is stored. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.cdkAppSourceCodeBucketPrefix">cdkAppSourceCodeBucketPrefix</a></code> | <code>string</code> | The prefix of the S3 bucket where the CDK application source code zip is stored. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.cdkAppSourceCodeZipName">cdkAppSourceCodeZipName</a></code> | <code>string</code> | The name of the zip file containing the CDK application source code. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.cdkParameters">cdkParameters</a></code> | <code>{[ key: string ]: aws-cdk-lib.CfnParameterProps}</code> | The CFN parameters to pass to the CDK application. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.cdkStack">cdkStack</a></code> | <code>string</code> | The CDK stack name to deploy. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.deployBuildSpec">deployBuildSpec</a></code> | <code>aws-cdk-lib.aws_codebuild.BuildSpec</code> | Deploy CodeBuild buildspec file name at the root of the cdk app folder. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.destroyBuildSpec">destroyBuildSpec</a></code> | <code>aws-cdk-lib.aws_codebuild.BuildSpec</code> | Destroy Codebuild buildspec file name at the root of the cdk app folder. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.gitBranch">gitBranch</a></code> | <code>string</code> | The branch to use on the Github repository. |
| <code><a href="#cdk-deployer.CdkDeployerProps.property.githubRepository">githubRepository</a></code> | <code>string</code> | The github repository containing the CDK application. |

---

##### `analyticsReporting`<sup>Optional</sup> <a name="analyticsReporting" id="cdk-deployer.CdkDeployerProps.property.analyticsReporting"></a>

```typescript
public readonly analyticsReporting: boolean;
```

- *Type:* boolean
- *Default:* `analyticsReporting` setting of containing `App`, or value of 'aws:cdk:version-reporting' context key

Include runtime versioning information in this Stack.

---

##### `crossRegionReferences`<sup>Optional</sup> <a name="crossRegionReferences" id="cdk-deployer.CdkDeployerProps.property.crossRegionReferences"></a>

```typescript
public readonly crossRegionReferences: boolean;
```

- *Type:* boolean
- *Default:* false

Enable this flag to allow native cross region stack references.

Enabling this will create a CloudFormation custom resource
in both the producing stack and consuming stack in order to perform the export/import

This feature is currently experimental

---

##### `description`<sup>Optional</sup> <a name="description" id="cdk-deployer.CdkDeployerProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the stack.

---

##### `env`<sup>Optional</sup> <a name="env" id="cdk-deployer.CdkDeployerProps.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* aws-cdk-lib.Environment
- *Default:* The environment of the containing `Stage` if available, otherwise create the stack will be environment-agnostic.

The AWS environment (account/region) where this stack will be deployed.

Set the `region`/`account` fields of `env` to either a concrete value to
select the indicated environment (recommended for production stacks), or to
the values of environment variables
`CDK_DEFAULT_REGION`/`CDK_DEFAULT_ACCOUNT` to let the target environment
depend on the AWS credentials/configuration that the CDK CLI is executed
under (recommended for development stacks).

If the `Stack` is instantiated inside a `Stage`, any undefined
`region`/`account` fields from `env` will default to the same field on the
encompassing `Stage`, if configured there.

If either `region` or `account` are not set nor inherited from `Stage`, the
Stack will be considered "*environment-agnostic*"". Environment-agnostic
stacks can be deployed to any environment but may not be able to take
advantage of all features of the CDK. For example, they will not be able to
use environmental context lookups such as `ec2.Vpc.fromLookup` and will not
automatically translate Service Principals to the right format based on the
environment's AWS partition, and other such enhancements.

---

*Example*

```typescript
// Use a concrete account and region to deploy this stack to:
// `.account` and `.region` will simply return these values.
new Stack(app, 'Stack1', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  },
});

// Use the CLI's current credentials to determine the target environment:
// `.account` and `.region` will reflect the account+region the CLI
// is configured to use (based on the user CLI credentials)
new Stack(app, 'Stack2', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

// Define multiple stacks stage associated with an environment
const myStage = new Stage(app, 'MyStage', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  }
});

// both of these stacks will use the stage's account/region:
// `.account` and `.region` will resolve to the concrete values as above
new MyStack(myStage, 'Stack1');
new YourStack(myStage, 'Stack2');

// Define an environment-agnostic stack:
// `.account` and `.region` will resolve to `{ "Ref": "AWS::AccountId" }` and `{ "Ref": "AWS::Region" }` respectively.
// which will only resolve to actual values by CloudFormation during deployment.
new MyStack(app, 'Stack1');
```


##### `permissionsBoundary`<sup>Optional</sup> <a name="permissionsBoundary" id="cdk-deployer.CdkDeployerProps.property.permissionsBoundary"></a>

```typescript
public readonly permissionsBoundary: PermissionsBoundary;
```

- *Type:* aws-cdk-lib.PermissionsBoundary
- *Default:* no permissions boundary is applied

Options for applying a permissions boundary to all IAM Roles and Users created within this Stage.

---

##### `stackName`<sup>Optional</sup> <a name="stackName" id="cdk-deployer.CdkDeployerProps.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string
- *Default:* Derived from construct path.

Name to deploy the stack with.

---

##### `synthesizer`<sup>Optional</sup> <a name="synthesizer" id="cdk-deployer.CdkDeployerProps.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer
- *Default:* `DefaultStackSynthesizer` if the `@aws-cdk/core:newStyleStackSynthesis` feature flag is set, `LegacyStackSynthesizer` otherwise.

Synthesis method to use while deploying this stack.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="cdk-deployer.CdkDeployerProps.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* {}

Stack tags that will be applied to all the taggable resources and the stack itself.

---

##### `terminationProtection`<sup>Optional</sup> <a name="terminationProtection" id="cdk-deployer.CdkDeployerProps.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to enable termination protection for this stack.

---

##### `cdkAppLocation`<sup>Optional</sup> <a name="cdkAppLocation" id="cdk-deployer.CdkDeployerProps.property.cdkAppLocation"></a>

```typescript
public readonly cdkAppLocation: string;
```

- *Type:* string
- *Default:* The root of the repository

The location of the CDK application in the Github repository.

It is used to `cd` into the folder before deploying the CDK application

---

##### `cdkAppSourceCodeBucketName`<sup>Optional</sup> <a name="cdkAppSourceCodeBucketName" id="cdk-deployer.CdkDeployerProps.property.cdkAppSourceCodeBucketName"></a>

```typescript
public readonly cdkAppSourceCodeBucketName: string;
```

- *Type:* string

The name of the S3 bucket where the CDK application source code zip is stored.

---

##### `cdkAppSourceCodeBucketPrefix`<sup>Optional</sup> <a name="cdkAppSourceCodeBucketPrefix" id="cdk-deployer.CdkDeployerProps.property.cdkAppSourceCodeBucketPrefix"></a>

```typescript
public readonly cdkAppSourceCodeBucketPrefix: string;
```

- *Type:* string

The prefix of the S3 bucket where the CDK application source code zip is stored.

---

##### `cdkAppSourceCodeZipName`<sup>Optional</sup> <a name="cdkAppSourceCodeZipName" id="cdk-deployer.CdkDeployerProps.property.cdkAppSourceCodeZipName"></a>

```typescript
public readonly cdkAppSourceCodeZipName: string;
```

- *Type:* string

The name of the zip file containing the CDK application source code.

---

##### `cdkParameters`<sup>Optional</sup> <a name="cdkParameters" id="cdk-deployer.CdkDeployerProps.property.cdkParameters"></a>

```typescript
public readonly cdkParameters: {[ key: string ]: CfnParameterProps};
```

- *Type:* {[ key: string ]: aws-cdk-lib.CfnParameterProps}
- *Default:* No parameter is used

The CFN parameters to pass to the CDK application.

---

##### `cdkStack`<sup>Optional</sup> <a name="cdkStack" id="cdk-deployer.CdkDeployerProps.property.cdkStack"></a>

```typescript
public readonly cdkStack: string;
```

- *Type:* string
- *Default:* The default stack is deployed

The CDK stack name to deploy.

---

##### `deployBuildSpec`<sup>Optional</sup> <a name="deployBuildSpec" id="cdk-deployer.CdkDeployerProps.property.deployBuildSpec"></a>

```typescript
public readonly deployBuildSpec: BuildSpec;
```

- *Type:* aws-cdk-lib.aws_codebuild.BuildSpec

Deploy CodeBuild buildspec file name at the root of the cdk app folder.

---

##### `destroyBuildSpec`<sup>Optional</sup> <a name="destroyBuildSpec" id="cdk-deployer.CdkDeployerProps.property.destroyBuildSpec"></a>

```typescript
public readonly destroyBuildSpec: BuildSpec;
```

- *Type:* aws-cdk-lib.aws_codebuild.BuildSpec

Destroy Codebuild buildspec file name at the root of the cdk app folder.

---

##### `gitBranch`<sup>Optional</sup> <a name="gitBranch" id="cdk-deployer.CdkDeployerProps.property.gitBranch"></a>

```typescript
public readonly gitBranch: string;
```

- *Type:* string
- *Default:* The main branch of the repository

The branch to use on the Github repository.

---

##### `githubRepository`<sup>Optional</sup> <a name="githubRepository" id="cdk-deployer.CdkDeployerProps.property.githubRepository"></a>

```typescript
public readonly githubRepository: string;
```

- *Type:* string

The github repository containing the CDK application.

---



