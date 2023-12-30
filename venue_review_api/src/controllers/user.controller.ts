import crypto from 'crypto';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getByToken as get_session_by_token } from '../models/sessions.model';
import { getPhoto as get_user_dp, removePhoto as remove_user_dp, uploadPhoto as upload_user_dp } from '../models/users.model';
import { removeFile as remove_file, uploadFile as upload_file } from '../util/google_cloud_storage.helper';

const updateUser = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const getPhoto = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const uploadPhoto = async (req: Request, res: Response) => {
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = await get_session_by_token(hashedToken);

  let image = req.body;
  let imageExt = (
    req.header('content-type')?.split('/')[1] ?? 'png'
  ).toLowerCase();

  let bucket = 'venue-review-user-dp';
  let fileName = `${user_id}.${imageExt}`;

  let imageDIR = './venue-review-user-dp';
  if (!fs.existsSync(imageDIR)) {
    fs.mkdirSync(imageDIR);
  }

  try {
    fs.writeFileSync(`${imageDIR}/${fileName}`, image);
    let filePath = path.resolve(`${imageDIR}/${fileName}`);
    upload_file(filePath, bucket).then((result) => {
      fs.rmdirSync(imageDIR, { recursive: true }); // Delete the local file now that storage upload succeeded
      let values = [
        result[0].metadata.selfLink ?? null,
        user_id
      ]
      upload_user_dp(values).then(() => {
        res.status(201).json({ status: 201, message: result[0].metadata.selfLink ?? null, });
      }).catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
      })
    })
  } catch (err) {
    fs.rmdirSync(imageDIR, { recursive: true }); // Delete the local file, we had a failure, and don't want these to hang around.
    res.status(500).json({ status: 500, message: err });
  }
};

const removePhoto = async (req: Request, res: Response) => {
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = await get_session_by_token(hashedToken);

  // Get the users current dp from database
  get_user_dp(user_id).then((result) => {
    // If the user doesn't have a dp, we don't need to do anything.
    if (result == null) {
      return res.status(200).json({ status: 200, message: 'No profile photo to remove.' });
    }
    // Get extension from the current DP.
    let resultSplit = result.split('/');
    let fileName = resultSplit[resultSplit.length - 1]?.toLowerCase();

    // If the user does have a dp, we need to remove it from storage and update the database.
    let bucket = 'venue-review-user-dp';
    remove_file(fileName, bucket).then(() => {
      remove_user_dp(user_id).then(() => {
        res.status(204).json({ status: 204, message: 'No Content.' });
      }).catch((err) => {
        console.log(err);
        res.status(500).json({ status: 500, message: err?.code ?? err });
      })
    })
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ status: 500, message: err?.code ?? err });
  });
};

export { getPhoto, removePhoto, updateUser, uploadPhoto };

