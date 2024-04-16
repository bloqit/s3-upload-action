const core = require('@actions/core');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const crc32 = require('buffer-crc32');

const NODE_ENV = process.env['NODE_ENV'];

// If you want to run it locally, set the environment variables like `$ export SOME_KEY=<your token>`
const AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'];
const AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'];
const AWS_BUCKET = process.env['AWS_BUCKET'];

let input;
if (NODE_ENV != 'local') {
  input = {
    awsAccessKeyId: core.getInput('aws-access-key-id', { required: true }),
    awsSecretAccessKey: core.getInput('aws-secret-access-key', { required: true }),
    awsRegion: core.getInput('aws-region', { required: true }),
    awsBucket: core.getInput('aws-bucket', { required: true }),
    destinationDir: core.getInput('destination-dir'),
    filePath: core.getInput('file-path', { required: true }),
    metadata: core.getInput('metadata')
  };
} else {
  input = {
    awsAccessKeyId: AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: AWS_SECRET_ACCESS_KEY,
    awsRegion: 'ap-northeast-1',
    awsBucket: AWS_BUCKET,
    destinationDir: '',
    filePath: './README.md',
    metadata: ''
  };
}

aws.config.update({
  accessKeyId: input.awsAccessKeyId,
  secretAccessKey: input.awsSecretAccessKey,
  region: input.awsRegion,
});

const s3 = new aws.S3({ signatureVersion: 'v4' });

async function run(input) {

  const destinationDir = input.destinationDir ? input.destinationDir + '/' : '';
  const fileKey = destinationDir + path.basename(input.filePath);
  const file = fs.readFileSync(input.filePath);
  const checksum = crc32(file).toString('base64');

  let params = {
    Bucket: input.awsBucket,
    Key: fileKey,
    Body: file,
    ACL: 'private',
    ChecksumCRC32: checksum,
    ChecksumAlgorithm: 'CRC32',
    Metadata: input.metadata ? JSON.parse(input.metadata) : undefined
  };

  await s3.putObject(params).promise();
}

run(input)
  .then(result => {
    core.setOutput('result', 'success');
  })
  .catch(error => {
    core.setOutput('result', 'failure');
    core.setFailed(error.message);
  });
