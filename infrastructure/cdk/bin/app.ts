import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { StorageStack } from '../lib/storage-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '123456789012',
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const authStack = new AuthStack(app, 'MediTranslateAuthStack', { env });
const storageStack = new StorageStack(app, 'MediTranslateStorageStack', { env });

new ApiStack(app, 'MediTranslateApiStack', {
  env,
  uploadBucketName: storageStack.uploadBucket.bucketName,
  resultBucketName: storageStack.resultBucket.bucketName,
});

app.synth();
