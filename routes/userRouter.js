const router = require('express').Router();

const mongoose = require('mongoose');

const User = require('../models/userModel');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
try{
    let {email, password, passwordCheck, displayName} = req.body;

    //validiation
    if(!email || !password || !passwordCheck) 
    return res.status(400).json({
        message: "Not all fields have been entered"
    });

    if(password.length < 5 )
    return res.status(400).json({
        message: "password must be 5 character long"
    });

    if(password !== passwordCheck)
    return res.status(400).json({
        message: "Please make sure that password and passwordCheck must be the same"
    }); 

    const existingUser = await User.findOne({email: email});

    if(existingUser)
    return res.status(400).json({
        message: 'Email already existed'
    });

    if(!displayName) displayName = email;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = new User({
        email,
        password: passwordHash,
        displayName
    });

    const saveUser = await newUser.save();
    res.json({saveUser});
} catch (err) {
    res.status(500).json({error: err.message});
}
});

router.post("/login", async (req, res) => {
    try{
        const {email, password} = req.body;

        //validation
        if(!email || !password) 
        return res.status(400).json({
            message: "Not all fields have been entered"
        });
        
        const user = await User.findOne({email: email});
        if(!user)
        return res.status(400).json({
            message: "No account with this email has been registered"
        });

        const isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched)
        return res.status(400).json({
            message: "Invalid credential"
        });
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                displayName: user.displayName,
                email: user.email
            }
        });

    } catch (err) { 
        res.status(500).json({
            error: err.message
        });
    }
});

router.delete('/delete', auth,  async (req, res) =>{
 try{
    const detetedUser = await User.findByIdAndDelete(req.user);
    res.status(200).json(detetedUser);

 }catch (err) {
     res.status(500).json({error: err.message});
}
});

router.post('/tokenIsValid', async (req, res) => {
    try{
        const token = req.header("x-auth-token");
        if(!token) 
        return res.json(false);

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if(!verified)
        return res.json(false);

        const user = await User.findById(verified.id);
        if(!user) 
        return res.json(false);

        return res.json(true);

    }catch (err) {
     res.status(500).json({error: err.message});
    }
});

module.exports = router;