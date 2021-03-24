import { NextFunction, Request, Response } from 'express';
import logging from '../config/logging';
import { Connect, Query } from '../config/mysql';
import validateHeaders from '../config/headers';
import nodemailer from "nodemailer";
import { Result, validationResult } from 'express-validator';
import randomString from '../common/common'
const NAMESPACE = 'Emailer';


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: "adarshkumar9315@gmail.com",
        pass: "shoekonnect"
    }
});



const emailConfirmation = async (req: Request, res: Response, next: NextFunction) => {
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
    let { email } = req.body;
    const time: number = Math.floor(Date.now() / 1000);
    const rand = randomString(64, '#A!');

    let query = `SELECT email, mobile FROM otp WHERE email ="${email}"`;
    Connect()
        .then((connection) => {
            Query(connection, query)
                .then((result: any) => {
                    if (result.length > 0) {
                        Connect()
                            .then((connection) => {
                                Query(connection, `UPDATE otp SET accessToken = '${rand}' WHERE email ="${email}"`)
                                    .then((result: any) => {
                                        console.log(result);
                                    })
                                    .catch((error) => {
                                        return res.status(200).json({
                                            message: error.message,
                                            status: 0,
                                            error
                                        });
                                    })
                                    .finally(() => {
                                        connection.end();
                                    });
                            })
                            .catch((error) => {
                                return res.status(200).json({
                                    message: error.message,
                                    status: 0,
                                    error
                                });
                            });
                    } else {
                        Connect()
                            .then((connection) => {
                                Query(connection, `INSERT INTO otp (email, accessToken, countryCode, createdOn) VALUES ('${email}', '${rand}', '91', ${time})`)
                                    .then((result: any) => {
                                        console.log(result);
                                    })
                                    .catch((error) => {
                                        return res.status(200).json({
                                            message: error.message,
                                            status: 0,
                                            error
                                        });
                                    })
                                    .finally(() => {
                                        connection.end();
                                    });
                            })
                            .catch((error) => {
                                return res.status(200).json({
                                    message: error.message,
                                    status: 0,
                                    error
                                });
                            });
                    }
                })
                .catch((error) => {
                    return res.status(200).json({
                        message: error.message,
                        status: 0,
                        error
                    });
                })
                .finally(() => {
                    connection.end();
                });
        })
        .catch((error) => {
            return res.status(200).json({
                message: error.message,
                status: 0,
                error
            });
        });

    console.log("request came");

    const link = `http://localhost:4200/verify_email/?id=${rand}`
    const mailOptions = {
        from: '"Leagues of Games Team" <adarshkumar9315@gmail.com>',
        to: email,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
    };
    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.log(error);
            res.status(400).json({ payload: error, status: 0 });
        } else {
            console.log('Message sent: %s', info.messageId);
            res.status(200).json({ payload: info, status: 1 });
        }
    });

};


export default { emailConfirmation };
