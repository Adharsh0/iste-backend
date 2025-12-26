const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ==================== CONFIGURATION ====================
const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: [
        'https://istembcet-asc26.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://www.istembcet-nexora.in',
        'https://istembcet-nexora.in'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });

// ==================== MODELS ====================
const registrationSchema = new mongoose.Schema({
    // Personal Information
    fullName: { 
        type: String, 
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        index: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        index: true
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'],
        trim: true,
        index: true
    },
    
    // Academic Information
    institution: {
        type: String,
        required: [true, 'Institution type is required'],
        enum: ['Engineering', 'Polytechnic'],
        trim: true,
        index: true
    },
    college: { 
        type: String, 
        required: [true, 'College name is required'],
        trim: true,
        index: true
    },
    department: { 
        type: String, 
        required: [true, 'Department is required'],
        trim: true,
        index: true
    },
    year: { 
        type: String, 
        required: [true, 'Academic year is required'],
        enum: ['First', 'Second', 'Third', 'Fourth', 'Final'],
        index: true
    },
    
    // ISTE Information
    isIsteMember: { 
        type: String, 
        required: [true, 'ISTE membership status is required'],
        enum: ['Yes', 'No'],
        index: true
    },
    isteRegistrationNumber: { 
        type: String, 
        default: '',
        trim: true
    },
    
    // Accommodation Information
    stayPreference: { 
        type: String, 
        required: [true, 'Stay preference is required'],
        enum: ['With Stay', 'Without Stay'],
        index: true
    },
    stayDates: {
        type: [String],
        default: []
    },
    stayDays: {
        type: Number,
        default: 0,
        min: [0, 'Stay days cannot be negative'],
        max: [3, 'Stay days cannot exceed 3']
    },
    
    // Payment Information
    totalAmount: { 
        type: Number, 
        required: [true, 'Total amount is required'],
        min: [0, 'Amount cannot be negative'],
        index: true
    },
    transactionId: { 
        type: String, 
        required: [true, 'Transaction ID is required'], 
        unique: true,
        trim: true,
        index: true
    },
    paymentStatus: { 
        type: String, 
        default: 'verified', 
        enum: ['verified', 'failed', 'pending'],
        index: true
    },
    
    // Registration Status
    registrationStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected'],
        index: true
    },
    registrationDate: { 
        type: Date, 
        default: Date.now,
        index: true 
    },
    
    // Admin Actions
    approvedBy: { 
        type: String, 
        default: '' 
    },
    approvedAt: { 
        type: Date,
        index: true
    },
    rejectedAt: { 
        type: Date,
        index: true
    },
    rejectionReason: { 
        type: String, 
        default: '',
        trim: true
    }
}, {
    timestamps: true
});

// Add indexes for common queries
registrationSchema.index({ registrationStatus: 1, registrationDate: -1 });
registrationSchema.index({ stayPreference: 1, registrationStatus: 1 });
registrationSchema.index({ institution: 1, registrationStatus: 1 });
registrationSchema.index({ email: 1, transactionId: 1 });

const Registration = mongoose.model('Registration', registrationSchema);

// ==================== DATABASE MIGRATION ====================
const migrateExistingDocuments = async () => {
    try {
        const docsToUpdate = await Registration.find({
            $or: [
                { institution: { $exists: false } },
                { stayDays: { $exists: false } }
            ]
        });
        
        if (docsToUpdate.length === 0) {
            console.log('✅ Database is up-to-date');
            return;
        }
        
        console.log(`📋 Migrating ${docsToUpdate.length} documents`);
        
        let updatedCount = 0;
        for (const doc of docsToUpdate) {
            const updates = {};
            
            if (!doc.institution) {
                updates.institution = 'Engineering';
            }
            
            if (doc.stayDays === undefined || doc.stayDays === null) {
                updates.stayDays = doc.stayPreference === 'With Stay' ? 1 : 0;
            }
            
            if (Object.keys(updates).length > 0) {
                await Registration.updateOne({ _id: doc._id }, { $set: updates });
                updatedCount++;
            }
        }
        
        console.log(`✅ Migration completed: Updated ${updatedCount} documents`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    }
};

// Run migration when connected
mongoose.connection.on('connected', async () => {
    await migrateExistingDocuments();
});

// ==================== AUTHENTICATION MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// ==================== PUBLIC ROUTES ====================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ISTE Industry 5.0 Registration API',
        version: '1.0.0'
    });
});

