const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Full name must be at least 3 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  college: { 
    type: String, 
    required: [true, 'College name is required'],
    trim: true
  },
  department: { 
    type: String, 
    required: [true, 'Department is required'],
    enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other']
  },
  year: { 
    type: String, 
    required: [true, 'Academic year is required'],
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate']
  },
  isIsteMember: { 
    type: String, 
    required: [true, 'ISTE membership status is required'],
    enum: ['yes', 'no']
  },
  isteRegistrationNumber: { 
    type: String, 
    default: '',
    trim: true
  },
  stayPreference: { 
    type: String, 
    required: [true, 'Stay preference is required'],
    enum: ['yes', 'no']
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
    default: 'pending',
    enum: ['pending', 'completed', 'failed']
  },
  registrationDate: { 
    type: Date, 
    default: Date.now 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for better query performance
registrationSchema.index({ email: 1 });
registrationSchema.index({ transactionId: 1 });
registrationSchema.index({ registrationDate: -1 });

// Update lastUpdated timestamp before saving
registrationSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);