import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, html }) => {
  const isMock = !process.env.EMAIL_USER || 
                 process.env.EMAIL_USER === 'mock@example.com' ||
                 !process.env.EMAIL_PASS || 
                 process.env.EMAIL_PASS === 'mockpassword';
  
  if (isMock) {
    console.log(`=========================================`);
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML Snippet): ${html.substring(0, 300)}...`);
    console.log(`=========================================`);
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Foodie B2B Wholesale" <no-reply@foodie.com>`,
      to: email,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    // Return a mock success response so development isn't blocked by credential issues
    return { success: false, error: error.message };
  }
};
export default sendEmail;
