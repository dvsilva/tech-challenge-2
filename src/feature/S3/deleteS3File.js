const AWS = require("aws-sdk");

/**
 * Service for deleting files from S3
 */
class DeleteS3FileService {
  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || "us-east-1",
      signatureVersion: "v4",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  /**
   * Delete a file from S3 bucket
   * @param {Object} params - Parameters for file deletion
   * @param {string} params.bucket - S3 bucket name
   * @param {string} params.key - Object key in S3
   * @returns {Promise<Object>} Deletion result
   */
  async execute({ bucket, key }) {
    try {
      // Validate inputs
      if (!bucket || !key) {
        throw new Error("Missing required parameters: bucket and key");
      }

      const params = {
        Bucket: bucket,
        Key: key,
      };

      // Check if file exists before deletion
      try {
        await this.s3.headObject(params).promise();
      } catch (error) {
        if (error.code === "NotFound") {
          return {
            success: false,
            error: "File not found",
            code: "FILE_NOT_FOUND",
          };
        }
        throw error;
      }

      // Delete the file
      await this.s3.deleteObject(params).promise();

      return {
        success: true,
        data: {
          message: "File deleted successfully",
          bucket,
          key,
        },
      };
    } catch (error) {
      console.error("Error in DeleteS3FileService:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = DeleteS3FileService;
