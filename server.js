// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const sendEmail = require('./utils/sendEmail');

// const app = express();

// // ==================== CONFIGURATION ====================
// const PORT = process.env.PORT || 5000;

// // Validate required environment variables
// const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
// requiredEnvVars.forEach(varName => {
//     if (!process.env[varName]) {
//         console.error(`❌ ERROR: Missing required environment variable: ${varName}`);
//         console.error(`   Please add ${varName}=value to your .env file`);
//         process.exit(1);
//     }
// });

// // ==================== MIDDLEWARE ====================
// app.use(cors({
//     origin: [
//         'https://istembcet-asc26.vercel.app',
//         'http://localhost:5173',
//         'http://localhost:3000',
//         'https://www.istembcet-nexora.in',
//         'https://istembcet-nexora.in'
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ==================== DATABASE CONNECTION ====================
// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//     console.error('❌ ERROR: MONGODB_URI is not defined in environment variables');
//     console.error('   Please add MONGODB_URI to your .env file');
//     process.exit(1);
// }

// mongoose.connect(MONGODB_URI)
//     .then(() => {
//         console.log('✅ Connected to MongoDB Atlas!');
//         console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'iste_industry5'}`);
//         console.log(`📈 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
//     })
//     .catch(err => {
//         console.error('❌ MongoDB connection failed:', err.message);
//         console.error('   Please check:');
//         console.error('   1. MongoDB Atlas network access (add your IP)');
//         console.error('   2. Database user password is correct');
//         console.error('   3. Internet connection');
//         process.exit(1);
//     });

// // ==================== MODELS ====================
// const registrationSchema = new mongoose.Schema({
//     // Personal Information
//     fullName: { 
//         type: String, 
//         required: [true, 'Full name is required'],
//         trim: true,
//         minlength: [2, 'Full name must be at least 2 characters']
//     },
//     email: { 
//         type: String, 
//         required: [true, 'Email is required'], 
//         unique: true, 
//         lowercase: true,
//         trim: true,
//         match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
//     },
//     phone: { 
//         type: String, 
//         required: [true, 'Phone number is required'],
//         trim: true
//     },
    
//     // Academic Information
//     institution: {
//         type: String,
//         required: [true, 'Institution type is required'],
//         enum: {
//             values: ['Engineering', 'Polytechnic'],
//             message: 'Institution must be either Engineering or Polytechnic'
//         },
//         trim: true
//     },
//     college: { 
//         type: String, 
//         required: [true, 'College name is required'],
//         trim: true
//     },
//     department: { 
//         type: String, 
//         required: [true, 'Department is required'],
//         trim: true
//     },
//     year: { 
//         type: String, 
//         required: [true, 'Academic year is required'],
//         enum: ['First', 'Second', 'Third', 'Fourth', 'Final']
//     },
    
//     // ISTE Information
//     isIsteMember: { 
//         type: String, 
//         required: [true, 'ISTE membership status is required'],
//         enum: ['Yes', 'No']
//     },
//     isteRegistrationNumber: { 
//         type: String, 
//         default: '',
//         trim: true
//     },
    
//     // Accommodation Information
//     stayPreference: { 
//         type: String, 
//         required: [true, 'Stay preference is required'],
//         enum: ['With Stay', 'Without Stay']
//     },
//     stayDays: {
//         type: Number,
//         default: 0,
//         min: [0, 'Stay days cannot be negative'],
//         max: [10, 'Stay days cannot exceed 10']
//     },
    
//     // Payment Information
//     totalAmount: { 
//         type: Number, 
//         required: [true, 'Total amount is required'],
//         min: [0, 'Amount cannot be negative']
//     },
//     transactionId: { 
//         type: String, 
//         required: [true, 'Transaction ID is required'], 
//         unique: true,
//         trim: true
//     },
//     paymentStatus: { 
//         type: String, 
//         default: 'verified', 
//         enum: ['verified', 'failed', 'pending']
//     },
    
//     // Registration Status
//     registrationStatus: {
//         type: String,
//         default: 'pending',
//         enum: ['pending', 'approved', 'rejected']
//     },
//     registrationDate: { 
//         type: Date, 
//         default: Date.now 
//     },
    
