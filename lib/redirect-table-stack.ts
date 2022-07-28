import * as cdk from "@aws-cdk/core";
import { AttributeType, BillingMode, Table, TableEncryption } from "@aws-cdk/aws-dynamodb";

export interface RedirectTableStackProps extends cdk.StackProps {
  readonly stage: string;
}

export default class RedirectTableStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: RedirectTableStackProps) {
    super(scope, id, props);

    const table = new Table(this, "InterviewRedirectTable", {
      partitionKey: { name: "Code", type: AttributeType.STRING },
      tableName: `InterviewRedirects${props.stage}`,
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: "TTL",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: "Original-index",
      partitionKey: { name: "Original", type: AttributeType.STRING },
    });
  }
}
