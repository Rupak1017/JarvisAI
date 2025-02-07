//this service folder for any 3rd party services like here we are using mongodb 
import userModel from '../models/user.model.js';


export const createUser = async ({
    email,password
}) => { // if email password not found then this if will run 
    if ( !email || !password) {
        throw new Error('Email and password are required');
    }

    const hashedPassword = await userModel.hashPassword(password);
    const user = await userModel.create({
        email,
        password: hashedPassword
    });

    return user;
}

export const getAllUsers = async ({userId})=>{
    const users = await userModel.find({
        _id: { $ne: userId }  // exclude current user
    });
    return users;
}