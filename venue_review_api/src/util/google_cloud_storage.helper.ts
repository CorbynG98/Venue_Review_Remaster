import { Storage, UploadResponse } from '@google-cloud/storage';
import dotenv from 'dotenv';
// Configure dotenv so we can load variables from .env file
dotenv.config({ path: '.production.env' });

const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const uploadFile = async (filePath: string, bucketName: string): Promise<UploadResponse> => {
    // First try create the bucket
    try {
        await storage.createBucket(bucketName);
    } catch (err: any) {
        // If the bucket already exists, that's fine
        if (err.code !== 409) {
            throw err;
        }
    }

    // upload file to bucket with public access
    return storage.bucket(bucketName).upload(filePath);
};

export const removeFile = async (filePath: string, bucketName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!storage.bucket(bucketName).exists()) return resolve();
        if (!storage.bucket(bucketName).file(filePath).exists()) return resolve();

        try {
            storage.bucket(bucketName).file(filePath).delete();
            resolve()
        } catch (err) {
            return reject(err);
        }
    });
};
