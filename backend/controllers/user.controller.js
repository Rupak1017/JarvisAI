import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
//CreateUserController will do two things for us :-1) It will validate all incoming data with the help of express validator
//2) It will  
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