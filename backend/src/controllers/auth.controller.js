import UserModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
async function RegisterController(req, res) {
    let { name, email, password } = req.body
    let UserExits = await UserModel.findOne({ email })

    if (UserExits) {
        return res.status(409).json({
            message: "user already exits",
            status: "failed"
        })
    }
    const user = await UserModel.create({
        email, name, password
    })
    let token = jwt.sign({
        userId: user._id,

    }, process.env.JWT_SECRET)
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.status(201).json({
        message: "user created successfully",
        user: {
            _id: user.id,
            email: user.email,
            name: user.name
        }
    })
}
async function LoginController(req, res) {
    let { email, password } = req.body
    let user = await UserModel.findOne({ email }).select('+password')
    if (!user) {
        res.status(401).json({
            message: "invalid email or password"
        })
    }
    let isPasswordvalid = await user.comparePassword(password)
    if (!isPasswordvalid) {
        return res.status(401).json({
            message: "invalid email or password"
        })
    }
    let token = jwt.sign({
        userId: user._id,

    }, process.env.JWT_SECRET)
    res.cookie('token', token,{
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })
    res.status(201).json({
        message: "user logged in successfully",
        user: {
            _id: user.id,
            email: user.email,
            name: user.name
        }
    })
}
async function getmeController(req, res) {
    let { userId } = req.user
    let user = await UserModel.findById(userId)
    res.status(200).json({
        message: "user data fetched succesfully",
        user
    })
}

async function logoutController(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    })
    res.status(200).json({
        message: "Successfully logged out"
    })
}

async function getTokencontroller(req,res) {
    const token = req.cookies.token;
  res.json({ token });
}

export default{ RegisterController, LoginController, getmeController, logoutController,getTokencontroller}