//     // Admin Actions
//     approvedBy: { 
//         type: String, 
//         default: '' 
//     },
//     approvedAt: { 
//         type: Date 
//     },
//     rejectedAt: { 
//         type: Date 
//     },
//     rejectionReason: { 
//         type: String, 
//         default: '',
//         trim: true
//     }
// }, {
//     timestamps: true
// });

// const Registration = mongoose.model('Registration', registrationSchema);

// // ==================== DATABASE MIGRATION ====================
// const migrateExistingDocuments = async () => {
//     try {
//         console.log('🔍 Checking for documents that need migration...');
        
//         const docsToUpdate = await Registration.find({
//             $or: [
//                 { institution: { $exists: false } },
//                 { stayDays: { $exists: false } }
//             ]
//         });
        
//         if (docsToUpdate.length === 0) {
//             console.log('✅ All documents are up-to-date');
//             return;
//         }
        
//         console.log(`📋 Found ${docsToUpdate.length} documents needing migration`);
        
//         let updatedCount = 0;
//         for (const doc of docsToUpdate) {
//             const updates = {};
            
//             if (!doc.institution) {
//                 updates.institution = 'Engineering';
//             }
            
//             if (doc.stayDays === undefined || doc.stayDays === null) {
//                 updates.stayDays = doc.stayPreference === 'With Stay' ? 1 : 0;
//             }
            
//             if (Object.keys(updates).length > 0) {
//                 await Registration.updateOne({ _id: doc._id }, { $set: updates });
//                 updatedCount++;
//             }
//         }
        
//         console.log(`✅ Migration completed: Updated ${updatedCount} documents`);
        
//     } catch (error) {
//         console.error('❌ Migration failed:', error.message);
//     }
// };

// // Run migration when connected
// mongoose.connection.on('connected', async () => {
//     console.log('📡 MongoDB connection established');
//     await migrateExistingDocuments();
// });

// mongoose.connection.on('error', (err) => {
//     console.error('❌ MongoDB connection error:', err.message);
// });

// mongoose.connection.on('disconnected', () => {
//     console.warn('⚠️ MongoDB disconnected');
// });

// // ==================== AUTHENTICATION MIDDLEWARE ====================
// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             message: 'Access token required. Please login first.'
//         });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Invalid or expired token. Please login again.'
//             });
//         }
//         req.user = user;
//         next();
//     });
// };

// // ==================== PUBLIC ROUTES ====================
// app.get('/', (req, res) => {
//     res.json({
//         success: true,
//         message: 'ISTE Industry 5.0 Registration API',
//         version: '1.0.0',
//         environment: process.env.NODE_ENV || 'development',
//         timestamp: new Date().toISOString(),
//         database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
//         endpoints: {
//             public: {
//                 register: 'POST /api/register',
//                 checkEmail: 'POST /api/check-email',
//                 health: 'GET /api/health',
//                 checkStatus: 'GET /api/check-status/:transactionId'
//             },
//             admin: {
//                 login: 'POST /api/admin/login',
//                 registrations: 'GET /api/admin/registrations',
//                 approve: 'PUT /api/admin/registration/:id/approve',
//                 reject: 'PUT /api/admin/registration/:id/reject',
//                 stats: 'GET /api/admin/stats'
//             }
//         }
//     });
// });

// app.get('/api/health', (req, res) => {
//     const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
//     const uptime = process.uptime();
    
//     res.json({
//         success: true,
//         status: 'healthy',
//         database: dbStatus,
//         uptime: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`,
//         memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
//         timestamp: new Date().toISOString()
//     });
// });

// app.post('/api/check-email', async (req, res) => {
//     try {
//         const { email } = req.body;
        
//         if (!email) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'Email is required',
//                 exists: false
//             });
//         }

//         const cleanEmail = email.toLowerCase().trim();
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
//         if (!emailRegex.test(cleanEmail)) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'Invalid email format',
//                 exists: false
//             });
//         }

//         const existingRegistration = await Registration.findOne({ 
//             email: cleanEmail 
//         });

//         const exists = !!existingRegistration;
        
//         return res.json({
//             success: true,
//             exists: exists,
//             message: exists ? 'Email already registered' : 'Email available',
//             data: exists ? {
//                 id: existingRegistration._id,
//                 fullName: existingRegistration.fullName,
//                 status: existingRegistration.registrationStatus
//             } : null
//         });

