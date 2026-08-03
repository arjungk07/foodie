import https from 'https';

export const sendOrderWhatsAppNotification = async (order, buyerUser) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio Sandbox number
  const toWhatsApp = process.env.STORE_OWNER_WHATSAPP;

  // Format Products List
  const productsList = order.items.map(item => 
    `- ${item.productName} (Qty: ${item.quantity} x $${item.price.toFixed(2)})`
  ).join('\n');

  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3); // 3 days expected shipping

  // Construct message content
  const messageBody = `
*New Wholesale Order Placed!* 🛒
--------------------------------------
*Order ID:* ${order._id}
*Invoice Number:* ${order.invoiceNumber}
*Order Date:* ${new Date(order.createdAt).toLocaleDateString()}
*Payment Method:* ${order.paymentMethod}
*Payment Status:* ${order.paymentStatus}
*Total Amount:* $${order.totalAmount.toFixed(2)}
*Expected Delivery:* ${expectedDeliveryDate.toLocaleDateString()}

*Customer Profile:*
• Name: ${buyerUser.fullName}
• Phone: ${buyerUser.mobile}
• Email: ${buyerUser.email}

*Delivery Destination:*
${order.shippingAddress.fullName}
${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}

*Products Purchased:*
${productsList}
--------------------------------------
*Admin Portal:* ${process.env.CLIENT_URL || 'http://localhost:5173'}/admin
  `.trim();

  // Fallback to Console logging if credentials are not configured
  const isMock = !accountSid || accountSid === 'mock' || !authToken || !toWhatsApp;

  if (isMock) {
    console.log(`=========================================`);
    console.log(`[MOCK WHATSAPP NOTIFICATION SENT TO STORE OWNER]`);
    console.log(`To: ${toWhatsApp || 'Store Owner'}`);
    console.log(`From: ${fromWhatsApp}`);
    console.log(`Message Body:\n\n${messageBody}`);
    console.log(`=========================================`);
    return { status: 'Sent', messageSid: `mock_wa_sid_${Date.now()}` };
  }

  // Real Twilio API invocation using native https
  return new Promise((resolve) => {
    const postData = new URLSearchParams({
      To: toWhatsApp,
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
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(body);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: 'Sent', messageSid: parsed.sid });
        } else {
          resolve({ status: 'Failed', errorMessage: parsed.message || 'Twilio API Error' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 'Failed', errorMessage: err.message });
    });

    req.write(postData);
    req.end();
  });
};
