import express from 'express';
import mongoose from  'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO)
                .then(()=>{
                    console.log("MongoDB is connected!");
                });

app.listen( port, ()=>{
    console.log("server is listening on port: "+ port);
})

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
    const statusCode =  err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success:false,
        statusCode,
        message
    })
});