//     } catch (error) {
//         console.error('❌ Error checking email:', error.message);
//         return res.status(500).json({ 
//             success: false, 
//             message: 'Server error checking email',
//             exists: false
//         });
//     }
// });

// app.get('/api/check-status/:transactionId', async (req, res) => {
//     try {
//         const { transactionId } = req.params;
        
//         if (!transactionId || transactionId.trim().length < 3) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid transaction ID is required'
//             });
//         }

//         const registration = await Registration.findOne({ 
//             transactionId: transactionId.trim() 
//         }).select('fullName email registrationStatus registrationDate transactionId');

//         if (!registration) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Registration not found with this transaction ID'
//             });
//         }

//         res.json({
//             success: true,
//             data: registration
//         });
//     } catch (error) {
//         console.error('Check status error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error checking registration status'
//         });
//     }
// });

// app.post('/api/register', async (req, res) => {
//     try {
//         console.log('📝 New registration request');
        
//         const {
//             fullName,
//             email,
//             phone,
//             institution,
//             college,
//             department,
//             otherDepartment,
//             year,
//             isIsteMember,
//             isteRegistrationNumber,
//             stayPreference,
//             stayDays,
//             totalAmount,
//             transactionId
//         } = req.body;

//         // Validate required fields
//         const requiredFields = {
//             fullName, email, phone, institution, college, department, year, 
//             isIsteMember, stayPreference, totalAmount, transactionId
//         };
        
//         const missingFields = Object.entries(requiredFields)
//             .filter(([key, value]) => {
//                 if (value === undefined || value === null) return true;
//                 if (typeof value === 'string' && value.trim() === '') return true;
//                 return false;
//             })
//             .map(([key]) => key);

//         if (missingFields.length > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'All required fields must be provided',
//                 missingFields
//             });
//         }

//         // Validate department - handle "Other" option
//         let finalDepartment = department.trim();
//         if (department === 'Other') {
//             if (!otherDepartment || otherDepartment.trim() === '') {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Please specify your department name when selecting "Other"'
//                 });
//             }
//             finalDepartment = otherDepartment.trim();
//         }

//         // Validate stayDays based on stayPreference
//         let finalStayDays = 0;
//         if (stayPreference === 'With Stay') {
//             if (!stayDays || stayDays < 1) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Stay days must be at least 1 when selecting "With Stay"'
//                 });
//             }
//             if (stayDays > 10) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Stay days cannot exceed 10'
//                 });
//             }
//             finalStayDays = Number(stayDays);
//         } else {
//             // For "Without Stay", explicitly set to 0
//             finalStayDays = 0;
//         }

//         const cleanEmail = email.toLowerCase().trim();
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
//         if (!emailRegex.test(cleanEmail)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid email format'
//             });
//         }

//         // Check for duplicates
//         const existingEmail = await Registration.findOne({ email: cleanEmail });
//         if (existingEmail) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'This email is already registered. Please use a different email.'
//             });
//         }

//         const existingTransaction = await Registration.findOne({ 
//             transactionId: transactionId.trim() 
//         });
        
//         if (existingTransaction) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'This transaction ID is already used. Please verify your payment.'
//             });
//         }

//         // Create and save registration
//         const registration = new Registration({
//             fullName: fullName.trim(),
//             email: cleanEmail,
//             phone: phone.trim(),
//             institution: institution.trim(),
//             college: college.trim(),
//             department: finalDepartment, // Use the processed department
//             year,
//             isIsteMember,
//             isteRegistrationNumber: isteRegistrationNumber ? isteRegistrationNumber.trim() : '',
//             stayPreference,
//             stayDays: finalStayDays,
//             totalAmount: Number(totalAmount),
//             transactionId: transactionId.trim(),
//             paymentStatus: 'verified',
//             registrationStatus: 'pending'
//         });

//         await registration.save();

//         console.log(`✅ Registration saved: ${registration._id}`);

//         res.status(201).json({
//             success: true,
//             message: 'Registration submitted successfully! Your registration is pending admin approval.',
//             data: {
//                 id: registration._id,
//                 registrationId: `ISTE${registration._id.toString().slice(-8).toUpperCase()}`,
//                 fullName: registration.fullName,
//                 email: registration.email,
//                 phone: registration.phone,
//                 institution: registration.institution,
//                 college: registration.college,
//                 department: registration.department,
//                 year: registration.year,
//                 isIsteMember: registration.isIsteMember,
//                 isteRegistrationNumber: registration.isteRegistrationNumber,
//                 stayPreference: registration.stayPreference,
//                 stayDays: registration.stayDays,
//                 transactionId: registration.transactionId,
//                 totalAmount: registration.totalAmount,
//                 registrationStatus: registration.registrationStatus,
//                 registrationDate: registration.registrationDate
//             }
//         });

