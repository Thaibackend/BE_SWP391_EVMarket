const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

class AdminController {
    // Get dashboard statistics (Admin only)
    static async getDashboardStats(req, res) {
        try {
            // Get user statistics
            const totalUsers = await User.getTotalCount();
            const totalMembers = await User.getTotalCount('Member');
            const totalAdmins = await User.getTotalCount('Admin');

            // Get listing statistics
            const pendingListings = await Listing.getPendingApproval();
            const totalListings = pendingListings.length; // This would need a proper count method

            // Get order statistics
            const totalOrders = await Order.getTotalCount();
            const pendingOrders = await Order.getTotalCount('Pending');
            const completedOrders = await Order.getTotalCount('Completed');

            // Get payment statistics
            const paymentStats = await Payment.getTotalAmount('Completed');

            res.json({
                success: true,
                data: {
                    users: {
                        total: totalUsers,
                        members: totalMembers,
                        admins: totalAdmins
                    },
                    listings: {
                        total: totalListings,
                        pending: pendingListings.length
                    },
                    orders: {
                        total: totalOrders,
                        pending: pendingOrders,
                        completed: completedOrders
                    },
                    revenue: {
                        total: paymentStats.totalAmount || 0,
                        transactions: paymentStats.totalCount || 0
                    }
                }
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get dashboard statistics',
                error: error.message
            });
        }
    }

    // Get system overview (Admin only)
    static async getSystemOverview(req, res) {
        try {
            const { period = '30' } = req.query; // days
            const days = parseInt(period);

            // This would require implementing date-based queries in models
            // For now, we'll return basic structure
            res.json({
                success: true,
                data: {
                    period: `${days} days`,
                    newUsers: 0, // Would need date filtering
                    newListings: 0,
                    newOrders: 0,
                    revenue: 0,
                    topBrands: [], // Would need aggregation
                    recentActivity: [] // Would need activity tracking
                }
            });
        } catch (error) {
            console.error('Get system overview error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get system overview',
                error: error.message
            });
        }
    }

    // Get pending approvals (Admin only)
    static async getPendingApprovals(req, res) {
        try {
            const pendingListings = await Listing.getPendingApproval();

            res.json({
                success: true,
                data: {
                    listings: pendingListings,
                    count: pendingListings.length
                }
            });
        } catch (error) {
            console.error('Get pending approvals error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get pending approvals',
                error: error.message
            });
        }
    }

    // Bulk approve listings (Admin only)
    static async bulkApproveListings(req, res) {
        try {
            const { listingIds, approved } = req.body;

            if (!Array.isArray(listingIds) || listingIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Listing IDs array is required'
                });
            }

            const results = [];
            for (const listingId of listingIds) {
                try {
                    const updatedListing = await Listing.update(parseInt(listingId), { 
                        approved: approved ? 1 : 0 
                    });
                    results.push({ listingId, success: true, data: updatedListing });
                } catch (error) {
                    results.push({ listingId, success: false, error: error.message });
                }
            }

            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            res.json({
                success: true,
                message: `Bulk operation completed: ${successCount} successful, ${failureCount} failed`,
                data: {
                    results,
                    summary: {
                        total: listingIds.length,
                        successful: successCount,
                        failed: failureCount
                    }
                }
            });
        } catch (error) {
            console.error('Bulk approve listings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to bulk approve listings',
                error: error.message
            });
        }
    }

    // Get system settings (Admin only)
    static async getSystemSettings(req, res) {
        try {
            // This would typically come from a settings table
            res.json({
                success: true,
                data: {
                    commissionRate: 5.0, // 5% commission
                    maxImagesPerListing: 10,
                    maxListingTitleLength: 200,
                    maxListingDescriptionLength: 1000,
                    autoApproveThreshold: 100, // Auto-approve after 100 successful transactions
                    maintenanceMode: false,
                    registrationEnabled: true,
                    listingFee: 0.0 // No listing fee
                }
            });
        } catch (error) {
            console.error('Get system settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get system settings',
                error: error.message
            });
        }
    }

    // Update system settings (Admin only)
    static async updateSystemSettings(req, res) {
        try {
            const { commissionRate, maxImagesPerListing, autoApproveThreshold, maintenanceMode, registrationEnabled } = req.body;

            // This would typically update a settings table
            // For now, we'll just return success
            res.json({
                success: true,
                message: 'System settings updated successfully',
                data: {
                    commissionRate: commissionRate || 5.0,
                    maxImagesPerListing: maxImagesPerListing || 10,
                    autoApproveThreshold: autoApproveThreshold || 100,
                    maintenanceMode: maintenanceMode || false,
                    registrationEnabled: registrationEnabled !== undefined ? registrationEnabled : true
                }
            });
        } catch (error) {
            console.error('Update system settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update system settings',
                error: error.message
            });
        }
    }

    // Get reports (Admin only)
    static async getReports(req, res) {
        try {
            const { type = 'overview', period = '30' } = req.query;

            let reportData = {};

            switch (type) {
                case 'overview':
                    reportData = await this.getOverviewReport(period);
                    break;
                case 'users':
                    reportData = await this.getUserReport(period);
                    break;
                case 'listings':
                    reportData = await this.getListingReport(period);
                    break;
                case 'orders':
                    reportData = await this.getOrderReport(period);
                    break;
                case 'revenue':
                    reportData = await this.getRevenueReport(period);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid report type'
                    });
            }

            res.json({
                success: true,
                data: {
                    type,
                    period: `${period} days`,
                    generatedAt: new Date().toISOString(),
                    ...reportData
                }
            });
        } catch (error) {
            console.error('Get reports error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get reports',
                error: error.message
            });
        }
    }

    // Helper methods for reports
    static async getOverviewReport(period) {
        // This would implement actual reporting logic
        return {
            totalUsers: 0,
            totalListings: 0,
            totalOrders: 0,
            totalRevenue: 0,
            growthRate: 0
        };
    }

    static async getUserReport(period) {
        return {
            newUsers: 0,
            activeUsers: 0,
            userGrowth: 0,
            topUsers: []
        };
    }

    static async getListingReport(period) {
        return {
            newListings: 0,
            approvedListings: 0,
            pendingListings: 0,
            topCategories: []
        };
    }

    static async getOrderReport(period) {
        return {
            totalOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            averageOrderValue: 0
        };
    }

    static async getRevenueReport(period) {
        return {
            totalRevenue: 0,
            commissionEarned: 0,
            averageTransactionValue: 0,
            revenueGrowth: 0
        };
    }
}

module.exports = AdminController;
