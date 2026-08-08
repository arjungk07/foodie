import https from 'https';

/**
 * Normalizes a phone number string to Twilio WhatsApp format (whatsapp:+<country_code><number>).
 * Handles Indian numbers, spaces, hyphens, parentheses, and leading zeroes.
 */
export const normalizeWhatsAppNumber = (phone) => {
  if (!phone) return null;
  
  let cleaned = phone.toString().trim();
  
  // If already starts with whatsapp:, remove it temporarily to clean the underlying number
  if (cleaned.startsWith('whatsapp:')) {
    cleaned = cleaned.replace(/^whatsapp:/, '');
  }
  
  // Remove non-digit characters except leading plus
  cleaned = cleaned.replace(/[\s\-\(\)]/g, '');
  
  // If no plus sign, assume Indian country code (+91) if 10 digits
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`;
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = `+91${cleaned.slice(1)}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }
  
  return `whatsapp:${cleaned}`;
};

/**
 * Sends a WhatsApp notification to a specific seller for their items in an order.
 * 
 * @param {Object} params
 * @param {Object} params.order - Complete Order document
 * @param {Array} params.sellerItems - Items belonging to this specific seller
 * @param {Object} params.buyerUser - Buyer details (fullName, mobile, email)
 * @param {Object} params.sellerUser - Seller details (_id, fullName, mobile, email)
 */
export const sendOrderWhatsAppNotification = async ({ order, sellerItems, buyerUser, sellerUser }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+17372212163';
  
  const rawSellerPhone = sellerUser?.mobile || sellerUser?.phone;
  const normalizedToWhatsApp = normalizeWhatsAppNumber(rawSellerPhone);

  console.log('=========================================');
  console.log('[WhatsApp Notification] Dispatch started');
  console.log(`Seller ID: ${sellerUser?._id || 'Unknown'}`);
  console.log(`Seller Name: ${sellerUser?.fullName || 'Unknown'}`);
  console.log(`Raw Seller Phone: ${rawSellerPhone || 'None'}`);
  console.log(`Normalized WhatsApp Number: ${normalizedToWhatsApp || 'Invalid'}`);
  console.log(`Twilio From Sender: ${fromWhatsApp}`);

  if (!rawSellerPhone || !normalizedToWhatsApp) {
    console.log('[WhatsApp Notification] FAILED: Missing or invalid seller phone number.');
    console.log('=========================================');
    return {
      status: 'Failed',
      errorMessage: 'Missing or invalid seller phone number',
      errorCode: 'INVALID_PHONE'
    };
  }

  // Calculate total amount for this seller's items
  const sellerTotalAmount = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Format Products List with INR symbol ₹
  const productsList = sellerItems.map(item => 
    `- ${item.productName} (Qty: ${item.quantity} x ₹${item.price.toFixed(2)} = ₹${(item.price * item.quantity).toFixed(2)})`
  ).join('\n');

  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);

  const portalUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/seller`;

  const messageBody = `
🛒 *New Order Received!*
--------------------------------------
*Order ID:* ${order._id}
*Invoice Number:* ${order.invoiceNumber || 'N/A'}
*Order Date:* ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}
*Payment Method:* ${order.paymentMethod}
*Payment Status:* ${order.paymentStatus}
*Items Total Amount:* ₹${sellerTotalAmount.toFixed(2)}
*Expected Delivery:* ${expectedDeliveryDate.toLocaleDateString('en-IN')}

*Customer Info:*
• Name: ${buyerUser?.fullName || order.shippingAddress?.fullName || 'N/A'}
• Phone: ${buyerUser?.mobile || order.shippingAddress?.mobile || 'N/A'}
• Email: ${buyerUser?.email || 'N/A'}

*Delivery Address:*
${order.shippingAddress?.fullName || ''}
${order.shippingAddress?.addressLine || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.postalCode || ''}

*Products Ordered:*
${productsList}
--------------------------------------
*Seller Dashboard:* ${portalUrl}
  `.trim();

  const isMock = !accountSid || accountSid === 'mock' || !authToken;

  if (isMock) {
    console.log(`[MOCK WHATSAPP NOTIFICATION SENT]`);
    console.log(`To: ${normalizedToWhatsApp}`);
    console.log(`From: ${fromWhatsApp}`);
    console.log(`Message Body:\n${messageBody}`);
    console.log('=========================================');
    return { status: 'Sent', messageSid: `mock_wa_sid_${Date.now()}` };
  }

  return new Promise((resolve) => {
    try {
      const postData = new URLSearchParams({
        To: normalizedToWhatsApp,
        From: fromWhatsApp,
        Body: messageBody
      }).toString();

      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          console.log(`Twilio response status: ${res.statusCode}`);
          let parsed = {};
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            console.error('Failed to parse Twilio response JSON:', body);
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`Twilio message SID: ${parsed.sid}`);
            console.log('[WhatsApp Notification] SUCCESS');
            console.log('=========================================');
            resolve({ status: 'Sent', messageSid: parsed.sid });
          } else {
            console.log(`Twilio error code: ${parsed.code || res.statusCode}`);
            console.log(`Twilio error message: ${parsed.message || 'Twilio API error'}`);
            console.log('[WhatsApp Notification] FAILED');
            console.log('=========================================');
            resolve({
              status: 'Failed',
              errorMessage: parsed.message || `Twilio HTTP ${res.statusCode}`,
              errorCode: parsed.code || res.statusCode
            });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`Network error during Twilio dispatch: ${err.message}`);
        console.log('[WhatsApp Notification] FAILED');
        console.log('=========================================');
        resolve({
          status: 'Failed',
          errorMessage: err.message,
          errorCode: 'NETWORK_ERROR'
        });
      });

      req.write(postData);
      req.end();
    } catch (err) {
      console.error(`Unexpected exception in WhatsApp dispatch: ${err.message}`);
      console.log('=========================================');
      resolve({
        status: 'Failed',
        errorMessage: err.message,
        errorCode: 'INTERNAL_EXCEPTION'
      });
    }
  });
};
