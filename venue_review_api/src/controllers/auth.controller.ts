import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import {
  createSession as create_session,
  removeSession as remove_session,
} from '../models/sessions.model';
import {
  createUser as create_user,
  getUserByEmail as get_user_by_email,
  getUserByUsername as get_user_by_username,
} from '../models/users.model';

function testEmail(email: string) {
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const login = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }

  let isEmailLogin = testEmail(req.body.username);

  try {
    // Get user data by email or username, depending on what the user entered for login
    let userData = isEmailLogin
      ? await get_user_by_email(req.body.username)
      : await get_user_by_username(req.body.username);

    if (userData == null || userData.user_id == null) {
      res
        .status(401)
        .json({ status: 401, message: 'Invalid username or password' });
      return;
    }

    bcrypt.compare(req.body.password, userData.password).then((result) => {
      if (!result) {
        res
          .status(401)
          .json({ status: 401, message: 'Invalid username or password' });
        return;
      }
      let token = crypto
        .createHash('sha512')
        .update(uuidv4().replace(/-/g, ''))
        .digest('hex');
      let hashedToked = crypto.createHash('sha512').update(token).digest('hex');
      let session_values = [
        uuidv4().replace(/-/g, ''),
        hashedToked,
        new Date(),
        null,
        userData?.user_id ?? null,
      ];
      create_session(session_values).then(() => {
        res.status(200).json({
          username: req.body.username,
          token: token,
          fullName: userData?.given_name + ' ' + userData?.family_name,
          profile_photo_filename: userData?.profile_photo_filename,
        });
      });
    });
  } catch (err) {
    console.error('err', err);
    res.status(500).json({ status: 500, message: err });
  }
};

const create = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }

  let user = await get_user_by_email(req.body.email);
  // Check email, if different to one currently used.
  if (user != null) {
    res.status(400).json({ status: 400, message: 'Email already in use.' });
    return;
  }
  user = await get_user_by_username(req.body.username);
  // Check email, if different to one currently used.
  if (user != null) {
    res.status(400).json({ status: 400, message: 'Username already in use.' });
    return;
  }

  let user_id = uuidv4().replace(/-/g, '');

  let user_values = [
    user_id,
    req.body.username,
    req.body.email,
    req.body.givenName,
    req.body.familyName,
  ];

  bcrypt
    .hash(req.body.password, 13)
    .then((result) => {
      user_values.push(result);
      create_user(user_values)
        .then(() => {
          // Do login here now too, I guess?
          let token = crypto
            .createHash('sha512')
            .update(uuidv4().replace(/-/g, ''))
            .digest('hex');
          let hashedToked = crypto
            .createHash('sha512')
            .update(token)
            .digest('hex');
          let session_values = [
            uuidv4().replace(/-/g, ''),
            hashedToked,
            new Date(),
            null,
            user_id,
          ];
          create_session(session_values).then(() => {
            res.status(200).json({
              username: req.body.username,
              token: token,
              fullName: req.body.givenName + ' ' + req.body.familyName,
            });
          });
        })
        .catch((err) => {
          if (err.code == 'ER_DUP_ENTRY') {
            return res
              .status(400)
              .json({ status: 400, message: 'User already exists' });
          }
          res.status(500).json({ status: 500, message: err?.code ?? err });
        });
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const signout = async (req: Request, res: Response) => {
  let token = req.header('Authorization');
  // Technically shouldn't be possible, but typescript doesn't know I have auth middleware to handle this case.
  // Only here to get rid of typescript warnings
  if (token == null)
    return res.status(401).json({ status: 401, message: 'No token provided' });

  remove_session(token)
    .then(() => {
      res.status(204).json();
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

export { create, login, signout };
