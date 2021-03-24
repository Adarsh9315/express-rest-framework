import express from 'express';
import controller from '../controllers/emailer';
import { body } from 'express-validator';

const router = express.Router();

router.post('/emailConfirmation', [body('email').isEmail()], controller.emailConfirmation);

export = router;
