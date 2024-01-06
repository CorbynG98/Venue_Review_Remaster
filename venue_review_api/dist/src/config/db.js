"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = exports.createPool = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
let pool;
const createPool = async () => {
    pool = mysql2_1.default.createPool({
        multipleStatements: true,
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });
};
exports.createPool = createPool;
const getPool = () => {
    return pool;
};
exports.getPool = getPool;
