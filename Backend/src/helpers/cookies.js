// SET_ACCESS_TOKEN_COOKIE
export const setAccessTokenCookie = (res, accessToken) => {
    res.cookie("accessToken", accessToken, {
        maxAge: 5 * 60 * 1000,  // 5 MIN
        httpOnly: true,
        // secure: true,
        sameSite: "none"
    })
};


// SET_REFRESH_TOKEN_COOKIE
export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 DAYS
        httpOnly: true,
        // secure: true,
        sameSite: "none"
    })
};
