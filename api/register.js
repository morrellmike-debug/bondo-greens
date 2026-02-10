import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function validatePayload(body) {
  const errors = [];
  if (!body.firstName || typeof body.firstName !== 'string') errors.push('First name is required');
  if (!body.lastName || typeof body.lastName !== 'string') errors.push('Last name is required');
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('A valid email is required');
  if (!body.phone || body.phone.replace(/\D/g, '').length !== 10) errors.push('A valid 10-digit phone is required');
  if (!body.eventType) errors.push('Event type is required');
  return errors;
}

const EVENT_LABELS = {
  friday: 'Friday Night Golf (10-hole)',
  saturday: 'Saturday Championship (2-man scramble)',
  both: 'Both Events (Friday & Saturday)',
  'non-golfer': 'Non-Golfer / Awards Ceremony',
};

function buildEmailHtml(data) {
  const {
    firstName, lastName, email, shirtSize, eventType,
    registrantDonation = 0, partnerName, partnerSelection,
    partnerEventType, partnerDonation = 0,
    registrantGuests = [], partnerGuests = [], totalDue = 0,
  } = data;

  const eventLabel = EVENT_LABELS[eventType] || eventType;
  const eventFee = (eventType === 'saturday' || eventType === 'both') ? 50 : 0;
  const totalMeals = registrantGuests.length + partnerGuests.length;

  const guestNames = registrantGuests.map(g => g.name).filter(Boolean).join(', ');
  const partnerFee = (partnerEventType === 'saturday' || partnerEventType === 'both') ? 50 : 0;

  let partnerSection = '';
  if (partnerName || partnerSelection === 'assign' || partnerSelection === 'team-assign') {
    if (partnerSelection === 'assign' || partnerSelection === 'team-assign') {
      partnerSection = `
        <div style="background-color:#eff6ff;padding:15px;border-radius:6px;margin-bottom:20px">
          <h3 style="margin-top:0;font-size:16px;color:#1e40af">Partner Information</h3>
          <p style="margin:5px 0">&#10003; You requested to be assigned to a team.</p>
        </div>`;
    } else {
      partnerSection = `
        <div style="background-color:#eff6ff;padding:15px;border-radius:6px;margin-bottom:20px">
          <h3 style="margin-top:0;font-size:16px;color:#1e40af">Partner Information</h3>
          <p style="margin:5px 0"><strong>Partner:</strong> ${partnerName}</p>
          <p style="margin:5px 0"><strong>Partner Events:</strong> ${partnerEventType === 'both' ? 'Friday & Saturday' : 'Saturday Only'}</p>
        </div>`;
    }
  }

  let partnerDueLine = '';
  if (partnerName) {
    partnerDueLine = `
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span>Partner's Golf + Donation:</span>
        <strong>$${partnerFee + parseInt(partnerDonation || 0)}</strong>
      </div>`;
  }

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
      <div style="background-color:#15803d;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0">Bondo Greens 2026</h1>
      </div>
      <div style="padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#15803d">Registration Confirmed!</h2>
        <p>Hi ${firstName},</p>
        <p>You're all set for the 2026 Bondo Greens event! Here is a summary of your registration details.</p>

        <div style="background-color:#f9fafb;padding:15px;border-radius:6px;margin-bottom:20px">
          <h3 style="margin-top:0;font-size:16px">Your Details</h3>
          <p style="margin:5px 0"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin:5px 0"><strong>Email:</strong> ${email}</p>
          <p style="margin:5px 0"><strong>Event:</strong> ${eventLabel}</p>
          ${shirtSize && shirtSize !== 'none' ? `<p style="margin:5px 0"><strong>Shirt Size:</strong> ${shirtSize.toUpperCase()}</p>` : ''}
          ${guestNames ? `<p style="margin:5px 0"><strong>Guests:</strong> ${guestNames}</p>` : ''}
          ${totalMeals > 0 ? `<p style="margin:5px 0"><strong>Dinner Guests:</strong> ${totalMeals}</p>` : ''}
        </div>

        ${partnerSection}

        <div style="border:2px solid #22c55e;padding:15px;border-radius:6px;background-color:#f0fdf4">
          <h3 style="margin-top:0;font-size:16px;color:#15803d">Amount Due</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span>${firstName}'s Golf + Donation:</span>
            <strong>$${eventFee + parseInt(registrantDonation || 0)}</strong>
          </div>
          ${partnerDueLine}
          <div style="border-top:1px solid #bdf4d4;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;font-size:18px">
            <strong>GRAND TOTAL:</strong>
            <strong style="color:#15803d">$${totalDue}</strong>
          </div>
        </div>

        <p style="margin-top:25px;font-size:14px;color:#666">
          If you have any questions, just reply to this email to reach Jim. We'll see you on the course!
        </p>
      </div>
      <div style="text-align:center;padding:20px;font-size:12px;color:#999">
        EST. 2001 | bondogreens.com
      </div>
    </div>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate env vars before doing anything
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return res.status(500).json({ success: false, error: 'Server configuration error. Please contact the organizer.' });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    return res.status(500).json({ success: false, error: 'Server configuration error. Please contact the organizer.' });
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
    // Look up the active event to link registration
    let eventId = null;
    const { data: activeEvent } = await supabase
      .from('events')
      .select('id')
      .in('status', ['scheduled', 'active'])
      .order('event_date', { ascending: true })
      .limit(1)
      .single();
    if (activeEvent) eventId = activeEvent.id;

    // Build JSONB columns for admin portal compatibility
    const shirts = [];
    if (shirtSize && shirtSize !== 'none') shirts.push({ size: shirtSize, qty: 1 });
    if (formData.partnerShirtSize && formData.partnerShirtSize !== 'none') shirts.push({ size: formData.partnerShirtSize, qty: 1 });
    (formData.registrantGuests || []).forEach(g => {
      if (g.shirtSize && g.shirtSize !== 'none') shirts.push({ size: g.shirtSize, qty: 1 });
    });
    (formData.partnerGuests || []).forEach(g => {
      if (g.shirtSize && g.shirtSize !== 'none') shirts.push({ size: g.shirtSize, qty: 1 });
    });

    const allGuests = [...(formData.registrantGuests || []), ...(formData.partnerGuests || [])];
    const meals = [];
    const mealCounts = {};
    allGuests.forEach(g => {
      const cat = g.category || 'adult';
      mealCounts[cat] = (mealCounts[cat] || 0) + 1;
    });
    Object.entries(mealCounts).forEach(([type, qty]) => meals.push({ type, qty }));

    const eventsAttending = [{ event: eventType, confirmed: true }];
    if (formData.partnerEventType) {
      eventsAttending.push({ event: formData.partnerEventType, who: 'partner', confirmed: true });
    }

    // 1. Save to Supabase — fail the request if this fails
    const { error: dbError } = await supabase
      .from('registrations')
      .insert([{
        event_id: eventId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: cleanPhone,
        shirt_size: shirtSize,
        event_type: eventType,
        total_due: totalDue,
        raw_data: formData,
        events_attending: eventsAttending,
        shirts,
        meals,
        guests: allGuests,
      }]);

    if (dbError) {
      console.error('Supabase error:', JSON.stringify(dbError));
      return res.status(500).json({ success: false, error: `Registration failed: ${dbError.message || 'database error'}` });
    }

    // 2. Send confirmation email via Resend (best-effort — don't fail registration if email fails)
    let emailSent = false;
    try {
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'Bondo Greens <onboarding@resend.dev>';

      const { error: emailError } = await resend.emails.send({
        from: fromAddress,
        to: [email, 'morrell.mike@gmail.com'],
        subject: `Bondo Greens 2026 - Registration Confirmed (${firstName} ${lastName})`,
        html: buildEmailHtml(formData),
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
