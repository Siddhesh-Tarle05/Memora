import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors'
import AuthRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import fetchDataRouter from './routes/fetchData.routes.js';
import morgan from 'morgan'
const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use("/api/auth",AuthRouter)
app.use('/api/data', fetchDataRouter)
export default app;