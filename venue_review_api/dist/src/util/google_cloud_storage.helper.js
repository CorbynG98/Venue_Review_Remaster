'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.removeFile = exports.uploadFile = void 0;
const storage_1 = require('@google-cloud/storage');
const dotenv_1 = __importDefault(require('dotenv'));
// Configure dotenv so we can load variables from .env file
dotenv_1.default.config({ path: '.production.env' });
const storage = new storage_1.Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const isTest = process.env.NODE_ENV == 'test';
const uploadFile = async (fileName, fileBuffer, bucketName) => {
  return new Promise(async (resolve, reject) => {
    // Make sure the bucket we are trying to interact with exists
    try {
      await storage.createBucket(bucketName);
    } catch (err) {
      // If the bucket already exists, that's fine
      if (err.code !== 409) {
        reject(err);
      }
    }
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    file
      .save(fileBuffer)
      .then(() => {
        resolve(file.metadata.mediaLink ?? null);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
exports.uploadFile = uploadFile;
const removeFile = async (filePath, bucketName) => {
  return new Promise((resolve, reject) => {
    // If there are issues getting the image here, we don't need to throw, just resolve as the image doesn't exist anyway
    try {
      if (!storage.bucket(bucketName).exists()) return resolve();
      if (!storage.bucket(bucketName).file(filePath).exists()) return resolve();
    } catch (err) {
      return resolve();
    }
    storage
      .bucket(bucketName)
      .file(filePath)
      .delete()
      .then(() => {
        return resolve();
      })
      .catch((err) => {
        if (err.code === 404) return resolve(); // Not found doesn't need to be checked further
        return reject(err);
      });
  });
};
exports.removeFile = removeFile;
