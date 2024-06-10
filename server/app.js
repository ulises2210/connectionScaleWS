import express from 'express';
import cors from 'cors';

const serverSky = express();
serverSky.use(cors({
    origin: 'http://localhost:4200', 
    methods: ['GET', 'POST'],
    credentials: true,
}));

export default serverSky;
