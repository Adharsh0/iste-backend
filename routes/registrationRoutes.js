const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

// @route   POST /api/register
// @desc    Register a new participant
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      college,
      department,
      year,
      isIsteMember,
      isteRegistrationNumber,
      stayPreference,
      totalAmount,
      transactionId
    } = req.body;

    // Check if email already exists
    const existingEmail = await Registration.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    // Check if transaction ID already exists
    const existingTransaction = await Registration.findOne({ transactionId });
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'This transaction ID is already used'
      });
    }

    // Create new registration
    const registration = new Registration({
      fullName,
      email,
      phone,
      college,
      department,
      year,
      isIsteMember,
      isteRegistrationNumber,
      stayPreference,
      totalAmount,
      transactionId,
      paymentStatus: 'completed'
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: registration._id,
        fullName: registration.fullName,
        email: registration.email,
        transactionId: registration.transactionId,
        totalAmount: registration.totalAmount,
        registrationDate: registration.registrationDate
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/registrations
// @desc    Get all registrations (for admin)
// @access  Private (add authentication later)
router.get('/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find()
      .sort({ registrationDate: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/registration/:id
// @desc    Get single registration by ID
// @access  Public
router.get('/registration/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .select('-__v');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/stats
// @desc    Get registration statistics
// @access  Private (add authentication later)
router.get('/stats', async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const totalAmount = await Registration.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const stayPreferenceStats = await Registration.aggregate([
      { $group: { _id: "$stayPreference", count: { $sum: 1 } } }
    ]);
    const yearStats = await Registration.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalRegistrations,
        totalRevenue: totalAmount[0]?.total || 0,
        stayPreference: stayPreferenceStats,
        yearDistribution: yearStats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;