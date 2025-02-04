//Here all the logic is made
import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
//CreateUserController will do two things for us :-1) It will validate all incoming data with the help of express validator
//2) It will  
import redisClient from '../services/redis.service.js';


export const createUSerController = async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try {
        //Create a new user
        const user = await userService.createUser(req.body);
        const token = await user.generateJWT();
        //Return the new user
        return res.status(201).send({user,token});
    } catch (error) {
        console.error(error);
        return res.status(400).send(error.message);
    }
}

export const loginController =async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        //Check if user exists
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ errors: 'Invalid email or password' });
        }
        const isMatch = await user.isValidPassword(password); 
        if (!isMatch){
            return res.status(401).json({ errors: 'Invalid email or password' });
        }
    
    const token =await user.generateJWT();

    res.status(200).json({ user,token });
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
     
}

export const profileController=async (req, res) => {
    console.log(req.user);
    res.status(200).json({ user: req.user});
    
}

export const logoutController=async (req, res) => {
    try{
const token =req.cookies.token || req.headers.authorization.split(' ')[1];
redisClient.set(token, 'logout', 'EX', 60*60*24);

res.status(200).json({
    message: 'Logged out successfully'});

    }catch(err){
        console.error(err);
        res.status(400).send(err.message);   
}
}