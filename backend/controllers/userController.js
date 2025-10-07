const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

class UserController {
    // Get all users (Admin only)
    static async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, role } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            const users = await User.getAll(pageNum, limitNum, role);
            const totalCount = await User.getTotalCount(role);

            res.json({
                success: true,
                data: {
                    users: users.map(user => user.toJSON()),
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalCount / limitNum),
                        totalItems: totalCount,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get users',
                error: error.message
            });
        }
    }

    // Get user by ID (Admin only)
    static async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findById(parseInt(userId));

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
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user',
                error: error.message
            });
        }
    }

    // Update user status (Admin only)
    static async updateUserStatus(req, res) {
        try {
            const { userId } = req.params;
            const { status } = req.body;

            if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be Active, Inactive, or Suspended'
                });
            }

            const updatedUser = await User.update(parseInt(userId), { status });

            res.json({
                success: true,
                message: 'User status updated successfully',
                data: updatedUser.toJSON()
            });
        } catch (error) {
            console.error('Update user status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status',
                error: error.message
            });
        }
    }

    // Update user role (Admin only)
    static async updateUserRole(req, res) {
        try {
            const { userId } = req.params;
            const { role } = req.body;

            if (!['Member', 'Admin'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Must be Member or Admin'
                });
            }

            // Prevent admin from changing their own role
            if (parseInt(userId) === req.user.userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot change your own role'
                });
            }

            const updatedUser = await User.update(parseInt(userId), { role });

            res.json({
                success: true,
                message: 'User role updated successfully',
                data: updatedUser.toJSON()
            });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user role',
                error: error.message
            });
        }
    }

    // Get user statistics (Admin only)
    static async getUserStats(req, res) {
        try {
            const totalUsers = await User.getTotalCount();
            const totalMembers = await User.getTotalCount('Member');
            const totalAdmins = await User.getTotalCount('Admin');
            const activeUsers = await User.getTotalCount(); // You might want to add status filter

            res.json({
                success: true,
                data: {
                    totalUsers,
                    totalMembers,
                    totalAdmins,
                    activeUsers,
                    inactiveUsers: totalUsers - activeUsers
                }
            });
        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user statistics',
                error: error.message
            });
        }
    }

    // Search users (Admin only)
    static async searchUsers(req, res) {
        try {
            const { q, page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters long'
                });
            }

            // This would require implementing search in the User model
            // For now, we'll use the basic getAll method
            const users = await User.getAll(pageNum, limitNum);
            const filteredUsers = users.filter(user => 
                user.fullName.toLowerCase().includes(q.toLowerCase()) ||
                user.email.toLowerCase().includes(q.toLowerCase())
            );

            res.json({
                success: true,
                data: {
                    users: filteredUsers.map(user => user.toJSON()),
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(filteredUsers.length / limitNum),
                        totalItems: filteredUsers.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search users',
                error: error.message
            });
        }
    }
}

module.exports = UserController;
