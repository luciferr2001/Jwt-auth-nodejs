import UserToken from "../models/userToken.js";
import jwt from "jsonwebtoken";

const verifyRefreshToken = (refreshToken) => {
    const privateKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;

    return new Promise((resolve, reject) => {
        try {
            UserToken.findOne({ token: refreshToken }).then((data)=>{
                if (!data)
                return reject({ error: true, message: "Invalid refresh token" });

            jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
                if (err)
                    return reject({ error: true, message: "Invalid refresh token" });
                resolve({
                    tokenDetails,
                    error: false,
                    message: "Valid refresh token",
                });
            });
            });
        } catch (err) {
            console.log(err)
        }
    });
};

export default verifyRefreshToken;
