import { useState } from 'react';

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventType: '', // 'friday', 'saturday', or 'both'
    numGuests: 0,
    guests: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Real-time email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation: extract digits and check for exactly 10
  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10; // Must have exactly 10 digits
  };

  // Clean phone to just digits for DB storage
  const cleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, ''); // Remove all non-digits
  };

  // Format phone for display: 5551234567 → (555) 123-4567
  const formatPhoneForDisplay = (phone) => {
    const digits = cleanPhone(phone);
    if (digits.length !== 10) return digits;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone: only allow numbers, dashes, parentheses, periods, spaces
    if (name === 'phone') {
      const phoneCharsOnly = value.replace(/[^\d\-().\s]/g, '');
      // Check if there are more than 10 digits
      const digitsOnly = phoneCharsOnly.replace(/\D/g, '');
      if (digitsOnly.length > 10) {
        // Don't update if it exceeds 10 digits
        return;
      }
      setFormData(prev => ({
        ...prev,
        [name]: phoneCharsOnly,
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errors = { ...validationErrors };

    // Only validate on blur, not during typing
    if (name === 'email') {
      if (!value) {
        delete errors.email;
      } else if (!validateEmail(value)) {
        errors.email = 'Please enter a valid email address';
      } else {
        delete errors.email;
      }
    }
    if (name === 'phone') {
      if (!value) {
        delete errors.phone;
      } else {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 10) {
          errors.phone = `Phone number incomplete: ${digitsOnly.length}/10 digits`;
        } else if (digitsOnly.length > 10) {
          errors.phone = `Too many digits: ${digitsOnly.length}/10 digits`;
        } else {
          delete errors.phone;
        }
      }
    }
    setValidationErrors(errors);
  };

  const handleEventSelect = (eventType) => {
    setFormData(prev => ({
      ...prev,
      eventType: eventType,
    }));
  };

  const handleAddGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { name: '', age: '', shirtSize: '' }],
    }));
  };

  const handleGuestChange = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((g, i) => i === idx ? { ...g, [field]: value } : g),
    }));
  };

  const handleDeleteGuest = (idx) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== idx),
    }));
  };

  const canProceed = () => {
    // Phone is optional but if entered must be valid
    const phoneValid = !formData.phone || (validatePhone(formData.phone) && !validationErrors.phone);
    return formData.firstName && formData.lastName && formData.email && 
           validateEmail(formData.email) && !validationErrors.email && phoneValid;
  };

  const handleSubmit = () => {
    // Clean phone to just digits before storing/submitting
    const cleanedFormData = {
      ...formData,
      phone: cleanPhone(formData.phone), // Store as: 5551234567
    };
    
    console.log('Submitting to DB:', cleanedFormData); // Phone will be just digits

    setSubmitted(true);
    setTimeout(() => {
      alert(`✓ Registration submitted!\nConfirmation sent to ${formData.email}`);
      setStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        eventType: '',
        numGuests: 0,
        guests: [],
      });
      setValidationErrors({});
      setSubmitted(false);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 mx-1">
              <div
                className={`h-2 rounded ${
                  i <= step ? 'bg-green-700' : 'bg-gray-300'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 text-center">
          Step {step} of 4
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Your Information
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email * <span className="text-xs text-gray-500">(required)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full border rounded px-3 py-2 ${
                validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">❌ {validationErrors.email}</p>
            )}
            {formData.email && validateEmail(formData.email) && !validationErrors.email && (
              <p className="text-green-500 text-xs mt-1">✓ Valid email</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-xs text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full border rounded px-3 py-2 ${
                validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567 — exactly 10 digits required"
            />
            {validationErrors.phone && (
              <p className="text-red-500 text-xs mt-1">❌ {validationErrors.phone}</p>
            )}
            {formData.phone && validatePhone(formData.phone) && !validationErrors.phone && (
              <p className="text-green-500 text-xs mt-1">✓ Valid phone</p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Event Selection */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Event Selection
          </h2>

          <p className="text-gray-600 mb-6">Choose which event(s) you'll attend:</p>

          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleEventSelect('friday')}
              className={`w-full p-6 text-left border-2 rounded-lg transition ${
                formData.eventType === 'friday'
                  ? 'border-green-700 bg-green-50'
                  : 'border-gray-300 hover:border-green-700'
              }`}
            >
              <div className="font-semibold text-gray-800">Friday Night Golf</div>
              <div className="text-sm text-gray-600 mt-1">10-hole individual night golf</div>
              <div className="text-sm font-medium text-green-700 mt-2">Donation only</div>
            </button>

            <button
              onClick={() => handleEventSelect('saturday')}
              className={`w-full p-6 text-left border-2 rounded-lg transition ${
                formData.eventType === 'saturday'
                  ? 'border-green-700 bg-green-50'
                  : 'border-gray-300 hover:border-green-700'
              }`}
            >
              <div className="font-semibold text-gray-800">Saturday Championship</div>
              <div className="text-sm text-gray-600 mt-1">10-hole 2-man scramble</div>
              <div className="text-sm font-medium text-green-700 mt-2">$50 per golfer</div>
            </button>

            <button
              onClick={() => handleEventSelect('both')}
              className={`w-full p-6 text-left border-2 rounded-lg transition ${
                formData.eventType === 'both'
                  ? 'border-green-700 bg-green-50'
                  : 'border-gray-300 hover:border-green-700'
              }`}
            >
              <div className="font-semibold text-gray-800">Both Events</div>
              <div className="text-sm text-gray-600 mt-1">Friday & Saturday Golf</div>
              <div className="text-sm font-medium text-green-700 mt-2">Donation + $50/golfer</div>
            </button>

            <button
              onClick={() => handleEventSelect('non-golfer')}
              className={`w-full p-6 text-left border-2 rounded-lg transition ${
                formData.eventType === 'non-golfer'
                  ? 'border-green-700 bg-green-50'
                  : 'border-gray-300 hover:border-green-700'
              }`}
            >
              <div className="font-semibold text-gray-800">Non-Golfer / Awards Ceremony</div>
              <div className="text-sm text-gray-600 mt-1">Join us for celebration & awards</div>
              <div className="text-sm font-medium text-green-700 mt-2">Donation only</div>
            </button>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!formData.eventType}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Guests & Details */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Guests & Details
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Number of Guests *
            </label>
            <input
              type="number"
              name="numGuests"
              value={formData.numGuests}
              onChange={(e) => {
                const num = parseInt(e.target.value) || 0;
                setFormData(prev => ({
                  ...prev,
                  numGuests: num,
                  guests: prev.guests.slice(0, num),
                }));
              }}
              min="0"
              max="10"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {formData.numGuests > 0 && (
            <div className="mb-6">
              <div className="space-y-4">
                {Array.from({ length: formData.numGuests }).map((_, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">
                        Guest {idx + 1}
                      </h3>
                      {formData.guests[idx] && (
                        <button
                          onClick={() => handleDeleteGuest(idx)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={formData.guests[idx]?.name || ''}
                          onChange={(e) => handleGuestChange(idx, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          value={formData.guests[idx]?.age || ''}
                          onChange={(e) => handleGuestChange(idx, 'age', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="35"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Shirt Size
                      </label>
                      <select
                        value={formData.guests[idx]?.shirtSize || ''}
                        onChange={(e) => handleGuestChange(idx, 'shirtSize', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select size</option>
                        <option value="s">Small</option>
                        <option value="m">Medium</option>
                        <option value="l">Large</option>
                        <option value="xl">X-Large</option>
                        <option value="xxl">2X-Large</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Review & Confirm
          </h2>

          <div className="space-y-6 mb-8">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-700 mb-2">Primary Registrant</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                {formData.phone && <p><strong>Phone:</strong> {formatPhoneForDisplay(formData.phone)}</p>}
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-700 mb-2">Event</h3>
              <div className="text-sm text-gray-600">
                {formData.eventType === 'friday' && 'Friday Night Golf'}
                {formData.eventType === 'saturday' && 'Saturday Championship'}
                {formData.eventType === 'both' && 'Both Events (Friday & Saturday)'}
                {formData.eventType === 'non-golfer' && 'Non-Golfer / Awards Ceremony'}
              </div>
            </div>

            {formData.numGuests > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Guests ({formData.numGuests})
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  {formData.guests.map((guest, idx) => (
                    <p key={idx}>
                      • {guest.name || `Guest ${idx + 1}`}
                      {guest.age && ` (Age ${guest.age})`}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              Confirm Registration
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Registration Submitted!
            </h3>
            <p className="text-gray-600">
              Confirmation email sent to {formData.email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
