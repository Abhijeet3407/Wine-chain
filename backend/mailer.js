const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "Wine Chain <onboarding@resend.dev>";

const sendMail = async ({ to, subject, html }) => {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message || "Resend send failed");
};

const send2FACode = async (email, name, code) =>
  sendMail({
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

const sendWelcomeEmail = async (email, name) =>
  sendMail({
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

const sendTransferNotification = async (email, name, bottleName, fromOwner, toOwner) =>
  sendMail({
    to: email,
    subject: "Wine Chain — Ownership Transfer Notification",
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

const sendBuyNowRequestToSeller = async (sellerEmail, sellerName, buyerName, buyerEmail, bottle) =>
  sendMail({
    to: sellerEmail,
    subject: "New Purchase Request on Wine Chain",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
          <p style="color: #888; font-size: 13px;">Blockchain Wine Inventory</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">New Purchase Request</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Hello ${sellerName}, someone wants to buy your bottle!</p>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">Bottle</td><td style="padding: 8px 0; font-weight: bold;">${bottle.name} ${bottle.vintage}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Buyer Name</td><td style="padding: 8px 0;">${buyerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Buyer Email</td><td style="padding: 8px 0;">${buyerEmail}</td></tr>
          </table>
          <p style="color: #555; font-size: 13px; margin-top: 20px;">Please log in to Wine Chain to confirm or cancel this purchase request.</p>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });

const sendOfferToSeller = async (sellerEmail, sellerName, buyerName, buyerEmail, offerPrice, message, bottle) =>
  sendMail({
    to: sellerEmail,
    subject: "New Offer on Wine Chain",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
          <p style="color: #888; font-size: 13px;">Blockchain Wine Inventory</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">You Have a New Offer</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Hello ${sellerName}, you received an offer on your listing.</p>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">Bottle</td><td style="padding: 8px 0; font-weight: bold;">${bottle.name} ${bottle.vintage}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Offer Price</td><td style="padding: 8px 0; font-weight: bold; color: #7b1c2e;">£${offerPrice}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Buyer Name</td><td style="padding: 8px 0;">${buyerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Buyer Email</td><td style="padding: 8px 0;">${buyerEmail}</td></tr>
            ${message ? `<tr><td style="padding: 8px 0; color: #888; vertical-align: top;">Message</td><td style="padding: 8px 0;">${message}</td></tr>` : ""}
          </table>
          <p style="color: #555; font-size: 13px; margin-top: 20px;">Log in to Wine Chain to accept or reject this offer.</p>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });

const sendOfferAcceptedToBuyer = async (buyerEmail, buyerName, bottle, price) =>
  sendMail({
    to: buyerEmail,
    subject: "Your Offer Was Accepted — Wine Chain",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
          <p style="color: #888; font-size: 13px;">Blockchain Wine Inventory</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">Offer Accepted!</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Congratulations ${buyerName}, your offer has been accepted!</p>
          <div style="background: #f0faf0; border-radius: 10px; padding: 16px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
            <p style="color: #155724; font-size: 13px; margin: 0;">✅ Your offer of <strong>£${price}</strong> for <strong>${bottle.name} ${bottle.vintage}</strong> has been accepted.</p>
          </div>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">Bottle</td><td style="padding: 8px 0; font-weight: bold;">${bottle.name} ${bottle.vintage}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Producer</td><td style="padding: 8px 0;">${bottle.producer}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Region</td><td style="padding: 8px 0;">${bottle.region}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Agreed Price</td><td style="padding: 8px 0; font-weight: bold; color: #7b1c2e;">£${price}</td></tr>
          </table>
          <p style="color: #555; font-size: 13px; margin-top: 20px;">The seller will be in touch to arrange transfer. The blockchain record has been updated.</p>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });

const sendOfferRejectedToBuyer = async (buyerEmail, buyerName, bottleName, price) =>
  sendMail({
    to: buyerEmail,
    subject: "Offer Update from Wine Chain",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
          <p style="color: #888; font-size: 13px;">Blockchain Wine Inventory</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">Offer Update</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Hello ${buyerName}, we have an update on your offer.</p>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">Bottle</td><td style="padding: 8px 0; font-weight: bold;">${bottleName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Your Offer</td><td style="padding: 8px 0;">£${price}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Status</td><td style="padding: 8px 0; color: #721c24;">Declined</td></tr>
          </table>
          <p style="color: #555; font-size: 13px; margin-top: 20px;">Unfortunately the seller has declined your offer. You can browse other listings on Wine Chain.</p>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });

const sendSaleConfirmedToSeller = async (sellerEmail, sellerName, buyerName, bottle, price) =>
  sendMail({
    to: sellerEmail,
    subject: "Sale Confirmed — Wine Chain",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
          <p style="color: #888; font-size: 13px;">Blockchain Wine Inventory</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">Sale Confirmed!</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Hello ${sellerName}, your sale has been confirmed and the blockchain has been updated.</p>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">Bottle</td><td style="padding: 8px 0; font-weight: bold;">${bottle.name} ${bottle.vintage}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Buyer</td><td style="padding: 8px 0;">${buyerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Sale Price</td><td style="padding: 8px 0; font-weight: bold; color: #7b1c2e;">£${price}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Block Hash</td><td style="padding: 8px 0; font-family: monospace; font-size: 11px;">${bottle.latestBlockHash}</td></tr>
          </table>
          <p style="color: #555; font-size: 13px; margin-top: 20px;">The ownership transfer has been permanently recorded on the blockchain.</p>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });

const sendSaleConfirmedToBuyer = async (buyerEmail, buyerName, bottle, price) =>
  sendMail({
    to: buyerEmail,
    subject: "Purchase Confirmed — Wine Chain",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f7f4; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1c2e; font-size: 28px; margin: 0;">🍷 Wine Chain</h1>
          <p style="color: #888; font-size: 13px;">Blockchain Wine Inventory</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #ece9e2;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">Purchase Confirmed!</h2>
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Hello ${buyerName}, your purchase has been confirmed and the blockchain updated.</p>
          <div style="background: #f0faf0; border-radius: 10px; padding: 16px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
            <p style="color: #155724; font-size: 13px; margin: 0;">✅ You are now the registered owner of <strong>${bottle.name} ${bottle.vintage}</strong>.</p>
          </div>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">Bottle</td><td style="padding: 8px 0; font-weight: bold;">${bottle.name} ${bottle.vintage}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Producer</td><td style="padding: 8px 0;">${bottle.producer}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Region</td><td style="padding: 8px 0;">${bottle.region}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Purchase Price</td><td style="padding: 8px 0; font-weight: bold; color: #7b1c2e;">£${price}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Block Hash</td><td style="padding: 8px 0; font-family: monospace; font-size: 11px;">${bottle.latestBlockHash}</td></tr>
          </table>
        </div>
        <p style="color: #ccc; font-size: 11px; text-align: center; margin-top: 20px;">Wine Chain · Blockchain Wine Inventory System</p>
      </div>
    `,
  });

module.exports = {
  send2FACode,
  sendTransferNotification,
  sendWelcomeEmail,
  sendBuyNowRequestToSeller,
  sendOfferToSeller,
  sendOfferAcceptedToBuyer,
  sendOfferRejectedToBuyer,
  sendSaleConfirmedToSeller,
  sendSaleConfirmedToBuyer,
};
