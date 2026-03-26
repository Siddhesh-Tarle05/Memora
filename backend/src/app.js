import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors'
import AuthRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import fetchDataRouter from './routes/fetchData.routes.js';
import morgan from 'morgan'
const app=express()
app.set('trust proxy', 1); // Trust first proxy (Railway/Vercel)
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:5173', 'https://memora-blue.vercel.app'];
        const isExtension = origin && (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://'));
        if (!origin || allowedOrigins.includes(origin) || isExtension) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))
app.use("/api/auth",AuthRouter)
app.use('/api/data', fetchDataRouter)
export default app;