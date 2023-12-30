"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFile = exports.uploadFile = void 0;
const storage_1 = require("@google-cloud/storage");
const dotenv_1 = __importDefault(require("dotenv"));
// Configure dotenv so we can load variables from .env file
dotenv_1.default.config({ path: '.production.env' });
const storage = new storage_1.Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const uploadFile = async (filePath, bucketName) => {
    // First try create the bucket
    try {
        await storage.createBucket(bucketName);
    }
    catch (err) {
        // If the bucket already exists, that's fine
        if (err.code !== 409) {
            throw err;
        }
    }
    // upload file to bucket with public access
    return storage.bucket(bucketName).upload(filePath);
};
exports.uploadFile = uploadFile;
const removeFile = async (filePath, bucketName) => {
    return new Promise((resolve, reject) => {
        if (!storage.bucket(bucketName).exists())
            return resolve();
        if (!storage.bucket(bucketName).file(filePath).exists())
            return resolve();
        try {
            storage.bucket(bucketName).file(filePath).delete();
            resolve();
        }
        catch (err) {
            return reject(err);
        }
    });
};
exports.removeFile = removeFile;
