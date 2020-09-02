const router = require('express').Router();

const mongoose = require('mongoose');

const User = require('../models/userModel');

const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
    const {email, password, passwordCheck, displayName} = req.body;

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
});

module.exports = router;