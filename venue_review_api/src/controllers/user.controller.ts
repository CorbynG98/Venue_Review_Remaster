import crypto from 'crypto';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getByToken as get_session_by_token } from '../models/sessions.model';
import {
  getPhoto as get_user_dp,
  removePhoto as remove_user_dp,
  uploadPhoto as upload_user_dp,
} from '../models/users.model';
import {
  removeFile as remove_file,
  uploadFile as upload_file,
} from '../util/google_cloud_storage.helper';

const userDPBucket = 'venue-review-user-dp';

const updateUser = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const uploadPhoto = async (req: Request, res: Response) => {
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = await get_session_by_token(hashedToken);

  if (req.file == null)
    return res.status(400).json({ status: 400, message: 'No file provided.' });

  let image = req.file.buffer;
  let imageExt = req.file.mimetype.split('/')[1];
  let fileName = `${user_id}.${imageExt}`;

  let imageDIR = `./${userDPBucket}`;
  if (!fs.existsSync(imageDIR)) {
    fs.mkdirSync(imageDIR);
  }

  try {
    fs.writeFileSync(`${imageDIR}/${fileName}`, image);
    let filePath = path.resolve(`${imageDIR}/${fileName}`);
    upload_file(filePath, userDPBucket).then((result) => {
      fs.rmSync(imageDIR, { recursive: true }); // Delete the local file now that storage upload succeeded
      let values = [result, user_id];
      upload_user_dp(values)
        .then(() => {
          res.status(201).json({ status: 201, message: result });
        })
        .catch((err) => {
          res.status(500).json({ status: 500, message: err?.code ?? err });
        });
    });
  } catch (err) {
    fs.rmSync(imageDIR, { recursive: true }); // Delete the local file, we had a failure, and don't want these to hang around.
    res.status(500).json({ status: 500, message: err });
  }
};

const removePhoto = async (req: Request, res: Response) => {
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = await get_session_by_token(hashedToken);

  // Get the users current dp from database
  get_user_dp(user_id)
    .then((result) => {
      // If the user doesn't have a dp, we don't need to do anything.
      if (result == null) {
        return res
          .status(200)
          .json({ status: 200, message: 'No profile photo to remove.' });
      }
      // Get extension from the current DP.
      let resultSplit = result.split('/');
      let fileName = resultSplit[resultSplit.length - 1]?.toLowerCase();

      // If the user does have a dp, we need to remove it from storage and update the database.
      remove_file(fileName, userDPBucket).then(() => {
        remove_user_dp(user_id)
          .then(() => {
            res.status(204).json({ status: 204, message: 'No Content.' });
          })
          .catch((err) => {
            res.status(500).json({ status: 500, message: err?.code ?? err });
          });
      });
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

export { removePhoto, updateUser, uploadPhoto };
