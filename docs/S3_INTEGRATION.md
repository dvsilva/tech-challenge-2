# S3 Upload Integration

This project now includes AWS S3 integration for file upload and management operations.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# S3 Configuration
S3_BUCKET_NAME=3frnt-group6-bytebank
```

### 2. AWS Credentials Setup

You can configure AWS credentials in multiple ways:

#### Option 1: Environment Variables (Recommended)

Set the environment variables as shown above.

#### Option 2: AWS Credentials File

Create `~/.aws/credentials` file:

```
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
```

#### Option 3: IAM Roles (for EC2/ECS deployment)

Use IAM roles when deploying to AWS infrastructure.

### 3. S3 Bucket Configuration

Ensure your S3 bucket `3frnt-group6-bytebank` has the following:

#### CORS Configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:4200",
      "https://your-frontend-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

#### Bucket Policy (Example):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowDirectUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-IAM-USER"
      },
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::3frnt-group6-bytebank/*"
    }
  ]
}
```

## Available Endpoints

All S3 endpoints require authentication (Bearer token).

### 1. Generate Signed URL

**POST** `/s3/signed-url`

Generate a pre-signed URL for S3 operations.

**Request Body:**

```json
{
  "bucket": "3frnt-group6-bytebank",
  "key": "uploads/1642678800000_abc123_document.pdf",
  "contentType": "application/pdf",
  "operation": "putObject"
}
```

**Response:**

```json
{
  "signedUrl": "https://3frnt-group6-bytebank.s3.amazonaws.com/uploads/1642678800000_abc123_document.pdf?X-Amz-Algorithm=...",
  "key": "uploads/1642678800000_abc123_document.pdf",
  "bucket": "3frnt-group6-bytebank",
  "operation": "putObject",
  "expiresIn": 3600
}
```

### 2. Delete File

**DELETE** `/s3/file`

Delete a file from S3.

**Request Body:**

```json
{
  "bucket": "3frnt-group6-bytebank",
  "key": "uploads/1642678800000_abc123_document.pdf"
}
```

**Response:**

```json
{
  "message": "File deleted successfully",
  "bucket": "3frnt-group6-bytebank",
  "key": "uploads/1642678800000_abc123_document.pdf"
}
```

### 3. List Files

**GET** `/s3/files?bucket=3frnt-group6-bytebank&prefix=uploads/&maxKeys=50`

List files in S3 bucket.

**Query Parameters:**

- `bucket` (optional): Bucket name
- `prefix` (optional): Filter files by prefix
- `maxKeys` (optional): Maximum number of files to return
- `continuationToken` (optional): For pagination

**Response:**

```json
{
  "bucket": "3frnt-group6-bytebank",
  "files": [
    {
      "key": "uploads/document1.pdf",
      "lastModified": "2024-01-20T10:30:00.000Z",
      "size": 1024,
      "storageClass": "STANDARD",
      "etag": "\"abc123\""
    }
  ],
  "isTruncated": false,
  "keyCount": 1,
  "prefix": "uploads/"
}
```

### 4. Get File Metadata

**GET** `/s3/file/metadata?bucket=3frnt-group6-bytebank&key=uploads/document.pdf`

Get metadata for a specific file.

**Query Parameters:**

- `bucket` (optional): Bucket name
- `key` (required): File key

**Response:**

```json
{
  "bucket": "3frnt-group6-bytebank",
  "key": "uploads/document.pdf",
  "metadata": {
    "contentType": "application/pdf",
    "contentLength": 1024,
    "lastModified": "2024-01-20T10:30:00.000Z",
    "etag": "\"abc123\"",
    "storageClass": "STANDARD",
    "metadata": {}
  }
}
```

### 5. Health Check

**GET** `/s3/health`

Check S3 connectivity and configuration.

**Response:**

```json
{
  "success": true,
  "message": "S3 connection is healthy",
  "bucket": "3frnt-group6-bytebank",
  "region": "us-east-1"
}
```

## Usage Example

### Frontend Upload Flow

1. **Generate signed URL for upload:**

```javascript
const response = await fetch("/s3/signed-url", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    bucket: "3frnt-group6-bytebank",
    key: `uploads/${Date.now()}_${file.name}`,
    contentType: file.type,
    operation: "putObject",
  }),
});

const { signedUrl } = await response.json();
```

2. **Upload file directly to S3:**

```javascript
await fetch(signedUrl, {
  method: "PUT",
  body: file,
  headers: {
    "Content-Type": file.type,
  },
});
```

3. **Generate signed URL for download:**

```javascript
const response = await fetch("/s3/signed-url", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    bucket: "3frnt-group6-bytebank",
    key: "uploads/document.pdf",
    operation: "getObject",
  }),
});

const { signedUrl } = await response.json();
// Use signedUrl for download
```

## Testing

### Using curl

1. **Generate signed URL:**

```bash
curl -X POST http://localhost:3000/s3/signed-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bucket": "3frnt-group6-bytebank",
    "key": "uploads/test.jpg",
    "contentType": "image/jpeg",
    "operation": "putObject"
  }'
```

2. **Delete file:**

```bash
curl -X DELETE http://localhost:3000/s3/file \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bucket": "3frnt-group6-bytebank",
    "key": "uploads/test.jpg"
  }'
```

3. **List files:**

```bash
curl -X GET "http://localhost:3000/s3/files?prefix=uploads/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Best Practices

1. **Use IAM roles with minimal permissions**
2. **Set appropriate CORS policies**
3. **Use signed URLs with short expiration times (default: 1 hour)**
4. **Validate file types and sizes on the backend**
5. **Implement rate limiting**
6. **Log all S3 operations for auditing**
7. **Use private ACL for uploaded files**
8. **Implement proper error handling**

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid token)
- `404`: Not Found (file doesn't exist)
- `500`: Internal Server Error

Error responses include:

```json
{
  "error": "Error description",
  "details": "Additional error details"
}
```

## Swagger Documentation

The S3 endpoints are documented in Swagger UI at `/docs` when the server is running.

## Project Structure

```
src/
├── controller/
│   └── S3.js                 # S3 controller with endpoint handlers
├── feature/
│   └── S3/
│       ├── generateSignedUrl.js  # Service for signed URL generation
│       ├── deleteS3File.js       # Service for file deletion
│       └── listS3Files.js        # Service for file listing
└── routes.js                 # Route definitions including S3 routes
```
