const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { buildConfirmationEmail } = require('./email-template');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

function validatePayload(body) {
  const errors = [];
  if (!body.firstName || typeof body.firstName !== 'string') errors.push('firstName is required');
  if (!body.lastName || typeof body.lastName !== 'string') errors.push('lastName is required');
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('A valid email is required');
  if (!body.eventType) errors.push('eventType is required');
  if (typeof body.totalDue !== 'number' && typeof body.totalDue !== 'string') errors.push('totalDue is required');
  return errors;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const formData = req.body;

  // 1. Validate payload
  const validationErrors = validatePayload(formData);
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: validationErrors });
  }

  const { firstName, lastName, email, phone, shirtSize, eventType, totalDue } = formData;

  let dbSaved = false;
  let emailSent = false;

  try {
    // 2. Save to Supabase — this is the critical step
    const { data: dbData, error: dbError } = await supabase
      .from('registrations')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          shirt_size: shirtSize,
          event_type: eventType,
          total_due: totalDue,
          raw_data: formData,
        }
      ])
      .select('id')
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save registration',
        details: dbError.message,
      });
    }

    dbSaved = true;

    // 3. Send confirmation email via Resend (best-effort — don't fail the registration)
    try {
      const emailHtml = buildConfirmationEmail({ formData, totalDue });

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Jim Bondurant <jim@bondogreens.com>',
        to: [email],
        cc: ['morrell.mike@gmail.com'],
        subject: `Bondo Greens 2026 - Registration Confirmed (${firstName} ${lastName})`,
        html: emailHtml,
      });

      if (emailError) {
        console.error('Resend error:', emailError);
      } else {
        emailSent = true;
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
    }

    // 4. Return success — registration is saved regardless of email outcome
    return res.status(200).json({
      success: true,
      registrationId: dbData?.id || null,
      emailSent,
      message: emailSent
        ? 'Registration saved and confirmation email sent!'
        : 'Registration saved! Confirmation email could not be sent — we have your info on file.',
    });
  } catch (err) {
    console.error('System error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      dbSaved,
      emailSent,
    });
  }
};
