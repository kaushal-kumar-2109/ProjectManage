const Task = require('../models/Task');
const Project = require('../models/Project');
const Message = require('../models/Message');

exports.createTask = async (req, res) => {
    try {
        const task = new Task({ ...req.body, project: req.body.projectId });
        await task.save();

        await Project.findByIdAndUpdate(req.body.projectId, { $push: { tasks: task._id } });

        // Send message to assignee
        if (req.body.assignedTo) {
            const message = new Message({
                recipient: req.body.assignedTo,
                sender: req.user._id,
                type: 'TaskAssignment',
                project: req.body.projectId,
                task: task._id,
                content: `Admin assigned you to task: ${task.title}`
            });
            await message.save();
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        // Check permissions
        const project = await Project.findById(task.project);
        const isAdmin = project.admin.toString() === req.user._id.toString();
        const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

        if (!isAdmin && !isAssignee) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only assignee can change status
        if (req.body.status && req.body.status !== task.status) {
            if (!isAssignee) {
                return res.status(403).json({ error: 'Only the assigned user can change the task status' });
            }
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name');

        // Check if assignee changed
        if (req.body.assignedTo && task.assignedTo.toString() !== req.body.assignedTo.toString()) {
            const message = new Message({
                recipient: req.body.assignedTo,
                sender: req.user._id,
                type: 'TaskAssignment',
                project: task.project,
                task: task._id,
                content: `Admin assigned you to task: ${updatedTask.title}`
            });
            await message.save();
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        let query = { project: req.params.projectId };
        
        // If user is not the project admin, they can only see tasks assigned to them
        if (project.admin.toString() !== req.user._id.toString()) {
            query.assignedTo = req.user._id;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name')
            .sort({ dueDate: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name')
            .populate('project', 'name admin');
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};