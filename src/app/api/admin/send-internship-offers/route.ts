// app/api/admin/send-internship-offers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { emailCampaigns, internshipOffers, students } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import nodemailer from 'nodemailer';

// Configure your email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const INTERNSHIP_OFFER_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Internship Offer - GenNext</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #000000; 
            background-color: #ffffff;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
        }
        .header { 
            background: #000000; 
            color: #ffffff; 
            padding: 10px; 
            text-align: center; 
            border-radius: 8px 8px 0 0; 
        }
        .logo { 
            text-align: center; 
            margin-bottom: 20px; 
        }
        .content { 
            padding: 20px; 
            background: #ffffff; 
            border-radius: 0 0 8px 8px; 
            border: 1px solid #dddddd;
        }
        .footer { 
            padding: 20px; 
            text-align: center; 
            color: #666666; 
            font-size: 12px;
        }
        .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #000000; 
            color: #ffffff; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
        }
        .details { 
            margin: 20px 0; 
            background: #ffffff; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #dddddd;
        }
        .detail-item { 
            margin-bottom: 10px; 
            padding: 8px 0; 
            border-bottom: 1px solid #dddddd; 
        }
        .detail-item:last-child { 
            border-bottom: none; 
        }
        .highlight { 
            font-weight: bold; 
            text-decoration: underline;
        }
        .urgent { 
            background: #f0f0f0; 
            padding: 10px; 
            border-radius: 6px; 
            margin: 15px 0; 
            border-left: 4px solid #888888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div style="display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <img src="https://rxo5hd130p.ufs.sh/f/q5swrPKmNsM9oTaM85w42eRf7hMqdyWPJ1QctavKoT8OLpVY" alt="GenNext Logo" style="width: 100px; height: 60px; padding:10px; filter: grayscale(100%);" />
            </div>
        </div>
        
        <div class="header">
            <h1>Congratulations! You've Been Shortlisted</h1>
        </div>
        
        <div class="content">
            <h2>Dear {{STUDENT_NAME}},</h2>
            <p>We are pleased to inform you that you have been <span class="highlight">shortlisted for our paid internship program!</span></p>
            
            <div class="details">
                <h3 style="margin-top: 0;">Internship Details:</h3>
                <div class="detail-item">
                    <strong>Duration:</strong> 2 months
                </div>
                <div class="detail-item">
                    <strong>Start Date:</strong> 1st August 2025
                </div>
                <div class="detail-item">
                    <strong>Format:</strong> Offline
                </div>
                <div class="detail-item">
                    <strong>Stipend:</strong> ₹2,000 per month
                </div>
                <div class="detail-item">
                    <strong>Location:</strong> Plot A-20, Sector-62, Noida, Uttar Pradesh
                </div>
            </div>
            
            <div class="urgent">
                <strong>Important:</strong> This offer link will expire in <strong>2 days</strong>. Please complete the acceptance process before then.
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f8f8; border-radius: 8px;">
                <a href="{{ACCEPTANCE_LINK}}" class="button">Accept Internship Offer</a>
            </div>
            
            <p>To complete your acceptance, you'll need to provide:</p>
            <ul>
                <li>Contact details (phone number)</li>
                <li>Father's name</li>
                <li>Permanent address</li>
                <li>Resume (PDF format, max 1MB)</li>
            </ul>
            
            <p>We're excited to have you join our team!</p>
            
            <p>Best regards,<br>
            <strong>The GenNext Team</strong></p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 GenNext. All rights reserved.</p>
            <p>
                This email was sent to {{STUDENT_EMAIL}}. If you didn't expect this email, please ignore it.
            </p>
        </div>
    </div>
</body>
</html>
`;

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Valid email addresses are required' },
        { status: 400 }
      );
    }

    // Fetch student data for the provided emails
    const studentsData = await db
      .select()
      .from(students)
      .where(inArray(students.email, emails));

    if (studentsData.length === 0) {
      return NextResponse.json(
        { error: 'No students found with provided emails' },
        { status: 404 }
      );
    }

    // Create expiration date (2 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);

    // Send emails and create offer records
    const emailPromises = studentsData.map(async (student) => {
      // Generate unique token for this student
      const token = Buffer.from(`${student.email}-${Date.now()}`).toString('base64');

      // Create acceptance link
      const acceptanceLink = `${process.env.NEXT_PUBLIC_BASE_URL}/internship/accept?token=${token}`;

      // Personalize email content
      const personalizedContent = INTERNSHIP_OFFER_TEMPLATE
        .replace(/{{STUDENT_NAME}}/g, student.name)
        .replace(/{{STUDENT_EMAIL}}/g, student.email)
        .replace(/{{ACCEPTANCE_LINK}}/g, acceptanceLink);

      // Send email
      const emailResult = await transporter.sendMail({
        from: `<${process.env.FROM_EMAIL || 'noreply@gennext.com'}>`,
        to: student.email,
        subject: '🎉 Congratulations! You\'ve Been Shortlisted for GenNext Internship',
        html: personalizedContent,
      });

      // Create offer record in database
      await db.insert(internshipOffers).values({
        studentId: student.id,
        email: student.email,
        token: token,
        expiresAt: expiresAt,
        status: 'sent',
      });

      return emailResult;
    });

    // Send all emails
    await Promise.all(emailPromises);

    // Save email campaign record
    await db.insert(emailCampaigns).values({
      name: 'Internship Offers - Shortlisted Candidates',
      subject: 'Congratulations! You\'ve Been Shortlisted for GenNext Internship',
      content: 'Internship offer letters sent to shortlisted students',
      recipientEmails: emails,
      status: 'sent',
      // sentBy: currentAdminId, // Add this when you have auth
    });

    return NextResponse.json({
      success: true,
      message: `Internship offers sent to ${studentsData.length} students`,
      count: studentsData.length,
      studentsNotified: studentsData.map(s => ({ name: s.name, email: s.email })),
    });

  } catch (error) {
    console.error('Error sending internship offers:', error);
    return NextResponse.json(
      { error: 'Failed to send internship offers' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch email campaign history
export async function GET() {
  try {
    const campaigns = await db
      .select()
      .from(emailCampaigns)
      .orderBy(emailCampaigns.sentAt);

    return NextResponse.json({
      campaigns: campaigns,
    });
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email campaigns' },
      { status: 500 }
    );
  }
}