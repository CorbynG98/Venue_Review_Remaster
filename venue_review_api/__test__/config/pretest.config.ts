import bcrypt from 'bcrypt';
import fs from 'fs';
import { createPool, getPool } from '../../src/config/db';

if (process.env.NODE_ENV !== 'test') {
  throw new Error('ENVIRONMENT NOT SET TO TEST. FAILING WITH ERROR.');
}

// Load in test environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.test.env' });

// Test connection to MySQL on test run
const testDbConnection = () => {
  return new Promise<void>((resolve, reject) => {
    createPool()
      .then(() => {
        getPool().getConnection((err, connection) => {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            console.log('Database connected!');
            connection.release();
            return resolve();
          }
        });
      })
      .catch((err) => {
        console.error(`Unable to connect to MySQL: ${err?.message ?? err}`);
        return reject();
      });
  });
};

const rebuildDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    fs.readFile(
      'resources/database/test/create_test_database.sql',
      (read_err, read_result) => {
        if (read_err) {
          console.log('Unable to read create_database.sql');
          return reject();
        }
        // Run sql from above file on database
        getPool().query(read_result.toString(), (query_err, query_result) => {
          if (query_err) {
            console.log(`Database could not be reset: ${query_err}`);
            return reject();
          }
          console.log('Database reset! Sampling with test data...');
          return resolve();
        });
      },
    );
  });
};

const resampleDatabase = (sampleFileName: string) => {
  return new Promise<void>((resolve, reject) => {
    // Read sample database sql file.
    fs.readFile(sampleFileName, (read_err, read_result) => {
      if (read_err) {
        console.log(`Unable to read ${sampleFileName}`);
        return reject();
      }
      // Run sql from above file on database
      getPool().query(read_result.toString(), (query_err, query_result) => {
        if (query_err) {
          console.log(`Database could not be sampled: ${query_err}`);
          return reject();
        }
        console.log(`Database sampled with ${sampleFileName}.`);
        return resolve();
      });
    });
  });
};

const resetDatabase = (doUserSampleRebuild = false) => {
  return new Promise<void>((resolve, reject) => {
    console.log('\nResetting database...');
    // Test connection to database
    testDbConnection()
      .then(() => rebuildDatabase())
      .then(() =>
        resampleDatabase(
          'resources/database/test/sample_data/resample_venue_category.sql',
        ),
      )
      .then(() => {
        // Probably only set this if we change our password hashing in some way, so we can get a new list users with up to date hashes
        // We are using slow hashing, so it takes some time to generate all the samples. And it's not necessary to do every time.
        if (doUserSampleRebuild) {
          buildUserSqlResampleCode();
        } else {
          resolve();
        }
      })
      .then(() =>
        resampleDatabase(
          'resources/database/test/sample_data/resample_users.sql',
        ),
      )
      .then(() =>
        resampleDatabase(
          'resources/database/test/sample_data/resample_venue.sql',
        ),
      )
      .then(() =>
        resampleDatabase(
          'resources/database/test/sample_data/resample_venue_photo.sql',
        ),
      )
      .then(() =>
        resampleDatabase(
          'resources/database/test/sample_data/resample_review.sql',
        ),
      )
      .then(() => {
        console.log('Ready to run tests.');
        return resolve();
      })
      .catch(() => {
        return reject();
      });
  });
};

interface DefaultUsers {
  properties: string[];
  usersData: string[][];
}

const buildUserSqlResampleCode = () => {
  return new Promise<void>((resolve, reject) => {
    // Read sample database sql file.
    fs.readFile(
      'resources/database/test/default_users.json',
      (read_err, read_result) => {
        if (read_err) {
          console.log(
            `Unable to read 'resources/database/test/default_users.json'`,
          );
          return reject();
        }

        const defaultUsers = JSON.parse(read_result.toString()) as DefaultUsers;
        let SQLStatement =
          'use venue_review_remaster_test;\n\nINSERT INTO User\n\t(user_id, username, email, given_name, family_name, password)\nVALUES\n\t';
        // Create an array of promises
        let hashPromises = defaultUsers.usersData.map((user) => {
          return bcrypt.hash(user[5], 13).then((result) => {
            return `('${user[0]}', '${user[1]}', '${user[2]}', '${user[3]}', '${user[4]}', '${result}'),\n\t`;
          });
        });

        // Wait for all hash operations to complete
        Promise.all(hashPromises)
          .then((hashResults) => {
            SQLStatement += hashResults.join('');
            let pos = SQLStatement.lastIndexOf(',\n\t');
            SQLStatement = SQLStatement.substring(0, pos) + ';';

            try {
              fs.writeFileSync(
                'resources/database/test/sample_data/resample_users.sql',
                SQLStatement,
              );
              console.log('Users sample file has been regenerated.');
              return resolve();
            } catch (write_err) {
              console.error('Error writing users sample file: ', write_err);
              return reject();
            }
          })
          .catch((error) => {
            console.error('Error generating hashes: ', error);
            reject(error);
          });
      },
    );
  });
};

module.exports = async () => await resetDatabase();