//     } catch (error) {
//         console.error('❌ Registration error:', error.message);

//         if (error.code === 11000) {
//             const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
//             const message = duplicateField === 'email' 
//                 ? 'This email is already registered. Please use a different email.'
//                 : duplicateField === 'transactionId'
//                 ? 'This transaction ID is already used. Please verify your payment.'
//                 : `${duplicateField} already exists.`;
                
//             return res.status(400).json({
//                 success: false,
//                 message
//             });
//         }

//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: 'Server error. Please try again later.',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });

// // ==================== ADMIN ROUTES ====================

// app.post('/api/admin/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         if (!username || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Username and password are required'
//             });
//         }

//         if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
//             console.warn(`⚠️ Failed login attempt for username: ${username}`);
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid username or password'
//             });
//         }

//         const token = jwt.sign(
//             { 
//                 id: 1, 
//                 username: username,
//                 role: 'admin',
//                 iat: Math.floor(Date.now() / 1000)
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '8h' }
//         );

//         console.log(`✅ Admin login successful: ${username}`);

//         res.json({
//             success: true,
//             message: 'Login successful',
//             token,
//             expiresIn: 8 * 60 * 60,
//             admin: {
//                 id: 1,
//                 name: 'ISTE Admin',
//                 username: username
//             }
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error during login'
//         });
//     }
// });

// app.get('/api/admin/registrations', authenticateToken, async (req, res) => {
//     try {
//         const { status, search, institution, page = 1, limit = 50 } = req.query;
        
//         let query = {};
        
//         if (status && ['pending', 'approved', 'rejected'].includes(status)) {
//             query.registrationStatus = status;
//         }
        
//         if (institution && ['Engineering', 'Polytechnic'].includes(institution)) {
//             query.institution = institution;
//         }
        
//         if (search && search.trim()) {
//             const searchRegex = new RegExp(search.trim(), 'i');
//             query.$or = [
//                 { fullName: searchRegex },
//                 { email: searchRegex },
//                 { transactionId: searchRegex },
//                 { college: searchRegex },
//                 { department: searchRegex }
//             ];
//         }

//         const skip = (parseInt(page) - 1) * parseInt(limit);
        
//         const [registrations, total] = await Promise.all([
//             Registration.find(query)
//                 .sort({ registrationDate: -1 })
//                 .skip(skip)
//                 .limit(parseInt(limit))
//                 .lean(),
//             Registration.countDocuments(query)
//         ]);

//         res.json({
//             success: true,
//             count: registrations.length,
//             total,
//             page: parseInt(page),
//             totalPages: Math.ceil(total / parseInt(limit)),
//             data: registrations
//         });
//     } catch (error) {
//         console.error('Get registrations error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch registrations'
//         });
//     }
// });

// app.get('/api/admin/registration/:id', authenticateToken, async (req, res) => {
//     try {
//         const registration = await Registration.findById(req.params.id)
//             .lean();

//         if (!registration) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Registration not found'
//             });
//         }

//         res.json({
//             success: true,
//             data: registration
//         });
//     } catch (error) {
//         console.error('Get registration error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// });

// app.put('/api/admin/registration/:id/approve', authenticateToken, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { approvedBy = req.user.username || 'Admin' } = req.body;

//         const registration = await Registration.findByIdAndUpdate(
//             id,
//             {
//                 registrationStatus: 'approved',
//                 approvedBy,
//                 approvedAt: new Date(),
//                 $unset: { rejectedAt: 1, rejectionReason: 1 }
//             },
//             { new: true, runValidators: true }
//         );

//         if (!registration) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Registration not found'
//             });
//         }

//         console.log(`✅ Registration ${id} approved by ${approvedBy}`);

//         res.json({
//             success: true,
//             message: 'Registration approved successfully',
//             data: registration
//         });

//     } catch (error) {
//         console.error('Approve error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to approve registration'
//         });
//     }
// });