app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
        success: true,
        status: 'healthy',
        database: dbStatus
    });
});

// GET stay availability
app.get('/api/stay-availability', async (req, res) => {
  try {
    const stayUsersCount = await Registration.countDocuments({
      stayPreference: 'With Stay',
      registrationStatus: 'approved'
    });
    
    const maxStayCapacity = 100;
    const remainingSpots = Math.max(0, maxStayCapacity - stayUsersCount);
    const available = remainingSpots > 0;
    
    res.json({
      success: true,
      data: {
        available,
        remaining: remainingSpots,
        totalCapacity: maxStayCapacity,
        used: stayUsersCount
      }
    });
  } catch (error) {
    console.error('Stay availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stay availability'
    });
  }
});

app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required'
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format'
            });
        }

        const existingRegistration = await Registration.findOne({ 
            email: cleanEmail 
        });

        const exists = !!existingRegistration;
        
        return res.json({
            success: true,
            exists: exists,
            message: exists ? 'Email already registered' : 'Email available'
        });

    } catch (error) {
        console.error('Error checking email:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error checking email'
        });
    }
});

app.get('/api/check-status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        if (!transactionId || transactionId.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Valid transaction ID is required'
            });
        }

        const registration = await Registration.findOne({ 
            transactionId: transactionId.trim() 
        }).select('fullName email registrationStatus registrationDate transactionId stayDates stayDays');

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
        console.error('Check status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking registration status'
        });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            institution,
            college,
            department,
            otherDepartment,
            year,
            isIsteMember,
            isteRegistrationNumber,
            stayPreference,
            stayDates,
            totalAmount,
            transactionId
        } = req.body;

        // Validate required fields
        const requiredFields = {
            fullName, email, phone, institution, college, department, year, 
            isIsteMember, stayPreference, totalAmount, transactionId
        };
        
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => {
                if (value === undefined || value === null) return true;
                if (typeof value === 'string' && value.trim() === '') return true;
                return false;
            })
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided',
                missingFields
            });
        }

        // Validate department - handle "Other" option
        let finalDepartment = department.trim();
        if (department === 'Other') {
            if (!otherDepartment || otherDepartment.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Please specify your department name when selecting "Other"'
                });
            }
            finalDepartment = otherDepartment.trim();
        }

        // Validate stay selection
        if (stayPreference === 'With Stay') {
            // Check stay capacity
            const stayUsersCount = await Registration.countDocuments({
                stayPreference: 'With Stay',
                registrationStatus: 'approved'
            });
            
            if (stayUsersCount >= 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Stay accommodation is full'
                });
            }
            
            // Validate stayDates
            if (!Array.isArray(stayDates) || stayDates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select at least one stay date'
                });
            }
            
            // Validate each date is Jan 29, 30, or 31 2026
            const validDays = [29, 30, 31];
            const invalidDates = [];
            
            for (const dateStr of stayDates) {
                try {
                    const date = new Date(dateStr);
                    
                    if (isNaN(date.getTime())) {
                        invalidDates.push(dateStr);
                        continue;
                    }
                    
                    if (date.getFullYear() !== 2026 || date.getMonth() !== 0) {
                        invalidDates.push(dateStr);
                        continue;
                    }
                    
                    const day = date.getDate();
                    if (!validDays.includes(day)) {
                        invalidDates.push(dateStr);
                        continue;
                    }
                    
                } catch (error) {
                    invalidDates.push(dateStr);
                }
            }
            
            if (invalidDates.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stay dates must be 29, 30, or 31 January 2026'
                });
            }
            
            // Max 3 days
            if (stayDates.length > 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 3 stay days allowed'
                });
            }
        }

        const cleanEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check for duplicates
        const existingEmail = await Registration.findOne({ email: cleanEmail });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered'
            });
        }

        const existingTransaction = await Registration.findOne({ 
            transactionId: transactionId.trim() 
        });
        
        if (existingTransaction) {
            return res.status(400).json({
                success: false,
                message: 'This transaction ID is already used'
            });
        }

        // Create and save registration
        const registration = new Registration({
            fullName: fullName.trim(),
            email: cleanEmail,
            phone: phone.trim(),
            institution: institution.trim(),
            college: college.trim(),
            department: finalDepartment,
            year,
            isIsteMember,
            isteRegistrationNumber: isteRegistrationNumber ? isteRegistrationNumber.trim() : '',
            stayPreference,
            stayDates: stayPreference === 'With Stay' ? stayDates : [],
            stayDays: stayPreference === 'With Stay' ? stayDates.length : 0,
            totalAmount: Number(totalAmount),
            transactionId: transactionId.trim(),
            paymentStatus: 'verified',
            registrationStatus: 'pending'
        });

        await registration.save();

        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully! Your registration is pending admin approval.',
            data: {
                id: registration._id,
                registrationId: `ISTE${registration._id.toString().slice(-8).toUpperCase()}`,
                fullName: registration.fullName,
                email: registration.email,
                transactionId: registration.transactionId,
                totalAmount: registration.totalAmount,
                registrationStatus: registration.registrationStatus
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        if (error.code === 11000) {
            const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
            const message = duplicateField === 'email' 
                ? 'This email is already registered'
                : 'This transaction ID is already used';
                
            return res.status(400).json({
                success: false,
                message
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ==================== ADMIN ROUTES ====================

app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            { 
                id: 1, 
                username: username,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            expiresIn: 8 * 60 * 60
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

app.get('/api/admin/registrations', authenticateToken, async (req, res) => {
    try {
        const { status, search, institution, page = 1, limit = 50 } = req.query;
        
        let query = {};
        
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.registrationStatus = status;
        }
        
        if (institution && ['Engineering', 'Polytechnic'].includes(institution)) {
            query.institution = institution;
        }
        
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { transactionId: searchRegex },
                { college: searchRegex },
                { department: searchRegex }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [registrations, total] = await Promise.all([
            Registration.find(query)
                .sort({ registrationDate: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Registration.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: registrations.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: registrations
        });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations'
        });
    }
});

app.put('/api/admin/registration/:id/approve', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedBy = req.user.username || 'Admin' } = req.body;

        const registration = await Registration.findByIdAndUpdate(
            id,
            {
                registrationStatus: 'approved',
                approvedBy,
                approvedAt: new Date(),
                $unset: { rejectedAt: 1, rejectionReason: 1 }
            },
            { new: true, runValidators: true }
        );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        res.json({
            success: true,
            message: 'Registration approved successfully',
            data: registration
        });

    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve registration'
        });
    }
});

