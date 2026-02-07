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
  const [guestOwner, setGuestOwner] = useState('registrant'); // 'registrant' or 'partner'
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

  // Format phone for display: 5551234567 → (555) 123-4567
  const formatPhoneForDisplay = (phone) => {
    const digits = cleanPhone(phone);
    if (digits.length !== 10) return digits;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  // Calculate event fee based on partner's selected event
  const calculateEventFee = (eventType) => {
    if (eventType === 'saturday') return 50;
    if (eventType === 'both') return 50;
    return 0;
  };

  // Calculate total due
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

  const handleAddGuest = (owner) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], { name: '', category: 'adult', shirtSize: 'adult-m' }]
    }));
  };

  const handleGuestChange = (owner, idx, field, value) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((g, i) => {
        if (i === idx) {
          if (field === 'category') {
            return { ...g, [field]: value, shirtSize: '' };
          }
          return { ...g, [field]: value };
        }
        return g;
      }),
    }));
  };

  const handleDeleteGuest = (owner, idx) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== idx),
    }));
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

  const totalMeals = formData.registrantGuests.length + formData.partnerGuests.length;
  const currentGuests = guestOwner === 'registrant' ? formData.registrantGuests : formData.partnerGuests;

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
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full rounded-xl" placeholder="Ex: Mike" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full rounded-xl" placeholder="Ex: Morrell" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} onBlur={handleBlur} className={`w-full rounded-xl ${validationErrors.email ? 'border-red-500 bg-red-50' : ''}`} placeholder="mike@example.com" />
              {validationErrors.email && <p className="text-red-500 text-xs mt-2 font-bold">❌ {validationErrors.email}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Mobile Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} className={`w-full rounded-xl ${validationErrors.phone ? 'border-red-500 bg-red-50' : ''}`} placeholder="(555) 555-5555" />
              {validationErrors.phone && <p className="text-red-500 text-xs mt-2 font-bold">❌ {validationErrors.phone}</p>}
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Shirt Size *</label>
              <select name="shirtSize" value={formData.shirtSize} onChange={handleInputChange} className="w-full rounded-xl">
                <option value="">Select size...</option>
                <option value="adult-s">Small</option>
                <option value="adult-m">Medium</option>
                <option value="adult-l">Large</option>
                <option value="adult-xl">X-Large</option>
                <option value="adult-xxl">2X-Large</option>
              </select>
            </div>

            {/* Step 1 Donation Block (Restored) */}
            <div className="mb-8 border rounded-2xl p-6 bg-blue-50 border-blue-100 space-y-4">
              <div className="p-4 bg-white rounded-xl border-l-4 border-green-600 flex justify-between items-center shadow-sm">
                <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Tournament Entry</span>
                <span className="text-lg font-black text-green-700 font-mono">$50</span>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Additional Donation (Optional)</label>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 tracking-tighter italic">Help the Jeffersons</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input type="number" name="registrantDonation" value={formData.registrantDonation} onChange={handleInputChange} className="w-full pl-8 rounded-xl border-slate-200" placeholder="0" />
                </div>
              </div>
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
            {showEventButtons ? (
              <>
                <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">Choose Your Experience</h2>
                <div className="space-y-4">
                  {[
                    { id: 'friday', label: 'Friday Night Golf', desc: '10-hole individual night golf', price: 'Donation only' },
                    { id: 'saturday', label: 'Saturday Championship', desc: '10-hole 2-man scramble', price: '$50 per golfer' },
                    { id: 'both', label: 'Both Events', desc: 'Friday Night & Saturday Championship', price: '$50 per golfer' },
                    { id: 'non-golfer', label: 'Non-Golfer / Awards Ceremony', desc: 'Join us for celebration & awards', price: 'Donation only' },
                  ].map(event => (
                    <button
                      key={event.id}
                      onClick={() => handleEventSelect(event.id)}
                      className="w-full p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 transition-all group"
                    >
                      <div className="font-black text-slate-900 uppercase group-hover:text-green-700">{event.label}</div>
                      <div className="text-sm text-slate-500 mt-1">{event.desc}</div>
                      <div className="text-xs font-bold text-green-700 uppercase mt-2 tracking-widest">{event.price}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : showPartnerDecision ? (
              <>
                <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">2-Man Scramble Partner</h2>
                <div className="space-y-4">
                  <button onClick={() => setFormData(prev => ({ ...prev, partnerSelection: 'partner' }))} className={`w-full p-6 text-left rounded-2xl border-2 transition-all group ${formData.partnerSelection === 'partner' ? 'border-green-600 bg-green-50' : 'border-slate-100 hover:border-green-600 hover:bg-green-50'}`}>
                    <div className="font-black text-slate-900 uppercase group-hover:text-green-700">Yes - I have a partner</div>
                    <div className="text-sm text-slate-500 mt-1">Enter my partner's information</div>
                  </button>
                  <button onClick={() => setFormData(prev => ({ ...prev, partnerSelection: 'team-assign' }))} className={`w-full p-6 text-left rounded-2xl border-2 transition-all group ${formData.partnerSelection === 'team-assign' ? 'border-green-600 bg-green-50' : 'border-slate-100 hover:border-green-600 hover:bg-green-50'}`}>
                    <div className="font-black text-slate-900 uppercase group-hover:text-green-700">No - Assign me to a team</div>
                    <div className="text-sm text-slate-500 mt-1">Let Jim assign me to a team</div>
                  </button>
                </div>
                <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-100">
                  <button onClick={() => { setShowPartnerDecision(false); setShowEventButtons(true); }} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">← Back</button>
                  <button onClick={() => { if (formData.partnerSelection === 'partner') { setShowPartnerDecision(false); } else { setStep(3); } }} disabled={!formData.partnerSelection} className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 disabled:opacity-30 transition-all shadow-lg">Next</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">Partner Information</h2>
                <div className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Name *</label>
                      <input type="text" name="partnerName" value={formData.partnerName} onChange={handleInputChange} className="w-full rounded-xl" placeholder="Partner's full name" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Email *</label>
                      <input type="email" name="partnerEmail" value={formData.partnerEmail} onChange={handleInputChange} onBlur={handleBlur} className={`w-full rounded-xl ${validationErrors.partnerEmail ? 'border-red-500 bg-red-50' : ''}`} placeholder="partner@example.com" />
                      {validationErrors.partnerEmail && <p className="text-red-500 text-xs mt-2 font-bold">❌ {validationErrors.partnerEmail}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Phone</label>
                      <input type="tel" name="partnerPhone" value={formData.partnerPhone} onChange={handleInputChange} className="w-full rounded-xl" placeholder="(555) 555-5555" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner Shirt Size</label>
                      <select name="partnerShirtSize" value={formData.partnerShirtSize} onChange={handleInputChange} className="w-full rounded-xl">
                        <option value="">No shirt</option>
                        <option value="adult-s">Small</option>
                        <option value="adult-m">Medium</option>
                        <option value="adult-l">Large</option>
                        <option value="adult-xl">X-Large</option>
                        <option value="adult-xxl">2X-Large</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Partner Event *</p>
                    <div className="space-y-3">
                      <button onClick={() => setFormData(prev => ({ ...prev, partnerEventType: 'saturday' }))} className={`w-full p-4 text-left border-2 rounded-xl transition-all ${formData.partnerEventType === 'saturday' ? 'border-green-600 bg-green-50' : 'border-slate-200 hover:border-green-600'}`}>
                        <div className="font-bold text-slate-900">Saturday only ($50)</div>
                      </button>
                      <button onClick={() => setFormData(prev => ({ ...prev, partnerEventType: 'both' }))} className={`w-full p-4 text-left border-2 rounded-xl transition-all ${formData.partnerEventType === 'both' ? 'border-green-600 bg-green-50' : 'border-slate-200 hover:border-green-600'}`}>
                        <div className="font-bold text-slate-900">Both days ($50)</div>
                      </button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Partner's Optional Donation</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                      <input type="number" name="partnerDonation" value={formData.partnerDonation} onChange={handleInputChange} className="w-full pl-8 rounded-xl border-slate-200" placeholder="0" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-100">
                  <button onClick={() => setShowPartnerDecision(true)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">← Back</button>
                  <button onClick={() => setStep(3)} disabled={!formData.partnerName || !formData.partnerEmail || !formData.partnerEventType || validationErrors.partnerEmail} className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 disabled:opacity-30 transition-all shadow-lg shadow-green-100">Next</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Guests */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-black mb-4 text-slate-900 uppercase tracking-tight">Dinner Guests</h2>
            <p className="text-slate-500 mb-8 font-medium">Add family members for the banquet. Meals are included for all guests.</p>
            
            <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-2">
              <button onClick={() => setGuestOwner('registrant')} className={`flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-tighter transition-all ${guestOwner === 'registrant' ? 'bg-green-700 text-white' : 'bg-white text-slate-400 border hover:bg-slate-100'}`}>{formData.firstName}'s</button>
              {formData.partnerName && <button onClick={() => setGuestOwner('partner')} className={`flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-tighter transition-all ${guestOwner === 'partner' ? 'bg-green-700 text-white' : 'bg-white text-slate-400 border hover:bg-slate-100'}`}>{formData.partnerName}'s</button>}
            </div>

            <div className="flex justify-between items-center mb-6">
              <p className="text-xs text-slate-500 font-medium italic">Adding for: <span className="font-bold text-slate-900">{guestOwner === 'registrant' ? formData.firstName : formData.partnerName}</span></p>
              <button onClick={() => addGuest(guestOwner)} className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase rounded-lg hover:bg-slate-800 transition shadow-md">+ Add Guest</button>
            </div>

            <div className="space-y-4 mb-10">
              {currentGuests.map((guest, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-slide-up">
                  <button onClick={() => handleDeleteGuest(guestOwner, idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Name</label>
                      <input type="text" value={guest.name} onChange={(e) => handleGuestChange(guestOwner, idx, 'name', e.target.value)} className="w-full rounded-lg" placeholder="Guest Name" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</label>
                      <select value={guest.category} onChange={(e) => handleGuestChange(guestOwner, idx, 'category', e.target.value)} className="w-full rounded-lg">
                        <option value="adult">Adult</option>
                        <option value="child">Child</option>
                        <option value="toddler">Toddler</option>
                        <option value="infant">Infant</option>
                      </select>
                    </div>
                  </div>
                  {(guest.category === 'adult' || guest.category === 'child') && (
                    <div className="mt-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shirt Size (Optional)</label>
                      <select value={guest.shirtSize} onChange={(e) => handleGuestChange(guestOwner, idx, 'shirtSize', e.target.value)} className="w-full rounded-lg">
                        <option value="">No shirt</option>
                        {shirtSizesByCategory[guest.category]?.map(size => <option key={size.value} value={size.value}>{size.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">← Back</button>
              <button onClick={() => setStep(4)} className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 shadow-lg shadow-green-100">Review Order</button>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">Review & Submit</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 space-y-6">
              
              {/* Registrant Card */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex justify-between font-black text-sm text-slate-900 uppercase tracking-tight mb-2">
                  <span>{formData.firstName} {formData.lastName}</span>
                  <span className="font-mono text-green-700">${formData.eventType !== 'non-golfer' ? '50.00' : '0.00'}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 uppercase">
                  <span className="bg-slate-200 px-2 py-0.5 rounded">{formData.eventType}</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded">Shirt: {formData.shirtSize.replace('adult-', '').toUpperCase()}</span>
                  {parseInt(formData.registrantDonation) > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Donation: ${formData.registrantDonation}</span>}
                </div>
              </div>

              {/* Partner Card */}
              {formData.partnerName && (
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex justify-between font-black text-sm text-slate-900 uppercase tracking-tight mb-2">
                    <span>Partner: {formData.partnerName}</span>
                    <span className="font-mono text-green-700">${formData.partnerEventType !== 'non-golfer' ? '50.00' : '0.00'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 uppercase">
                    <span className="bg-slate-200 px-2 py-0.5 rounded">{formData.partnerEventType}</span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded">Shirt: {formData.partnerShirtSize ? formData.partnerShirtSize.replace('adult-', '').toUpperCase() : 'NONE'}</span>
                    {parseInt(formData.partnerDonation) > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Donation: ${formData.partnerDonation}</span>}
                  </div>
                </div>
              )}

              {/* Guests Breakdown */}
              {totalMeals > 0 && (
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex justify-between font-black text-sm text-slate-900 uppercase tracking-tight mb-2">
                    <span>Guests ({totalMeals})</span>
                    <span className="font-mono text-slate-400">FREE</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase space-y-1">
                    {formData.registrantGuests.map((g, i) => <div key={i}>• {formData.firstName}'s Guest: {g.name || 'UNNAMED'} ({g.category}) {g.shirtSize && `| Shirt: ${g.shirtSize.toUpperCase()}`}</div>)}
                    {formData.partnerGuests.map((g, i) => <div key={i}>• {formData.partnerName}'s Guest: {g.name || 'UNNAMED'} ({g.category}) {g.shirtSize && `| Shirt: ${g.shirtSize.toUpperCase()}`}</div>)}
                  </div>
                </div>
              )}

              <div className="flex justify-between font-black text-xl border-t-2 border-slate-900 pt-4 mt-4">
                <span className="text-slate-900 uppercase tracking-tighter">Total Due</span>
                <span className="text-green-700 font-mono">${calculateTotalDue()}.00</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button onClick={() => setStep(3)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">← Back</button>
              <button onClick={handleSubmit} disabled={loading} className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 shadow-lg shadow-green-100 flex items-center gap-2">{loading ? 'Processing...' : 'Submit Registration'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
