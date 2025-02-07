import projectModel from '../models/project.model.js';

export const createProject = async ({ name, userId }) => {
    if (!name) {
        throw new Error('Name is required');
    }
    if (!userId) {
        throw new Error('User is required');
    }

    // Check if a project with the same name already exists
    const existingProject = await projectModel.findOne({ name });
    if (existingProject) {
        throw new Error('Project with this name already exists');
    }

    try {
        const project = await projectModel.create({
            name,
            users: [userId]
        });
        return project;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project with this name already exists');
        }
        throw error;
    }
};
