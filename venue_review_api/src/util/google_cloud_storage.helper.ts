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
  filePath: string,
  bucketName: string,
): Promise<string | null> => {
  return new Promise(async (resolve, reject) => {
    if (isTest) {
      var filePathSplit = filePath.split(`\\${bucketName}\\`);
      return resolve(filePathSplit[1]); // On test mode, don't actually call google. Just mimic a success
    }

    try {
      await storage.createBucket(bucketName);
    } catch (err: any) {
      // If the bucket already exists, that's fine
      if (err.code !== 409) {
        reject(err);
      }
    }

    storage
      .bucket(bucketName)
      .upload(filePath)
      .then((result) => {
        resolve(result[0].metadata.mediaLink ?? null);
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
