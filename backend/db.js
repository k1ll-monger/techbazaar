import pg from 'pg';
import dotenv from 'dotenv';
import {Pool} from 'pg';

dotenv.config();

const db = new Pool({
    connectionString : process.env.DB_URL
})

export default db;

