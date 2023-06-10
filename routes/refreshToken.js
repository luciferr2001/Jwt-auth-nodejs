import { Router } from "express";
import jwt from "jsonwebtoken";
import { refreshTokenBodyValidation } from "../utils/validationSchema.js";
import verifyRefreshToken from "../utils/verifyRefreshToken.js";

const router = Router();

// get new access token
router.post("/", async (req, res) => {
    const { error } = refreshTokenBodyValidation(req.body);
    if (error)
        return res
            .status(400)
            .json({ error: true, message: error.details[0].message });

    verifyRefreshToken(req.body.refreshToken)
        .then(({ tokenDetails }) => {
            const payload = { _id: tokenDetails._id};
            const accessToken = jwt.sign(
                payload,
                process.env.ACCESS_TOKEN_PRIVATE_KEY,
                { expiresIn: "120s" }
            );
            res.status(200).json({
                error: false,
                accessToken,
                message: "Access token created successfully",
            });
        })
        .catch((err) => res.status(400).json(err));
});

export default router;