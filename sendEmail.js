// sendEmail.js
const nodemailer = require("nodemailer");

// Create transporter with improved configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
  // Additional settings for better reliability
  tls: {
    rejectUnauthorized: false
  },
  pool: true, // Use pooled connections
  maxConnections: 5,
  maxMessages: 100
});

// Verify transporter on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!to || !subject) {
      throw new Error("Recipient email and subject are required");
    }

    const mailOptions = {
      from: `"ISTE INDUSTRY 5.0" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      html,
      text: text || subject, // Fallback to subject if text not provided
      // Optional headers
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    
    // Enhanced error logging
    if (error.code === 'EAUTH') {
      console.error("⚠️ Authentication failed. Check email credentials in .env file");
      console.error("⚠️ Make sure you've enabled 2FA and created an App Password in Google");
    } else if (error.code === 'EENVELOPE') {
      console.error("⚠️ Invalid recipient email address");
    }
    
    return { success: false, error: error.message };
  }
};

// Email template functions for reuse
const emailTemplates = {
  approval: (userData) => ({
    subject: '🎉 Registration Approved - ISTE INDUSTRY 5.0',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f5f7fa;
        }
        .email-container {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
        }
        .header h2 { 
            margin: 10px 0 0 0; 
            font-size: 22px; 
            font-weight: 500;
        }
        .content { 
            padding: 40px 30px; 
        }
        .status-approved { 
            background-color: #d4ffd9; 
            color: #0d5c1f; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 25px 0; 
            font-weight: 600; 
            text-align: center; 
            border-left: 5px solid #28a745;
        }
        .details-card { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border: 1px solid #e9ecef;
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 12px; 
            padding-bottom: 12px; 
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child { 
            border-bottom: none; 
            margin-bottom: 0; 
            padding-bottom: 0;
        }
        .detail-label { 
            color: #666; 
            font-weight: 500;
        }
        .detail-value { 
            color: #333; 
            font-weight: 600;
        }
        .badge { 
            display: inline-block; 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: white; 
            padding: 8px 20px; 
            border-radius: 25px; 
            font-size: 14px; 
            margin: 15px 0; 
            font-weight: 600;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #666; 
            font-size: 14px; 
            border-top: 1px solid #eee; 
            padding-top: 20px;
        }
        .contact-box { 
            background: #e8f4ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border-left: 4px solid #2196F3;
        }
        .contact-box h4 { 
            margin-top: 0; 
            color: #0d47a1;
        }
        .highlight { 
            background-color: #fffde7; 
            padding: 12px; 
            border-radius: 6px; 
            margin: 15px 0; 
            border-left: 4px solid #ffc107;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 12px 30px; 
            border-radius: 5px; 
            text-decoration: none; 
            font-weight: 600; 
            margin: 15px 0;
        }
        @media (max-width: 600px) {
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
            .detail-row { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>ISTE INDUSTRY 5.0</h1>
            <h2>Registration Approved Successfully!</h2>
        </div>
        
        <div class="content">
            <p>Dear <strong>${userData.fullName}</strong>,</p>
            
            <div class="status-approved">
                🎉 Congratulations! Your registration has been <strong>APPROVED</strong>
            </div>
            
            <p>We are pleased to inform you that your registration for <strong>ISTE INDUSTRY 5.0</strong> has been reviewed and approved by our team. You are now officially registered for the event!</p>
            
            <div class="details-card">
                <h3 style="margin-top: 0; color: #333;">Registration Details:</h3>
                <div class="detail-row">
                    <span class="detail-label">Registration ID:</span>
                    <span class="detail-value">ISTE${userData._id ? userData._id.toString().slice(-8).toUpperCase() : ''}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${userData.fullName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">College:</span>
                    <span class="detail-value">${userData.college}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${userData.department}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Year:</span>
                    <span class="detail-value">${userData.year}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Institution Type:</span>
                    <span class="detail-value">${userData.institution}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Accommodation:</span>
                    <span class="detail-value">${userData.stayPreference} ${userData.stayPreference === 'With Stay' ? `(${userData.stayDays} day${userData.stayDays !== 1 ? 's' : ''})` : ''}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${userData.transactionId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value">₹${userData.totalAmount}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Approved By:</span>
                    <span class="detail-value">${userData.approvedBy || 'Admin Team'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Approval Date:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('en-IN', { 
                        weekday: 'long',
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })}</span>
                </div>
            </div>
            
            <div class="contact-box">
                <h4>📅 Event Information:</h4>
                <p><strong>Important:</strong> Please carry your college ID card and a printed copy of this email (or digital copy) for verification at the venue.</p>
                <p>${userData.stayPreference === 'With Stay' ? 'Your accommodation details will be shared separately via email.' : 'No accommodation has been arranged for you.'}</p>
            </div>
            
            <div class="highlight">
                <p><strong>🎫 Your registration is now complete!</strong> We look forward to hosting you at ISTE INDUSTRY 5.0.</p>
            </div>
            
            <div style="text-align: center;">
                <span class="badge">✓ Registration Confirmed</span>
            </div>
            
            <p>Should you have any questions, feel free to contact us at ${process.env.ADMIN_EMAIL || 'iste.industry5.0@example.com'}</p>
            
            <p>Best regards,<br>
            <strong>ISTE INDUSTRY 5.0 Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} ISTE INDUSTRY 5.0. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  }),

  rejection: (userData) => ({
    subject: '⚠️ Registration Update - ISTE INDUSTRY 5.0',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f5f7fa;
        }
        .email-container {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
        }
        .header h2 { 
            margin: 10px 0 0 0; 
            font-size: 22px; 
            font-weight: 500;
        }
        .content { 
            padding: 40px 30px; 
        }
        .status-rejected { 
            background-color: #ffe6e6; 
            color: #721c24; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 25px 0; 
            font-weight: 600; 
            text-align: center; 
            border-left: 5px solid #dc3545;
        }
        .details-card { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border: 1px solid #e9ecef;
        }
        .reason-box { 
            background: #fff3cd; 
            border-left: 5px solid #ffc107; 
            padding: 20px; 
            margin: 25px 0; 
            border-radius: 8px;
        }
        .reason-box h4 { 
            margin-top: 0; 
            color: #856404;
        }
        .contact-info { 
            background: #e8f4ff; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border-left: 5px solid #2196F3;
        }
        .contact-info h4 { 
            margin-top: 0; 
            color: #0d47a1;
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 12px; 
            padding-bottom: 12px; 
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child { 
            border-bottom: none; 
            margin-bottom: 0; 
            padding-bottom: 0;
        }
        .detail-label { 
            color: #666; 
            font-weight: 500;
        }
        .detail-value { 
            color: #333; 
            font-weight: 600;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #666; 
            font-size: 14px; 
            border-top: 1px solid #eee; 
            padding-top: 20px;
        }
        .refund-note { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border: 1px dashed #dc3545;
        }
        .action-buttons { 
            text-align: center; 
            margin: 30px 0;
        }
        .action-link { 
            display: inline-block; 
            background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%); 
            color: white; 
            padding: 12px 30px; 
            border-radius: 5px; 
            text-decoration: none; 
            font-weight: 600; 
            margin: 10px;
        }
        @media (max-width: 600px) {
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
            .detail-row { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>ISTE INDUSTRY 5.0</h1>
            <h2>Registration Status Update</h2>
        </div>
        
        <div class="content">
            <p>Dear <strong>${userData.fullName}</strong>,</p>
            
            <div class="status-rejected">
                ⚠️ Your registration requires attention
            </div>
            
            <p>We regret to inform you that your registration for <strong>ISTE INDUSTRY 5.0</strong> could not be approved at this time.</p>
            
            <div class="details-card">
                <h3 style="margin-top: 0; color: #333;">Registration Details:</h3>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${userData.fullName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">College:</span>
                    <span class="detail-value">${userData.college}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${userData.transactionId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">₹${userData.totalAmount}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Registration Date:</span>
                    <span class="detail-value">${new Date(userData.registrationDate || userData.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric'
                    })}</span>
                </div>
            </div>
            
            <div class="reason-box">
                <h4>📝 Reason for Rejection:</h4>
                <p style="font-size: 16px; color: #721c24; margin: 15px 0; font-weight: 500;">"${userData.rejectionReason || 'Registration does not meet the required criteria. Please contact us for more information.'}"</p>
            </div>
            
            <div class="contact-info">
                <h4>📞 What to do next:</h4>
                <ol style="padding-left: 20px;">
                    <li>Carefully review the reason for rejection mentioned above</li>
                    <li>If you believe there's been a mistake, contact us immediately</li>
                    <li>Please include your <strong>Transaction ID: ${userData.transactionId}</strong> in all communications</li>
                    <li>We will review your case and respond within 24-48 hours</li>
                </ol>
                
                <p><strong>Contact Information:</strong></p>
                <p>📧 Email: ${process.env.ADMIN_EMAIL || 'iste.industry5.0@example.com'}</p>
            </div>
            
            <div class="refund-note">
                <p><strong>💰 Refund Information:</strong></p>
                <p>If applicable, any refund will be processed to your original payment method within 7-10 working days from the date of rejection.</p>
                <p><em>Note: Refund processing time may vary depending on your bank/payment provider.</em></p>
            </div>
            
            <div class="action-buttons">
                <p>Need immediate assistance? Contact our support team:</p>
                <a href="mailto:${process.env.ADMIN_EMAIL || 'iste.industry5.0@example.com'}?subject=Query regarding rejected registration - ${userData.transactionId}" class="action-link">
                    ✉️ Contact Support
                </a>
            </div>
            
            <p>We apologize for any inconvenience caused and thank you for your interest in <strong>ISTE INDUSTRY 5.0</strong>.</p>
            
            <p>Sincerely,<br>
            <strong>ISTE INDUSTRY 5.0 Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} ISTE INDUSTRY 5.0. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  })
};

module.exports = { sendEmail, emailTemplates };