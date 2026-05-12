import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";

export class AwsCdkStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);

    const bucket = new s3.Bucket(this, "AudioBucket", {

      publicReadAccess: true,
    
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    
      removalPolicy:
        cdk.RemovalPolicy.DESTROY,
    
      autoDeleteObjects: true,
    
    });
    const table =
  new dynamodb.Table(this, "HistoryTable", {

    partitionKey: {
      name: "id",
      type: dynamodb.AttributeType.STRING,
    },

    removalPolicy:
      cdk.RemovalPolicy.DESTROY,

  });

    const pollyFunction =
      new lambda.Function(this, "PollyFunction", {

        runtime:
          lambda.Runtime.NODEJS_18_X,

        handler:
          "polly.handler",

        code:
          lambda.Code.fromAsset(
            path.join(__dirname, "../lambda")
          ),

          environment: {
            BUCKET_NAME: bucket.bucketName,
            TABLE_NAME: table.tableName,
          },
      });

    bucket.grantPut(pollyFunction);
   
    table.grantWriteData(pollyFunction);
    
    pollyFunction.addToRolePolicy(

      new iam.PolicyStatement({

        actions: [
          "polly:SynthesizeSpeech",
        ],

        resources: ["*"],

      })

    );

    new apigateway.LambdaRestApi(this, "PollyApi", {

      handler: pollyFunction,

      defaultCorsPreflightOptions: {

        allowOrigins:
          apigateway.Cors.ALL_ORIGINS,

        allowMethods:
          apigateway.Cors.ALL_METHODS,

      },

    });

  }

}