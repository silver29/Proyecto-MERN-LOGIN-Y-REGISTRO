const Mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require("../auth/generateTokens");
const getUserInfo = require("../lib/getUserInfo");
const Token = require("./token");

const UserSchema = new Mongoose.Schema({
    id: { type: Object },
    username: { type:String, required:true, unique:true },
    password: { type:String, required:true },
    name: { type: String, required:true },
});

UserSchema.pre('save', function(next){
    if(this.isModified('password') || this.isNew){
        const document = this;

        bcrypt.hash(document.password,10, (err, hash) => {
            if(err){
                next(err);
            }else{
                document.password = hash;
                // Se completa la transacción en el método save de mongodb 
                next();             
            }
        })
    } else {
        next();
    }
});

UserSchema.methods.usernameExists = async function(username) {
    //const result = await Mongoose.model("User").find({ username });
    const result = await Mongoose.model("User").findOne({ username });
    //return result.length > 0;
    return !!result;
};

UserSchema.methods.comparePassword = async function (password, hash) {
    const same = await bcrypt.compare(password, hash);
    return same;
}

UserSchema.methods.createAccessToken = function () {
    return generateAccessToken(getUserInfo(this)); // el this hacer referencia al usuario actual.
}

UserSchema.methods.createRefreshToken = async function () {
    const refreshToken = generateRefreshToken(getUserInfo(this));
    try {
        await new Token({token: refreshToken}).save();
        return refreshToken;
    } catch (error) {
        console.log(error);
    }
}

module.exports = Mongoose.model("User",UserSchema);