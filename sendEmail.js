const nodemailer = require("nodemailer");

// Create transporter with improved configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
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
      text: text || subject,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    
    if (error.code === 'EAUTH') {
      console.error("⚠️ Authentication failed. Check email credentials in .env file");
    } else if (error.code === 'EENVELOPE') {
      console.error("⚠️ Invalid recipient email address");
    }
    
    return { success: false, error: error.message };
  }
};

// Email template generators (FIXED: These are functions, not objects)
const generateApprovalEmail = (userData) => {
  return {
    subject: '🎉 Registration Approved - ISTE INDUSTRY 5.0',
    html: `<!DOCTYPE html>
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
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #666; 
            font-size: 14px; 
            border-top: 1px solid #eee; 
            padding-top: 20px;
        }
        @media (max-width: 600px) {
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
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
            <p>Dear <strong>${userData.fullName || 'Student'}</strong>,</p>
            
            <div class="status-approved">
                🎉 Congratulations! Your registration has been <strong>APPROVED</strong>
            </div>
            
            <p>We are pleased to inform you that your registration for <strong>ISTE INDUSTRY 5.0</strong> has been reviewed and approved by our team. You are now officially registered for the event!</p>
            
            <div class="details-card">
                <h3 style="margin-top: 0; color: #333;">Registration Details:</h3>
                <p><strong>Name:</strong> ${userData.fullName || ''}</p>
                <p><strong>College:</strong> ${userData.college || ''}</p>
                <p><strong>Department:</strong> ${userData.department || ''}</p>
                <p><strong>Year:</strong> ${userData.year || ''}</p>
                <p><strong>Transaction ID:</strong> ${userData.transactionId || ''}</p>
            </div>
            
            <p><strong>📅 Event Information:</strong> Please carry your college ID card for verification at the venue.</p>
            
            <p>Should you have any questions, feel free to contact us.</p>
            
            <p>Best regards,<br>
            <strong>ISTE INDUSTRY 5.0 Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} ISTE INDUSTRY 5.0. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
  };
};

const generateRejectionEmail = (userData) => {
  return {
    subject: '⚠️ Registration Update - ISTE INDUSTRY 5.0',
    html: `<!DOCTYPE html>
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
        .reason-box { 
            background: #fff3cd; 
            border-left: 5px solid #ffc107; 
            padding: 20px; 
            margin: 25px 0; 
            border-radius: 8px;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #666; 
            font-size: 14px; 
            border-top: 1px solid #eee; 
            padding-top: 20px;
        }
        @media (max-width: 600px) {
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
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
            <p>Dear <strong>${userData.fullName || 'Student'}</strong>,</p>
            
            <div class="status-rejected">
                ⚠️ Your registration requires attention
            </div>
            
            <p>We regret to inform you that your registration for <strong>ISTE INDUSTRY 5.0</strong> could not be approved at this time.</p>
            
            <div class="reason-box">
                <h4 style="margin-top: 0; color: #856404;">Reason for Rejection:</h4>
                <p style="font-size: 16px; color: #721c24; margin: 15px 0; font-weight: 500;">"${userData.rejectionReason || 'Registration does not meet the required criteria. Please contact us for more information.'}"</p>
            </div>
            
            <p><strong>What to do next:</strong></p>
            <ul>
                <li>Review the reason for rejection mentioned above</li>
                <li>If you believe there's been a mistake, contact us immediately</li>
                <li>Include your Transaction ID: <strong>${userData.transactionId || ''}</strong> in your query</li>
            </ul>
            
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
</html>`
  };
};

// Export everything
module.exports = { 
  sendEmail, 
  generateApprovalEmail, 
  generateRejectionEmail 
};