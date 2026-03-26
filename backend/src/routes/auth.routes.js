import express from 'express';
const AuthRouter=express.Router();
import { RegisterController, LoginController ,getmeController, logoutController,getTokencontroller} from '../controllers/auth.controller.js';
import { identifyUser } from '../middlewares/auth.middleware.js';

AuthRouter.post('/register', RegisterController)
AuthRouter.post('/login', LoginController)
AuthRouter.get('/getme', identifyUser, getmeController)
AuthRouter.post('/logout', logoutController)
AuthRouter.get('/api/auth/get-token',getTokencontroller)
export default AuthRouter;