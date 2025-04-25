import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../config/config.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.emailUser,
        pass: this.configService.emailPassword,
      },
    });
  }

  async sendOtp(
    email: string,
    otp: string,
    type: 'reset' | 'delete',
  ): Promise<void> {
    const subject =
      type === 'reset'
        ? 'Reset Password - Ngampus.in'
        : 'Account Deletion - Ngampus.in';

    const action =
      type === 'reset' ? 'reset your password' : 'delete your account';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .otp {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #4a6ee0;
            background-color: #eef2ff;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: center;
          }
          .footer {
            font-size: 12px;
            color: #666;
            margin-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Hello from Ngampus.in!</h2>
          <p>We received a request to ${action}. Please use the following OTP code to continue:</p>
          <div class="otp">${otp}</div>
          <p>This code will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
          <p>Thank you,<br>The Ngampus.in Team</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Ngampus.in. All rights reserved.
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"Ngampus.in" <${this.configService.emailUser}>`,
      to: email,
      subject,
      html: htmlContent,
    });
  }
}
