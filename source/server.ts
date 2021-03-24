import http from 'http';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import usersRoutes from './routes/users';
import emailerRoutes from './routes/emailer';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const NAMESPACE = 'Server';
const router = express();

/** Log the request */
router.use((req, res, next) => {
    /** Log the req */
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.use(helmet());
router.use(cors());

/** Routes go here */
router.use('/users', usersRoutes);
router.use('/sendEmail', emailerRoutes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(router);

httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running ${config.server.hostname}:${config.server.port}`));
