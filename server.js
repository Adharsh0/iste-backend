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
        console.error(`❌ ERROR: Missing required environment variable: ${varName}`);
        console.error(`   Please add ${varName}=value to your .env file`);
        process.exit(1);
    }
});

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: [
        'https://istembcet-asc26.vercel.app',  // Your Vercel frontend
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE CONNECTION (FIXED) ====================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not defined in environment variables');
    console.error('   Please add MONGODB_URI to your .env file');
    process.exit(1);
}

// Connect to MongoDB (Updated for Mongoose 7+)
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas!');
        console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'iste_industry5'}`);
        console.log(`📈 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        console.error('   Please check:');
        console.error('   1. MongoDB Atlas network access (add your IP)');
        console.error('   2. Database user password is correct');
        console.error('   3. Internet connection');
        process.exit(1);
    });

// MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('📡 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
});

// ==================== MODELS ====================
const registrationSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'],
        trim: true
    },
    college: { 
        type: String, 
        required: [true, 'College name is required'],
        trim: true
    },
    department: { 
        type: String, 
        required: [true, 'Department is required'],
        trim: true
    },
    year: { 
        type: String, 
        required: [true, 'Academic year is required'],
        enum: ['First', 'Second', 'Third', 'Fourth', 'Final']
    },
    isIsteMember: { 
        type: String, 
        required: [true, 'ISTE membership status is required'],
        enum: ['Yes', 'No']
    },
    isteRegistrationNumber: { 
        type: String, 
        default: '',
        trim: true
    },
    stayPreference: { 
        type: String, 
        required: [true, 'Stay preference is required'],
        enum: ['With Stay', 'Without Stay']
    },
    totalAmount: { 
        type: Number, 
        required: [true, 'Total amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    transactionId: { 
        type: String, 
        required: [true, 'Transaction ID is required'], 
        unique: true,
        trim: true
    },
    paymentStatus: { 
        type: String, 
        default: 'verified', 
        enum: ['verified', 'failed', 'pending']
    },
    registrationStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    registrationDate: { 
        type: Date, 
        default: Date.now 
    },
    approvedBy: { 
        type: String, 
        default: '' 
    },
    approvedAt: { 
        type: Date 
    },
    rejectedAt: { 
        type: Date 
    },
    rejectionReason: { 
        type: String, 
        default: '',
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const Registration = mongoose.model('Registration', registrationSchema);

// ==================== AUTHENTICATION MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required. Please login first.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
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
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        endpoints: {
            public: {
                register: 'POST /api/register',
                checkEmail: 'POST /api/check-email',
                health: 'GET /api/health',
                checkStatus: 'GET /api/check-status/:transactionId'
            },
            admin: {
                login: 'POST /api/admin/login',
                registrations: 'GET /api/admin/registrations',
                approve: 'PUT /api/admin/registration/:id/approve',
                reject: 'PUT /api/admin/registration/:id/reject',
                stats: 'GET /api/admin/stats'
            }
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const uptime = process.uptime();
    
    res.json({
        success: true,
        status: 'healthy',
        database: dbStatus,
        uptime: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`,
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        timestamp: new Date().toISOString()
    });
});

// ✅ NEW ENDPOINT: Check if email already exists
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('📧 Checking email:', email);
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required',
                exists: false
            });
        }

        // Clean and validate email
        const cleanEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format',
                exists: false
            });
        }

        // Check if email exists in database
        const existingRegistration = await Registration.findOne({ 
            email: cleanEmail 
        });

        const exists = !!existingRegistration;
        
        console.log(`📊 Email ${cleanEmail} exists: ${exists}`);
        
        return res.json({
            success: true,
            exists: exists,
            message: exists ? 'Email already registered' : 'Email available',
            data: exists ? {
                id: existingRegistration._id,
                fullName: existingRegistration.fullName,
                status: existingRegistration.registrationStatus
            } : null
        });

    } catch (error) {
        console.error('❌ Error checking email:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error checking email',
            exists: false
        });
    }
});

// Check registration status by transaction ID
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
        }).select('fullName email registrationStatus registrationDate transactionId');

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found with this transaction ID'
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

// Register endpoint with duplicate email check
app.post('/api/register', async (req, res) => {
    try {
        console.log('📝 Registration request received');

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

        // Validate required fields
        const requiredFields = {
            fullName, email, phone, college, department, year, 
            isIsteMember, stayPreference, totalAmount, transactionId
        };
        
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided',
                missingFields
            });
        }

        // Clean and validate email
        const cleanEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Double-check for duplicate email (safety check)
        const existingEmail = await Registration.findOne({ email: cleanEmail });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered. Please use a different email.'
            });
        }

        // Check for duplicate transaction ID
        const existingTransaction = await Registration.findOne({ 
            transactionId: transactionId.trim() 
        });
        
        if (existingTransaction) {
            return res.status(400).json({
                success: false,
                message: 'This transaction ID is already used. Please verify your payment.'
            });
        }

        // Create new registration
        const registration = new Registration({
            fullName: fullName.trim(),
            email: cleanEmail,
            phone: phone.trim(),
            college: college.trim(),
            department: department.trim(),
            year,
            isIsteMember,
            isteRegistrationNumber: isteRegistrationNumber ? isteRegistrationNumber.trim() : '',
            stayPreference,
            totalAmount: Number(totalAmount),
            transactionId: transactionId.trim(),
            paymentStatus: 'verified',
            registrationStatus: 'pending'
        });

        await registration.save();

        console.log(`✅ Registration saved: ${registration._id}`);
        console.log(`📧 Email: ${cleanEmail}`);
        console.log(`💰 Amount: ${registration.totalAmount}`);
        console.log(`📋 Status: ${registration.registrationStatus}`);

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
                registrationStatus: registration.registrationStatus,
                registrationDate: registration.registrationDate
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error.message);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
            const message = duplicateField === 'email' 
                ? 'This email is already registered. Please use a different email.'
                : duplicateField === 'transactionId'
                ? 'This transaction ID is already used. Please verify your payment.'
                : `${duplicateField} already exists.`;
                
            return res.status(400).json({
                success: false,
                message
            });
        }

        // Handle validation errors
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
            message: 'Server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ==================== ADMIN ROUTES ====================

// Admin login with JWT
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Compare with environment variables
        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            console.warn(`⚠️ Failed login attempt for username: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: 1, 
                username: username,
                role: 'admin',
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.log(`✅ Admin login successful: ${username}`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            expiresIn: 8 * 60 * 60, // 8 hours in seconds
            admin: {
                id: 1,
                name: 'ISTE Admin',
                username: username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Get all registrations (admin only)
app.get('/api/admin/registrations', authenticateToken, async (req, res) => {
    try {
        const { status, search, page = 1, limit = 50 } = req.query;
        
        let query = {};
        
        // Filter by status
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.registrationStatus = status;
        }
        
        // Search in name, email, or transaction ID
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { transactionId: searchRegex },
                { college: searchRegex }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [registrations, total] = await Promise.all([
            Registration.find(query)
                .sort({ registrationDate: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('-__v'),
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

// Get single registration by ID (admin only)
app.get('/api/admin/registration/:id', authenticateToken, async (req, res) => {
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

// Approve registration (admin only)
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

        console.log(`✅ Registration ${id} approved by ${approvedBy}`);

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

// Reject registration (admin only)
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

        console.log(`❌ Registration ${id} rejected. Reason: ${reason}`);

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

// Get registration statistics (admin only)
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
                    count: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ["$registrationStatus", "pending"] }, 1, 0] }
                    },
                    approved: {
                        $sum: { $cond: [{ $eq: ["$registrationStatus", "approved"] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ["$registrationStatus", "rejected"] }, 1, 0] }
                    }
                }
            }
        ]);

        // Add email stats
        const emailStats = await Registration.aggregate([
            {
                $group: {
                    _id: { $substr: ["$email", { $indexOfBytes: ["$email", "@"] }, 100] },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                totalRegistrations,
                pendingRegistrations,
                approvedRegistrations,
                rejectedRegistrations,
                totalRevenue: totalRevenue[0]?.total || 0,
                stayPreferenceStats: stayStats,
                emailDomainStats: emailStats,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        requestedUrl: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🚨 Unhandled error:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Admin login: POST http://localhost:${PORT}/api/admin/login`);
    console.log(`📧 Email check: POST http://localhost:${PORT}/api/check-email`);
    console.log(`📊 Health check: GET http://localhost:${PORT}/api/health`);
    console.log('========================================');
});
