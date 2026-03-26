import express from 'express';
const AuthRouter=express.Router();
import AuthController from '../controllers/auth.controller.js'
import { identifyUser } from '../middlewares/auth.middleware.js';

AuthRouter.post('/register',AuthController.RegisterController)
AuthRouter.post('/login', AuthController.LoginController)
AuthRouter.get('/getme', identifyUser, AuthController.getmeController)
AuthRouter.post('/logout', AuthController.logoutController)
AuthRouter.get('/get-token',AuthController.getTokencontroller)
export default AuthRouter;