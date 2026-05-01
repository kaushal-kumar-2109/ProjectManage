const Invite = require('../models/Invite');
const User = require('../models/User');
const Project = require('../models/Project');

exports.createInvite = async (req, res) => {
    try {
        const { projectId, inviteCode, role } = req.body;
        
        if (!role) return res.status(400).json({ error: 'Role is required' });

        // Verify project admin
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        if (project.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the project admin can send invites' });
        }

        // Find user by 15-digit code
        const recipient = await User.findOne({ inviteCode });
        if (!recipient) return res.status(404).json({ error: 'Invalid invite code. User not found.' });

        if (recipient._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'You cannot invite yourself' });
        }

        if (project.members.some(m => m.user.toString() === recipient._id.toString())) {
            return res.status(400).json({ error: 'User is already a member of this project' });
        }

        // Check if an invite already exists
        const existingInvite = await Invite.findOne({ project: projectId, recipient: recipient._id, status: 'Pending' });
        if (existingInvite) return res.status(400).json({ error: 'An invite is already pending for this user' });

        const invite = new Invite({
            project: projectId,
            sender: req.user._id,
            recipient: recipient._id,
            role
        });
        await invite.save();

        res.status(201).json({ message: 'Invite sent successfully', invite });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPendingInvites = async (req, res) => {
    try {
        const invites = await Invite.find({ recipient: req.user._id, status: 'Pending' })
            .populate('project', 'name description')
            .populate('sender', 'name');
        res.json(invites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.handleInvite = async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'decline'
        const invite = await Invite.findOne({ _id: req.params.id, recipient: req.user._id, status: 'Pending' });
        
        if (!invite) return res.status(404).json({ error: 'Invite not found or already processed' });

        if (action === 'accept') {
            invite.status = 'Accepted';
            await invite.save();
            await Project.findByIdAndUpdate(invite.project, { $push: { members: { user: req.user._id, role: invite.role } } });
            res.json({ message: 'Joined project successfully' });
        } else if (action === 'decline') {
            invite.status = 'Declined';
            await invite.save();
            res.json({ message: 'Invite declined' });
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
