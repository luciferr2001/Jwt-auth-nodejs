import { Router } from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import generateTokens from "../utils/generateToken.js";
import {
    signUpBodyValidation,
    logInBodyValidation,
} from "../utils/validationSchema.js";
import UserToken from "../models/userToken.js";
import verifyToken from "../utils/verifyToken.js";

const router = Router();

// signup
router.post("/signup", async (req, res) => {
    try {
        const { error } = signUpBodyValidation(req.body);
        if (error)
            return res
                .status(400)
                .json({ error: true, message: error.details[0].message });

        const user = await User.findOne({ userName: req.body.userName });
        if (user)
            return res
                .status(400)
                .json({ error: true, message: "User with given userName already exist" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        await new User({ ...req.body, password: hashPassword }).save();

        res
            .status(201)
            .json({ error: false, message: "Account created sucessfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// login
router.post("/login", async (req, res) => {
    try {
        const { error } = logInBodyValidation(req.body);
        if (error)
            return res
                .status(400)
                .json({ error: true, message: error.details[0].message });

        const user = await User.findOne({ userName: req.body.userName });
        if (!user)
            return res
                .status(401)
                .json({ error: true, message: "Invalid userName or password" });

        const verifiedPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!verifiedPassword)
            return res
                .status(401)
                .json({ error: true, message: "Invalid userName or password" });

        const { accessToken, refreshToken } = await generateTokens(user);

        res.status(200).json({
            error: false,
            id:user._id,
            accessToken,
            refreshToken,
            message: "Logged in sucessfully",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});


// delete user
router.delete("/deleteUser", async (req, res) => {
    try {
        const { error } = logInBodyValidation(req.body);
        if (error)
            return res
                .status(400)
                .json({ error: true, message: error.details[0].message });
                
        const userData=await User.findOneAndDelete({ userName: req.body.userName });
        if(!userData){
            return res
            .status(401)
            .json({ error: true, message: "Invalid userName" });
        }
        await UserToken.findOneAndDelete({ userId: userData._id });
        res.status(200).json({
            error: false,
            message: "User Deleted sucessfully",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});


// Dummy api to check access token
router.get("/getData", verifyToken, (req, res)=>{
    res.status(200).json({
        error: false,
        message: "Get Data",
    });
});


export default router;