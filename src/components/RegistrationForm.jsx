import { useState, useEffect } from 'react';

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestOwner, setGuestOwner] = useState('registrant');
  const [showEventButtons, setShowEventButtons] = useState(true);
  const [showPartnerDecision, setShowPartnerDecision] = useState(false);

  useEffect(() => {
    if (step === 2 && !formData.eventType) {
      setShowEventButtons(true);
    }
  }, [step]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => phone.replace(/\D/g, '').length === 10;
  const cleanPhone = (phone) => phone.replace(/\D/g, '');

  const calculateEventFee = (type) => (type === 'saturday' || type === 'both' ? 50 : 0);

  const calculateTotalDue = () => {
    let total = calculateEventFee(formData.eventType);
    total += parseInt(formData.registrantDonation) || 0;
    if (formData.partnerSelection === 'partner') {
      total += calculateEventFee(formData.partnerEventType);
      total += parseInt(formData.partnerDonation) || 0;
    }
    return total;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'partnerPhone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digits }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestChange = (owner, idx, field, value) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((g, i) => i === idx ? { ...g, [field]: value } : g)
    }));
  };

  const addGuest = (owner) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], { name: '', category: 'adult', shirtSize: '' }]
    }));
  };

  const removeGuest = (owner, idx) => {
    const fieldName = owner === 'registrant' ? 'registrantGuests' : 'partnerGuests';
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== idx)
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errors = { ...validationErrors };
    if (name === 'email' && value && !validateEmail(value)) errors.email = 'Invalid email';
    else if (name === 'email') delete errors.email;
    if (name === 'phone' && value && !validatePhone(value)) errors.phone = '10 digits required';
    else if (name === 'phone') delete errors.phone;
    setValidationErrors(errors);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, totalDue: calculateTotalDue() }),
      });
      if (!res.ok) throw new Error();
      alert('✓ Registration submitted!');
      window.location.reload();
    } catch {
      alert('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 dark:text-white transition-colors">
      <div className="flex gap-1 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-2 flex-1 rounded ${i <= step ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tight">Step 1: Your Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700" />
            <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <input name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} onBlur={handleBlur} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700" />
          <input name="phone" placeholder="Phone (10 digits)" value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700" />
          <select name="shirtSize" value={formData.shirtSize} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700">
            <option value="">Shirt Size...</option>
            <option value="s">Small</option><option value="m">Medium</option><option value="l">Large</option><option value="xl">XL</option>
          </select>
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-bold uppercase mb-2 text-blue-700 dark:text-blue-400">Optional Donation</p>
            <input type="number" name="registrantDonation" value={formData.registrantDonation} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700" placeholder="$0" />
          </div>
          <button onClick={() => setStep(2)} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase shadow-lg">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-2xl font-black uppercase italic tracking-tight">Step 2: Event</h2>
          {showEventButtons ? (
            <div className="space-y-3">
              {['friday', 'saturday', 'both', 'non-golfer'].map(t => (
                <button key={t} onClick={() => { setFormData(p => ({...p, eventType: t})); setShowEventButtons(false); if(t==='saturday'||t==='both') setShowPartnerDecision(true); else setStep(3); }} className="w-full p-6 text-left border-2 rounded-2xl hover:border-green-600 dark:border-slate-800 uppercase font-black">{t.replace('-', ' ')}</button>
              ))}
            </div>
          ) : showPartnerDecision ? (
            <div className="space-y-3">
              <button onClick={() => { setFormData(p => ({...p, partnerSelection: 'partner'})); setShowPartnerDecision(false); }} className="w-full p-6 text-left border-2 rounded-2xl uppercase font-black">I Have a Partner</button>
              <button onClick={() => { setFormData(p => ({...p, partnerSelection: 'assign'})); setStep(3); }} className="w-full p-6 text-left border-2 rounded-2xl uppercase font-black">Assign me a partner</button>
            </div>
          ) : (
            <div className="space-y-4">
              <input name="partnerName" placeholder="Partner Name" value={formData.partnerName} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700" />
              <input name="partnerEmail" placeholder="Partner Email" value={formData.partnerEmail} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700" />
              <select name="partnerEventType" value={formData.partnerEventType} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700">
                <option value="">Partner Event...</option>
                <option value="saturday">Saturday ($50)</option>
                <option value="both">Both ($50)</option>
              </select>
              <button onClick={() => setStep(3)} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase">Next</button>
            </div>
          )}
          <button onClick={() => {setStep(1); setShowEventButtons(true); setShowPartnerDecision(false);}} className="text-slate-400 text-xs font-bold uppercase">← Back</button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tight">Step 3: Guests</h2>
          <div className="flex gap-2">
            <button onClick={() => setGuestOwner('registrant')} className={`flex-1 py-2 rounded-lg font-bold uppercase text-xs ${guestOwner==='registrant'?'bg-green-600 text-white':'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{formData.firstName || 'My'} Guests</button>
            {formData.partnerName && <button onClick={() => setGuestOwner('partner')} className={`flex-1 py-2 rounded-lg font-bold uppercase text-xs ${guestOwner==='partner'?'bg-green-600 text-white':'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{formData.partnerName}'s Guests</button>}
          </div>
          <button onClick={() => addGuest(guestOwner)} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 font-bold uppercase text-xs">+ Add Dinner Guest</button>
          <div className="space-y-4">
            {(guestOwner === 'registrant' ? formData.registrantGuests : formData.partnerGuests).map((g, idx) => (
              <div key={idx} className="p-4 border dark:border-slate-800 rounded-2xl relative">
                <button onClick={() => removeGuest(guestOwner, idx)} className="absolute top-2 right-2 text-red-400">×</button>
                <input placeholder="Guest Name" value={g.name} onChange={(e) => handleGuestChange(guestOwner, idx, 'name', e.target.value)} className="w-full mb-2 p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
                <select value={g.category} onChange={(e) => handleGuestChange(guestOwner, idx, 'category', e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                  <option value="adult">Adult</option><option value="child">Child</option><option value="toddler">Toddler</option><option value="infant">Infant</option>
                </select>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(4)} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase">Review Order</button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tight">Step 4: Summary</h2>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 space-y-4">
            <div className="flex justify-between font-bold uppercase text-xs">
              <span>{formData.firstName || 'Registrant'}</span>
              <span>${calculateEventFee(formData.eventType) + (parseInt(formData.registrantDonation) || 0)}</span>
            </div>
            {formData.partnerName && (
              <div className="flex justify-between font-bold uppercase text-xs border-t dark:border-slate-700 pt-4">
                <span>Partner: {formData.partnerName}</span>
                <span>${calculateEventFee(formData.partnerEventType) + (parseInt(formData.partnerDonation) || 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-xl border-t-2 border-slate-900 dark:border-white pt-4">
              <span>TOTAL DUE</span>
              <span className="text-green-600">${calculateTotalDue()}</span>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xl shadow-xl shadow-green-200 dark:shadow-none">{loading ? 'Processing...' : 'Submit Registration'}</button>
          <button onClick={() => setStep(3)} className="w-full text-slate-400 text-xs font-bold uppercase">← Back</button>
        </div>
      )}
    </div>
  );
}
