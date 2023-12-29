import dotenv from 'dotenv';
import { createPool, getPool } from './src/config/db';
import app from './src/config/express';
// Configure dotenv so we can load variables from .env file
dotenv.config({ path: '.production.env' });
// Configure port
const PORT = process.env.PORT || 5000;

// Test connection to MySQL on start-up
async function testDbConnection() {
  try {
    await createPool();
    await getPool().getConnection((err, connection) => {
      if (err) throw err;
      console.log('Database connected!');
      connection.release();
    });
  } catch (err: any) {
    console.error(`Unable to connect to MySQL: ${err?.message ?? err}`);
    process.exit(1);
  }
}

// Test connection, and start server if successful
testDbConnection().then(function () {
  app.listen(PORT, function () {
    console.log(`Listening on port: ${PORT}`);
  });
});
