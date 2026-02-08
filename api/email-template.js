/**
 * Server-side email HTML template.
 * Mirrors the design of src/components/ConfirmationEmail.jsx
 * but outputs a plain HTML string (no JSX/React needed in serverless).
 */

function buildEventLabel(eventType) {
  const labels = {
    friday: 'Friday Night Golf (10-hole)',
    saturday: 'Saturday Championship (2-man scramble)',
    both: 'Both Events (Friday & Saturday)',
    'non-golfer': 'Non-Golfer / Awards Ceremony',
  };
  return labels[eventType] || eventType;
}

function calculateEventFee(type) {
  return type === 'saturday' || type === 'both' ? 50 : 0;
}

function buildConfirmationEmail({ formData, totalDue }) {
  const {
    firstName,
    lastName,
    email,
    shirtSize,
    eventType,
    registrantDonation,
    partnerName,
    partnerSelection,
    partnerEventType,
    partnerDonation,
    registrantGuests = [],
    partnerGuests = [],
  } = formData;

  const eventFee = calculateEventFee(eventType);
  const eventLabel = buildEventLabel(eventType);
  const totalMeals = registrantGuests.length + partnerGuests.length;

  const guestNames = registrantGuests.map((g) => g.name).join(', ');

  // --- Partner section ---
  let partnerHtml = '';
  if (partnerName || partnerSelection === 'team-assign') {
    if (partnerSelection === 'team-assign' || partnerSelection === 'assign') {
      partnerHtml = `
        <div style="background-color:#eff6ff;padding:15px;border-radius:6px;margin-bottom:20px;">
          <h3 style="margin-top:0;font-size:16px;color:#1e40af;">Partner Information</h3>
          <p style="margin:5px 0;">&#10003; You requested to be assigned to a team.</p>
        </div>`;
    } else if (partnerName) {
      const partnerEventLabel =
        partnerEventType === 'both' ? 'Friday & Saturday' : 'Saturday Only';
      partnerHtml = `
        <div style="background-color:#eff6ff;padding:15px;border-radius:6px;margin-bottom:20px;">
          <h3 style="margin-top:0;font-size:16px;color:#1e40af;">Partner Information</h3>
          <p style="margin:5px 0;"><strong>Partner:</strong> ${partnerName}</p>
          <p style="margin:5px 0;"><strong>Partner Events:</strong> ${partnerEventLabel}</p>
        </div>`;
    }
  }

  // --- Partner cost line ---
  let partnerCostHtml = '';
  if (partnerName) {
    const partnerFee = calculateEventFee(partnerEventType);
    partnerCostHtml = `
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <span>Partner's Golf + Donation:</span>
        <strong>$${partnerFee + parseInt(partnerDonation || 0)}</strong>
      </div>`;
  }

  // --- Guests line ---
  let guestsLine = '';
  if (registrantGuests.length > 0) {
    guestsLine = `<p style="margin:5px 0;"><strong>Guests:</strong> ${guestNames}</p>`;
  }

  // --- Meals summary ---
  let mealsHtml = '';
  if (totalMeals > 0) {
    mealsHtml = `<p style="margin:5px 0;"><strong>Dinner Guests:</strong> ${totalMeals}</p>`;
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background-color:#f9fafb;">
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
  <header style="background-color:#15803d;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;">Bondo Greens 2026</h1>
  </header>

  <div style="padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;background-color:#ffffff;">
    <h2 style="color:#15803d;">Registration Confirmed!</h2>
    <p>Hi ${firstName},</p>
    <p>You're all set for the 2026 Bondo Greens event! Here is a summary of your registration details.</p>

    <div style="background-color:#f9fafb;padding:15px;border-radius:6px;margin-bottom:20px;">
      <h3 style="margin-top:0;font-size:16px;">Your Details</h3>
      <p style="margin:5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p style="margin:5px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin:5px 0;"><strong>Event:</strong> ${eventLabel}</p>
      <p style="margin:5px 0;"><strong>Shirt Size:</strong> ${(shirtSize || '').toUpperCase()}</p>
      ${guestsLine}
      ${mealsHtml}
    </div>

    ${partnerHtml}

    <div style="border:2px solid #22c55e;padding:15px;border-radius:6px;background-color:#f0fdf4;">
      <h3 style="margin-top:0;font-size:16px;color:#15803d;">Amount Due</h3>
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <span>${firstName}'s Golf + Donation:</span>
        <strong>$${eventFee + parseInt(registrantDonation || 0)}</strong>
      </div>
      ${partnerCostHtml}
      <div style="border-top:1px solid #bdf4d4;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;font-size:18px;">
        <strong>GRAND TOTAL:</strong>
        <strong style="color:#15803d;">$${totalDue}</strong>
      </div>
    </div>

    <p style="margin-top:25px;font-size:14px;color:#666;">
      If you have any questions, just reply to this email to reach Jim. We'll see you on the course!
    </p>
  </div>

  <footer style="text-align:center;padding:20px;font-size:12px;color:#999;">
    EST. 2001 | bondogreens.com
  </footer>
</div>
</body>
</html>`;
}

module.exports = { buildConfirmationEmail };
