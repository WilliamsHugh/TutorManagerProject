import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USERNAME');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        'SMTP chưa được cấu hình đầy đủ. Email sẽ được log ra console thay vì gửi thật.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    this.isConfigured = true;
    this.logger.log(`SMTP transporter initialized: ${host}:${port}`);
  }

  async sendMail(options: MailOptions): Promise<void> {
    const fromAddress =
      this.configService.get<string>('SMTP_FROM') || 'noreply@tutormanager.com';

    if (!this.isConfigured || !this.transporter) {
      // Fallback: log ra console nếu chưa có SMTP
      this.logger.log(`[MAILER] Gửi email tới ${options.to}`);
      this.logger.log(`[MAILER] Tiêu đề: ${options.subject}`);
      this.logger.log(`[MAILER] Nội dung: ${options.text || options.html}`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Fallback: log ra console khi gửi thất bại
      this.logger.log(`[MAILER FALLBACK] Gửi email tới ${options.to}`);
      this.logger.log(`[MAILER FALLBACK] Tiêu đề: ${options.subject}`);
      this.logger.log(`[MAILER FALLBACK] Nội dung: ${options.text || options.html}`);
    }
  }

  async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    const subject = 'Mã OTP đặt lại mật khẩu - TutorManager';

    const text = `
Xin chào,

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TutorManager của mình.

Mã OTP của bạn là: ${otpCode}

Mã này có hiệu lực trong 10 phút.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ TutorManager
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4f8ef7, #7b5ef7); padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 30px; color: #333; line-height: 1.6; }
    .otp-code { text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f8ef7; margin: 24px 0; padding: 16px; background: #f0f4ff; border-radius: 8px; }
    .footer { padding: 20px 30px; background: #f9f9f9; font-size: 13px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Đặt lại mật khẩu</h1>
    </div>
    <div class="body">
      <p>Xin chào,</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>TutorManager</strong> của mình.</p>
      <p>Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình đặt lại mật khẩu:</p>
      <div class="otp-code">${otpCode}</div>
      <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    </div>
    <div class="footer">
      <p>Trân trọng,<br>Đội ngũ TutorManager</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.sendMail({ to: email, subject, text, html });
  }
}
