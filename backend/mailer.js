const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const send2FACode = async (email, name, code) => {
  await transporter.sendMail({
    from: `"Wine Chain" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Wine Chain Login Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
          <p style="color: #888; font-size: 13px;">Blockchain Wine Inventory</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">Hello ${name}!</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 24px;">Your 2FA verification code is:</p>
          <div style="text-align: center; background: #f8f7f4; border-radius: 10px; padding: 20px; margin-bottom: 24px; border: 2px dashed #ece9e2;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #7b1c2e;">${code}</span>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #888; font-size: 13px; text-align: center;">If you did not request this code, please ignore this email.</p>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });
};

const sendTransferNotification = async (
  email,
  name,
  bottleName,
  fromOwner,
  toOwner,
) => {
  await transporter.sendMail({
    from: `"Wine Chain" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Wine Chain — Ownership Transfer Notification`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">Transfer Recorded</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Hello ${name}, a bottle transfer has been recorded on the blockchain.</p>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">Bottle</td><td style="padding: 8px 0; font-weight: bold;">${bottleName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">From</td><td style="padding: 8px 0;">${fromOwner}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">To</td><td style="padding: 8px 0;">${toOwner}</td></tr>
          </table>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });
};

const sendWelcomeEmail = async (email, name) => {
  await transporter.sendMail({
    from: `"Wine Chain" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Wine Chain!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">Welcome, ${name}!</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Your account has been created successfully. You can now start registering your wine collection on the blockchain.</p>
          <ul style="color: #555; font-size: 13px; line-height: 2;">
            <li>✅ Register bottles on the blockchain</li>
            <li>✅ Transfer ownership securely</li>
            <li>✅ Verify authenticity with QR codes</li>
            <li>✅ Export inventory to PDF</li>
          </ul>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });
};

module.exports = { send2FACode, sendTransferNotification, sendWelcomeEmail };
