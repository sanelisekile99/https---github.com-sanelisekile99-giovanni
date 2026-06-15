/**
 * Firebase Cloud Function: Send Order Confirmation Email
 * Triggered when a new order document is created in Firestore with paymentStatus: "paid"
 * Sends confirmation email and updates receiptEmailSent flag
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK (use default credentials)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Create Nodemailer transporter using Gmail SMTP with App Password
 * Gmail App Password should be stored in Firebase Functions Config or environment variable
 */
const createTransporter = () => {
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || 
                          functions.config().gmail?.app_password;
  
  if (!gmailAppPassword) {
    throw new Error('GMAIL_APP_PASSWORD not configured in Firebase Functions');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || functions.config().gmail?.user || 'orders@giovanni-official.com',
      pass: gmailAppPassword,
    },
  });
};

/**
 * Build HTML email template with order details
 */
const buildEmailTemplate = (order, orderItems) => {
  const orderDate = order.created_at 
    ? new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const shippingAddress = order.shipping_address || {};
  const customerName = shippingAddress.name || order.customer_id || 'Valued Customer';

  // Build items table rows
  const itemsRows = (orderItems || [])
    .map(
      item => `
    <tr style="border-bottom: 1px solid #e0e0e0;">
      <td style="padding: 12px; text-align: left; font-size: 14px; color: #333;">
        ${item.product_name}${item.variant_title ? ` - ${item.variant_title}` : ''}
      </td>
      <td style="padding: 12px; text-align: center; font-size: 14px; color: #666;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; text-align: right; font-size: 14px; color: #666;">
        R${(item.unit_price / 100).toFixed(2)}
      </td>
      <td style="padding: 12px; text-align: right; font-size: 14px; color: #333; font-weight: 500;">
        R${(item.total / 100).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Giovanni</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 0.1em; }
    .header p { margin: 8px 0 0; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.8; }
    .content { background: white; padding: 40px; margin-top: 20px; }
    .greeting { font-size: 16px; margin-bottom: 24px; }
    .order-number { background: #f0f0f0; padding: 16px; border-left: 4px solid #1a1a1a; margin: 20px 0; font-size: 14px; }
    .order-number strong { font-weight: 600; color: #1a1a1a; }
    .section { margin: 32px 0; }
    .section-title { font-size: 14px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #1a1a1a; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table th { background: #f5f5f5; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #1a1a1a; }
    .totals { margin-top: 24px; padding-top: 24px; border-top: 2px solid #e0e0e0; }
    .totals-row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
    .totals-row.total { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-top: 16px; }
    .address-box { background: #fafafa; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; }
    .cta-button { display: inline-block; background: #1a1a1a; color: white; padding: 12px 32px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin: 20px 0; border-radius: 2px; font-weight: 500; }
    .cta-button:hover { background: #333; }
    .footer { background: #f9f9f9; padding: 32px 20px; text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #e0e0e0; }
    .footer p { margin: 8px 0; }
    .divider { height: 1px; background: #e0e0e0; margin: 32px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>GIOVANNI</h1>
      <p>Order Confirmation</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <div class="greeting">
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! We're excited to share the art of quiet luxury with you. Your purchase represents a commitment to timeless craftsmanship and modern minimalism.</p>
      </div>

      <!-- Order Number -->
      <div class="order-number">
        <strong>Order Number:</strong> ${order.id || 'N/A'} <br>
        <strong>Order Date:</strong> ${orderDate}
      </div>

      <!-- Order Items -->
      <div class="section">
        <div class="section-title">Order Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>

      <!-- Order Summary -->
      <div class="section">
        <div class="section-title">Order Summary</div>
        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>R${(order.subtotal / 100).toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Shipping</span>
            <span>R${(order.shipping / 100).toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Tax</span>
            <span>R${(order.tax / 100).toFixed(2)}</span>
          </div>
          <div class="totals-row total">
            <span>Total Amount</span>
            <span>R${(order.total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Address -->
      <div class="section">
        <div class="section-title">Delivery Address</div>
        <div class="address-box">
          <strong>${shippingAddress.name || 'N/A'}</strong><br>
          ${shippingAddress.address || 'N/A'}<br>
          ${shippingAddress.city || 'N/A'}${shippingAddress.state ? ', ' + shippingAddress.state : ''} ${shippingAddress.zip || 'N/A'}<br>
          ${shippingAddress.country || 'N/A'}<br>
          ${shippingAddress.phone ? '<br>' + shippingAddress.phone : ''}
        </div>
      </div>

      <!-- Tracking Link (placeholder) -->
      <div class="section" style="text-align: center;">
        <p style="font-size: 12px; color: #666;">You will receive a shipping notification with tracking details once your order is dispatched.</p>
        <a href="https://giovanni-official.com/order-tracking?id=${order.id}" class="cta-button">Track Order</a>
      </div>

      <!-- Thank You Message -->
      <div class="divider"></div>
      <div class="section">
        <p style="font-size: 14px; line-height: 1.8; color: #666;">
          <strong>Thank you for choosing Giovanni.</strong><br><br>
          At Giovanni, we believe in the power of quiet luxury—pieces that speak through their exceptional quality and refined simplicity. Every item in your order has been carefully crafted to transcend seasons and trends, becoming a timeless addition to your wardrobe.<br><br>
          We're committed to providing you with not just beautiful clothing, but an experience that reflects our values of craftsmanship, sustainability, and elegance.<br><br>
          If you have any questions about your order, please don't hesitate to reach out to our customer service team at <strong>support@giovanni-official.com</strong>.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>GIOVANNI</strong> | Where Timeless Craftsmanship Meets Modern Minimalism</p>
      <p>© ${new Date().getFullYear()} Giovanni. All rights reserved.</p>
      <p>
        <a href="https://giovanni-official.com" style="color: #1a1a1a; text-decoration: none;">Website</a> | 
        <a href="mailto:support@giovanni-official.com" style="color: #1a1a1a; text-decoration: none;">Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Cloud Function: Triggered on new order creation
 * Sends confirmation email if paymentStatus is "paid" and receipt not already sent
 */
exports.sendOrderConfirmationEmail = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderId = context.params.orderId;
    const order = snap.data();

    console.log(`Processing order: ${orderId}`);
    console.log(`Order data:`, JSON.stringify(order, null, 2));

    try {
      // Validate prerequisites
      if (!order.customer_email) {
        console.warn(`Order ${orderId} missing customer_email. Skipping email.`);
        return null;
      }

      // Check if payment status is "paid" and email hasn't been sent yet
      if (order.paymentStatus !== 'paid' || order.receiptEmailSent === true) {
        console.log(`Order ${orderId}: paymentStatus=${order.paymentStatus}, receiptEmailSent=${order.receiptEmailSent}. Skipping email.`);
        return null;
      }

      // Fetch order items
      let orderItems = [];
      try {
        const itemsCollection = await db.collection('orders').doc(orderId).collection('items').get();
        orderItems = itemsCollection.docs.map(doc => doc.data());
        console.log(`Fetched ${orderItems.length} items for order ${orderId}`);
      } catch (err) {
        console.warn(`Could not fetch items from subcollection: ${err.message}. Continuing with empty items.`);
      }

      // Create email transporter
      const transporter = createTransporter();

      // Build email content
      const emailTemplate = buildEmailTemplate(order, orderItems);
      const mailOptions = {
        from: process.env.GMAIL_USER || functions.config().gmail?.user || 'orders@giovanni-official.com',
        to: order.customer_email,
        subject: `Order Confirmation: ${order.id} - GIOVANNI`,
        html: emailTemplate,
        replyTo: 'support@giovanni-official.com',
      };

      // Send email
      console.log(`Sending email to: ${order.customer_email}`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully. MessageID: ${info.messageId}`);

      // Update order document to mark email as sent
      await db.collection('orders').doc(orderId).update({
        receiptEmailSent: true,
        receiptEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        receiptEmailMessageId: info.messageId,
      });

      console.log(`Order ${orderId} updated with email sent confirmation.`);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error(`Error processing order ${orderId}:`, error);

      // Log failed attempt in order document for debugging
      try {
        await db.collection('orders').doc(orderId).update({
          receiptEmailError: error.message,
          receiptEmailErrorAt: admin.firestore.FieldValue.serverTimestamp(),
          receiptEmailAttempts: admin.firestore.FieldValue.increment(1),
        });
      } catch (updateError) {
        console.error(`Could not update order with error info:`, updateError);
      }

      throw error;
    }
  });

