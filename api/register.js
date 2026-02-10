module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate env vars before doing anything
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return res.status(500).json({ error: 'Server configuration error. Please contact the organizer.' });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    return res.status(500).json({ error: 'Server configuration error. Please contact the organizer.' });
  }

  const { createClient } = require('@supabase/supabase-js');
  const { Resend } = require('resend');

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);

  const formData = req.body;
  const { firstName, lastName, email, phone, shirtSize, eventType, totalDue } = formData;

  // Server-side validation
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'First name and last name are required.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!phone || phone.replace(/\D/g, '').length !== 10) {
    return res.status(400).json({ error: 'A valid 10-digit phone number is required.' });
  }
  if (!shirtSize) {
    return res.status(400).json({ error: 'Shirt size is required.' });
  }
  if (!eventType) {
    return res.status(400).json({ error: 'Event type is required.' });
  }

  try {
    // 1. Save to Supabase — fail the request if this fails (don't send a confirmation for unsaved data)
    const { error: dbError } = await supabase
      .from('registrations')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        shirt_size: shirtSize,
        event_type: eventType,
        total_due: totalDue,
        raw_data: formData,
      }]);

    if (dbError) {
      console.error('Supabase error:', dbError);
      return res.status(500).json({ error: 'Failed to save registration. Please try again.' });
    }

    // 2. Send confirmation email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Jim Bondurant <jim@bondogreens.com>',
      to: [email, 'morrell.mike@gmail.com'],
      subject: `Bondo Greens 2026 - Registration Confirmed (${firstName} ${lastName})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <header style="background-color: #22c55e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0;">Bondo Greens 2026</h1>
          </header>
          <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
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
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      // Registration saved, but email failed — still return success with a note
      return res.status(200).json({ success: true, emailSent: false });
    }

    return res.status(200).json({ success: true, emailSent: true });
  } catch (err) {
    console.error('System error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
};
