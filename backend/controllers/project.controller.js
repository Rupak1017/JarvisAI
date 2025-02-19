import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';


export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = loggedInUser._id;
        const newProject = await projectService.createProject({ name, userId });
        return res.status(201).json(newProject);
    } catch (err) {
        console.error(err.message); // Only log the message to avoid unnecessary crash logs
        return res.status(400).json({ error: err.message }); // Send error response instead of crashing
    }
};

export const getAllProject = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

       const allUserProjects = await projectService.
       getAllProjectByUserId({
        userId: loggedInUser._id
    })
    return res.status(200).json({
        projects : allUserProjects
    });

      
    } catch (err) {
        console.log(err);
         res.status(400).json({ error: err.message});
    }
};


export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {projectId,users} = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
            });
            return res.status(200).json({
                
                project,
            });


    } catch (err) {
        console.log(err.message); // Only log the message to avoid unnecessary crash logs
     res.status(400).json({ error: err.message }); // Send error response instead of crashing
    }
}


export const getProjectById = async (req, res) => {

    const {projectId} = req.params;
    console.log("Received Project ID:", projectId);

    try{
        const project = await projectService.getProjectById({projectId});
        return res.status(200).json({
            project
        });
        } catch (err) {
            console.log(err.message); // Only log the message to avoid unnecessary crash logs
            res.status(400).json({ error: err.message }); // Send error response instead of crashing
    }
    
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}

export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Find the project to ensure it exists
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Delete the project
        await projectModel.findByIdAndDelete(projectId);
        return res.status(200).json({ message: "Project deleted successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete project" });
    }
};
