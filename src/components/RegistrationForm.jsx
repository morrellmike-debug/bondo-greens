import { useState, useEffect } from 'react';

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
    registrantDonation: 0, // optional donation for Jeffersons
    // Partner decision (if Saturday/Both)
    partnerSelection: '', // 'partner' or 'team-assign'
    partnerAssignmentType: 'enter', // 'enter' or 'assign'
    // Partner (if partnerSelection === 'partner')
    partnerName: '',
    partnerEmail: '',
    partnerPhone: '',
    partnerShirtSize: '', // optional
    partnerEventType: '', // 'saturday', 'both'
    partnerDonation: 0, // optional donation for Jeffersons
    // Guests for both
    registrantGuests: [],
    partnerGuests: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEventButtons, setShowEventButtons] = useState(true); // Control which view on Step 2
  const [showPartnerDecision, setShowPartnerDecision] = useState(false); // Show partner decision screen

  // When step changes to 2, ensure showEventButtons reflects current eventType
  useEffect(() => {
    if (step === 2 && !formData.eventType) {
      setShowEventButtons(true);
    }
  }, [step]);

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

  // Calculate total due (event fee + donation)
  const calculateTotalDue = () => {
    let total = 0;
    
    // Registrant
    if (formData.eventType && formData.eventType !== 'non-golfer') {
      total += 50;
    }
    total += parseInt(formData.registrantDonation) || 0;

    // Partner
    if (formData.partnerSelection === 'partner') {
      if (formData.partnerEventType && formData.partnerEventType !== 'non-golfer') {
        total += 50;
      }
      total += parseInt(formData.partnerDonation) || 0;
    }

    return total;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone: only allow numbers, dashes, parentheses, periods, spaces
    if (name === 'phone' || name === 'partnerPhone') {
      const phoneCharsOnly = value.replace(/[^\d\-().\s]/g, '');
      const digitsOnly = phoneCharsOnly.replace(/\D/g, '');
      if (digitsOnly.length > 10) return;
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

  const handleGuestInputChange = (owner, index, field, value) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    const updatedGuests = [...formData[fieldName]];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setFormData(prev => ({ ...prev, [fieldName]: updatedGuests }));
  };

  const addGuest = (owner) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], { category: 'adult', shirtSize: 'adult-m' }]
    }));
  };

  const removeGuest = (owner, index) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    const updatedGuests = formData[fieldName].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [fieldName]: updatedGuests }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errors = { ...validationErrors };

    if (name === 'email') {
      if (!value) delete errors.email;
      else if (!validateEmail(value)) errors.email = 'Please enter a valid email address';
      else delete errors.email;
    }
    if (name === 'phone') {
      if (!value) delete errors.phone;
      else {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 10) errors.phone = `Phone number incomplete: ${digitsOnly.length}/10 digits`;
        else delete errors.phone;
      }
    }
    if (name === 'partnerEmail') {
      if (!value) delete errors.partnerEmail;
      else if (!validateEmail(value)) errors.partnerEmail = 'Please enter a valid email address';
      else delete errors.partnerEmail;
    }
    if (name === 'partnerPhone') {
      if (!value) delete errors.partnerPhone;
      else {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length > 0 && digitsOnly.length < 10) errors.partnerPhone = `Phone number incomplete: ${digitsOnly.length}/10 digits`;
        else delete errors.partnerPhone;
      }
    }
    setValidationErrors(errors);
  };

  const handleEventSelect = (eventType) => {
    setShowEventButtons(false);
    setFormData(prev => ({ ...prev, eventType }));
    
    if (eventType === 'friday' || eventType === 'non-golfer') {
      setStep(3);
    } else {
      setShowPartnerDecision(true);
    }
  };

  const handleSubmit = async () => {
    const cleanedFormData = {
      ...formData,
      phone: cleanPhone(formData.phone),
      partnerPhone: cleanPhone(formData.partnerPhone),
    };
    
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cleanedFormData,
          totalDue: calculateTotalDue()
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      alert(`✓ Registration submitted!\nConfirmation sent to ${formData.email}`);
      setSubmitted(true);
      
      // Reset after brief delay
      setTimeout(() => {
        setStep(1);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          shirtSize: '',
          eventType: '',
          registrantDonation: 0,
          partnerSelection: '',
          partnerName: '',
          partnerEmail: '',
          partnerPhone: '',
          partnerShirtSize: '',
          partnerEventType: '',
          partnerDonation: 0,
          registrantGuests: [],
          partnerGuests: [],
        });
        setValidationErrors({});
        setSubmitted(false);
        setShowEventButtons(true);
        setShowPartnerDecision(false);
      }, 2000);

    } catch (error) {
      console.error('Submission failed:', error);
      alert('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    const emailValid = formData.email && validateEmail(formData.email) && !validationErrors.email;
    const phoneValid = formData.phone && validatePhone(formData.phone) && !validationErrors.phone;
    return formData.firstName && formData.lastName && emailValid && phoneValid && formData.shirtSize;
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 mx-1">
                <div className={`h-2 rounded transition-all duration-500 ${i <= step ? 'bg-green-600 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-slate-200'}`} />
              </div>
            ))}
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">
            Stage {step} of 4
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">Your Profile</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full rounded-xl border-slate-200 focus:border-green-600 focus:ring-green-600" placeholder="Ex: Mike" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full rounded-xl border-slate-200 focus:border-green-600 focus:ring-green-600" placeholder="Ex: Morrell" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} onBlur={handleBlur} className={`w-full rounded-xl ${validationErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-green-600 focus:ring-green-600`} placeholder="mike@example.com" />
              {validationErrors.email && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-tighter">❌ {validationErrors.email}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Mobile Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} className={`w-full rounded-xl ${validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:border-green-600 focus:ring-green-600`} placeholder="(555) 555-5555" />
              {validationErrors.phone && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-tighter">❌ {validationErrors.phone}</p>}
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Shirt Size *</label>
              <select name="shirtSize" value={formData.shirtSize} onChange={handleInputChange} className="w-full rounded-xl border-slate-200 focus:border-green-600 focus:ring-green-600">
                <option value="">Select size...</option>
                <option value="adult-s">Small</option>
                <option value="adult-m">Medium</option>
                <option value="adult-l">Large</option>
                <option value="adult-xl">X-Large</option>
                <option value="adult-xxl">2X-Large</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step 1/4</span>
              <button onClick={() => setStep(2)} disabled={!canProceed()} className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 disabled:opacity-30 transition-all shadow-lg shadow-green-100">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Event Selection */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">
            {showEventButtons && (
              <>
                <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">Choose Your Experience</h2>
                <div className="space-y-4">
                  {[
                    { id: 'friday', label: 'Friday Only', desc: 'Social round and dinner' },
                    { id: 'saturday', label: 'Saturday Only', desc: 'The Main Event + Banquet' },
                    { id: 'both', label: 'Both Days', desc: 'Full Bondo Greens Weekend' },
                    { id: 'non-golfer', label: 'Non-Golfer', desc: 'Dinner & Socializing only' },
                  ].map(event => (
                    <button
                      key={event.id}
                      onClick={() => handleEventSelect(event.id)}
                      className="w-full p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 transition-all group"
                    >
                      <div className="font-black text-slate-900 uppercase group-hover:text-green-700">{event.label}</div>
                      <div className="text-sm text-slate-500">{event.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {showPartnerDecision && (
              <>
                <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">Partner Selection</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => { setShowPartnerDecision(false); setStep(3); }}
                    className="w-full p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 transition-all group"
                  >
                    <div className="font-black text-slate-900 uppercase group-hover:text-green-700">Assign Me a Partner</div>
                    <div className="text-sm text-slate-500">I'll play with whoever Jim pairs me with.</div>
                  </button>
                  <button
                    onClick={() => { setShowPartnerDecision(false); setStep(3); setFormData(prev => ({...prev, partnerSelection: 'partner'})); }}
                    className="w-full p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 transition-all group"
                  >
                    <div className="font-black text-slate-900 uppercase group-hover:text-green-700">I Have a Partner</div>
                    <div className="text-sm text-slate-500">I'll enter my partner's details on the next step.</div>
                  </button>
                </div>
              </>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">
              <button onClick={() => { setStep(1); setShowEventButtons(true); setShowPartnerDecision(false); }} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">
                ← Back to Profile
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step 2/4</span>
            </div>
          </div>
        )}

        {/* Step 3: Final Details */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">Final Details</h2>
            
            {/* Partner Details Section */}
            {formData.partnerSelection === 'partner' && (
              <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-black text-green-700 uppercase tracking-widest mb-6">Partner Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Name *</label>
                    <input type="text" name="partnerName" value={formData.partnerName} onChange={handleInputChange} className="w-full rounded-xl border-slate-200" placeholder="Ex: Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Email</label>
                    <input type="email" name="partnerEmail" value={formData.partnerEmail} onChange={handleInputChange} onBlur={handleBlur} className={`w-full rounded-xl ${validationErrors.partnerEmail ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} placeholder="jane@example.com" />
                    {validationErrors.partnerEmail && <p className="text-red-500 text-xs mt-2 font-bold">❌ {validationErrors.partnerEmail}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Phone</label>
                    <input type="tel" name="partnerPhone" value={formData.partnerPhone} onChange={handleInputChange} onBlur={handleBlur} className={`w-full rounded-xl border-slate-200`} placeholder="(555) 555-5555" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Shirt Size</label>
                    <select name="partnerShirtSize" value={formData.partnerShirtSize} onChange={handleInputChange} className="w-full rounded-xl border-slate-200">
                      <option value="">Select size...</option>
                      <option value="adult-s">Small</option>
                      <option value="adult-m">Medium</option>
                      <option value="adult-l">Large</option>
                      <option value="adult-xl">X-Large</option>
                      <option value="adult-xxl">2X-Large</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Event Type *</label>
                    <select name="partnerEventType" value={formData.partnerEventType} onChange={handleInputChange} className="w-full rounded-xl border-slate-200">
                      <option value="">Select event...</option>
                      <option value="saturday">Saturday Only ($50)</option>
                      <option value="both">Both Days ($50)</option>
                      <option value="non-golfer">Non-Golfer (Free)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Donation</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                      <input type="number" name="partnerDonation" value={formData.partnerDonation} onChange={handleInputChange} className="w-full pl-8 rounded-xl border-slate-200" placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Registrant Donation */}
            <div className="mb-10">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Your Optional Donation for the Jeffersons</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input type="number" name="registrantDonation" value={formData.registrantDonation} onChange={handleInputChange} className="w-full pl-8 rounded-xl border-slate-200" placeholder="0" />
              </div>
            </div>

            {/* Guests Section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Additional Guests (Dinner Only)</h3>
                <button 
                  onClick={() => addGuest('registrant')}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase rounded-lg hover:bg-slate-800 transition shadow-md"
                >
                  + Add Guest
                </button>
              </div>

              {formData.registrantGuests.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No additional guests added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.registrantGuests.map((guest, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</label>
                        <select 
                          value={guest.category} 
                          onChange={(e) => handleGuestInputChange('registrant', index, 'category', e.target.value)}
                          className="w-full text-sm rounded-lg border-slate-200"
                        >
                          <option value="adult">Adult</option>
                          <option value="child">Child (Under 12)</option>
                          <option value="toddler">Toddler (Under 5)</option>
                          <option value="infant">Infant (Under 2)</option>
                        </select>
                      </div>
                      {(guest.category === 'adult' || guest.category === 'child') && (
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shirt Size</label>
                          <select 
                            value={guest.shirtSize} 
                            onChange={(e) => handleGuestInputChange('registrant', index, 'shirtSize', e.target.value)}
                            className="w-full text-sm rounded-lg border-slate-200"
                          >
                            <option value="adult-s">Adult S</option>
                            <option value="adult-m">Adult M</option>
                            <option value="adult-l">Adult L</option>
                            <option value="adult-xl">Adult XL</option>
                            <option value="child-s">Child S</option>
                            <option value="child-m">Child M</option>
                            <option value="child-l">Child L</option>
                          </select>
                        </div>
                      )}
                      <button 
                        onClick={() => removeGuest('registrant', index)}
                        className="p-2 text-red-400 hover:text-red-600 self-end sm:self-center transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">
                ← Back to Event
              </button>
              <button 
                onClick={() => setStep(4)} 
                disabled={formData.partnerSelection === 'partner' && (!formData.partnerName || !formData.partnerEventType)}
                className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 disabled:opacity-30 transition-all shadow-lg shadow-green-100"
              >
                Review Order
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">Review & Submit</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 space-y-3">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500 uppercase text-xs tracking-widest">
                  {formData.firstName}'s Registration ({formData.eventType})
                </span>
                <span className="text-slate-900 font-mono">
                  ${formData.eventType !== 'non-golfer' ? '50.00' : '0.00'}
                </span>
              </div>
              
              {parseInt(formData.registrantDonation) > 0 && (
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500 uppercase text-xs tracking-widest">Your Donation</span>
                  <span className="text-slate-900 font-mono">${parseInt(formData.registrantDonation).toFixed(2)}</span>
                </div>
              )}

              {formData.partnerSelection === 'partner' && (
                <>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-3">
                    <span className="text-slate-500 uppercase text-xs tracking-widest">
                      Partner: {formData.partnerName} ({formData.partnerEventType})
                    </span>
                    <span className="text-slate-900 font-mono">
                      ${formData.partnerEventType !== 'non-golfer' ? '50.00' : '0.00'}
                    </span>
                  </div>
                  {parseInt(formData.partnerDonation) > 0 && (
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500 uppercase text-xs tracking-widest">Partner's Donation</span>
                      <span className="text-slate-900 font-mono">${parseInt(formData.partnerDonation).toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              {formData.registrantGuests.length > 0 && (
                <div className="flex justify-between font-bold border-t border-slate-200 pt-3">
                  <span className="text-slate-500 uppercase text-xs tracking-widest">
                    Guests ({formData.registrantGuests.length})
                  </span>
                  <span className="text-slate-900 font-mono">Free</span>
                </div>
              )}

              <div className="flex justify-between font-black text-xl border-t-2 border-slate-900 pt-4 mt-4">
                <span className="text-slate-900 uppercase tracking-tighter">Total Due</span>
                <span className="text-green-700 font-mono">${calculateTotalDue()}.00</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button onClick={() => setStep(3)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">
                ← Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 disabled:opacity-30 transition-all shadow-lg shadow-green-100 flex items-center gap-2"
              >
                {loading ? 'Processing...' : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
