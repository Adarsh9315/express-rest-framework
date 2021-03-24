import { NextFunction, Request, Response } from 'express';
import logging from '../config/logging';
import { Connect, Query } from '../config/mysql';
import validateHeaders from '../config/headers';
import { validationResult } from 'express-validator';
const NAMESPACE = 'Users';

const register = async (req: Request, res: Response, next: NextFunction) => {
    if (validateHeaders(req.headers.authtoken)) {
        logging.info(NAMESPACE, 'checking headers');
        return res.status(200).json({
            message: 'Invalid authToken',
            status: 0
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    logging.info(NAMESPACE, 'Inserting user');

    let { email, password, userName } = req.body;
    const time: number = Math.floor(Date.now() / 1000);
    let query = `INSERT INTO user_master (email, password, userName, createdOn, updatedOn) VALUES ("${email}", AES_ENCRYPT("${password}", "${process.env.AES_KEY}"), "${userName}", ${time}, ${time})`;

    Connect()
        .then((connection) => {
            Query(connection, query)
                .then((result) => {
                    logging.info(NAMESPACE, 'User created: ', result);

                    return res.status(200).json({
                        status: 1,
                        message: 'User Registred Succefully',
                        result
                    });
                })
                .catch((error) => {
                    logging.error(NAMESPACE, error.message, error);

                    return res.status(200).json({
                        message: error.message,
                        status: 0,
                        error
                    });
                })
                .finally(() => {
                    logging.info(NAMESPACE, 'Closing connection.');
                    connection.end();
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, error.message, error);

            return res.status(200).json({
                message: error.message,
                status: 0,
                error
            });
        });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    if (validateHeaders(req.headers.authtoken)) {
        logging.info(NAMESPACE, 'checking headers');
        return res.status(200).json({
            message: 'Invalid authToken',
            status: 0
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { email, password } = req.body;
    let query = `SELECT um.email, um.userName FROM user_master um WHERE um.email ="${email}" AND um.password = AES_ENCRYPT("${password}", "${process.env.AES_KEY}")`;

    Connect()
        .then((connection) => {
            Query(connection, query)
                .then((result: any) => {
                    logging.info(NAMESPACE, 'Retrieved user: ', result);
                    if (result.length > 0) {
                        return res.status(200).json({
                            status: 1,
                            message: 'User Data Found',
                            result
                        });
                    } else {
                        return res.status(200).json({
                            status: 0,
                            message: 'Invalid email or password'
                        });
                    }
                })
                .catch((error) => {
                    logging.error(NAMESPACE, error.message, error);

                    return res.status(200).json({
                        message: error.message,
                        error
                    });
                })
                .finally(() => {
                    logging.info(NAMESPACE, 'Closing connection.');
                    connection.end();
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, error.message, error);

            return res.status(200).json({
                message: error.message,
                error
            });
        });
};

const checkOtp = async (req: Request, res: Response, next: NextFunction) => {
    if (validateHeaders(req.headers.authtoken)) {
        logging.info(NAMESPACE, 'checking headers');
        return res.status(200).json({
            message: 'Invalid authToken',
            status: 0
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { email, otp } = req.body;
    let query = `SELECT email, mobile FROM otp WHERE otp = '${otp}' AND email = '${email}'`;

    Connect()
        .then((connection) => {
            Query(connection, query)
                .then((result: any) => {
                    logging.info(NAMESPACE, 'Retrieved otp: ', result);
                    if (result.length > 0) {
                        return res.status(200).json({
                            status: 1,
                            message: 'Valid OTP',
                            result
                        });
                    } else {
                        return res.status(200).json({
                            status: 0,
                            message: 'Invalid OTP'
                        });
                    }

                })
                .catch((error) => {
                    logging.error(NAMESPACE, error.message, error);

                    return res.status(200).json({
                        message: error,
                        error
                    });
                })
                .finally(() => {
                    logging.info(NAMESPACE, 'Closing connection.');
                    connection.end();
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, error.message, error);

            return res.status(200).json({
                message: error,
                error
            });
        });
};
export default { register, login, checkOtp };
