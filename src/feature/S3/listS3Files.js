const AWS = require("aws-sdk");

/**
 * Service for listing files from S3 bucket
 */
class ListS3FilesService {
  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || "us-east-1",
      signatureVersion: "v4",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  /**
   * List files from S3 bucket
   * @param {Object} params - Parameters for listing files
   * @param {string} params.bucket - S3 bucket name
   * @param {string} params.prefix - Prefix to filter files (optional)
   * @param {number} params.maxKeys - Maximum number of files to return (default: 100)
   * @param {string} params.continuationToken - Token for pagination (optional)
   * @returns {Promise<Object>} List of files
   */
  async execute({ bucket, prefix, maxKeys = 100, continuationToken }) {
    try {
      // Validate inputs
      if (!bucket) {
        throw new Error("Missing required parameter: bucket");
      }

      const params = {
        Bucket: bucket,
        MaxKeys: Math.min(maxKeys, 1000), // AWS limit is 1000
      };

      if (prefix) {
        params.Prefix = prefix;
      }

      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      const data = await this.s3.listObjectsV2(params).promise();

      const files = data.Contents.map((file) => ({
        key: file.Key,
        lastModified: file.LastModified,
        size: file.Size,
        storageClass: file.StorageClass,
        etag: file.ETag,
      }));

      return {
        success: true,
        data: {
          bucket,
          files,
          isTruncated: data.IsTruncated,
          keyCount: data.KeyCount,
          nextContinuationToken: data.NextContinuationToken,
          prefix: prefix || null,
        },
      };
    } catch (error) {
      console.error("Error in ListS3FilesService:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = ListS3FilesService;
