const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ recipient: req.user._id })
            .populate('sender', 'name')
            .populate('project', 'name')
            .populate('task', 'title')
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({ 
            recipient: req.user._id, 
            status: { $in: ['Pending', 'Unread'] } 
        });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createInviteMessage = async (req, res) => {
    try {
        const { projectId, inviteCode, role } = req.body;
        if (!role) return res.status(400).json({ error: 'Role is required' });

        const recipient = await User.findOne({ inviteCode });
        if (!recipient) return res.status(404).json({ error: 'User not found' });

        // Check if already a member
        const project = await Project.findById(projectId);
        const isMember = project.members.some(m => m.user.toString() === recipient._id.toString());
        if (isMember) return res.status(400).json({ error: 'User is already a member' });

        // Check for pending invite
        const existing = await Message.findOne({
            project: projectId,
            recipient: recipient._id,
            type: 'Invite',
            status: 'Pending'
        });
        if (existing) return res.status(400).json({ error: 'Invite already sent' });

        const message = new Message({
            project: projectId,
            sender: req.user._id,
            recipient: recipient._id,
            type: 'Invite',
            role,
            content: `Admin invited you to join ${project.name} as a ${role}.`,
            status: 'Pending'
        });

        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.handleMessageAction = async (req, res) => {
    try {
        const { action } = req.body; // 'accept', 'decline', 'read'
        const message = await Message.findById(req.params.id);

        if (!message) return res.status(404).json({ error: 'Message not found' });
        if (message.recipient.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Unauthorized' });

        if (message.type === 'Invite') {
            if (action === 'accept') {
                message.status = 'Accepted';
                // Add to project
                await Project.findByIdAndUpdate(message.project, {
                    $push: { members: { user: req.user._id, role: message.role } }
                });
            } else if (action === 'decline') {
                message.status = 'Declined';
            }
        } else {
            // General notification (TaskAssignment)
            if (action === 'read') {
                message.status = 'Read';
            }
        }

        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
