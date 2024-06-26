import crypto from 'crypto';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getByToken as get_session_by_token } from '../models/sessions.model';
import {
  getFullUserById as get_full_user_by_id,
  getUserByEmail as get_user_by_email,
  getUsernameEmailById as get_user_by_id,
  getUserByUsername as get_user_by_username,
  getPhoto as get_user_dp,
  removePhoto as remove_user_dp,
  updateUser as update_user,
  uploadPhoto as upload_user_dp,
} from '../models/users.model';
import {
  removeFile as remove_file,
  uploadFile as upload_file,
} from '../util/google_cloud_storage.helper';

const userDPBucket = 'venue-review-user-dp';

const getMyUserProfile = async (req: Request, res: Response) => {
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = (await get_session_by_token(hashedToken)) as string;
  get_full_user_by_id(user_id).then(user => {
    res.status(200).json({
      profile_photo_filename: user?.profile_photo_filename,
      username: user?.username,
      given_name: user?.given_name,
      family_name: user?.family_name,
      email: user?.email
    });
  });
  
}

const updateUser = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = (await get_session_by_token(hashedToken)) as string;

  let user = await get_user_by_id(user_id);
  // Check email, if different to one currently used.
  if (user != null && user.email != req.body.email) {
    // Get user by email from database, to see if there is one already. Fail request if so.
    let userByEmail = await get_user_by_email(req.body.email);
    if (userByEmail != null) {
      res.status(400).json({ status: 400, message: 'Email already in use.' });
      return;
    }
  }
  // Check username, if different to one currently used.
  if (user != null && user.email != req.body.email) {
    // Get user by email from database, to see if there is one already. Fail request if so.
    let userByUsername = await get_user_by_username(req.body.username);
    if (userByUsername != null) {
      res
        .status(400)
        .json({ status: 400, message: 'Username already in use.' });
      return;
    }
  }

  let values = [
    req.body.username,
    req.body.email,
    req.body.given_name,
    req.body.family_name,
    user_id,
  ];
  update_user(values)
    .then(() => {
      res.status(200).json({ status: 200, message: 'OK' });
    })
    .catch((err) => {
      if (err.code == 'ER_DUP_ENTRY') {
        res.status(400).json({
          status: 400,
          message: 'Username or email is not valid, or already in use.',
        });
        return;
      }
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const uploadPhoto = async (req: Request, res: Response) => {
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = (await get_session_by_token(hashedToken)) as string;

  if (req.file == null)
    return res.status(400).json({ status: 400, message: 'No file provided.' });

  let image = req.file.buffer;
  let imageExt = req.file.mimetype.split('/')[1];
  let fileName = `${user_id}.${imageExt}`;

  try {
    upload_file(fileName, image, userDPBucket).then((result) => {
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
    res.status(500).json({ status: 500, message: err });
  }
};

const removePhoto = async (req: Request, res: Response) => {
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = (await get_session_by_token(hashedToken)) as string;

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

export { getMyUserProfile, removePhoto, updateUser, uploadPhoto };

