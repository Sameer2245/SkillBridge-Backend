const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@skillbridge.com',
      to: email,
      subject: 'Password Reset Request - SkillBridge',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px;
              border-radius: 10px;
              text-align: center;
            }
            .content {
              background: white;
              padding: 40px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: white;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              color: #666;
              font-size: 14px;
              margin-top: 30px;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">SkillBridge</div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password for your SkillBridge account. If you didn't make this request, you can safely ignore this email.</p>
              <p>To reset your password, click the button below:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons.
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact our support team.</p>
              <p>&copy; 2024 SkillBridge. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email, username) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@skillbridge.com',
      to: email,
      subject: 'Welcome to SkillBridge!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SkillBridge</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px;
              border-radius: 10px;
              text-align: center;
            }
            .content {
              background: white;
              padding: 40px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: white;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              color: #666;
              font-size: 14px;
              margin-top: 30px;
            }
            .features {
              text-align: left;
              margin: 20px 0;
            }
            .features li {
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">SkillBridge</div>
            <div class="content">
              <h2>Welcome to SkillBridge, ${username}!</h2>
              <p>Thank you for joining our community of talented freelancers and clients.</p>
              <p>Here's what you can do next:</p>
              <ul class="features">
                <li>Complete your profile to attract more clients</li>
                <li>Browse available projects and services</li>
                <li>Start building your reputation with great work</li>
                <li>Connect with other professionals in your field</li>
              </ul>
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">Get Started</a>
            </div>
            <div class="footer">
              <p>Need help? Contact our support team anytime.</p>
              <p>&copy; 2024 SkillBridge. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }
}

module.exports = new EmailService();