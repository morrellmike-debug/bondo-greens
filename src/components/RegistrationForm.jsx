import { useState } from 'react';

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    shirtSize: '',
    numGuests: 0,
    events: {
      thursday18Hole: false,
      friday9Hole: false,
      dinner: false,
    },
    guests: [],
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEventChange = (eventKey) => {
    setFormData(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [eventKey]: !prev.events[eventKey],
      },
    }));
  };

  const handleAddGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { name: '', age: '', shirtSize: '', mealPref: '' }],
    }));
  };

  const handleGuestChange = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((g, i) => i === idx ? { ...g, [field]: value } : g),
    }));
  };

  const handleSubmit = () => {
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
        numGuests: 0,
        events: { thursday18Hole: false, friday9Hole: false, dinner: false },
        guests: [],
      });
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
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="john@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shirt Size *
            </label>
            <select
              name="shirtSize"
              value={formData.shirtSize}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select a size</option>
              <option value="s">Small</option>
              <option value="m">Medium</option>
              <option value="l">Large</option>
              <option value="xl">X-Large</option>
              <option value="xxl">2X-Large</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How many guests? *
            </label>
            <input
              type="number"
              name="numGuests"
              value={formData.numGuests}
              onChange={handleInputChange}
              min="0"
              max="10"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Events */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Events *</h3>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.events.thursday18Hole}
                onChange={() => handleEventChange('thursday18Hole')}
                className="mr-2 w-4 h-4"
              />
              <span className="text-gray-700">
                Thu 18-Hole Championship ($125) - Feb 11, 8:00 AM
              </span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.events.friday9Hole}
                onChange={() => handleEventChange('friday9Hole')}
                className="mr-2 w-4 h-4"
              />
              <span className="text-gray-700">
                Fri 9-Hole Round ($75) - Feb 12, 2:00 PM
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.events.dinner}
                onChange={() => handleEventChange('dinner')}
                className="mr-2 w-4 h-4"
              />
              <span className="text-gray-700">
                Awards Dinner ($50) - Feb 12, 7:00 PM
              </span>
            </label>
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
              disabled={!formData.firstName || !formData.lastName || !formData.email}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Guest Information */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Guest Information
          </h2>

          {formData.numGuests > 0 ? (
            <>
              <p className="text-gray-600 mb-6">
                You're bringing {formData.numGuests} guest{formData.numGuests !== 1 ? 's' : ''}. Enter their details:
              </p>

              {formData.guests.map((guest, idx) => (
                <div key={idx} className="border-b pb-6 mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Guest {idx + 1} of {formData.numGuests}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) => handleGuestChange(idx, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        value={guest.age}
                        onChange={(e) => handleGuestChange(idx, 'age', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="35"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shirt Size *
                    </label>
                    <select
                      value={guest.shirtSize}
                      onChange={(e) => handleGuestChange(idx, 'shirtSize', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select a size</option>
                      <option value="s">Small</option>
                      <option value="m">Medium</option>
                      <option value="l">Large</option>
                      <option value="xl">X-Large</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Preference
                    </label>
                    <select
                      value={guest.mealPref}
                      onChange={(e) => handleGuestChange(idx, 'mealPref', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select preference</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              ))}

              {formData.guests.length < formData.numGuests && (
                <button
                  onClick={handleAddGuest}
                  className="mb-6 px-4 py-2 text-green-700 border border-green-700 rounded hover:bg-green-50"
                >
                  + Add Guest {formData.guests.length + 1}
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No guests selected. Click "Next" to continue.
            </p>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Review & Confirm
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Primary Registrant</h3>
              <div className="text-gray-600 space-y-1">
                <p>Name: {formData.firstName} {formData.lastName}</p>
                <p>Email: {formData.email}</p>
                {formData.phone && <p>Phone: {formData.phone}</p>}
                <p>Shirt Size: {formData.shirtSize.toUpperCase()}</p>
              </div>
            </div>

            {formData.guests.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Guests ({formData.guests.length})
                </h3>
                {formData.guests.map((guest, idx) => (
                  <div key={idx} className="text-gray-600 mb-2">
                    • {guest.name || `Guest ${idx + 1}`}
                    {guest.age && ` (Age ${guest.age})`}
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Events Selected</h3>
              <div className="text-gray-600 space-y-1">
                {formData.events.thursday18Hole && <p>✓ Thu 18-Hole Championship</p>}
                {formData.events.friday9Hole && <p>✓ Fri 9-Hole Round</p>}
                {formData.events.dinner && <p>✓ Awards Dinner</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              <input type="checkbox" className="mr-2" defaultChecked />
              I agree to the terms and conditions
            </p>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(2)}
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