// app.put('/api/admin/registration/:id/reject', authenticateToken, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { reason = '' } = req.body;

//         if (!reason || reason.trim().length < 5) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Rejection reason is required (minimum 5 characters)'
//             });
//         }

//         const registration = await Registration.findByIdAndUpdate(
//             id,
//             {
//                 registrationStatus: 'rejected',
//                 rejectedAt: new Date(),
//                 rejectionReason: reason.trim(),
//                 $unset: { approvedBy: 1, approvedAt: 1 }
//             },
//             { new: true, runValidators: true }
//         );

//         if (!registration) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Registration not found'
//             });
//         }

//         console.log(`❌ Registration ${id} rejected. Reason: ${reason}`);

//         res.json({
//             success: true,
//             message: 'Registration rejected',
//             data: registration
//         });

//     } catch (error) {
//         console.error('Reject error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to reject registration'
//         });
//     }
// });

// app.get('/api/admin/stats', authenticateToken, async (req, res) => {
//     try {
//         const [
//             totalRegistrations,
//             pendingRegistrations,
//             approvedRegistrations,
//             rejectedRegistrations,
//             totalRevenue
//         ] = await Promise.all([
//             Registration.countDocuments(),
//             Registration.countDocuments({ registrationStatus: 'pending' }),
//             Registration.countDocuments({ registrationStatus: 'approved' }),
//             Registration.countDocuments({ registrationStatus: 'rejected' }),
//             Registration.aggregate([
//                 { $match: { registrationStatus: 'approved' } },
//                 { $group: { _id: null, total: { $sum: "$totalAmount" } } }
//             ])
//         ]);

//         const stayStats = await Registration.aggregate([
//             {
//                 $group: {
//                     _id: "$stayPreference",
//                     count: { $sum: 1 },
//                     totalStayDays: { $sum: { $ifNull: ["$stayDays", 0] } },
//                     pending: {
//                         $sum: { $cond: [{ $eq: ["$registrationStatus", "pending"] }, 1, 0] }
//                     },
//                     approved: {
//                         $sum: { $cond: [{ $eq: ["$registrationStatus", "approved"] }, 1, 0] }
//                     },
//                     rejected: {
//                         $sum: { $cond: [{ $eq: ["$registrationStatus", "rejected"] }, 1, 0] }
//                     }
//                 }
//             }
//         ]);

//         const institutionStats = await Registration.aggregate([
//             {
//                 $group: {
//                     _id: "$institution",
//                     count: { $sum: 1 },
//                     pending: {
//                         $sum: { $cond: [{ $eq: ["$registrationStatus", "pending"] }, 1, 0] }
//                     },
//                     approved: {
//                         $sum: { $cond: [{ $eq: ["$registrationStatus", "approved"] }, 1, 0] }
//                     },
//                     rejected: {
//                         $sum: { $cond: [{ $eq: ["$registrationStatus", "rejected"] }, 1, 0] }
//                     }
//                 }
//             }
//         ]);

//         const departmentStats = await Registration.aggregate([
//             {
//                 $group: {
//                     _id: "$department",
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { count: -1 } },
//             { $limit: 20 }
//         ]);

//         const emailStats = await Registration.aggregate([
//             {
//                 $group: {
//                     _id: { $substr: ["$email", { $indexOfBytes: ["$email", "@"] }, 100] },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { count: -1 } },
//             { $limit: 10 }
//         ]);

//         res.json({
//             success: true,
//             data: {
//                 totalRegistrations,
//                 pendingRegistrations,
//                 approvedRegistrations,
//                 rejectedRegistrations,
//                 totalRevenue: totalRevenue[0]?.total || 0,
//                 stayPreferenceStats: stayStats,
//                 institutionStats: institutionStats,
//                 departmentStats: departmentStats,
//                 emailDomainStats: emailStats,
//                 lastUpdated: new Date().toISOString()
//             }
//         });

//     } catch (error) {
//         console.error('Stats error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Failed to fetch statistics',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });

// // ==================== ERROR HANDLING ====================

// app.use('*', (req, res) => {
//     res.status(404).json({
//         success: false,
//         message: 'Endpoint not found',
//         requestedUrl: req.originalUrl,
//         method: req.method
//     });
// });

// app.use((err, req, res, next) => {
//     console.error('🚨 Unhandled error:', err.stack);
    
