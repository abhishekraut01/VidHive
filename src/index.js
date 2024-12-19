import express from 'express';
import dotenv from 'dotenv'
dotenv.config({
    path :'./.env'
})
const app = express();
import {connectDB} from './db/dbConnect.js'
connectDB()
