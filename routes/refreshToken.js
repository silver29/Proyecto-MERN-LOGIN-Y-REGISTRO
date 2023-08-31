const { generateAccessToken } = require("../auth/generateTokens");
const getTokenFromHeader = require("../auth/getTokenFromHeader");
const { verifyRefreshToken } = require("../auth/verifyTokens");
const router = require("express").Router();
const { jsonResponse } = require("../lib/jsonResponse");
//const Token = require("../schema/token");
const Token = require("../schema/token");

router.post("/", async (req,res) => {
    const refreshToken = getTokenFromHeader(req.headers);

    if(refreshToken){
        try {
            const found = await Token.findOne({ token: refreshToken }); 
            if(!found){
                return res
                    .status(401)
                    .send(jsonResponse(401, { error: "Unauthorized" }));
            }
            // SI se encuentra refresh token
            const payload = verifyRefreshToken(found.token);
            if(payload) {
                const accessToken = generateAccessToken(payload.user);
                return res.status(200).json(jsonResponse(200, { accessToken }));
            } else {
                return res
                    .status(401)
                    .send(jsonResponse(401, { error:"Unauthorized" }));
            }    
        } catch (error) {
            return res.status(401).send(jsonResponse(401, { error:"Unauthorized" }));
        }
    }else{
        res.status(401).send(jsonResponse(401, { error:"Unauthorized" }));
    }
    res.send("refresh token");
});

module.exports = router;