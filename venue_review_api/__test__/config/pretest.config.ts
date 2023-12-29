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

const resetDatabase = () => {
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

module.exports = async () => await resetDatabase();
