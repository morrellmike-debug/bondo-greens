import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import React from 'react';
import { ConfirmationEmail } from '../src/components/ConfirmationEmail.jsx';

function validatePayload(body) {
  const errors = [];
  if (!body.firstName || typeof body.firstName !== 'string') errors.push('First name is required');
  if (!body.lastName || typeof body.lastName !== 'string') errors.push('Last name is required');
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('A valid email is required');
  if (!body.phone || body.phone.replace(/\D/g, '').length !== 10) errors.push('A valid 10-digit phone is required');
  if (!body.shirtSize) errors.push('Shirt size is required');
  if (!body.eventType) errors.push('Event type is required');
  return errors;
}

export default async function handler(req, res) {
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

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);

  const formData = req.body;
  const { firstName, lastName, email, phone, shirtSize, eventType, totalDue } = formData;

  // Server-side validation
  const errors = validatePayload(formData);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join('; ') });
  }

  // Format phone as digits only
  const cleanPhone = (phone || '').replace(/\D/g, '');

  try {
    // 1. Save to Supabase — fail the request if this fails
    const { error: dbError } = await supabase
      .from('registrations')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        email,
        phone: cleanPhone,
        shirt_size: shirtSize,
        event_type: eventType,
        total_due: totalDue,
        raw_data: formData,
      }]);

    if (dbError) {
      console.error('Supabase error:', JSON.stringify(dbError));
      return res.status(500).json({ success: false, error: `Registration failed: ${dbError.message || 'database error'}` });
    }

    // 2. Send confirmation email via Resend (best-effort — don't fail registration if email fails)
    let emailSent = false;
    try {
      // Use custom domain if verified, otherwise fall back to Resend's onboarding address
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'Bondo Greens <onboarding@resend.dev>';

      const { error: emailError } = await resend.emails.send({
        from: fromAddress,
        to: [email, 'morrell.mike@gmail.com'],
        subject: `Bondo Greens 2026 - Registration Confirmed (${firstName} ${lastName})`,
        react: React.createElement(ConfirmationEmail, {
          firstName,
          lastName,
          email,
          shirtSize: shirtSize || '',
          eventType: eventType || '',
          registrantDonation: formData.registrantDonation,
          partnerName: formData.partnerName,
          partnerSelection: formData.partnerSelection,
          partnerEventType: formData.partnerEventType,
          partnerDonation: formData.partnerDonation,
          registrantGuests: formData.registrantGuests || [],
          partnerGuests: formData.partnerGuests || [],
          totalDue,
        }),
      });

      if (emailError) {
        console.error('Resend error:', JSON.stringify(emailError));
      } else {
        emailSent = true;
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message || emailErr);
    }

    return res.status(201).json({ success: true, emailSent });
  } catch (err) {
    console.error('System error:', err);
    return res.status(500).json({ success: false, error: `Server error: ${err.message || 'unknown'}` });
  }
}
