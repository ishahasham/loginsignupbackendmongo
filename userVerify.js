import jwt from 'jsonwebtoken';

const userVerifyMiddle=(req,res,next)=>{
    var token=req.headers.authorization.split(" ")[1];
    console.log(token);
    var decoded= jwt.verify(token,process.env.JWT_SECRET_KEY);

    if(!decoded){
        res.json({
            message:"token is invalid",
        })
    }else{
        next();
    }
}

export default userVerifyMiddle