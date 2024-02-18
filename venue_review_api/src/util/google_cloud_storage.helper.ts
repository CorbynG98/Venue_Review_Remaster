import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
// Configure dotenv so we can load variables from .env file
dotenv.config({ path: '.production.env' });

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const isTest = process.env.NODE_ENV == 'test';

export const uploadFile = async (
  fileName: string,
  fileBuffer: Buffer,
  bucketName: string,
): Promise<string | null> => {
  return new Promise(async (resolve, reject) => {
    // Make sure the bucket we are trying to interact with exists
    try {
      await storage.createBucket(bucketName);
    } catch (err: any) {
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

export const removeFile = async (
  filePath: string,
  bucketName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
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
