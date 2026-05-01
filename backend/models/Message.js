const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['Invite', 'TaskAssignment'], required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    role: { type: String }, // For invites
    content: { type: String, required: true }, // E.g., "John assigned you to task: Setup DB"
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined', 'Unread', 'Read'], default: 'Unread' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