//     res.status(err.status || 500).json({
//         success: false,
//         message: process.env.NODE_ENV === 'production' 
//             ? 'Internal server error' 
//             : err.message,
//         ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//     });
// });

// // ==================== START SERVER ====================
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`🔐 Admin login: POST http://localhost:${PORT}/api/admin/login`);
//     console.log(`📧 Email check: POST http://localhost:${PORT}/api/check-email`);
//     console.log(`📊 Health check: GET http://localhost:${PORT}/api/health`);
//     console.log('========================================');
// });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import email utility with templates
const { sendEmail, emailTemplates } = require('./utils/sendEmail');

const app = express();

// ==================== CONFIGURATION ====================
const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI', 
    'JWT_SECRET', 
    'ADMIN_USERNAME', 
    'ADMIN_PASSWORD',
    'ADMIN_EMAIL',
    'ADMIN_EMAIL_PASSWORD'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ ERROR: Missing required environment variable: ${varName}`);
        console.error(`   Please add ${varName}=value to your .env file`);
        
        if (varName.includes('EMAIL')) {
            console.error('\n📧 Email Configuration Help:');
            console.error('   1. Go to https://myaccount.google.com/security');
            console.error('   2. Enable 2-Step Verification');
            console.error('   3. Create an App Password');
            console.error('   4. Use that password as ADMIN_EMAIL_PASSWORD');
        }
        
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

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

// FIXED: Removed deprecated options useNewUrlParser and useUnifiedTopology
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas!');
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'iste_industry5'}`);
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
    
    // Academic Information
    institution: {
        type: String,
        required: [true, 'Institution type is required'],
        enum: {
            values: ['Engineering', 'Polytechnic'],
            message: 'Institution must be either Engineering or Polytechnic'
        },
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
    
    // ISTE Information
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
    
    // Accommodation Information
    stayPreference: { 
        type: String, 
        required: [true, 'Stay preference is required'],
        enum: ['With Stay', 'Without Stay']
    },
    stayDays: {
        type: Number,
        default: 0,
        min: [0, 'Stay days cannot be negative'],
        max: [10, 'Stay days cannot exceed 10']
    },
    
    // Payment Information
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
    
    // Registration Status
    registrationStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    registrationDate: { 
        type: Date, 
        default: Date.now 
    },
    
    // Admin Actions
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
    },
    
    // Email tracking
    emailSent: {
        approval: { type: Boolean, default: false },
        rejection: { type: Boolean, default: false },
        lastSentAt: { type: Date }
    }
}, {
    timestamps: true
});

// Indexes for better performance
// REMOVED duplicate index definitions to fix warnings
// The unique: true in field definitions already creates these indexes
registrationSchema.index({ registrationStatus: 1 });
registrationSchema.index({ registrationDate: -1 });
registrationSchema.index({ institution: 1, registrationStatus: 1 });

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

// ==================== HELPER FUNCTIONS ====================
const sendApprovalEmail = async (registration) => {
    try {
        console.log(`📧 Attempting to send approval email to: ${registration.email}`);
        
        const emailTemplate = emailTemplates.approval(registration);
        
        console.log('📧 Email template generated, calling sendEmail...');
        
        // FIXED: Properly handle sendEmail response
        const emailResult = await sendEmail({
            to: registration.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: `Your registration for ISTE INDUSTRY 5.0 has been approved. Registration ID: ISTE${registration._id.toString().slice(-8).toUpperCase()}`
        });

        console.log('📧 sendEmail result:', emailResult);

        // FIXED: Check emailResult properly
        if (emailResult && emailResult.success === true) {
            // Update email tracking in database
            await Registration.findByIdAndUpdate(registration._id, {
                $set: {
                    'emailSent.approval': true,
                    'emailSent.lastSentAt': new Date()
                }
            });
            
            console.log(`✅ Approval email sent to ${registration.email}`);
            return true;
        } else {
            console.error(`❌ Failed to send approval email to ${registration.email}:`, 
                         emailResult ? emailResult.error : 'No result returned');
            return false;
        }
    } catch (error) {
        console.error(`❌ Error in sendApprovalEmail function:`, error.message);
        console.error('Full error:', error);
        return false;
    }
};

