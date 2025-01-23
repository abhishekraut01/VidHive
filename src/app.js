import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//import all the router
import userRouter from './routes/user.routes.js';
import globalErrorHandler from './middlewares/globelErrorHandler.middleware.js';

//use all the routers
app.use('/api/v1/users', userRouter);

app.use(globalErrorHandler);

export default app;
