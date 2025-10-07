const Joi = require('joi');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};

// User validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('Member', 'Admin').default('Member')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    fullName: Joi.string().min(2).max(100).optional(),
    avatarUrl: Joi.string().uri().optional()
});

// Brand validation schemas
const brandSchema = Joi.object({
    brandName: Joi.string().min(2).max(100).required()
});

// Car validation schemas
const carSchema = Joi.object({
    brandId: Joi.number().integer().positive().required(),
    model: Joi.string().min(1).max(100).required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    batteryCapacity: Joi.number().positive().required(),
    kilometers: Joi.number().integer().min(0).required(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('Active', 'Inactive').default('Active')
});

// Pin validation schemas
const pinSchema = Joi.object({
    brandId: Joi.number().integer().positive().required(),
    capacity: Joi.number().positive().required(),
    model: Joi.string().min(1).max(100).required(),
    status: Joi.string().valid('Active', 'Inactive').default('Active'),
    manufactureYear: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    description: Joi.string().max(500).optional()
});

// Listing validation schemas
const listingSchema = Joi.object({
    carId: Joi.number().integer().positive().when('listingType', {
        is: 'Car',
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    pinId: Joi.number().integer().positive().when('listingType', {
        is: 'Pin',
        then: Joi.required(),
        otherwise: Joi.forbidden()
    }),
    listingType: Joi.string().valid('Car', 'Pin').required(),
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().precision(2).required(),
    images: Joi.string().optional()
});

// Auction validation schemas
const auctionSchema = Joi.object({
    listingId: Joi.number().integer().positive().required(),
    bidPrice: Joi.number().positive().precision(2).required()
});

// Order validation schemas
const orderSchema = Joi.object({
    listingId: Joi.number().integer().positive().required(),
    orderType: Joi.string().valid('BuyNow', 'Auction').required()
});

// Payment validation schemas
const paymentSchema = Joi.object({
    orderId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().precision(2).required(),
    paymentMethod: Joi.string().valid('CreditCard', 'BankTransfer', 'E-Wallet', 'Cash').required()
});

// Review validation schemas
const reviewSchema = Joi.object({
    orderId: Joi.number().integer().positive().required(),
    revieweeId: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(10).max(1000).required()
});

// Search validation schemas
const searchSchema = Joi.object({
    listingType: Joi.string().valid('Car', 'Pin').optional(),
    brandId: Joi.number().integer().positive().optional(),
    minPrice: Joi.number().positive().precision(2).optional(),
    maxPrice: Joi.number().positive().precision(2).optional(),
    minYear: Joi.number().integer().min(1900).optional(),
    maxYear: Joi.number().integer().min(1900).optional(),
    minBatteryCapacity: Joi.number().positive().optional(),
    maxBatteryCapacity: Joi.number().positive().optional(),
    maxKilometers: Joi.number().integer().min(0).optional(),
    searchTerm: Joi.string().max(200).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
    validateRequest,
    registerSchema,
    loginSchema,
    updateProfileSchema,
    brandSchema,
    carSchema,
    pinSchema,
    listingSchema,
    auctionSchema,
    orderSchema,
    paymentSchema,
    reviewSchema,
    searchSchema
};