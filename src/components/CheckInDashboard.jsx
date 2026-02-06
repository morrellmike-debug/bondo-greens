import { useState, useEffect } from 'react';

const mockRegistrations = [
  { id: 1, firstName: 'John', lastName: 'Doe', eventType: 'both', shirtSize: 'adult-l', donation: 50, paid: false, checkedIn: false, guests: [{ category: 'adult', shirtSize: 'adult-m' }] },
  { id: 2, firstName: 'Jane', lastName: 'Smith', eventType: 'saturday', shirtSize: 'adult-s', donation: 75, paid: true, checkedIn: true, guests: [] },
  // Alphabetical sorting will be applied to real data
];

export default function CheckInDashboard() {
  const [registrations, setRegistrations] = useState(mockRegistrations);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting alphabetically by last name then first name
  const sortedRegs = [...registrations].sort((a, b) => {
    const lastCompare = a.lastName.localeCompare(b.lastName);
    return lastCompare !== 0 ? lastCompare : a.firstName.localeCompare(b.firstName);
  });

  const filteredRegs = sortedRegs.filter(reg => 
    `${reg.firstName} ${reg.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id, field) => {
    setRegistrations(prev => prev.map(reg => 
      reg.id === id ? { ...reg, [field]: !reg[field] } : reg
    ));
  };

  const updateDonation = (id, amount) => {
    setRegistrations(prev => prev.map(reg => 
      reg.id === id ? { ...reg, donation: parseInt(amount) || 0 } : reg
    ));
  };

  // Shirt/Meal Aggregators
  const getShirtTotals = () => {
    const totals = {};
    registrations.forEach(r => {
      // Main golfer shirt
      if (r.shirtSize) totals[r.shirtSize] = (totals[r.shirtSize] || 0) + 1;
      // Guest shirts
      r.guests?.forEach(g => {
        if (g.shirtSize) totals[g.shirtSize] = (totals[g.shirtSize] || 0) + 1;
      });
    });
    return totals;
  };

  const getMealTotals = () => {
    const totals = { adult: 0, child: 0, toddler: 0, infant: 0 };
    registrations.forEach(r => {
      // Golfer is always an adult meal if playing Saturday/Both
      if (r.eventType === 'saturday' || r.eventType === 'both') totals.adult++;
      r.guests?.forEach(g => {
        if (g.category) totals[g.category]++;
      });
    });
    return totals;
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {showRoster && <h1 className="text-3xl font-bold text-green-800">Tournament Check-In</h1>}
      {showInventory && !showRoster && <h1 className="text-3xl font-bold text-blue-800">Shirt & Meal Inventory</h1>}

      {/* Summary Stats - Only if showInventory is true */}
      {showInventory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600">
            <h2 className="font-bold text-lg mb-4 uppercase text-gray-600">Shirt Inventory</h2>
            <div className="space-y-2">
              {Object.entries(getShirtTotals()).map(([size, count]) => (
                <div key={size} className="flex justify-between border-b pb-1">
                  <span className="capitalize">{size.replace('-', ' ')}</span>
                  <span className="font-mono font-bold text-green-700">{count}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t font-bold text-gray-800">
                <span>GRAND TOTAL SHIRTS</span>
                <span>{Object.values(getShirtTotals()).reduce((a, b) => a + b, 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
            <h2 className="font-bold text-lg mb-4 uppercase text-gray-600">Meal Counts</h2>
            <div className="space-y-2">
              {Object.entries(getMealTotals()).map(([cat, count]) => (
                <div key={cat} className="flex justify-between border-b pb-1">
                  <span className="capitalize">{cat}</span>
                  <span className="font-mono font-bold text-blue-700">{count}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t font-bold text-gray-800">
                <span>GRAND TOTAL MEALS</span>
                <span>{Object.values(getMealTotals()).reduce((a, b) => a + b, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roster Section - Only if showRoster is true */}
      {showRoster && (
        <>
          <div className="bg-white p-4 rounded shadow">
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="w-full p-3 border rounded text-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold uppercase text-xs text-gray-500">Golfer (A-Z)</th>
                  <th className="p-4 font-semibold uppercase text-xs text-gray-500">Days</th>
                  <th className="p-4 font-semibold uppercase text-xs text-gray-500">Shirt</th>
                  <th className="p-4 font-semibold uppercase text-xs text-gray-500 text-center">Donation</th>
                  <th className="p-4 font-semibold uppercase text-xs text-gray-500 text-center">Paid</th>
                  <th className="p-4 font-semibold uppercase text-xs text-gray-500 text-center">Check-In</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map(reg => (
                  <tr key={reg.id} className={`border-b hover:bg-gray-50 ${reg.checkedIn ? 'bg-green-50' : ''}`}>
                    <td className="p-4 font-medium text-gray-800">
                      {reg.lastName.toUpperCase()}, {reg.firstName}
                    </td>
                    <td className="p-4 text-sm text-gray-600 capitalize">
                      {reg.eventType}
                    </td>
                    <td className="p-4 text-sm font-mono text-gray-600 uppercase">
                      {reg.shirtSize?.replace('adult-', '') || '—'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-gray-400">$</span>
                        <input 
                          type="number" 
                          className="w-16 p-1 border rounded text-right font-mono"
                          value={reg.donation}
                          onChange={(e) => updateDonation(reg.id, e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleStatus(reg.id, 'paid')}
                        className={`px-3 py-1 rounded text-xs font-bold ${reg.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {reg.paid ? 'PAID' : 'UNPAID'}\n                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={reg.checkedIn}
                        onChange={() => toggleStatus(reg.id, 'checkedIn')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
