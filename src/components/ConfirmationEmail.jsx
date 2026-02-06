import React from 'react';

const ConfirmationEmail = ({ formData, totalDue, eventFee }) => {
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
    registrantGuests,
    partnerGuests 
  } = formData;

  const totalMeals = registrantGuests.length + partnerGuests.length;

  const eventLabel = {
    'friday': 'Friday Night Golf (10-hole)',
    'saturday': 'Saturday Championship (2-man scramble)',
    'both': 'Both Events (Friday & Saturday)',
    'non-golfer': 'Non-Golfer / Awards Ceremony'
  }[eventType];

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', color: '#333' }}>
      <header style={{ backgroundColor: '#15803d', padding: '20px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Bondo Greens 2026</h1>
      </header>
      
      <div style={{ padding: '30px', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <h2 style={{ color: '#15803d' }}>Registration Confirmed!</h2>
        <p>Hi {firstName},</p>
        <p>You're all set for the 2026 Bondo Greens event! Here is a summary of your registration details.</p>

        <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, fontSize: '16px' }}>Your Details</h3>
          <p style={{ margin: '5px 0' }}><strong>Event:</strong> {eventLabel}</p>
          <p style={{ margin: '5px 0' }}><strong>Shirt Size:</strong> {shirtSize.toUpperCase()}</p>
          {registrantGuests.length > 0 && (
            <p style={{ margin: '5px 0' }}><strong>Guests:</strong> {registrantGuests.map(g => g.name).join(', ')}</p>
          )}
        </div>

        {(partnerName || partnerSelection === 'team-assign') && (
          <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', color: '#1e40af' }}>Partner Information</h3>
            {partnerSelection === 'team-assign' ? (
              <p style={{ margin: '5px 0' }}>✓ You requested to be assigned to a team.</p>
            ) : (
              <>
                <p style={{ margin: '5px 0' }}><strong>Partner:</strong> {partnerName}</p>
                <p style={{ margin: '5px 0' }}><strong>Partner Events:</strong> {partnerEventType === 'both' ? 'Friday & Saturday' : 'Saturday Only'}</p>
              </>
            )}
          </div>
        )}

        <div style={{ border: '2px solid #22c55e', padding: '15px', borderRadius: '6px', backgroundColor: '#f0fdf4' }}>
          <h3 style={{ marginTop: 0, fontSize: '16px', color: '#15803d' }}>Amount Due</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>{firstName}'s Golf + Donation:</span>
            <strong>${50 + parseInt(registrantDonation || 0)}</strong>
          </div>
          {partnerName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Partner's Golf + Donation:</span>
              <strong>${eventFee + parseInt(partnerDonation || 0)}</strong>
            </div>
          )}
          <div style={{ borderTop: '1px solid #bdf4d4', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
            <strong>GRAND TOTAL:</strong>
            <strong style={{ color: '#15803d' }}>${totalDue}</strong>
          </div>
        </div>

        <p style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
          If you have any questions, just reply to this email to reach Jim. We'll see you on the course!
        </p>
      </div>
      
      <footer style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: '#999' }}>
        EST. 2001 | bondogreens.com
      </footer>
    </div>
  );
};

export default ConfirmationEmail;
