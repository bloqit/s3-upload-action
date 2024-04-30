# S3 Upload Action

This is a GitHub Action that uploads a file to Amazon S3.
Uploaded files can be accessed via HTTP (Use [presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) for private s3 buckets).
Currently, only single file upload is supported.

## Inputs

| Name | Description | 
| --- | --- | 
| `aws-access-key-id` | (Required) Your AWS access key ID. | 
| `aws-secret-access-key` | (Required) Your AWS secret access key. | 
| `aws-region` | (Required) Region where the bucket is located. | 
| `aws-bucket` | (Required) S3 bucket to upload files. | 
| `destination-dir` | Directory on the bucket to upload files | 
| `metadata` | metadata in json format | 
| `content-type` | standard MIME type that describes the format the file | 

## Outputs

| Name | Description |
| --- | --- |
| `result` | Result of this action. `success` or `failure` is set. |

## Usage

### Basic usage

```yaml
- uses: bloqit/s3-upload-action@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: 'ap-northeast-1'
    aws-bucket: ${{ secrets.AWS_BUCKET }}
    file-path: 'myfile.txt'
    destination-dir: 'folder'
    metadata:  |
      {
        "key1": "value1",
        "key2": "value2",
        "key3": "value3"
      }
    content-type: 'text/html'
```

In this example, `myfile.txt` is stored in `folder/myfile.txt` on the bucket.
Specify `destination-dir` input to change the destination.

## License

[MIT](LICENSE)
