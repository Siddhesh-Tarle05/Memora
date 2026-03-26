import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

async function identifyUser(req, res, next) {
    const authHeader = req.headers.authorization;
    try {
        const token = req.cookies.token || (authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null);

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await UserModel.findById(decoded.userId)
        if (!user) {
            return res.status(401).json({
                message: "user not found"
            })
        }
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

export { identifyUser };