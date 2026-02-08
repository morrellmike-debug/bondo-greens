import { useState, useEffect, useCallback } from 'react';
import CheckInDashboard from './CheckInDashboard';

export default function AdminPanel() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Data
  const [dashboard, setDashboard] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regPage, setRegPage] = useState(0);
  const [regTotal, setRegTotal] = useState(0);
  const [regHasMore, setRegHasMore] = useState(false);
  const [inventory, setInventory] = useState([]);

  // UI states
  const [loading, setLoading] = useState({ events: true });
  const [errors, setErrors] = useState({});
  const [regSearch, setRegSearch] = useState('');

  // ── Fetch events on mount ──
  useEffect(() => {
    fetchEvents();
  }, []);

  // ── Fetch all data when event changes ──
  useEffect(() => {
    if (selectedEventId) {
      fetchDashboard();
      fetchRegistrations(0);
      fetchInventory();
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    setLoading(prev => ({ ...prev, events: true }));
    setErrors(prev => ({ ...prev, events: null }));
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to load events');
      const data = await res.json();
      setEvents(data);
      if (data.length > 0) setSelectedEventId(data[0].id);
    } catch (err) {
      setErrors(prev => ({ ...prev, events: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  };

  const fetchDashboard = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setErrors(prev => ({ ...prev, dashboard: null }));
    try {
      const res = await fetch(`/api/admin/events/${selectedEventId}/dashboard`);
      if (!res.ok) throw new Error('Failed to load dashboard');
      setDashboard(await res.json());
    } catch (err) {
      setErrors(prev => ({ ...prev, dashboard: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  const fetchRegistrations = async (page = 0) => {
    setLoading(prev => ({ ...prev, registrations: true }));
    setErrors(prev => ({ ...prev, registrations: null }));
    try {
      const res = await fetch(`/api/admin/events/${selectedEventId}/registrations?page=${page}`);
      if (!res.ok) throw new Error('Failed to load registrations');
      const data = await res.json();
      setRegistrations(data.registrations);
      setRegPage(data.page);
      setRegTotal(data.total);
      setRegHasMore(data.hasMore);
    } catch (err) {
      setErrors(prev => ({ ...prev, registrations: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, registrations: false }));
    }
  };

  const fetchInventory = async () => {
    setLoading(prev => ({ ...prev, inventory: true }));
    setErrors(prev => ({ ...prev, inventory: null }));
    try {
      const res = await fetch(`/api/admin/events/${selectedEventId}/inventory`);
      if (!res.ok) throw new Error('Failed to load inventory');
      const data = await res.json();
      setInventory(data.inventory);
    } catch (err) {
      setErrors(prev => ({ ...prev, inventory: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  const updateInventoryItem = async (itemId, field, delta) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    const newValue = Math.max(0, (item[field] || 0) + delta);
    try {
      const res = await fetch(`/api/admin/events/${selectedEventId}/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setInventory(prev => prev.map(i => i.id === itemId ? updated : i));
    } catch (err) {
      console.error('Inventory update error:', err);
    }
  };

  // Refresh dashboard after check-in changes
  const handleCheckInChange = useCallback(() => {
    if (selectedEventId) fetchDashboard();
  }, [selectedEventId]);

  // Filter registrations by search
  const filteredRegs = registrations.filter(reg => {
    if (!regSearch) return true;
    const q = regSearch.toLowerCase();
    const name = `${reg.first_name} ${reg.last_name}`.toLowerCase();
    return name.includes(q) || (reg.email || '').toLowerCase().includes(q);
  });

  // ── Helpers ──
  const statusBadge = (status, checkedIn) => {
    if (checkedIn) return { label: 'Checked In', cls: 'bg-blue-100 text-blue-800' };
    if (status === 'confirmed') return { label: 'Confirmed', cls: 'bg-green-100 text-green-800' };
    if (status === 'cancelled') return { label: 'Cancelled', cls: 'bg-red-100 text-red-800' };
    return { label: 'Registered', cls: 'bg-yellow-100 text-yellow-800' };
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'registrations', label: `Registrations${dashboard ? ` (${dashboard.registrations.total})` : ''}` },
    { id: 'checkins', label: 'Check-ins' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'admins', label: 'Admins' },
  ];

  // ── Loading gate for events ──
  if (loading.events) {
    return (
      <div className="text-center py-20">
        <div className="text-lg text-gray-500">Loading events...</div>
      </div>
    );
  }

  if (errors.events) {
    return (
      <div className="text-center py-20">
        <div className="text-lg text-red-600 mb-4">{errors.events}</div>
        <p className="text-gray-500 text-sm mb-4">Make sure the Express backend is running on port 3001.</p>
        <button onClick={fetchEvents} className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800">
          Retry
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-lg text-gray-500">No events found. Create one via the API to get started.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header + Event Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Event:</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} — {ev.event_date ? new Date(ev.event_date).toLocaleDateString() : 'No date'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-32 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 font-medium transition whitespace-nowrap ${
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

        {/* ════════ OVERVIEW TAB ════════ */}
        {activeTab === 'overview' && (
          <div>
            {loading.dashboard ? (
              <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
            ) : errors.dashboard ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-2">{errors.dashboard}</p>
                <button onClick={fetchDashboard} className="text-green-700 hover:underline text-sm">Retry</button>
              </div>
            ) : dashboard && (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard
                    label="Registrations"
                    value={dashboard.registrations.total}
                    sub={selectedEvent?.max_capacity ? `of ${selectedEvent.max_capacity} capacity` : null}
                  />
                  <StatCard
                    label="Checked In"
                    value={dashboard.registrations.checked_in}
                    sub={`of ${dashboard.registrations.total} registered`}
                  />
                  <StatCard
                    label="Check-In %"
                    value={dashboard.registrations.total > 0
                      ? Math.round((dashboard.registrations.checked_in / dashboard.registrations.total) * 100) + '%'
                      : '0%'
                    }
                  />
                  <StatCard
                    label="Merchandise Items"
                    value={dashboard.merchandise.length}
                    sub="item types tracked"
                  />
                </div>

                {/* Status Breakdown + Merchandise */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Registration Status</h3>
                    <div className="space-y-3">
                      <StatusBar label="Registered" count={dashboard.registrations.by_status.registered} total={dashboard.registrations.total} color="bg-yellow-500" />
                      <StatusBar label="Confirmed" count={dashboard.registrations.by_status.confirmed} total={dashboard.registrations.total} color="bg-green-600" />
                      <StatusBar label="Cancelled" count={dashboard.registrations.by_status.cancelled} total={dashboard.registrations.total} color="bg-red-500" />
                      <StatusBar label="Checked In" count={dashboard.registrations.checked_in} total={dashboard.registrations.total} color="bg-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Merchandise Snapshot</h3>
                    {dashboard.merchandise.length === 0 ? (
                      <p className="text-gray-500 text-sm">No merchandise tracked for this event.</p>
                    ) : (
                      <div className="space-y-2">
                        {dashboard.merchandise.map(item => (
                          <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                            <span className="text-gray-700 capitalize">{item.item_type} — {item.size}</span>
                            <span className="font-mono text-gray-800">
                              {item.total_checked_in || 0}/{item.total_available || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════ REGISTRATIONS TAB ════════ */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
              <h2 className="font-semibold text-gray-800">
                Registrations {regTotal > 0 && <span className="text-gray-400 font-normal">({regTotal} total)</span>}
              </h2>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={regSearch}
                onChange={e => setRegSearch(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {loading.registrations ? (
              <div className="text-center py-12 text-gray-500">Loading registrations...</div>
            ) : errors.registrations ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-2">{errors.registrations}</p>
                <button onClick={() => fetchRegistrations(0)} className="text-green-700 hover:underline text-sm">Retry</button>
              </div>
            ) : filteredRegs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {regSearch ? 'No registrations match your search.' : 'No registrations yet.'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-In</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredRegs.map(reg => {
                        const badge = statusBadge(reg.status, reg.checked_in);
                        return (
                          <tr key={reg.id} className={`hover:bg-gray-50 ${reg.checked_in ? 'bg-green-50/50' : ''}`}>
                            <td className="px-6 py-3 text-sm font-medium text-gray-800">
                              {reg.first_name} {reg.last_name}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600">{reg.email}</td>
                            <td className="px-6 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${badge.cls}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {reg.checked_in
                                ? reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleTimeString() : 'Yes'
                                : '—'
                              }
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {regTotal > 100 && (
                  <div className="px-6 py-4 border-t flex justify-between items-center">
                    <button
                      onClick={() => fetchRegistrations(regPage - 1)}
                      disabled={regPage === 0}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {regPage + 1} of {Math.ceil(regTotal / 100)}
                    </span>
                    <button
                      onClick={() => fetchRegistrations(regPage + 1)}
                      disabled={!regHasMore}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════════ CHECK-INS TAB ════════ */}
        {activeTab === 'checkins' && (
          <CheckInDashboard eventId={selectedEventId} onCheckInChange={handleCheckInChange} />
        )}

        {/* ════════ INVENTORY TAB ════════ */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Merchandise Inventory</h2>
              <p className="text-sm text-gray-500 mt-1">Use +/- buttons to adjust distributed counts</p>
            </div>

            {loading.inventory ? (
              <div className="text-center py-12 text-gray-500">Loading inventory...</div>
            ) : errors.inventory ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-2">{errors.inventory}</p>
                <button onClick={fetchInventory} className="text-green-700 hover:underline text-sm">Retry</button>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No inventory items for this event. Add items via the database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Available</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Allocated</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Distributed</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Remaining</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inventory.map(item => {
                      const remaining = (item.total_available || 0) - (item.total_checked_in || 0);
                      const pct = item.total_available > 0
                        ? Math.round((item.total_checked_in || 0) / item.total_available * 100)
                        : 0;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-800 capitalize">{item.item_type}</td>
                          <td className="px-6 py-3 text-sm text-gray-800 uppercase">{item.size}</td>
                          <td className="px-6 py-3 text-sm text-center text-gray-800">{item.total_available || 0}</td>
                          <td className="px-6 py-3 text-sm text-center text-gray-800">{item.total_allocated || 0}</td>
                          <td className="px-6 py-3 text-sm text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => updateInventoryItem(item.id, 'total_checked_in', -1)}
                                className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                              >−</button>
                              <span className="font-mono w-8 text-center">{item.total_checked_in || 0}</span>
                              <button
                                onClick={() => updateInventoryItem(item.id, 'total_checked_in', 1)}
                                className="w-7 h-7 rounded bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm"
                              >+</button>
                            </div>
                          </td>
                          <td className={`px-6 py-3 text-sm text-center font-bold ${remaining <= 2 ? 'text-red-600' : 'text-gray-800'}`}>
                            {remaining}
                          </td>
                          <td className="px-6 py-3">
                            <div className="w-24 mx-auto bg-gray-200 rounded h-2">
                              <div className="bg-green-600 h-2 rounded" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <div className="text-xs text-center text-gray-500 mt-1">{pct}%</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════ ADMINS TAB ════════ */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Manage Admins & Permissions</h2>
              <p className="text-sm text-gray-600 mt-1">Admin authentication coming soon — currently using dev password gate</p>
            </div>
            <div className="p-6 text-center text-gray-500">
              <p>Admin management will be available once JWT authentication is implemented.</p>
              <p className="text-xs mt-2 text-gray-400">See server/routes/auth.js for the planned auth flow.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function StatusBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-700 w-24">{label} ({count})</span>
      <div className="flex-1 bg-gray-200 rounded h-2">
        <div className={`${color} h-2 rounded`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
    </div>
  );
}
