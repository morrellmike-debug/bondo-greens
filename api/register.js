import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import React from 'react';
import { ConfirmationEmail } from '../src/components/ConfirmationEmail.jsx';

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
  return errors;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' });
  }

  const formData = req.body;

  // 1. Validate payload
  const errors = validatePayload(formData);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: errors.join('; ') });
  }

  const { firstName, lastName, email, phone, shirtSize, eventType, totalDue } = formData;

  // 2. Insert into Supabase — critical path
  const { data: dbData, error: dbError } = await supabase
    .from('registrations')
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
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
      code: 'DB_ERROR',
      message: 'Unable to save registration.',
    });
  }

  // 3. Send confirmation email via Resend (best-effort)
  let emailSent = false;
  try {
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Bondo Greens <no-reply@bondogreens.com>',
      to: [email],
      subject: 'Your Bondo Greens registration is confirmed',
      react: React.createElement(ConfirmationEmail, {
        firstName,
        lastName,
        email,
        shirtSize,
        eventType,
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
      console.error('Resend error:', emailError);
    } else {
      emailSent = true;
    }
  } catch (emailErr) {
    console.error('Email send error:', emailErr);
  }

  // 4. Return response
  if (emailSent) {
    return res.status(201).json({ success: true, emailSent: true });
  }

  return res.status(201).json({
    success: true,
    emailSent: false,
    message: 'Registration saved, but we could not send the confirmation email.',
  });
}
