const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formData = req.body;
  const { firstName, email, totalDue } = formData;

  try {
    const data = await resend.emails.send({
      from: 'Jim Bondurant <jim@bondogreens.com>',
      to: [email, 'morrell.mike@gmail.com'], // CC Mike for validation
      subject: 'Bondo Greens 2026 - Registration Confirmed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <header style="background-color: #22c55e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0;">Bondo Greens 2026</h1>
          </header>
          
          <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; borderRadius: 0 0 8px 8px;">
            <h2 style="color: #15803d;">Registration Confirmed!</h2>
            <p>Hi ${firstName},</p>
            <p>You're all set for the 2026 Bondo Greens event!</p>
            <div style="border: 2px solid #22c55e; padding: 15px; border-radius: 6px; background-color: #f0fdf4; margin-top: 20px;">
              <strong>GRAND TOTAL: $${totalDue}</strong>
            </div>
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions, just reply to this email to reach Jim. We'll see you on the course!
            </p>
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send confirmation email' });
  }
}
