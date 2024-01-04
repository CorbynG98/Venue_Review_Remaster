"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./src/config/db");
const express_1 = __importDefault(require("./src/config/express"));
// Configure dotenv so we can load variables from .env file
dotenv_1.default.config({ path: '.production.env' });
// Configure port
const PORT = process.env.PORT || 5000;
// Test connection to MySQL on start-up
async function testDbConnection() {
    try {
        await (0, db_1.createPool)();
        await (0, db_1.getPool)().getConnection((err, connection) => {
            if (err)
                throw err;
            console.log('Database connected!');
            connection.release();
        });
    }
    catch (err) {
        console.error(`Unable to connect to MySQL: ${err?.message ?? err}`);
        process.exit(1);
    }
}
// Test connection, and start server if successful
testDbConnection().then(function () {
    express_1.default.listen(PORT, function () {
        console.log(`Listening on port: ${PORT}`);
    });
});
