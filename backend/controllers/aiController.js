const axios = require('axios');
const Listing = require('../models/Listing');
const { authenticateToken } = require('../middleware/auth');

class AIController {
    // Get AI price suggestion (Protected)
    static async getPriceSuggestion(req, res) {
        try {
            const { listingType, brandId, model, year, batteryCapacity, kilometers, condition } = req.body;

            // Get similar listings from database for comparison
            const similarListings = await this.getSimilarListings({
                listingType,
                brandId,
                model,
                year,
                batteryCapacity,
                kilometers
            });

            // Calculate base price from similar listings
            let suggestedPrice = 0;
            if (similarListings.length > 0) {
                const prices = similarListings.map(listing => parseFloat(listing.price));
                const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
                suggestedPrice = averagePrice;
            } else {
                // Fallback to market data or default pricing
                suggestedPrice = await this.getMarketPrice(listingType, brandId, model, year);
            }

            // Apply condition adjustments
            if (condition) {
                suggestedPrice = this.applyConditionAdjustment(suggestedPrice, condition);
            }

            // Apply depreciation based on year and kilometers
            suggestedPrice = this.applyDepreciation(suggestedPrice, year, kilometers);

            // Get market trends
            const marketTrends = await this.getMarketTrends(listingType, brandId);

            res.json({
                success: true,
                data: {
                    suggestedPrice: Math.round(suggestedPrice),
                    priceRange: {
                        min: Math.round(suggestedPrice * 0.85),
                        max: Math.round(suggestedPrice * 1.15)
                    },
                    factors: {
                        similarListings: similarListings.length,
                        marketTrend: marketTrends.trend,
                        conditionAdjustment: condition || 'Good',
                        depreciationApplied: true
                    },
                    recommendations: this.getPriceRecommendations(suggestedPrice, similarListings.length)
                }
            });
        } catch (error) {
            console.error('Get price suggestion error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get price suggestion',
                error: error.message
            });
        }
    }

    // Get market analysis (Protected)
    static async getMarketAnalysis(req, res) {
        try {
            const { listingType, brandId, model } = req.query;

            const analysis = await this.analyzeMarket(listingType, brandId, model);

            res.json({
                success: true,
                data: analysis
            });
        } catch (error) {
            console.error('Get market analysis error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get market analysis',
                error: error.message
            });
        }
    }

    // Helper methods
    static async getSimilarListings(filters) {
        try {
            const listings = await Listing.search(filters);
            return listings.filter(listing => listing.approved && listing.status === 'Active');
        } catch (error) {
            console.error('Get similar listings error:', error);
            return [];
        }
    }

    static async getMarketPrice(listingType, brandId, model, year) {
        // This would integrate with external APIs or use predefined market data
        // For now, return a base price based on listing type
        const basePrices = {
            'Car': 25000,
            'Pin': 5000
        };

        return basePrices[listingType] || 10000;
    }

    static applyConditionAdjustment(price, condition) {
        const adjustments = {
            'Excellent': 1.1,
            'Good': 1.0,
            'Fair': 0.85,
            'Poor': 0.7
        };

        return price * (adjustments[condition] || 1.0);
    }

    static applyDepreciation(price, year, kilometers) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        
        // Apply age depreciation (5% per year)
        let adjustedPrice = price * Math.pow(0.95, age);
        
        // Apply mileage depreciation
        const mileageDepreciation = Math.min(kilometers / 10000 * 0.01, 0.2); // Max 20% depreciation
        adjustedPrice = adjustedPrice * (1 - mileageDepreciation);
        
        return Math.max(adjustedPrice, price * 0.3); // Minimum 30% of original price
    }

    static async getMarketTrends(listingType, brandId) {
        // This would analyze historical data
        return {
            trend: 'stable', // 'rising', 'falling', 'stable'
            confidence: 0.75
        };
    }

    static getPriceRecommendations(suggestedPrice, similarCount) {
        const recommendations = [];

        if (similarCount < 3) {
            recommendations.push('Limited similar listings found. Consider broader market research.');
        }

        if (suggestedPrice < 5000) {
            recommendations.push('Low price point. Ensure all features are clearly described.');
        }

        if (suggestedPrice > 50000) {
            recommendations.push('High-value item. Consider professional inspection and detailed documentation.');
        }

        recommendations.push('Consider seasonal factors and local market conditions.');
        recommendations.push('Monitor competitor pricing and adjust accordingly.');

        return recommendations;
    }

    static async analyzeMarket(listingType, brandId, model) {
        // This would perform comprehensive market analysis
        return {
            averagePrice: 0,
            priceRange: { min: 0, max: 0 },
            marketSize: 0,
            competitionLevel: 'medium',
            trends: {
                price: 'stable',
                demand: 'medium',
                supply: 'medium'
            },
            insights: [
                'Market shows stable pricing trends',
                'Moderate competition in this segment',
                'Consider seasonal pricing adjustments'
            ]
        };
    }
}

module.exports = AIController;
