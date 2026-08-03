import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const isMock =
  !process.env.RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID === 'mock' ||
  !process.env.RAZORPAY_KEY_SECRET ||
  process.env.RAZORPAY_KEY_SECRET === 'mock';

let razorpayInstance = null;

if (!isMock) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a Razorpay Order on the server.
 * @param {number} amount     - Total amount in INR (e.g. 1500)
 * @param {string} currency   - ISO currency code (default 'INR')
 * @param {string} receiptId  - Unique local order reference (invoiceNumber)
 */
export const createRazorpayOrder = async (amount, currency = 'INR', receiptId) => {
  const amountInPaise = Math.round(amount * 100);

  if (isMock) {
    console.log('[MOCK] Razorpay order created for receipt:', receiptId);
    return {
      id: `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: amountInPaise,
      currency,
      receipt: receiptId,
      status: 'created',
    };
  }

  return await razorpayInstance.orders.create({
    amount: amountInPaise,
    currency,
    receipt: receiptId.toString(),
  });
};

/**
 * Verify Razorpay payment signature (HMAC-SHA256).
 * Returns true if signature is valid, false otherwise.
 */
export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, signature) => {
  if (isMock) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Razorpay configuration error: Mock payment verification is strictly forbidden in production mode.');
    }
    // In mock development mode, accept signature for testing
    return true;
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/** Expose the key_id so the frontend can initialise Razorpay checkout */
export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || 'mock';
