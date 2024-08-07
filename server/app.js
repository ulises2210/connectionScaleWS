import express from 'express';
import cors from 'cors';

const serverSky = express();
serverSky.use(cors({
    origin: 'https://skynet.skytex.com.mx:8195/#/sky/yarn/',
    methods: ['GET', 'POST'],
    credentials: true,
}));

export default serverSky;