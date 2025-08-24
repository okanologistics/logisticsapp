import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // HTML email template for the admin notification
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 20px; }
          .field-label { font-weight: bold; color: #f97316; margin-bottom: 5px; }
          .field-value { background: white; padding: 10px; border-radius: 4px; border-left: 4px solid #f97316; }
          .message-box { background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; min-height: 100px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🚴 Okano Logistics</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">New Contact Form Submission</p>
          </div>
          <div class="content">
            <p>You have received a new message through your website contact form:</p>
            
            <div class="field">
              <div class="field-label">👤 Name:</div>
              <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
              <div class="field-label">📧 Email:</div>
              <div class="field-value">
                <a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a>
              </div>
            </div>
            
            <div class="field">
              <div class="field-label">💬 Message:</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 4px; border-left: 4px solid #f59e0b;">
              <strong>🔔 Action Required:</strong> Please respond to this inquiry as soon as possible.
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from your Okano Logistics website contact form.</p>
            <p>Received on ${new Date().toLocaleDateString('en-GB', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Auto-reply email template for the sender
    const autoReplyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Thank you for contacting Okano Logistics</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .logo { font-size: 28px; margin-bottom: 10px; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .contact-info { background: white; padding: 20px; border-radius: 4px; margin-top: 20px; }
          .contact-item { display: flex; align-items: center; margin-bottom: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚴 Okano Logistics</div>
            <p style="margin: 0; font-size: 18px;">Thank you for your message!</p>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for contacting Okano Logistics. We have successfully received your message and appreciate you taking the time to reach out to us.</p>
            
            <div class="highlight">
              <strong>📋 Your Message Summary:</strong><br>
              <em>"${message.length > 100 ? message.substring(0, 100) + '...' : message}"</em>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>✅ Your message has been forwarded to our customer service team</li>
              <li>📞 We typically respond within 24-48 hours during business days</li>
              <li>🔄 You will receive a detailed response at this email address</li>
            </ul>
            
            <div class="contact-info">
              <h3 style="color: #f97316; margin-top: 0;">📞 Need Immediate Assistance?</h3>
              <p><strong>Phone:</strong> +234 813 123 4567</p>
              <p><strong>Email:</strong> info@okanologistics.com</p>
              <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM WAT</p>
              <p><strong>Address:</strong> 1, Rebadu Road, Ikoyi, Lagos</p>
            </div>
            
            <p>We're here to help with all your logistics needs, from bike rentals to investment opportunities. Thank you for choosing Okano Logistics!</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="btn">Visit Our Website</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated response to confirm receipt of your message.</p>
            <p>&copy; ${new Date().getFullYear()} Okano Logistics. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_FROM || 'admin@okanologistics.com';
    const adminResult = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission from ${name}`,
      html: adminEmailHtml,
    });

    if (!adminResult.success) {
      console.error('Failed to send admin notification:', adminResult.error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    // Send auto-reply to sender
    const autoReplyResult = await sendEmail({
      to: email,
      subject: 'Thank you for contacting Okano Logistics - Message Received',
      html: autoReplyHtml,
    });

    if (!autoReplyResult.success) {
      console.error('Failed to send auto-reply:', autoReplyResult.error);
      // Don't fail the request if auto-reply fails, admin notification is more important
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
