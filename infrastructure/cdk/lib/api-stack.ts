import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  uploadBucketName: string;
  resultBucketName: string;
}

export class ApiStack extends cdk.Stack {
  public readonly apiGateway: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const apiLambda = new lambda.Function(this, 'MediTranslateApiHandler', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'app.main.handler',
      code: lambda.Code.fromAsset('../../apps/api'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        S3_UPLOAD_BUCKET: props.uploadBucketName,
        S3_RESULT_BUCKET: props.resultBucketName,
        AWS_REGION: this.region,
      },
    });

    apiLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:PutObject',
        'textract:DetectDocumentText',
        'bedrock:InvokeModel',
      ],
      resources: ['*'],
    }));

    this.apiGateway = new apigateway.LambdaRestApi(this, 'MediTranslateApi', {
      handler: apiLambda,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    new cdk.CfnOutput(this, 'ApiEndpointUrl', { value: this.apiGateway.url });
  }
}