/**
 * Retry function for manually resending failed emails
 * Call via: firebase functions:call sendOrderConfirmationRetry --data '{"orderId":"order-id"}'
 */
exports.sendOrderConfirmationRetry = functions.https.onCall(async (data, context) => {
  const { orderId } = data;

  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'orderId is required');
  }

  // Optional: Add authentication check
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  // }

  try {
    console.log(`Retrying order confirmation email for: ${orderId}`);

    // Fetch order
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', `Order ${orderId} not found`);
    }

    const order = orderDoc.data();

    if (!order.customer_email) {
      throw new functions.https.HttpsError('invalid-argument', 'Order missing customer_email');
    }

    // Fetch order items
    let orderItems = [];
    try {
      const itemsCollection = await db.collection('orders').doc(orderId).collection('items').get();
      orderItems = itemsCollection.docs.map(doc => doc.data());
    } catch (err) {
      console.warn(`Could not fetch items: ${err.message}`);
    }

    // Create transporter and send email
    const transporter = createTransporter();
    const emailTemplate = buildEmailTemplate(order, orderItems);
    const mailOptions = {
      from: process.env.GMAIL_USER || functions.config().gmail?.user || 'orders@giovanni-official.com',
      to: order.customer_email,
      subject: `Order Confirmation: ${order.id} - GIOVANNI`,
      html: emailTemplate,
      replyTo: 'support@giovanni-official.com',
    };

    console.log(`Retrying email send to: ${order.customer_email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email resent successfully. MessageID: ${info.messageId}`);

    // Update order
    await db.collection('orders').doc(orderId).update({
      receiptEmailSent: true,
      receiptEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      receiptEmailMessageId: info.messageId,
      receiptEmailError: null, // Clear previous error
    });

    return {
      success: true,
      messageId: info.messageId,
      message: `Email resent to ${order.customer_email}`,
    };

  } catch (error) {
    console.error(`Error retrying email for ${orderId}:`, error);
    throw new functions.https.HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});
