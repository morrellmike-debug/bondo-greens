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

  // Calculate event fee based on partner's selected event
  const calculateEventFee = (eventType) => {
    if (eventType === 'saturday') return 50;
    if (eventType === 'both') return 50;
    return 0;
  };

  // Calculate total due (event fee + donation)
  const calculateTotalDue = () => {
    const eventFee = calculateEventFee(formData.partnerEventType);
    const donation = parseInt(formData.partnerDonation) || 0;
    // Base $50 for golfer + additional donations
    const base = (formData.eventType !== 'non-golfer') ? 50 : 0;
    return base + (parseInt(formData.registrantDonation) || 0) + eventFee + donation;
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

  const handleGuestInputChange = (index, field, value) => {
    const updatedGuests = [...formData.registrantGuests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setFormData(prev => ({ ...prev, registrantGuests: updatedGuests }));
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

  const handleSubmit = async () => {
    const cleanedFormData = {
      ...formData,
      phone: cleanPhone(formData.phone),
    };
    
    setLoading(true);
    setSubmitted(true);

    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cleanedFormData,
          totalDue: calculateTotalDue()
        }),
      });

      alert(`✓ Registration submitted!\nConfirmation sent to ${formData.email}`);
      
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
    } catch (error) {
      console.error('Submission failed:', error);
      alert('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
      setSubmitted(false);
      setShowEventButtons(true);
      setShowPartnerDecision(false);
    }
  };

  const canProceed = () => {
    const phoneValid = !formData.phone || (validatePhone(formData.phone) && !validationErrors.phone);
    return formData.firstName && formData.lastName && formData.email && formData.shirtSize &&
           validateEmail(formData.email) && !validationErrors.email && phoneValid;
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
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full" placeholder="Ex: John" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full" placeholder="Ex: Doe" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} onBlur={handleBlur} className={`w-full ${validationErrors.email ? 'border-red-500 bg-red-50' : ''}`} placeholder="john@example.com" />
              {validationErrors.email && <p className="text-red-500 text-xs mt-2 font-bold">❌ {validationErrors.email}</p>}
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Shirt Size *</label>
              <select name="shirtSize" value={formData.shirtSize} onChange={handleInputChange} className="w-full">
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
              <button onClick={() => setStep(2)} disabled={!canProceed()} className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-700 disabled:opacity-30 transition-all">
                Continue
              </button>
            </div>
          </div>
        )}

        {step > 1 && (
          <div className="p-8 text-center bg-white rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold mb-4">Proceeding to Step {step}</h2>
            <button onClick={() => setStep(1)} className="text-green-600 font-bold uppercase">Go Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
