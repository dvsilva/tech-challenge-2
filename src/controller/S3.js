const AWS = require("aws-sdk");
const GenerateSignedUrlService = require("../feature/S3/generateSignedUrl");
const DeleteS3FileService = require("../feature/S3/deleteS3File");
const ListS3FilesService = require("../feature/S3/listS3Files");

class S3Controller {
  constructor() {
    // Configure AWS S3
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || "us-east-1",
      signatureVersion: "v4",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.bucketName = process.env.S3_BUCKET_NAME || "3frnt-group6-bytebank";
    this.signedUrlExpires = parseInt(process.env.S3_SIGNED_URL_EXPIRES) || 3600;

    // Initialize services
    this.generateSignedUrlService = new GenerateSignedUrlService();
    this.deleteS3FileService = new DeleteS3FileService();
    this.listS3FilesService = new ListS3FilesService();
  }

  /**
   * Generate signed URL for S3 operations
   */
  async generateSignedUrl(req, res) {
    try {
      const { bucket, key, contentType, operation, originalFileName } =
        req.body;

      const result = await this.generateSignedUrlService.execute({
        bucket,
        key,
        contentType,
        operation,
        originalFileName,
      });

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error("Error in generateSignedUrl controller:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(req, res) {
    try {
      const { bucket, key } = req.body;

      const result = await this.deleteS3FileService.execute({
        bucket,
        key,
      });

      if (result.success) {
        res.json(result.data);
      } else {
        const statusCode = result.code === "FILE_NOT_FOUND" ? 404 : 400;
        res.status(statusCode).json({ error: result.error });
      }
    } catch (error) {
      console.error("Error in deleteFile controller:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  /**
   * List files in S3 bucket with optional prefix
   */
  async listFiles(req, res) {
    try {
      const { bucket, prefix, maxKeys, continuationToken } = req.query;
      const bucketToUse = bucket || this.bucketName;

      const result = await this.listS3FilesService.execute({
        bucket: bucketToUse,
        prefix,
        maxKeys: maxKeys ? parseInt(maxKeys) : undefined,
        continuationToken,
      });

      if (result.success) {
        res.json(result.data);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error("Error in listFiles controller:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(req, res) {
    try {
      const { bucket, key } = req.query;

      if (!key) {
        return res.status(400).json({
          error: "Missing required parameter: key",
        });
      }

      const bucketToUse = bucket || this.bucketName;

      const params = {
        Bucket: bucketToUse,
        Key: key,
      };

      const data = await this.s3.headObject(params).promise();

      res.json({
        success: true,
        bucket: bucketToUse,
        key,
        metadata: {
          contentType: data.ContentType,
          contentLength: data.ContentLength,
          lastModified: data.LastModified,
          etag: data.ETag,
          storageClass: data.StorageClass,
          metadata: data.Metadata,
        },
      });
    } catch (error) {
      console.error("Error getting file metadata:", error);
      if (error.code === "NotFound") {
        return res.status(404).json({
          error: "File not found",
          bucket: bucket || this.bucketName,
          key,
        });
      }
      res.status(500).json({
        error: "Failed to get file metadata",
        details: error.message,
      });
    }
  }

  /**
   * Health check for S3 connectivity
   */
  async healthCheck(req, res) {
    try {
      const params = {
        Bucket: this.bucketName,
      };

      await this.s3.headBucket(params).promise();

      res.json({
        success: true,
        message: "S3 connection is healthy",
        bucket: this.bucketName,
        region: this.s3.config.region,
      });
    } catch (error) {
      console.error("S3 health check failed:", error);
      res.status(500).json({
        success: false,
        error: "S3 connection failed",
        details: error.message,
      });
    }
  }
}

module.exports = S3Controller;
