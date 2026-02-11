import { useState, useEffect } from 'react';

export default function CheckInDashboard({ eventId, onCheckInChange }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingIn, setCheckingIn] = useState({}); // { [regId]: true } while API call in flight

  useEffect(() => {
    if (eventId) fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/registrations/${eventId}`);
      if (!res.ok) throw new Error('Failed to load registrations');
      const data = await res.json();
      setRegistrations(data.registrations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (regId, isCurrentlyCheckedIn) => {
    setCheckingIn(prev => ({ ...prev, [regId]: true }));
    try {
      const res = await fetch(`/api/registrations/${eventId}/${regId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCurrentlyCheckedIn ? { undo: true } : {}),
      });
      if (!res.ok) throw new Error('Check-in failed');

      // Optimistic update
      setRegistrations(prev => prev.map(reg =>
        reg.id === regId
          ? { ...reg, checked_in: !isCurrentlyCheckedIn, checked_in_at: !isCurrentlyCheckedIn ? new Date().toISOString() : null }
          : reg
      ));

      // Notify parent to refresh dashboard stats
      onCheckInChange?.();
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setCheckingIn(prev => ({ ...prev, [regId]: false }));
    }
  };

  // Sort A-Z by last name then first name
  const sorted = [...registrations].sort((a, b) => {
    const lastCmp = (a.last_name || '').localeCompare(b.last_name || '');
    return lastCmp !== 0 ? lastCmp : (a.first_name || '').localeCompare(b.first_name || '');
  });

  const filtered = sorted.filter(reg => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return `${reg.first_name} ${reg.last_name}`.toLowerCase().includes(q);
  });

  // Aggregate shirt sizes from registration data
  const getShirtTotals = () => {
    const totals = {};
    registrations.forEach(r => {
      // From JSONB shirts array: [{size, qty}]
      if (Array.isArray(r.shirts)) {
        r.shirts.forEach(s => {
          if (s.size) totals[s.size] = (totals[s.size] || 0) + (s.qty || 1);
        });
      }
      // From flat shirt_size field (Vercel registration path)
      if (r.shirt_size && !Array.isArray(r.shirts)?.length) {
        totals[r.shirt_size] = (totals[r.shirt_size] || 0) + 1;
      }
    });
    return totals;
  };

  // Aggregate meal counts from registration data
  const getMealTotals = () => {
    const totals = { adult: 0, child: 0, toddler: 0, infant: 0 };
    registrations.forEach(r => {
      // From JSONB meals array: [{type, qty}]
      if (Array.isArray(r.meals)) {
        r.meals.forEach(m => {
          if (m.type && totals[m.type] !== undefined) totals[m.type] += (m.qty || 1);
        });
      }
      // From JSONB guests array: [{name, category}] or [{name, age}]
      if (Array.isArray(r.guests)) {
        r.guests.forEach(g => {
          const cat = g.category || 'adult';
          if (totals[cat] !== undefined) totals[cat]++;
        });
      }
    });
    return totals;
  };

  const checkedInCount = registrations.filter(r => r.checked_in).length;
  const totalCount = registrations.length;
  const shirtTotals = getShirtTotals();
  const mealTotals = getMealTotals();

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading check-in roster...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={fetchRegistrations} className="text-green-700 hover:underline text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[140px]">
          <p className="text-xs text-gray-500 uppercase font-semibold">Checked In</p>
          <p className="text-2xl font-bold text-green-700">{checkedInCount} / {totalCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[140px]">
          <p className="text-xs text-gray-500 uppercase font-semibold">Remaining</p>
          <p className="text-2xl font-bold text-gray-800">{totalCount - checkedInCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[140px]">
          <p className="text-xs text-gray-500 uppercase font-semibold">Check-In %</p>
          <p className="text-2xl font-bold text-blue-700">
            {totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Inventory aggregation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow border-t-4 border-green-600">
          <h2 className="font-bold text-sm mb-3 uppercase text-gray-500">Shirt Sizes (from registrations)</h2>
          {Object.keys(shirtTotals).length === 0 ? (
            <p className="text-sm text-gray-400">No shirt data</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(shirtTotals).map(([size, count]) => (
                <div key={size} className="flex justify-between border-b pb-1 text-sm">
                  <span className="uppercase text-gray-700">{size}</span>
                  <span className="font-mono font-bold text-green-700">{count}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t font-bold text-gray-800 text-sm">
                <span>TOTAL</span>
                <span>{Object.values(shirtTotals).reduce((a, b) => a + b, 0)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-lg shadow border-t-4 border-blue-600">
          <h2 className="font-bold text-sm mb-3 uppercase text-gray-500">Meal Counts (from registrations)</h2>
          <div className="space-y-1">
            {Object.entries(mealTotals).map(([cat, count]) => (
              <div key={cat} className="flex justify-between border-b pb-1 text-sm">
                <span className="capitalize text-gray-700">{cat}</span>
                <span className="font-mono font-bold text-blue-700">{count}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t font-bold text-gray-800 text-sm">
              <span>TOTAL</span>
              <span>{Object.values(mealTotals).reduce((a, b) => a + b, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full p-3 border rounded-lg text-lg focus:ring-2 focus:ring-green-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Roster */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No golfers match your search.' : 'No registrations for this event.'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold uppercase text-xs text-gray-500">Golfer (A-Z)</th>
                <th className="p-4 font-semibold uppercase text-xs text-gray-500">Email</th>
                <th className="p-4 font-semibold uppercase text-xs text-gray-500">Status</th>
                <th className="p-4 font-semibold uppercase text-xs text-gray-500 text-center">Check-In</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(reg => (
                <tr key={reg.id} className={`border-b hover:bg-gray-50 ${reg.checked_in ? 'bg-green-50' : ''}`}>
                  <td className="p-4 font-medium text-gray-800">
                    {(reg.last_name || '').toUpperCase()}, {reg.first_name}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{reg.email}</td>
                  <td className="p-4 text-sm">
                    {reg.checked_in ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Checked In {reg.checked_in_at ? `@ ${new Date(reg.checked_in_at).toLocaleTimeString()}` : ''}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {reg.status || 'registered'}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      className="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer disabled:opacity-50"
                      checked={reg.checked_in}
                      disabled={checkingIn[reg.id]}
                      onChange={() => handleCheckIn(reg.id, reg.checked_in)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
