const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Invite', inviteSchema);
