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
    // Dùng MAIL_* để tương thích với biến môi trường hiện có (giống MailerModule)
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

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
      this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER') || 'noreply@tutormanager.com';

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
      this.logger.log(
        `[MAILER FALLBACK] Nội dung: ${options.text || options.html}`,
      );
    }
  }

  async sendAcceptanceEmail(
    personalEmail: string,
    fullName: string,
    systemEmail: string,
    tempPassword: string,
  ): Promise<void> {
    const subject = `Chúc mừng! Hồ sơ gia sư ${fullName} đã được duyệt - TutorManager`;

    const text = `
Xin chào ${fullName},

Chúng tôi xin thông báo hồ sơ đăng ký gia sư của bạn đã được xét duyệt thành công!

Thông tin tài khoản hệ thống của bạn:
- Email đăng nhập: ${systemEmail}
- Mật khẩu tạm thời: ${tempPassword}

Vui lòng đăng nhập vào hệ thống bằng email và mật khẩu trên.
Sau khi đăng nhập, bạn có thể đổi mật khẩu trong phần cài đặt hồ sơ.

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
    .header { background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 30px; color: #333; line-height: 1.6; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-item { margin-bottom: 12px; }
    .info-item label { font-size: 12px; color: #6b7280; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-item .value { font-size: 16px; font-weight: bold; color: #065f46; }
    .password-box { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; }
    .password-box .label { font-size: 12px; color: #92400e; }
    .password-box .value { font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #92400e; font-family: monospace; }
    .footer { padding: 20px 30px; background: #f9f9f9; font-size: 13px; color: #888; text-align: center; }
    .warning { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-size: 13px; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Chúc mừng bạn đã trúng tuyển!</h1>
    </div>
    <div class="body">
      <p>Xin chào <strong>${fullName}</strong>,</p>
      <p>Chúng tôi xin thông báo hồ sơ đăng ký gia sư của bạn đã được <strong>xét duyệt thành công</strong>! 🎊</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #065f46;">📧 Thông tin tài khoản hệ thống</h3>
        <div class="info-item">
          <label>Email đăng nhập</label>
          <div class="value">${systemEmail}</div>
        </div>
        <div class="password-box">
          <div class="label">Mật khẩu tạm thời</div>
          <div class="value">${tempPassword}</div>
        </div>
      </div>

      <p>Vui lòng đăng nhập vào hệ thống bằng email và mật khẩu trên. <strong>Sau khi đăng nhập, bạn nên đổi mật khẩu trong phần cài đặt hồ sơ.</strong></p>

      <div class="warning">
        ⚠️ Vì lý do bảo mật, vui lòng không chia sẻ mật khẩu này với bất kỳ ai. Nhân viên trung tâm sẽ không bao giờ yêu cầu mật khẩu của bạn.
      </div>
    </div>
    <div class="footer">
      <p>Trân trọng,<br>Đội ngũ TutorManager</p>
      <p style="font-size: 11px; color: #aaa;">Đây là email tự động, vui lòng không phản hồi thư này.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.sendMail({ to: personalEmail, subject, text, html });
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
