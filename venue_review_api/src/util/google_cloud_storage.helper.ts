import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
// Configure dotenv so we can load variables from .env file
dotenv.config({ path: '.production.env' });

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

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
