import { useState } from 'react';

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Registrant
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    shirtSize: '', // optional
    eventType: '', // 'friday', 'saturday', 'both', or 'non-golfer'
    // Partner (if Saturday/Both)
    partnerName: '',
    partnerEmail: '',
    partnerPhone: '',
    partnerShirtSize: '', // optional
    // Guests for both
    registrantGuests: [],
    partnerGuests: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [guestOwner, setGuestOwner] = useState('registrant'); // 'registrant' or 'partner'

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
    // Auto-advance for Friday/Non-golfer (no partner needed)
    if (eventType === 'friday' || eventType === 'non-golfer') {
      setTimeout(() => setStep(3), 100);
    }
  };

  const shirtSizesByCategory = {
    adult: [
      { label: 'Small', value: 'adult-s' },
      { label: 'Medium', value: 'adult-m' },
      { label: 'Large', value: 'adult-l' },
      { label: 'X-Large', value: 'adult-xl' },
      { label: '2X-Large', value: 'adult-xxl' },
      { label: '3X-Large', value: 'adult-3xl' },
    ],
    child: [
      { label: 'XS (Ages 4-6)', value: 'child-xs' },
      { label: 'S (Ages 6-8)', value: 'child-s' },
      { label: 'M (Ages 8-10)', value: 'child-m' },
      { label: 'L (Ages 10-12)', value: 'child-l' },
    ],
    toddler: [
      { label: '2T', value: 'toddler-2t' },
      { label: '3T', value: 'toddler-3t' },
      { label: '4T', value: 'toddler-4t' },
      { label: '5T', value: 'toddler-5t' },
    ],
    infant: [
      { label: 'NB (Newborn)', value: 'infant-nb' },
      { label: '0-3 months', value: 'infant-0-3m' },
      { label: '3-6 months', value: 'infant-3-6m' },
      { label: '6-12 months', value: 'infant-6-12m' },
      { label: '12-18 months', value: 'infant-12-18m' },
      { label: '18-24 months', value: 'infant-18-24m' },
    ],
  };

  const handleAddGuest = () => {
    setFormData(prev => {
      const newGuest = { name: '', category: '', shirtSize: '' };
      if (guestOwner === 'registrant') {
        return {
          ...prev,
          registrantGuests: [...prev.registrantGuests, newGuest],
        };
      } else {
        return {
          ...prev,
          partnerGuests: [...prev.partnerGuests, newGuest],
        };
      }
    });
  };

  const handleGuestChange = (idx, field, value) => {
    setFormData(prev => {
      if (guestOwner === 'registrant') {
        return {
          ...prev,
          registrantGuests: prev.registrantGuests.map((g, i) => {
            if (i === idx) {
              if (field === 'category') {
                return { ...g, [field]: value, shirtSize: '' };
              }
              return { ...g, [field]: value };
            }
            return g;
          }),
        };
      } else {
        return {
          ...prev,
          partnerGuests: prev.partnerGuests.map((g, i) => {
            if (i === idx) {
              if (field === 'category') {
                return { ...g, [field]: value, shirtSize: '' };
              }
              return { ...g, [field]: value };
            }
            return g;
          }),
        };
      }
    });
  };

  const handleDeleteGuest = (idx) => {
    setFormData(prev => {
      if (guestOwner === 'registrant') {
        return {
          ...prev,
          registrantGuests: prev.registrantGuests.filter((_, i) => i !== idx),
        };
      } else {
        return {
          ...prev,
          partnerGuests: prev.partnerGuests.filter((_, i) => i !== idx),
        };
      }
    });
  };

  const currentGuests = guestOwner === 'registrant' ? formData.registrantGuests : formData.partnerGuests;
  const totalMeals = formData.registrantGuests.length + formData.partnerGuests.length;

  const canProceed = () => {
    // Phone is optional but if entered must be valid
    const phoneValid = !formData.phone || (validatePhone(formData.phone) && !validationErrors.phone);
    return formData.firstName && formData.lastName && formData.email && formData.shirtSize &&
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
        shirtSize: '',
        eventType: '',
        partnerName: '',
        partnerEmail: '',
        partnerPhone: '',
        partnerShirtSize: '',
        registrantGuests: [],
        partnerGuests: [],
      });
      setValidationErrors({});
      setSubmitted(false);
      setGuestOwner('registrant');
    }, 500);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-4 px-3 sm:px-4 md:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between mb-3 sm:mb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 mx-0.5 sm:mx-1">
                <div
                  className={`h-2 rounded ${
                    i <= step ? 'bg-green-700' : 'bg-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 text-center">
            Step {step} of 4
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
              Your Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-base"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-base"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email * <span className="text-xs text-gray-500">(required)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full border rounded px-4 py-3 text-base ${
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full border rounded px-4 py-3 text-base ${
                  validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-xs mt-1">❌ {validationErrors.phone}</p>
              )}
              {formData.phone && validatePhone(formData.phone) && !validationErrors.phone && (
                <p className="text-green-500 text-xs mt-1">✓ Valid phone</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shirt Size * <span className="text-xs text-gray-500">(Adult sizes)</span>
              </label>
              <select
                name="shirtSize"
                value={formData.shirtSize}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-3 text-base"
              >
                <option value="">Select size</option>
                <option value="adult-s">Small</option>
                <option value="adult-m">Medium</option>
                <option value="adult-l">Large</option>
                <option value="adult-xl">X-Large</option>
                <option value="adult-xxl">2X-Large</option>
              </select>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 text-base font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed()}
                className="px-6 py-3 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50 text-base font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      

      {/* Step 2: Event Selection & Partner Info */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
            Event Selection
          </h2>

          {!formData.eventType ? (
            <>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Choose which event(s) you'll attend:</p>

              <div className="space-y-3 mb-6 sm:mb-8">
              <button
                onClick={() => handleEventSelect('friday')}
                className={`w-full p-4 sm:p-6 text-left border-2 rounded-lg transition ${
                  formData.eventType === 'friday'
                    ? 'border-green-700 bg-green-50'
                    : 'border-gray-300 hover:border-green-700'
                }`}
              >
                <div className="font-semibold text-gray-800 text-base">Friday Night Golf</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">10-hole individual night golf</div>
                <div className="text-xs sm:text-sm font-medium text-green-700 mt-2">Donation only</div>
              </button>

              <button
                onClick={() => handleEventSelect('saturday')}
                className={`w-full p-4 sm:p-6 text-left border-2 rounded-lg transition ${
                  formData.eventType === 'saturday'
                    ? 'border-green-700 bg-green-50'
                    : 'border-gray-300 hover:border-green-700'
                }`}
              >
                <div className="font-semibold text-gray-800 text-base">Saturday Championship</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">10-hole 2-man scramble</div>
                <div className="text-xs sm:text-sm font-medium text-green-700 mt-2">$50 per golfer</div>
              </button>

              <button
                onClick={() => handleEventSelect('both')}
                className={`w-full p-4 sm:p-6 text-left border-2 rounded-lg transition ${
                  formData.eventType === 'both'
                    ? 'border-green-700 bg-green-50'
                    : 'border-gray-300 hover:border-green-700'
                }`}
              >
                <div className="font-semibold text-gray-800 text-base">Both Events</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Friday & Saturday Golf</div>
                <div className="text-xs sm:text-sm font-medium text-green-700 mt-2">$50 per golfer</div>
              </button>

              <button
                onClick={() => handleEventSelect('non-golfer')}
                className={`w-full p-4 sm:p-6 text-left border-2 rounded-lg transition ${
                  formData.eventType === 'non-golfer'
                    ? 'border-green-700 bg-green-50'
                    : 'border-gray-300 hover:border-green-700'
                }`}
              >
                <div className="font-semibold text-gray-800 text-base">Non-Golfer / Awards Ceremony</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Join us for celebration & awards</div>
                <div className="text-xs sm:text-sm font-medium text-green-700 mt-2">Donation only</div>
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
              disabled={!formData.eventType || ((formData.eventType === 'saturday' || formData.eventType === 'both') && !formData.partnerName)}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
            </>
          ) : (
            <>
              {/* Partner Info for Saturday/Both */}
              {(formData.eventType === 'saturday' || formData.eventType === 'both') && (
                <div className="mb-6 sm:mb-8 border rounded-lg p-5 sm:p-6 bg-blue-50">
                  <h3 className="font-semibold text-gray-700 mb-4 text-base">
                    2-Man Scramble Partner Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner Name *
                      </label>
                      <input
                        type="text"
                        name="partnerName"
                        value={formData.partnerName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base"
                        placeholder="Partner's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner Email *
                      </label>
                      <input
                        type="email"
                        name="partnerEmail"
                        value={formData.partnerEmail}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base"
                        placeholder="partner@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner Phone
                      </label>
                      <input
                        type="text"
                        name="partnerPhone"
                        value={formData.partnerPhone}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner Shirt Size <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <select
                        name="partnerShirtSize"
                        value={formData.partnerShirtSize}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-4 py-3 text-base"
                      >
                        <option value="">No shirt</option>
                        <option value="adult-s">Small</option>
                        <option value="adult-m">Medium</option>
                        <option value="adult-l">Large</option>
                        <option value="adult-xl">X-Large</option>
                        <option value="adult-xxl">2X-Large</option>
                        <option value="adult-3xl">3X-Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, eventType: '' }));
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 text-base font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-green-700 text-white rounded hover:bg-green-800 text-base font-medium"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Guests & Meals */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
            Guests & Meals
          </h2>

          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Add family members (guests). Meals are included for all guests. T-shirts are optional.
          </p>

          {/* Guest Owner Toggle */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={() => setGuestOwner('registrant')}
                className={`flex-1 py-3 px-3 sm:px-4 rounded font-medium transition text-sm sm:text-base ${
                  guestOwner === 'registrant'
                    ? 'bg-green-700 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {formData.firstName}'s Guests ({formData.registrantGuests.length})
              </button>
              {formData.partnerName && (
                <button
                  onClick={() => setGuestOwner('partner')}
                  className={`flex-1 py-3 px-3 sm:px-4 rounded font-medium transition text-sm sm:text-base ${
                    guestOwner === 'partner'
                      ? 'bg-green-700 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {formData.partnerName}'s Guests ({formData.partnerGuests.length})
                </button>
              )}
            </div>
          </div>

          {/* Add Guest Button */}
          <div className="mb-6">
            <button
              onClick={handleAddGuest}
              className="px-4 py-3 bg-green-700 text-white rounded hover:bg-green-800 text-base font-medium"
            >
              + Add Guest
            </button>
          </div>

          {/* Guests List */}
          {currentGuests.length > 0 && (
            <div className="mb-6">
              <div className="space-y-4">
                {currentGuests.map((guest, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">
                        Guest {idx + 1}
                      </h3>
                      <button
                        onClick={() => handleDeleteGuest(idx)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={guest.name || ''}
                        onChange={(e) => handleGuestChange(idx, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="Jane Smith"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={guest.category || ''}
                        onChange={(e) => handleGuestChange(idx, 'category', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select category</option>
                        <option value="adult">Adult</option>
                        <option value="child">Child</option>
                        <option value="toddler">Toddler</option>
                        <option value="infant">Infant</option>
                      </select>
                    </div>

                    {guest.category && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Shirt Size <span className="text-xs text-gray-500">(optional)</span>
                        </label>
                        <select
                          value={guest.shirtSize || ''}
                          onChange={(e) => handleGuestChange(idx, 'shirtSize', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="">No shirt</option>
                          {shirtSizesByCategory[guest.category]?.map(size => (
                            <option key={size.value} value={size.value}>
                              {size.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meal Summary */}
          {totalMeals > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Total Meals Included:</strong> {totalMeals}
              </p>
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
              Review & Confirm
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
                {formData.shirtSize && <p><strong>Shirt Size:</strong> {formData.shirtSize}</p>}
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

            {formData.partnerName && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-gray-700 mb-2">Partner (Saturday 2-Man Scramble)</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {formData.partnerName}</p>
                  <p><strong>Email:</strong> {formData.partnerEmail}</p>
                  {formData.partnerPhone && <p><strong>Phone:</strong> {formatPhoneForDisplay(formData.partnerPhone)}</p>}
                  {formData.partnerShirtSize && <p><strong>Shirt Size:</strong> {formData.partnerShirtSize}</p>}
                </div>
              </div>
            )}

            {(formData.registrantGuests.length > 0 || formData.partnerGuests.length > 0) && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Guests & Meals ({totalMeals})
                </h3>
                <div className="text-sm text-gray-600 space-y-3">
                  {formData.registrantGuests.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">{formData.firstName}'s Guests:</p>
                      {formData.registrantGuests.map((guest, idx) => (
                        <p key={`reg-${idx}`} className="ml-4">
                          • {guest.name}
                          {guest.category && ` (${guest.category.charAt(0).toUpperCase() + guest.category.slice(1)})`}
                          {guest.shirtSize && ` - Shirt: ${guest.shirtSize}`}
                        </p>
                      ))}
                    </div>
                  )}
                  {formData.partnerGuests.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">{formData.partnerName}'s Guests:</p>
                      {formData.partnerGuests.map((guest, idx) => (
                        <p key={`partner-${idx}`} className="ml-4">
                          • {guest.name}
                          {guest.category && ` (${guest.category.charAt(0).toUpperCase() + guest.category.slice(1)})`}
                          {guest.shirtSize && ` - Shirt: ${guest.shirtSize}`}
                        </p>
                      ))}
                    </div>
                  )}
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
    </div>
  );
}
