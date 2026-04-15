import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import mongodbConnect from "./config/mongo.client";
import { pool } from './config/sql.client';

const PORT = process.env.PORT || 3000;

async function start() {
    try{
        const connection = await pool.getConnection();
        try {
            console.log('MySQL connected');
            const [rows] = await connection.query('SELECT NOW()');
            console.log('MySQL NOW():', rows);
        } finally {
            connection.release();
        }
        await mongodbConnect();
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    }
    catch(err) {
        console.error(err);
    }
}

start();