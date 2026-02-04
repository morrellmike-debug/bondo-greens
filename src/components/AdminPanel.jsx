import { useState } from 'react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = {
    registrations: 45,
    guests: 23,
    revenue: '$7,500',
    checkinPercent: 71,
  };

  const registrations = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'confirmed', cost: '$450', paid: true },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'confirmed', cost: '$275', paid: true },
    { id: 3, name: 'Mike Chen', email: 'mike@example.com', status: 'checked_in', cost: '$450', paid: true },
    { id: 4, name: 'Emily Garcia', email: 'emily@example.com', status: 'pending', cost: '$200', paid: false },
    { id: 5, name: 'David Martinez', email: 'david@example.com', status: 'confirmed', cost: '$100', paid: true },
  ];

  const merchandise = [
    { id: 1, item: 'BONDO GREENS 2026 Polo', total: 60, allocated: 45, distributed: 30, left: 15 },
    { id: 2, item: 'Trucker Cap - Black', total: 40, allocated: 38, distributed: 25, left: 2 },
    { id: 3, item: 'Golf Gloves Pair', total: 50, allocated: 42, distributed: 30, left: 8 },
  ];

  const admins = [
    { id: 1, name: 'Mike Morrell', email: 'mike@bondogreens.com', role: 'Master Admin', master: true },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', role: 'Check-In Lead', master: false },
    { id: 3, name: 'James Park', email: 'james@domain.com', role: 'Merchandise', master: false },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <div className="text-sm text-gray-600">
            Mike Morrell (Master Admin)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-32 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Home' },
              { id: 'registrations', label: 'Registrations' },
              { id: 'merchandise', label: 'Merchandise' },
              { id: 'admins', label: 'Manage Admins' },
              { id: 'reports', label: 'Reports' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Registrations</p>
                <p className="text-3xl font-bold text-gray-800">{stats.registrations}</p>
                <p className="text-sm text-green-700 mt-1">↑ 5 new</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Guests</p>
                <p className="text-3xl font-bold text-gray-800">{stats.guests}</p>
                <p className="text-sm text-green-700 mt-1">↑ 3 new</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Revenue</p>
                <p className="text-3xl font-bold text-gray-800">{stats.revenue}</p>
                <p className="text-sm text-orange-600 mt-1">$500 pending</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Check-In %</p>
                <p className="text-3xl font-bold text-gray-800">{stats.checkinPercent}%</p>
                <p className="text-sm text-green-700 mt-1">↑ 8 since 7am</p>
              </div>
            </div>

            {/* Pie Chart & Events */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Registration Status Breakdown
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Confirmed (35)</span>
                    <div className="w-40 bg-gray-200 rounded h-2">
                      <div className="bg-green-700 h-2 rounded" style={{ width: '78%' }} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending (5)</span>
                    <div className="w-40 bg-gray-200 rounded h-2">
                      <div className="bg-yellow-600 h-2 rounded" style={{ width: '11%' }} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled (2)</span>
                    <div className="w-40 bg-gray-200 rounded h-2">
                      <div className="bg-red-700 h-2 rounded" style={{ width: '4%' }} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Checked In (32)</span>
                    <div className="w-40 bg-gray-200 rounded h-2">
                      <div className="bg-blue-700 h-2 rounded" style={{ width: '71%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  <div className="pb-3 border-b">
                    <p className="font-medium text-gray-800">Thu Feb 11 @ 8:00 AM</p>
                    <p className="text-sm text-gray-600">18-Hole Championship</p>
                    <p className="text-xs text-gray-500 mt-1">Registered: 38/40 | ON SCHEDULE</p>
                  </div>
                  <div className="pb-3 border-b">
                    <p className="font-medium text-gray-800">Thu Feb 11 @ 7:00 AM</p>
                    <p className="text-sm text-gray-600">Breakfast Buffet</p>
                    <p className="text-xs text-gray-500 mt-1">Expected: 45+ | READY</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Fri Feb 12 @ 2:00 PM</p>
                    <p className="text-sm text-gray-600">9-Hole Afternoon Round</p>
                    <p className="text-xs text-gray-500 mt-1">Registered: 22/30 | OPEN</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>✓ John Doe registered (Checked in at 7:28 AM)</div>
                <div>✓ Jane Smith added as guest</div>
                <div>✓ Payment received: $500 from Sarah Johnson</div>
                <div>✓ Merchandise allocated: 30 tournament shirts</div>
                <div>ℹ Emily Garcia submitted special request</div>
              </div>
            </div>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
              <h2 className="font-semibold text-gray-800">Registrations</h2>
              <button className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 text-sm">
                + New Registration
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cost</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Paid</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-800">{reg.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{reg.email}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reg.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-800">{reg.cost}</td>
                      <td className="px-6 py-3 text-sm">
                        {reg.paid ? <span className="text-green-700">✓</span> : <span className="text-red-700">✗</span>}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <button className="text-green-700 hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Merchandise Tab */}
        {activeTab === 'merchandise' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Merchandise Inventory</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Allocated</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Distributed</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Left</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {merchandise.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-800">{item.item}</td>
                      <td className="px-6 py-3 text-sm text-gray-800">{item.total}</td>
                      <td className="px-6 py-3 text-sm text-gray-800">{item.allocated}</td>
                      <td className="px-6 py-3 text-sm text-gray-800">{item.distributed}</td>
                      <td className="px-6 py-3 text-sm text-gray-800">{item.left}</td>
                      <td className="px-6 py-3 text-sm">
                        <div className="w-32 bg-gray-200 rounded h-2">
                          <div
                            className="bg-green-700 h-2 rounded"
                            style={{ width: `${(item.distributed / item.total) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Manage Admins & Permissions</h2>
              <p className="text-sm text-gray-600 mt-1">Only Master Admin (Mike) can manage roles</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Master</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {admins.map(admin => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-800">{admin.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{admin.email}</td>
                      <td className="px-6 py-3 text-sm text-gray-800">{admin.role}</td>
                      <td className="px-6 py-3 text-sm">
                        {admin.master ? <span className="text-yellow-700">★ Yes</span> : 'No'}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <button className="text-green-700 hover:underline">
                          {admin.master ? 'View' : 'Edit'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 text-sm">
                + Add New Admin
              </button>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-2 gap-6">
            {[
              { title: 'Registration Summary', desc: '45 registered, 90% capacity' },
              { title: 'Financial Report', desc: 'Total revenue: $7,500' },
              { title: 'Events Attendance', desc: '38/40 on 18-Hole Championship' },
              { title: 'Merchandise Distribution', desc: '178/340 items distributed' },
              { title: 'Check-In Summary', desc: '32/45 checked in (71%)' },
              { title: 'Guest Report', desc: '23 guests, avg age 34' },
            ].map((report, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition">
                <h3 className="font-semibold text-gray-800 mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{report.desc}</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    View
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
