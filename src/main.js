const core = require('@actions/core');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const crc32 = require('buffer-crc32');

const input = {
  awsRegion: core.getInput('aws-region', { required: true }),
  awsBucket: core.getInput('aws-bucket', { required: true }),
  destinationDir: core.getInput('destination-dir'),
  filePath: core.getInput('file-path', { required: true }),
  metadata: core.getInput('metadata')
};

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_SESSION_TOKEN
) {
  core.setFailed(
    "Missing AWS credentials. Make sure `aws-actions/configure-aws-credentials` is executed before this action."
  );
  process.exit(1);
}

aws.config.update({
  region: input.awsRegion,
  credentials: new aws.EnvironmentCredentials('AWS')
});

const s3 = new aws.S3({ signatureVersion: 'v4' });

async function run(input) {
  const destinationDir = input.destinationDir
    ? input.destinationDir.replace(/\/+$/, '') + '/'
    : '';

  const fileKey = destinationDir + path.basename(input.filePath);
  const file = fs.readFileSync(input.filePath);
  const checksum = crc32(file).toString('base64');

  const params = {
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
  .then(() => {
    core.setOutput('result', 'success');
  })
  .catch(error => {
    core.setOutput('result', 'failure');
    core.setFailed(error.message);
  });