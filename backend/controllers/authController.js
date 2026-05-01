const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ error: 'User already exists' });
            }
            // Resend OTP logic for unverified users
            user.otp = otp;
            user.otpExpires = otpExpires;
            user.name = name;
            user.password = password; // pre-save hook handles hashing if modified
            await user.save();
        } else {
            const inviteCode = Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
            user = new User({ name, email, password, role: 'Member', inviteCode, isVerified: false, otp, otpExpires });
            await user.save();
        }

        // Send Email
        try {
            const emailTemplate = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2>Hello, ${user.name}</h2>
                    <p>Welcome to <strong>Projex App</strong> 👋</p>
                    <p>Thank you for registering with us. To complete your signup and secure your account, please verify your email address using the One-Time Password (OTP) below:</p>
                    <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
                        <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code:</p>
                        <h1 style="margin: 10px 0; font-size: 32px; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone for security reasons.</p>
                    <p>If you did not initiate this request, you can safely ignore this email.</p>
                    <p>We’re excited to have you onboard and look forward to helping you manage and build your projects more efficiently.</p>
                    <p>Warm regards,<br><strong>Projex App Team</strong><br><em>Building smarter projects, together.</em></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; font-style: italic;">Note: This is an automated message. Please do not reply to this email.</p>
                </div>
            `;

            await sendEmail({
                email: user.email,
                subject: 'Verify your Projex Account',
                message: `Hello ${user.name},\n\nYour OTP for registration is: ${otp}\nIt will expire in 10 minutes.`,
                html: emailTemplate
            });
            res.status(200).json({ message: 'OTP sent to email. Please verify.' });
        } catch (emailError) {
            console.error(emailError);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ error: 'Error sending email. Please try again.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email, isVerified: false });
        if (!user) return res.status(400).json({ error: 'User not found or already verified' });

        if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ error: 'OTP expired' });

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });

        res.status(200).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: 'Please verify your email to log in. Try signing up again to resend OTP.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });

        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};