app.put('/api/admin/registration/:id/reject', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason = '' } = req.body;

        if (!reason || reason.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required (minimum 5 characters)'
            });
        }

        const registration = await Registration.findByIdAndUpdate(
            id,
            {
                registrationStatus: 'rejected',
                rejectedAt: new Date(),
                rejectionReason: reason.trim(),
                $unset: { approvedBy: 1, approvedAt: 1 }
            },
            { new: true, runValidators: true }
        );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        res.json({
            success: true,
            message: 'Registration rejected',
            data: registration
        });

    } catch (error) {
        console.error('Reject error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject registration'
        });
    }
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const [
            totalRegistrations,
            pendingRegistrations,
            approvedRegistrations,
            rejectedRegistrations,
            totalRevenue
        ] = await Promise.all([
            Registration.countDocuments(),
            Registration.countDocuments({ registrationStatus: 'pending' }),
            Registration.countDocuments({ registrationStatus: 'approved' }),
            Registration.countDocuments({ registrationStatus: 'rejected' }),
            Registration.aggregate([
                { $match: { registrationStatus: 'approved' } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ])
        ]);

        const stayStats = await Registration.aggregate([
            {
                $group: {
                    _id: "$stayPreference",
                    count: { $sum: 1 }
                }
            }
        ]);

        const institutionStats = await Registration.aggregate([
            {
                $group: {
                    _id: "$institution",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate stay capacity stats
        const stayCapacity = 100;
        const usedStay = await Registration.countDocuments({ 
            stayPreference: 'With Stay',
            registrationStatus: 'approved'
        });
        const remainingStay = Math.max(0, stayCapacity - usedStay);

        res.json({
            success: true,
            data: {
                totalRegistrations,
                pendingRegistrations,
                approvedRegistrations,
                rejectedRegistrations,
                totalRevenue: totalRevenue[0]?.total || 0,
                stayStats: {
                    capacity: stayCapacity,
                    used: usedStay,
                    remaining: remainingStay
                },
                institutionStats: institutionStats,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch statistics'
        });
    }
});

// ==================== ERROR HANDLING ====================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    
    res.status(err.status || 500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});