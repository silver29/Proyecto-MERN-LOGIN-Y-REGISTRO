const router = require("express").Router();
const { jsonResponse } = require("../lib/jsonResponse");
const User = require("../schema/user");

router.post("/", async (req,res) => {
    const {username, name, password} = req.body;

    if(!!!username || !!!name || !!!password){
        return res.status(400).json(jsonResponse(400, {
            error: "Fields are required",
            })
        );
    }
    // crear usuario en la base de datos
    // const user = new User({username, name, password});
    try {
        const user = new User();
        const exists = await user.usernameExists(username);

        if(exists){
            return res.status(400).json(
                jsonResponse(400,{
                    error: "Username already exists",
                })
            );
        }

        const newUser = new User({ username, name, password });

        await newUser.save();
        res
            .status(200)
            .json(jsonResponse(200, {message:"User created successfully" }));

        //res.send("signout");
        
        /* https://stackoverflow.com/questions/7042340/error-cant-set-headers-after-they-are-sent-to-the-client 
           Error: Can't set headers after they are sent.
           Usually happens when you send several responses for one request. Make sure the following functions are called only once per request: 
        */
        
        } catch (error) { 
        res.status(500).json(
            jsonResponse(500, {
                error:"Error creating user",
            })
        )
    }
    
});

module.exports = router;