const sendRejectionEmail = async (registration) => {
    try {
        console.log(`📧 Attempting to send rejection email to: ${registration.email}`);
        
        const emailTemplate = emailTemplates.rejection(registration);
        
        const emailResult = await sendEmail({
            to: registration.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: `Your registration for ISTE INDUSTRY 5.0 has been rejected. Reason: ${registration.rejectionReason || 'Not specified'}. Transaction ID: ${registration.transactionId}`
        });

        console.log('📧 sendEmail result:', emailResult);

        if (emailResult && emailResult.success === true) {
            // Update email tracking in database
            await Registration.findByIdAndUpdate(registration._id, {
                $set: {
                    'emailSent.rejection': true,
                    'emailSent.lastSentAt': new Date()
                }
            });
            
            console.log(`✅ Rejection email sent to ${registration.email}`);
            return true;
        } else {
            console.error(`❌ Failed to send rejection email to ${registration.email}:`, 
                         emailResult ? emailResult.error : 'No result returned');
            return false;
        }
    } catch (error) {
        console.error(`❌ Error in sendRejectionEmail function:`, error.message);
        return false;
    }
};

// ==================== PUBLIC ROUTES ====================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ISTE Industry 5.0 Registration API',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        emailConfigured: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASSWORD),
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

app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const uptime = process.uptime();
    
    res.json({
        success: true,
        status: 'healthy',
        database: dbStatus,
        email: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASSWORD) ? 'configured' : 'not configured',
        uptime: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`,
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required',
                exists: false
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format',
                exists: false
            });
        }

        const existingRegistration = await Registration.findOne({ 
            email: cleanEmail 
        });

        const exists = !!existingRegistration;
        
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

app.post('/api/register', async (req, res) => {
    try {
        console.log('📝 New registration request');
        
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
            stayDays,
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

        // Validate stayDays based on stayPreference
        let finalStayDays = 0;
        if (stayPreference === 'With Stay') {
            if (!stayDays || stayDays < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Stay days must be at least 1 when selecting "With Stay"'
                });
            }
            if (stayDays > 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Stay days cannot exceed 10'
                });
            }
            finalStayDays = Number(stayDays);
        } else {
            // For "Without Stay", explicitly set to 0
            finalStayDays = 0;
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
                message: 'This email is already registered. Please use a different email.'
            });
        }

        const existingTransaction = await Registration.findOne({ 
            transactionId: transactionId.trim() 
        });
        
        if (existingTransaction) {
            return res.status(400).json({
                success: false,
                message: 'This transaction ID is already used. Please verify your payment.'
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
            stayDays: finalStayDays,
            totalAmount: Number(totalAmount),
            transactionId: transactionId.trim(),
            paymentStatus: 'verified',
            registrationStatus: 'pending'
        });

        await registration.save();

        console.log(`✅ Registration saved: ${registration._id}`);

        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully! Your registration is pending admin approval.',
            data: {
                id: registration._id,
                registrationId: `ISTE${registration._id.toString().slice(-8).toUpperCase()}`,
                fullName: registration.fullName,
                email: registration.email,
                phone: registration.phone,
                institution: registration.institution,
                college: registration.college,
                department: registration.department,
                year: registration.year,
                isIsteMember: registration.isIsteMember,
                isteRegistrationNumber: registration.isteRegistrationNumber,
                stayPreference: registration.stayPreference,
                stayDays: registration.stayDays,
                transactionId: registration.transactionId,
                totalAmount: registration.totalAmount,
                registrationStatus: registration.registrationStatus,
                registrationDate: registration.registrationDate
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error.message);

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
            console.warn(`⚠️ Failed login attempt for username: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

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
            expiresIn: 8 * 60 * 60,
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

app.get('/api/admin/registration/:id', authenticateToken, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .lean();

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

        // Send approval email to user
        const emailSent = await sendApprovalEmail(registration);
        
        if (!emailSent) {
            console.warn(`⚠️ Approval email failed for ${registration.email}, but registration was approved`);
        }

        res.json({
            success: true,
            message: 'Registration approved successfully' + (emailSent ? ' and email sent' : ' (email notification failed)'),
            data: registration,
            emailSent: emailSent // Make sure this is included
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

        const rejectionReason = reason.trim();

        const registration = await Registration.findByIdAndUpdate(
            id,
            {
                registrationStatus: 'rejected',
                rejectedAt: new Date(),
                rejectionReason: rejectionReason,
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

        console.log(`❌ Registration ${id} rejected. Reason: ${rejectionReason}`);

        // Send rejection email to user
        const emailSent = await sendRejectionEmail(registration);
        
        if (!emailSent) {
            console.warn(`⚠️ Rejection email failed for ${registration.email}, but registration was rejected`);
        }

        res.json({
            success: true,
            message: 'Registration rejected' + (emailSent ? ' and email sent' : ' (email notification failed)'),
            data: registration,
            emailSent: emailSent // Make sure this is included
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
                    count: { $sum: 1 },
                    totalStayDays: { $sum: { $ifNull: ["$stayDays", 0] } },
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

        const institutionStats = await Registration.aggregate([
            {
                $group: {
                    _id: "$institution",
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

        const departmentStats = await Registration.aggregate([
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

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

        // Email statistics
        const emailSentStats = await Registration.aggregate([
            {
                $group: {
                    _id: null,
                    approvalEmailsSent: { $sum: { $cond: ["$emailSent.approval", 1, 0] } },
                    rejectionEmailsSent: { $sum: { $cond: ["$emailSent.rejection", 1, 0] } }
                }
            }
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
                institutionStats: institutionStats,
                departmentStats: departmentStats,
                emailDomainStats: emailStats,
                emailNotifications: emailSentStats[0] || { approvalEmailsSent: 0, rejectionEmailsSent: 0 },
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

// ==================== EMAIL TEST ROUTE ====================
app.post('/api/admin/test-email', authenticateToken, async (req, res) => {
    try {
        const { to = process.env.ADMIN_EMAIL, type = 'test' } = req.body;
        
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is required for test email'
            });
        }
        
        let testResult;
        
        if (type === 'approval') {
            const testUser = {
                _id: 'test12345678',
                fullName: 'Test User',
                email: to,
                college: 'Test College',
                department: 'Computer Science',
                year: 'Third',
                institution: 'Engineering',
                stayPreference: 'With Stay',
                stayDays: 2,
                transactionId: 'TEST123456',
                totalAmount: 800,
                approvedBy: 'Admin',
                registrationDate: new Date()
            };
            
            const emailTemplate = emailTemplates.approval(testUser);
            testResult = await sendEmail({
                to,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });
            
        } else if (type === 'rejection') {
            const testUser = {
                fullName: 'Test User',
                email: to,
                college: 'Test College',
                transactionId: 'TEST123456',
                totalAmount: 800,
                rejectionReason: 'Test rejection reason for testing email functionality',
                registrationDate: new Date(),
                createdAt: new Date()
            };
            
            const emailTemplate = emailTemplates.rejection(testUser);
            testResult = await sendEmail({
                to,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });
            
        } else {
            // Simple test email
            testResult = await sendEmail({
                to,
                subject: 'Test Email from ISTE INDUSTRY 5.0',
                html: '<h1>Test Email</h1><p>This is a test email from ISTE INDUSTRY 5.0 backend.</p>'
            });
        }
        
        res.json({
            success: testResult ? testResult.success : false,
            message: testResult && testResult.success ? 'Test email sent successfully' : 'Failed to send test email',
            details: testResult
        });
        
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending test email',
            error: error.message
        });
    }
});

// ==================== DEBUG ROUTE FOR EMAIL CONFIG ====================
app.get('/api/debug/env', (req, res) => {
    res.json({
        emailConfigured: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASSWORD),
        email: process.env.ADMIN_EMAIL ? 'Set (hidden)' : 'Not set',
        passwordLength: process.env.ADMIN_EMAIL_PASSWORD ? process.env.ADMIN_EMAIL_PASSWORD.length : 0,
        nodeEnv: process.env.NODE_ENV
    });
});

// ==================== ERROR HANDLING ====================

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        requestedUrl: req.originalUrl,
        method: req.method
    });
});

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
    console.log(`📧 Email configured: ${!(process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASSWORD) ? 'NO' : 'YES'}`);
    console.log(`🔐 Admin login: POST http://localhost:${PORT}/api/admin/login`);
    console.log(`📊 Health check: GET http://localhost:${PORT}/api/health`);
    console.log(`🐛 Debug env: GET http://localhost:${PORT}/api/debug/env`);
    console.log(`📧 Email test: POST http://localhost:${PORT}/api/admin/test-email (requires auth)`);
    console.log('========================================');
});