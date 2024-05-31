import express from 'express';
import cors from 'cors';

const serverSky = new express();
serverSky.use(cors({
    origin: 'http://localhost:4200/#/sky/yarn/bobinas-cortas', 
    methods: ['GET', 'POST'],
    credentials: true,
}))

export default serverSky
