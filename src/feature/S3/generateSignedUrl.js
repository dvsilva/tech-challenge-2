const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

/**
 * Service for generating S3 signed URLs
 */
class GenerateSignedUrlService {
  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || "us-east-1",
      signatureVersion: "v4",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  /**
   * Generate a signed URL for S3 operations
   * @param {Object} params - Parameters for URL generation
   * @param {string} params.bucket - S3 bucket name
   * @param {string} params.key - Object key in S3
   * @param {string} params.contentType - Content type for upload operations
   * @param {string} params.operation - S3 operation (putObject or getObject)
   * @param {number} params.expiresIn - URL expiration time in seconds (default: 3600)
   * @param {string} params.originalFileName - Original filename for upload operations (optional)
   * @returns {Promise<Object>} Signed URL and metadata
   */
  async execute({
    bucket,
    key,
    contentType,
    operation,
    expiresIn = 3600,
    originalFileName,
  }) {
    try {
      // Validate inputs
      if (!bucket || !key || !operation) {
        throw new Error(
          "Missing required parameters: bucket, key, and operation"
        );
      }

      const validOperations = ["putObject", "getObject"];
      if (!validOperations.includes(operation)) {
        throw new Error("Invalid operation. Must be putObject or getObject");
      }

      if (operation === "putObject" && !contentType) {
        throw new Error("contentType is required for putObject operation");
      }

      let finalKey = key;

      // Generate unique filename for upload operations
      if (operation === "putObject") {
        const uniqueId = uuidv4();

        // Extract extension from original filename or key
        let extension = "";
        if (originalFileName) {
          const parts = originalFileName.split(".");
          if (parts.length > 1) {
            extension = "." + parts.pop();
          }
        } else if (key.includes(".")) {
          const parts = key.split(".");
          if (parts.length > 1) {
            extension = "." + parts.pop();
          }
        }

        // Generate unique filename with UUID
        const uniqueFileName = `${uniqueId}${extension}`;

        // Keep the uploads/ prefix if it exists in the original key
        const keyParts = key.split("/");
        if (keyParts.length > 1) {
          keyParts[keyParts.length - 1] = uniqueFileName;
          finalKey = keyParts.join("/");
        } else {
          finalKey = `uploads/${uniqueFileName}`;
        }
      }

      const params = {
        Bucket: bucket,
        Key: finalKey,
        Expires: expiresIn,
      };

      // Add content type and ACL for upload operations
      if (operation === "putObject") {
        params.ContentType = contentType;
        params.ACL = "private";
      }

      const signedUrl = await this.s3.getSignedUrlPromise(operation, params);

      return {
        success: true,
        data: {
          signedUrl,
          key: finalKey,
          originalKey: key,
          bucket,
          operation,
          expiresIn,
          contentType: operation === "putObject" ? contentType : undefined,
          originalFileName: originalFileName || undefined,
        },
      };
    } catch (error) {
      console.error("Error in GenerateSignedUrlService:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = GenerateSignedUrlService;
