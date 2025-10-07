const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRequest, registerSchema, loginSchema, updateProfileSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { email, phone, password, fullName, role } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Hash password
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Create user
            const userData = {
                email,
                phone,
                passwordHash,
                fullName,
                role: role || 'Member'
            };

            const user = await User.create(userData);

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.userId, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: user.toJSON(),
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: error.message
            });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            console.log('=== LOGIN ATTEMPT ===');
            console.log('Email:', email);
            console.log('Password length:', password?.length);

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                console.log('❌ User not found in database');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            console.log('✅ User found:', user.email);
            console.log('User Status:', user.status);
            console.log('User Role:', user.role);
            console.log('Password hash exists:', !!user.passwordHash);

            // Check if account is active
            if (user.status !== 'Active') {
                console.log('❌ Account not active. Status:', user.status);
                return res.status(401).json({
                    success: false,
                    message: 'Account is not active'
                });
            }

            console.log('✅ Account is active');
            console.log('Comparing password...');

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            console.log('Password valid:', isPasswordValid);
            
            if (!isPasswordValid) {
                console.log('❌ Password verification failed');
                console.log('Expected hash:', user.passwordHash?.substring(0, 30) + '...');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            console.log('✅ Password verified successfully');

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.userId, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: user.toJSON(),
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user.toJSON()
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile',
                error: error.message
            });
        }
    }

    // Update user profile
    static async updateProfile(req, res) {
        try {
            const { phone, fullName, avatarUrl } = req.body;
            const userId = req.user.userId;

            const updateData = {};
            if (phone !== undefined) updateData.phone = phone;
            if (fullName !== undefined) updateData.fullName = fullName;
            if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            const updatedUser = await User.update(userId, updateData);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser.toJSON()
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: error.message
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            // Get current user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            await User.update(userId, { passwordHash: newPasswordHash });

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password',
                error: error.message
            });
        }
    }

    // Logout (client-side token removal)
    static async logout(req, res) {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }

    // Verify token
    static async verifyToken(req, res) {
        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                user: req.user.toJSON()
            }
        });
    }
}

module.exports = AuthController;
