/**
 * Simple Registration Endpoint
 * Matches the frontend form structure
 */

const express = require('express');
const router = express.Router();

// POST /api/register - Simple registration endpoint
router.post('/', async (req, res) => {
  try {
    const formData = req.body;
    const {
      firstName,
      lastName,
      email,
      phone,
      shirtSize,
      eventType,
      totalDue,
      partnerSelection,
      partnerName,
      partnerEmail,
      partnerShirtSize,
      partnerEventType,
      registrantGuests,
      partnerGuests
    } = formData;

    console.log('Registration received:', {
      name: `${firstName} ${lastName}`,
      email,
      eventType,
      totalDue,
      guestCount: (registrantGuests?.length || 0) + (partnerGuests?.length || 0)
    });

    // For now, just log and return success
    // TODO: Add database insertion and email sending
    res.status(200).json({
      success: true,
      message: 'Registration received successfully',
      data: {
        firstName,
        lastName,
        email,
        totalDue
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;
