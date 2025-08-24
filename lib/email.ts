import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface PaymentEmailData {
  total_amount: number;
  interest_amount: number;
  principal_amount: number;
  payout_frequency: 'weekly' | 'monthly';
  payment_date: string;
}

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export function generateVerificationEmail(token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  return `
    <h1>Verify your email address</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
  `;
}

export function generatePasswordResetEmail(token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  return `
    <h1>Reset your password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;
}

export async function sendPaymentNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  paymentData: PaymentEmailData
): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 20px; border: 1px solid #dee2e6; }
          .payment-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .amount-breakdown { display: flex; gap: 20px; justify-content: space-between; margin: 15px 0; }
          .amount-item { text-align: center; padding: 10px; border-radius: 5px; }
          .interest { background: #d1f2eb; color: #0d7347; }
          .principal { background: #fef2e6; color: #b7472a; }
          .total { background: #e3f2fd; color: #1565c0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #495057; margin: 0;">Payment Processed Successfully</h1>
          </div>
          
          <div class="content">
            <p>Dear ${recipientName},</p>
            
            <p>Your <strong>${paymentData.payout_frequency}</strong> investment payout has been processed successfully on <strong>${new Date(paymentData.payment_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</strong>.</p>

            <div class="payment-details">
              <h3 style="margin-top: 0; color: #495057;">Payment Breakdown</h3>
              
              <div class="amount-breakdown">
                <div class="amount-item interest">
                  <div style="font-size: 12px; margin-bottom: 5px;">Interest Return</div>
                  <div style="font-size: 18px; font-weight: bold;">₦${paymentData.interest_amount.toLocaleString()}</div>
                </div>
                
                <div class="amount-item principal">
                  <div style="font-size: 12px; margin-bottom: 5px;">Principal Return</div>
                  <div style="font-size: 18px; font-weight: bold;">₦${paymentData.principal_amount.toLocaleString()}</div>
                </div>
                
                <div class="amount-item total">
                  <div style="font-size: 12px; margin-bottom: 5px;">Total Payment</div>
                  <div style="font-size: 20px; font-weight: bold;">₦${paymentData.total_amount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <p>This payment has been credited to your account. You can view more details and your complete payment history in your investor dashboard.</p>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </p>

            <p>Thank you for investing with Okano Logistics. We appreciate your trust in our platform.</p>

            <p>Best regards,<br>
            <strong>Okano Logistics Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>If you have any questions, contact us at support@okanologistics.com</p>
            <p>&copy; 2025 Okano Logistics. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: recipientEmail,
      subject: 'Investment Payout Notification - Okano Logistics',
      html: html
    });

    console.log('Payment notification email sent successfully to:', recipientEmail);
    return true;
  } catch (error) {
    console.error('Error sending payment notification email:', error);
    return false;
  }
}
