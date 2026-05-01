const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.createProject = async (req, res) => {
    try {
        const project = new Project({ ...req.body, admin: req.user._id });
        await project.save();
        await User.findByIdAndUpdate(req.user._id, { $push: { projects: project._id } });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ $or: [{ admin: req.user._id }, { 'members.user': req.user._id }] })
            .populate('admin', 'name')
            .populate('members.user', 'name')
            .populate('tasks');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { projectId, memberId } = req.body;
        const project = await Project.findOne({ _id: projectId, admin: req.user._id });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        await Project.findByIdAndUpdate(projectId, { $push: { members: memberId } });
        res.json({ message: 'Member added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};