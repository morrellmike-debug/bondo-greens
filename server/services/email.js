const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendConfirmationEmail = async (registrationData) => {
  const { first_name, email } = registrationData;
  
  try {
    const data = await resend.emails.send({
      from: 'Jim <jim@bondogreens.com>',
      to: [email],
      subject: 'Bondo Greens 2026 - Registration Confirmed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <header style="background-color: #15803d; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0;">Bondo Greens 2026</h1>
          </header>
          
          <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; borderRadius: 0 0 8px 8px;">
            <h2 style="color: #15803d;">Registration Confirmed!</h2>
            <p>Hi ${first_name},</p>
            <p>You're all set for the 2026 Bondo Greens event! We have received your registration.</p>
            <p style="margin-top: 25px; fontSize: 14px; color: #666;">
              If you have any questions, just reply to this email to reach Jim. We'll see you on the course!
            </p>
          </div>
          
          <footer style="text-align: center; padding: 20px; fontSize: 12px; color: #999;">
            EST. 2001 | bondogreens.com
          </footer>
        </div>
      `
    });
    console.log('Confirmation email sent:', data.id);
    return data;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
};

module.exports = { sendConfirmationEmail };
