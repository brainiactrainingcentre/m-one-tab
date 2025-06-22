import jwt from "jsonwebtoken"
import UserRefreshTokenModel from "../model/UserRefreshToken.js";
const generateTokens = async (user, deviceInfo = {}) => {
    try {
        const payload = { 
            id: user._id, 
            roles: user.roles,
            // Add device info to token payload (optional)
            device: deviceInfo
        };
        // Shorter access token expiry for mobile (15 minutes)
        const accessTokenExp = Math.floor(Date.now() / 1000) + (15 * 60);
        const accessToken = jwt.sign(
            { ...payload, exp: accessTokenExp },
            process.env.JWT_ACCESS_TOKEN_SECRET_KEY
        );

        // Longer refresh token for mobile (30 days)
        const refreshTokenExp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        const refreshToken = jwt.sign(
            { ...payload, exp: refreshTokenExp },
            process.env.JWT_REFRESH_TOKEN_SECRET_KEY
        );

        // Store refresh token with device info
        await UserRefreshTokenModel.findOneAndDelete({ userId: user._id });
        await new UserRefreshTokenModel({ 
            userId: user._id, 
            token: refreshToken,
            deviceInfo: deviceInfo // Store device info with token
        }).save();

        return Promise.resolve({ 
            accessToken, 
            refreshToken, 
            accessTokenExp, 
            refreshTokenExp 
        });
    } catch (error) {
        return Promise.reject(error);
    }
};

export default generateTokens