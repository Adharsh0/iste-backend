// emailService.js
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 465,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false // For self-signed certificates
            }
        });
    }

    // Test email configuration
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email server connection verified');
            return true;
        } catch (error) {
            console.error('❌ Email server connection failed:', error);
            return false;
        }
    }

    // Send approval email
    async sendApprovalEmail(registration) {
        try {
            const registrationDate = new Date(registration.registrationDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const approvalDate = new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            const mailOptions = {
                from: `"ISTE Industry 5.0" <${process.env.EMAIL_USER}>`,
                to: registration.email,
                subject: '🎉 Registration Approved - ISTE Industry 5.0',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Registration Approved - ISTE Industry 5.0</title>
                        <style>
                            body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                line-height: 1.6;
                                color: #333;
                                margin: 0;
                                padding: 0;
                                background-color: #f5f7fa;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: white;
                                border-radius: 15px;
                                overflow: hidden;
                                box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
                            }
                            .header {
                                background: linear-gradient(135deg, #4A90E2 0%, #357ABD 50%, #2E6DB2 100%);
                                color: white;
                                padding: 40px 30px;
                                text-align: center;
                            }
                            .header h1 {
                                margin: 0;
                                font-size: 28px;
                                font-weight: 700;
                            }
                            .header p {
                                margin: 10px 0 0;
                                font-size: 16px;
                                opacity: 0.9;
                            }
                            .content {
                                padding: 40px;
                            }
                            .approved-badge {
                                background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                                color: white;
                                padding: 12px 25px;
                                border-radius: 25px;
                                display: inline-block;
                                font-weight: 600;
                                font-size: 16px;
                                margin-bottom: 25px;
                            }
                            .greeting {
                                font-size: 24px;
                                color: #2c3e50;
                                margin-bottom: 25px;
                                font-weight: 600;
                            }
                            .details-card {
                                background: #f8fafc;
                                border: 2px solid #e2e8f0;
                                border-radius: 12px;
                                padding: 25px;
                                margin-bottom: 30px;
                            }
                            .details-table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            .details-table td {
                                padding: 12px 0;
                                border-bottom: 1px solid #e2e8f0;
                            }
                            .details-table td:first-child {
                                font-weight: 600;
                                color: #4a5568;
                                width: 35%;
                            }
                            .details-table tr:last-child td {
                                border-bottom: none;
                            }
                            .important-info {
                                background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
                                border-left: 4px solid #4A90E2;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 30px 0;
                            }
                            .important-info h3 {
                                color: #2c3e50;
                                margin-top: 0;
                            }
                            .important-info ul {
                                margin: 10px 0;
                                padding-left: 20px;
                            }
                            .important-info li {
                                margin-bottom: 8px;
                            }
                            .event-details {
                                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                                padding: 25px;
                                border-radius: 12px;
                                text-align: center;
                                margin: 30px 0;
                            }
                            .event-details h3 {
                                color: #2c3e50;
                                margin-top: 0;
                            }
                            .event-details p {
                                font-size: 18px;
                                margin: 10px 0;
                                color: #4a5568;
                            }
                            .highlight {
                                color: #4A90E2;
                                font-weight: 700;
                            }
                            .footer {
                                text-align: center;
                                padding: 30px;
                                background: #1a202c;
                                color: white;
                                border-radius: 0 0 15px 15px;
                            }
                            .contact-info {
                                display: inline-block;
                                background: rgba(255, 255, 255, 0.1);
                                padding: 15px 25px;
                                border-radius: 8px;
                                margin: 20px 0;
                            }
                            .contact-info a {
                                color: #4A90E2;
                                text-decoration: none;
                                font-weight: 600;
                            }
                            .contact-info a:hover {
                                text-decoration: underline;
                            }
                            .logo {
                                font-size: 24px;
                                font-weight: 700;
                                color: #4A90E2;
                                margin-bottom: 15px;
                            }
                            .disclaimer {
                                font-size: 12px;
                                opacity: 0.7;
                                margin-top: 20px;
                                line-height: 1.5;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="logo">ISTE INDUSTRY 5.0</div>
                                <h1>Registration Approved!</h1>
                                <p>Smart and Sustainable: Engineering a Better Tomorrow with AI</p>
                            </div>
                            
                            <div class="content">
                                <div class="greeting">
                                    Congratulations, <span class="highlight">${registration.fullName}</span>!
                                </div>
                                
                                <div class="approved-badge">
                                    ✅ Your registration has been successfully approved
                                </div>
                                
                                <div class="details-card">
                                    <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px;">📋 Registration Details</h3>
                                    <table class="details-table">
                                        <tr>
                                            <td>Registration ID:</td>
                                            <td><strong>ISTE${registration._id.toString().slice(-8).toUpperCase()}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>Full Name:</td>
                                            <td>${registration.fullName}</td>
                                        </tr>
                                        <tr>
                                            <td>Email:</td>
                                            <td>${registration.email}</td>
                                        </tr>
                                        <tr>
                                            <td>Phone:</td>
                                            <td>${registration.phone}</td>
                                        </tr>
                                        <tr>
                                            <td>College:</td>
                                            <td>${registration.college}</td>
                                        </tr>
                                        <tr>
                                            <td>Department & Year:</td>
                                            <td>${registration.department} - ${registration.year} Year</td>
                                        </tr>
                                        <tr>
                                            <td>ISTE Member:</td>
                                            <td>${registration.isIsteMember}${registration.isteRegistrationNumber ? ` (${registration.isteRegistrationNumber})` : ''}</td>
                                        </tr>
                                        <tr>
                                            <td>Accommodation:</td>
                                            <td>${registration.stayPreference}</td>
                                        </tr>
                                        <tr>
                                            <td>Transaction ID:</td>
                                            <td><strong>${registration.transactionId}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>Amount Paid:</td>
                                            <td><strong>₹${registration.totalAmount}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>Registration Date:</td>
                                            <td>${registrationDate}</td>
                                        </tr>
                                        <tr>
                                            <td>Approval Status:</td>
                                            <td><span style="color: #28a745; font-weight: bold;">APPROVED ✅</span></td>
                                        </tr>
                                        <tr>
                                            <td>Approved On:</td>
                                            <td>${approvalDate}</td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <div class="important-info">
                                    <h3>📝 Important Information</h3>
                                    <ul>
                                        <li>Please keep this email for future reference</li>
                                        <li>Carry a printed copy of this approval and your college ID card</li>
                                        <li>Check your email regularly for event updates</li>
                                        <li>Join our WhatsApp group for event updates (link will be sent separately)</li>
                                    </ul>
                                </div>
                                
                                <div class="event-details">
                                    <h3>📅 Event Details</h3>
                                    <p><strong>Date:</strong> 24th & 25th January 2026</p>
                                    <p><strong>Venue:</strong> Mar Baselios College of Engineering and Technology</p>
                                    <p><strong>Theme:</strong> Smart and Sustainable: Engineering a Better Tomorrow with AI</p>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <p style="font-size: 16px; color: #4a5568;">
                                        We look forward to seeing you at ISTE Industry 5.0!
                                    </p>
                                    <p style="font-size: 14px; color: #718096;">
                                        For queries related to accommodation, food, or event schedule, please contact us.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <div class="contact-info">
                                    <p style="margin: 5px 0;">📧 <a href="mailto:iste@mbcet.ac.in">iste@mbcet.ac.in</a></p>
                                    <p style="margin: 5px 0;">📱 <a href="tel:+911234567890">+91 1234567890</a></p>
                                    <p style="margin: 5px 0;">📍 Mar Baselios College of Engineering and Technology</p>
                                </div>
                                
                                <div class="disclaimer">
                                    <p>This is an automated email. Please do not reply to this message.</p>
                                    <p>ISTE Kerala Section & Mar Baselios College of Engineering and Technology</p>
                                    <p>© 2026 ISTE Industry 5.0. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Approval email sent to: ${registration.email}`);
            console.log(`📧 Message ID: ${info.messageId}`);
            return info;

        } catch (error) {
            console.error('❌ Error sending approval email:', error);
            throw error;
        }
    }

    // Send rejection email
    async sendRejectionEmail(registration, reason) {
        try {
            const mailOptions = {
                from: `"ISTE Industry 5.0" <${process.env.EMAIL_USER}>`,
                to: registration.email,
                subject: 'Update on Your ISTE Industry 5.0 Registration',
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
                                margin: 0;
                                padding: 0;
                                background-color: #f5f7fa;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: white;
                                border-radius: 15px;
                                overflow: hidden;
                                box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
                            }
                            .header {
                                background: #dc3545;
                                color: white;
                                padding: 30px;
                                text-align: center;
                            }
                            .content {
                                padding: 40px;
                            }
                            .rejection-badge {
                                background: #dc3545;
                                color: white;
                                padding: 12px 25px;
                                border-radius: 25px;
                                display: inline-block;
                                font-weight: 600;
                                font-size: 16px;
                                margin-bottom: 25px;
                            }
                            .reason-box {
                                background: #fff3cd;
                                border-left: 4px solid #ffc107;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 25px 0;
                            }
                            .contact-box {
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 25px 0;
                                text-align: center;
                            }
                            .footer {
                                text-align: center;
                                padding: 30px;
                                background: #1a202c;
                                color: white;
                                border-radius: 0 0 15px 15px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>ISTE Industry 5.0</h2>
                                <p>Registration Status Update</p>
                            </div>
                            
                            <div class="content">
                                <h3>Dear ${registration.fullName},</h3>
                                
                                <div class="rejection-badge">
                                    ❌ Registration Status: REJECTED
                                </div>
                                
                                <p>We regret to inform you that after reviewing your registration for ISTE Industry 5.0, we are unable to approve it at this time.</p>
                                
                                ${reason ? `
                                    <div class="reason-box">
                                        <h4>📝 Reason for Rejection:</h4>
                                        <p><strong>${reason}</strong></p>
                                    </div>
                                ` : ''}
                                
                                <div class="contact-box">
                                    <h4>🤝 Need Assistance?</h4>
                                    <p>If you believe there has been an error or if you would like to appeal this decision, please contact our support team:</p>
                                    <p>📧 <strong>Email:</strong> iste@mbcet.ac.in</p>
                                    <p>📱 <strong>Phone:</strong> +91 1234567890</p>
                                </div>
                                
                                <p>We appreciate your interest in ISTE Industry 5.0 and hope to see you at future events.</p>
                                
                                <p>Best regards,<br>
                                <strong>ISTE Industry 5.0 Team</strong><br>
                                Mar Baselios College of Engineering and Technology</p>
                            </div>
                            
                            <div class="footer">
                                <p>ISTE Kerala Section & Mar Baselios College of Engineering and Technology</p>
                                <p style="font-size: 12px; opacity: 0.7;">© 2026 ISTE Industry 5.0. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📧 Rejection email sent to: ${registration.email}`);
            return info;
        } catch (error) {
            console.error('❌ Error sending rejection email:', error);
            throw error;
        }
    }

    // Send registration confirmation email
    async sendRegistrationConfirmation(registration) {
        try {
            const registrationDate = new Date(registration.registrationDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            const mailOptions = {
                from: `"ISTE Industry 5.0" <${process.env.EMAIL_USER}>`,
                to: registration.email,
                subject: 'Registration Received - ISTE Industry 5.0',
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
                                margin: 0;
                                padding: 0;
                                background-color: #f5f7fa;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: white;
                                border-radius: 15px;
                                overflow: hidden;
                                box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
                            }
                            .header {
                                background: linear-gradient(135deg, #4A90E2 0%, #357ABD 50%, #2E6DB2 100%);
                                color: white;
                                padding: 40px 30px;
                                text-align: center;
                            }
                            .content {
                                padding: 40px;
                            }
                            .status-badge {
                                background: #ffc107;
                                color: #333;
                                padding: 10px 20px;
                                border-radius: 25px;
                                display: inline-block;
                                font-weight: 600;
                                font-size: 16px;
                                margin: 20px 0;
                            }
                            .details-card {
                                background: #f8fafc;
                                border: 1px solid #e2e8f0;
                                border-radius: 10px;
                                padding: 20px;
                                margin: 20px 0;
                            }
                            .next-steps {
                                background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
                                border-left: 4px solid #4A90E2;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 25px 0;
                            }
                            .footer {
                                text-align: center;
                                padding: 30px;
                                background: #1a202c;
                                color: white;
                                border-radius: 0 0 15px 15px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>ISTE Industry 5.0</h2>
                                <p>Registration Confirmation</p>
                            </div>
                            
                            <div class="content">
                                <h3>Thank you for registering, ${registration.fullName}!</h3>
                                <p>Your registration has been received successfully and is currently under review by our admin team.</p>
                                
                                <div class="status-badge">
                                    ⏳ Status: PENDING APPROVAL
                                </div>
                                
                                <div class="details-card">
                                    <h4>📋 Registration Summary:</h4>
                                    <p><strong>Transaction ID:</strong> ${registration.transactionId}</p>
                                    <p><strong>Amount Paid:</strong> ₹${registration.totalAmount}</p>
                                    <p><strong>Registration Date:</strong> ${registrationDate}</p>
                                    <p><strong>Registration ID:</strong> ISTE${registration._id.toString().slice(-8).toUpperCase()}</p>
                                </div>
                                
                                <div class="next-steps">
                                    <h4>📝 What happens next?</h4>
                                    <ul>
                                        <li>Our admin team will review your registration</li>
                                        <li>You will receive an approval email within 24-48 hours</li>
                                        <li>Keep this email for future reference</li>
                                        <li>Check your spam folder if you don't receive updates</li>
                                    </ul>
                                </div>
                                
                                <p><strong>For any queries, please contact:</strong></p>
                                <p>📧 <strong>Email:</strong> iste@mbcet.ac.in</p>
                                <p>📱 <strong>Phone:</strong> +91 1234567890</p>
                            </div>
                            
                            <div class="footer">
                                <p>ISTE Kerala Section & Mar Baselios College of Engineering and Technology</p>
                                <p style="font-size: 12px; opacity: 0.7;">© 2026 ISTE Industry 5.0. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📧 Registration confirmation sent to: ${registration.email}`);
            return info;
        } catch (error) {
            console.error('❌ Error sending registration confirmation:', error);
            // Don't throw error - we don't want registration to fail if email fails
        }
    }
}

module.exports = new EmailService();