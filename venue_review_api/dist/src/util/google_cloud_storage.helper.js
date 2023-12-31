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
const uploadFile = async (filePath, bucketName) => {
  return new Promise(async (resolve, reject) => {
    if (isTest) {
      var filePathSplit = filePath.split(`\\${bucketName}\\`);
      return resolve(filePathSplit[1]); // On test mode, don't actually call google. Just mimic a success
    }
    try {
      await storage.createBucket(bucketName);
    } catch (err) {
      // If the bucket already exists, that's fine
      if (err.code !== 409) {
        reject(err);
      }
    }
    storage
      .bucket(bucketName)
      .upload(filePath)
      .then((result) => {
        resolve(result[0].metadata.selfLink ?? null);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
exports.uploadFile = uploadFile;
const removeFile = async (filePath, bucketName) => {
  return new Promise((resolve, reject) => {
    if (isTest) return resolve(); // On test mode, don't actually call google. Just mimic a success
    if (!storage.bucket(bucketName).exists()) return resolve();
    if (!storage.bucket(bucketName).file(filePath).exists()) return resolve();
    try {
      storage.bucket(bucketName).file(filePath).delete();
      resolve();
    } catch (err) {
      return reject(err);
    }
  });
};
exports.removeFile = removeFile;
