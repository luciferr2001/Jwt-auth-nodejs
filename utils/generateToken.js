import jwt from "jsonwebtoken";
import UserToken from "../models/userToken.js";

const generateTokens = async (user) => {
    try {
        const payload = { _id: user._id};
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: "120s" }
        );
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_PRIVATE_KEY,
            { expiresIn: "30d" }
        );

        const userToken = await UserToken.findOne({ userId: user._id });
        if (userToken) await userToken.deleteOne();

        await new UserToken({ userId: user._id, token: refreshToken }).save();
        return Promise.resolve({ accessToken, refreshToken });
    } catch (err) {
        return Promise.reject(err);
    }
};

export default generateTokens;