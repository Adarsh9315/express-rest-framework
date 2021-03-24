import express from 'express';
import controller from '../controllers/users';
import { body } from 'express-validator';

const router = express.Router();

router.post('/register', [body('userName').isLength({ min: 3 }), body('email').isEmail(), body('password').isLength({ min: 8 })], controller.register);
router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 8 })], controller.login);
router.post('/checkOtp', [body('email').isEmail(), body('otp').isLength({ min: 6 })], controller.checkOtp);

export = router;
