import { useState } from 'react';

export default function CheckInDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedIn, setCheckedIn] = useState(new Set(['john_doe', 'sarah_johnson', 'mike_chen']));

  const mockRegistrations = [
    { id: 'john_doe', name: 'John Doe', email: 'john@example.com', guests: 1, events: '18-Hole, Dinner', status: 'confirmed' },
    { id: 'sarah_johnson', name: 'Sarah Johnson', email: 'sarah@example.com', guests: 0, events: '18-Hole', status: 'confirmed' },
    { id: 'mike_chen', name: 'Mike Chen', email: 'mike@example.com', guests: 2, events: '18-Hole, 9-Hole, Dinner', status: 'confirmed' },
    { id: 'emily_garcia', name: 'Emily Garcia', email: 'emily@example.com', guests: 1, events: '18-Hole, Dinner', status: 'confirmed' },
    { id: 'david_martinez', name: 'David Martinez', email: 'david@example.com', guests: 0, events: '18-Hole', status: 'pending' },
    { id: 'lisa_wong', name: 'Lisa Wong', email: 'lisa@example.com', guests: 3, events: '18-Hole, 9-Hole, Dinner', status: 'confirmed' },
  ];

  const totalRegistrations = mockRegistrations.length;
  const checkedInCount = checkedIn.size;
  const completionPercent = Math.round((checkedInCount / totalRegistrations) * 100);

  const recentCheckIns = [
    { name: 'Sarah Johnson', time: '7:28 AM' },
    { name: 'Mike Chen', time: '7:25 AM' },
    { name: 'John Doe', time: '7:20 AM' },
  ];

  const filtered = mockRegistrations.filter(reg =>
    reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckIn = (id) => {
    const newCheckedIn = new Set(checkedIn);
    if (newCheckedIn.has(id)) {
      newCheckedIn.delete(id);
    } else {
      newCheckedIn.add(id);
    }
    setCheckedIn(newCheckedIn);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Check-In Station
        </h1>
        <p className="text-gray-600">
          Thursday, February 11 | 7:30 AM
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Registered</p>
          <p className="text-3xl font-bold text-gray-800">{totalRegistrations}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Checked In</p>
          <p className="text-3xl font-bold text-green-700">{checkedInCount}</p>
          <p className="text-sm text-gray-600">({completionPercent}%)</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Not Yet</p>
          <p className="text-3xl font-bold text-orange-600">{totalRegistrations - checkedInCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Completion</p>
          <div className="w-full bg-gray-200 rounded h-2 mb-2">
            <div
              className="bg-green-700 h-2 rounded transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-center font-bold text-gray-800">{completionPercent}%</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email... (or scan QR code)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-green-700 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Results */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <h2 className="font-semibold text-gray-800">
                {searchQuery ? 'Search Results' : 'Next to Check In'}
              </h2>
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No registrations found
                </div>
              ) : (
                filtered.map(reg => (
                  <div
                    key={reg.id}
                    className={`p-6 border-l-4 transition ${
                      checkedIn.has(reg.id)
                        ? 'bg-green-50 border-green-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {checkedIn.has(reg.id) ? '✓ ' : ''}{reg.name}
                        </h3>
                        <p className="text-sm text-gray-600">{reg.email}</p>
                      </div>
                      {checkedIn.has(reg.id) && (
                        <span className="text-sm font-medium text-green-700">
                          Checked In
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Party of {reg.guests + 1}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Events: {reg.events}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCheckIn(reg.id)}
                        className={`px-4 py-2 rounded font-medium transition ${
                          checkedIn.has(reg.id)
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-green-700 text-white hover:bg-green-800'
                        }`}
                      >
                        {checkedIn.has(reg.id) ? 'Undo' : 'Check In'}
                      </button>
                      <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                        Skip
                      </button>
                      <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                        Notes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recently Checked In */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Recently Checked In
            </h3>
            <div className="space-y-2">
              {recentCheckIns.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b">
                  <p className="text-sm text-gray-700">✓ {item.name}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Alerts</h3>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-red-800">⚠ 1 registration unpaid</p>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">ℹ 2 guests no meal pref</p>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-800">✓ All merch allocated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
