const User = require("../models/user");
const { validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

exports.signin = ( req , res ) => {
    const {email , password} = req.body;

    const errors = validationResult(req);

   if(!errors.isEmpty()){
       return res.status(422).json({
          error: errors.array()[0].msg
       });
   }

   User.findOne({email} , (err,user) => {
    if(err || !user){
        return res.status(400).json({
           error: "User email doesn't exists"
        });
    }
    
    if(!user.authenticate(password)){
        return res.status(401).json({
            error: "Email and Password doesn't match"
         });
    }

    const token = jwt.sign({_id: user._id}, process.env.SECRET);

    res.cookie("token", token, { expire: new Date() + 999} );

    const {_id , name , email , role } = user;
    return res.json({ token , user: { _id,name,email,role }});
   });

}

exports.signout = ( req , res ) => {
    res.clearCookie("token");
    res.send("User Signout Successfully");
}

exports.signup = ( req , res ) => {

   const errors = validationResult(req);

   if(!errors.isEmpty()){
       return res.status(422).json({
          error: errors.array()[0].msg
       });
   }

   const user = new User(req.body);
   user.save((err,user) => {
       if(err){
           return res.status(400).json({
               err: "Not able to save user in DB" 
           });
       }
       res.json(user);
   });
};

exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth"
})

exports.isAuthenticated = (req,res,next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!checker){
        return res.status(403).json({
            error: "Access Denied" 
        });
    }
    next();
}

exports.isAdmin = (req,res,next) => {
    if(req.profile.role === 0){
        return res.status(403).json({
            error: "You are not Admin , Access Denied" 
        });
    }
    next();
}