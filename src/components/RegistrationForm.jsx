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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, totalDue: calculateTotalDue() }),
      });
      if (!res.ok) throw new Error();
      alert('✓ Registration submitted! Check your email.');
      window.location.reload();
    } catch {
      alert('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = () => {
    return formData.firstName && formData.lastName && validateEmail(formData.email) && validatePhone(formData.phone) && formData.shirtSize;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 dark:text-white transition-colors pb-20">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-2 flex-1 rounded ${i <= step ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tight dark:text-white">Step 1: Your Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">First Name *</label>
              <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Ex: Mike" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Last Name *</label>
              <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Ex: Morrell" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Email Address *</label>
            <input name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="mike@example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Mobile Phone * (10 Digits)</label>
            <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="5551234567" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Shirt Size *</label>
            <select name="shirtSize" value={formData.shirtSize} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="">Select Size...</option>
              <option value="S">Small</option><option value="M">Medium</option><option value="L">Large</option><option value="XL">XL</option><option value="XXL">2XL</option>
            </select>
          </div>
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p className="text-[10px] font-black uppercase mb-2 text-blue-700 dark:text-blue-400 tracking-widest">Optional Donation (Jeffersons)</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input type="number" name="registrantDonation" value={formData.registrantDonation} onChange={handleInputChange} className="w-full p-4 pl-8 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="0" />
            </div>
          </div>
          <button onClick={() => setStep(2)} disabled={!canProceedStep1()} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase shadow-lg shadow-green-200 dark:shadow-none disabled:opacity-30">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-2xl font-black uppercase italic tracking-tight dark:text-white">Step 2: Choose Event</h2>
          {showEventButtons ? (
            <div className="space-y-3">
              {[
                { id: 'friday', label: 'Friday Night Golf', desc: '10-hole individual night golf', price: 'Donation Only' },
                { id: 'saturday', label: 'Saturday Championship', desc: '10-hole 2-man scramble', price: '$50 Entry' },
                { id: 'both', label: 'Both Days', desc: 'Friday Night & Saturday Championship', price: '$50 Entry' },
                { id: 'non-golfer', label: 'Non-Golfer / Awards', desc: 'Join us for celebration & awards', price: 'Donation Only' },
              ].map(t => (
                <button key={t.id} onClick={() => { setFormData(p => ({...p, eventType: t.id})); setShowEventButtons(false); if(t.id==='saturday'||t.id==='both') setShowPartnerDecision(true); else setStep(3); }} className="w-full p-6 text-left border-2 rounded-2xl hover:border-green-600 dark:border-slate-800 transition-all group">
                  <div className="font-black text-slate-900 dark:text-white uppercase group-hover:text-green-600">{t.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</div>
                  <div className="text-[10px] font-black text-green-600 mt-2 uppercase">{t.price}</div>
                </button>
              ))}
            </div>
          ) : showPartnerDecision ? (
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm mb-4">2-Man Scramble Partner</h3>
              <button onClick={() => { setFormData(p => ({...p, partnerSelection: 'partner'})); setShowPartnerDecision(false); }} className="w-full p-6 text-left border-2 rounded-2xl uppercase font-black hover:border-green-600">I Have a Partner</button>
              <button onClick={() => { setFormData(p => ({...p, partnerSelection: 'assign'})); setStep(3); }} className="w-full p-6 text-left border-2 rounded-2xl uppercase font-black hover:border-green-600">Assign me a partner</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Partner Name *</label>
                <input name="partnerName" value={formData.partnerName} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Partner's Name" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Partner Email *</label>
                <input name="partnerEmail" value={formData.partnerEmail} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="partner@email.com" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Partner Event *</label>
                <select name="partnerEventType" value={formData.partnerEventType} onChange={handleInputChange} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="">Select Event...</option>
                  <option value="saturday">Saturday Only ($50)</option>
                  <option value="both">Both Days ($50)</option>
                </select>
              </div>
              <button onClick={() => setStep(3)} disabled={!formData.partnerName || !formData.partnerEmail || !formData.partnerEventType} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase shadow-lg disabled:opacity-30">Next Step</button>
            </div>
          )}
          <button onClick={() => {setStep(1); setShowEventButtons(true); setShowPartnerDecision(false);}} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">← Back to Profile</button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tight dark:text-white">Step 3: Dinner Guests</h2>
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button onClick={() => setGuestOwner('registrant')} className={`flex-1 py-3 rounded-lg font-black uppercase text-[10px] transition-all ${guestOwner==='registrant'?'bg-white dark:bg-slate-700 text-green-600 shadow-sm':'text-slate-400'}`}>{formData.firstName || 'My'} Guests</button>
            {formData.partnerName && <button onClick={() => setGuestOwner('partner')} className={`flex-1 py-3 rounded-lg font-black uppercase text-[10px] transition-all ${guestOwner==='partner'?'bg-white dark:bg-slate-700 text-green-600 shadow-sm':'text-slate-400'}`}>{formData.partnerName}'s Guests</button>}
          </div>
          
          <div className="space-y-4">
            {(guestOwner === 'registrant' ? formData.registrantGuests : formData.partnerGuests).map((g, idx) => (
              <div key={idx} className="p-5 border dark:border-slate-800 rounded-2xl relative bg-slate-50 dark:bg-slate-800/30">
                <button onClick={() => removeGuest(guestOwner, idx)} className="absolute top-4 right-4 text-red-400 font-bold">REMOVE</button>
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <input placeholder="Guest Name" value={g.name} onChange={(e) => handleGuestChange(guestOwner, idx, 'name', e.target.value)} className="w-full p-3 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                  <select value={g.category} onChange={(e) => handleGuestChange(guestOwner, idx, 'category', e.target.value)} className="w-full p-3 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <option value="adult">Adult</option><option value="child">Child</option><option value="toddler">Toddler</option><option value="infant">Infant</option>
                  </select>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Shirt Size</label>
                    <select value={g.shirtSize} onChange={(e) => handleGuestChange(guestOwner, idx, 'shirtSize', e.target.value)} className="w-full p-3 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                      <option value="">Select Size...</option>
                      <option value="S">Small</option><option value="M">Medium</option><option value="L">Large</option><option value="XL">XL</option><option value="XXL">2XL</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addGuest(guestOwner)} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-black uppercase text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">+ Add Dinner Guest</button>
          </div>
          
          <button onClick={() => setStep(4)} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase shadow-lg shadow-green-100 dark:shadow-none">Review Order</button>
          <button onClick={() => setStep(2)} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest">← Back</button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tight dark:text-white">Step 4: Final Summary</h2>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between font-black text-slate-900 dark:text-white uppercase text-sm">
                <span>{formData.firstName} {formData.lastName}</span>
                <span className="text-green-600">${calculateEventFee(formData.eventType) + (parseInt(formData.registrantDonation) || 0)}</span>
              </div>
              <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>{formData.eventType}</span>
                <span>• SHIRT: {formData.shirtSize}</span>
                {parseInt(formData.registrantDonation) > 0 && <span className="text-blue-500">• DONATION: ${formData.registrantDonation}</span>}
              </div>
            </div>

            {formData.partnerName && (
              <div className="space-y-2 border-t dark:border-slate-700 pt-4">
                <div className="flex justify-between font-black text-slate-900 dark:text-white uppercase text-sm">
                  <span>Partner: {formData.partnerName}</span>
                  <span className="text-green-600">${calculateEventFee(formData.partnerEventType) + (parseInt(formData.partnerDonation) || 0)}</span>
                </div>
                <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase">
                  <span>{formData.partnerEventType}</span>
                  {parseInt(formData.partnerDonation) > 0 && <span className="text-blue-500">• DONATION: ${formData.partnerDonation}</span>}
                </div>
              </div>
            )}

            {totalMeals > 0 && (
              <div className="border-t dark:border-slate-700 pt-4">
                <div className="flex justify-between font-black text-slate-900 dark:text-white uppercase text-sm">
                  <span>Dinner Guests ({totalMeals})</span>
                  <span className="text-slate-400">FREE</span>
                </div>
              </div>
            )}

            <div className="flex justify-between font-black text-2xl border-t-2 border-slate-900 dark:border-white pt-6">
              <span className="tracking-tighter">TOTAL</span>
              <span className="text-green-600">${calculateTotalDue()}</span>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full py-6 bg-green-600 text-white rounded-3xl font-black uppercase text-xl shadow-2xl shadow-green-200 dark:shadow-none hover:bg-green-700 active:scale-95 transition-all">{loading ? 'Processing...' : 'Complete Registration'}</button>
          <button onClick={() => setStep(3)} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">← Back</button>
        </div>
      )}
    </div>
  );
}
