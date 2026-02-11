import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import CheckInDashboard from './CheckInDashboard';

export default function AdminPanel() {
  const { adminToken } = useAuth();
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

  // Edit registration state
  const [editingReg, setEditingReg] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete registration state
  const [deletingReg, setDeletingReg] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Admin users state
  const [adminUsers, setAdminUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', role: 'admin', temp_password: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  // Change own password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ current: '', newPw: '', confirm: '' });
  const [changingOwnPassword, setChangingOwnPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

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

  // ── Fetch users when users tab is active ──
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

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

  const authHeaders = adminToken
    ? { 'Authorization': `Bearer ${adminToken}` }
    : {};

  const fetchDashboard = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setErrors(prev => ({ ...prev, dashboard: null }));
    try {
      const res = await fetch(`/api/admin/events/${selectedEventId}/dashboard`, { headers: authHeaders });
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
      const res = await fetch(`/api/admin/events/${selectedEventId}/registrations?page=${page}`, { headers: authHeaders });
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
      const res = await fetch(`/api/admin/events/${selectedEventId}/inventory`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load inventory');
      const data = await res.json();
      setInventory(data.inventory);
    } catch (err) {
      setErrors(prev => ({ ...prev, inventory: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetch('/api/admin/users', { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setAdminUsers(data.users);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
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

  // ── Edit Registration ──
  const openEdit = (reg) => {
    setEditingReg(reg);
    setEditForm({
      first_name: reg.first_name || '',
      last_name: reg.last_name || '',
      email: reg.email || '',
      phone: reg.phone || '',
      shirt_size: reg.shirt_size || '',
      event_type: reg.event_type || '',
      status: reg.status || 'registered',
      total_due: reg.total_due || 0,
    });
    setEditError('');
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    setEditError('');
    try {
      const res = await fetch(`/api/admin/events/${selectedEventId}/registrations`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: editingReg.id, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setRegistrations(prev => prev.map(r => r.id === editingReg.id ? data.registration : r));
      setEditingReg(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete Registration ──
  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${selectedEventId}/registrations`, {
        method: 'DELETE',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: deletingReg.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setRegistrations(prev => prev.filter(r => r.id !== deletingReg.id));
      setRegTotal(prev => prev - 1);
      setDeletingReg(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Admin User Management ──
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateUserError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setAdminUsers(prev => [...prev, data.user]);
      setShowCreateUser(false);
      setNewUserForm({ email: '', role: 'admin', temp_password: '' });
    } catch (err) {
      setCreateUserError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setAdminUsers(prev => prev.map(u => u.id === user.id ? data.user : u));
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!resetPasswordValue || resetPasswordValue.length < 6) {
      alert('Temporary password must be at least 6 characters');
      return;
    }
    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_password: resetPasswordValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setAdminUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      setResetPasswordUser(null);
      setResetPasswordValue('');
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete admin user ${user.email}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setAdminUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // ── Change Own Password ──
  const handleChangeOwnPassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');
    if (changePasswordForm.newPw.length < 6) {
      setChangePasswordError('New password must be at least 6 characters');
      return;
    }
    if (changePasswordForm.newPw !== changePasswordForm.confirm) {
      setChangePasswordError('Passwords do not match');
      return;
    }
    setChangingOwnPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: changePasswordForm.current,
          new_password: changePasswordForm.newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setChangePasswordSuccess('Password changed successfully!');
      setChangePasswordForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => { setShowChangePassword(false); setChangePasswordSuccess(''); }, 2000);
    } catch (err) {
      setChangePasswordError(err.message);
    } finally {
      setChangingOwnPassword(false);
    }
  };

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
    { id: 'users', label: 'Users' },
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
        <p className="text-gray-500 text-sm mb-4">Could not load events. Please try again.</p>
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
                    label="Registered"
                    value={dashboard.registrations.total}
                    sub={selectedEvent?.max_capacity ? `of ${selectedEvent.max_capacity} capacity` : null}
                  />
                  <StatCard
                    label="Checked In"
                    value={dashboard.registrations.checked_in}
                    sub={`of ${dashboard.registrations.total} registered`}
                  />
                  <StatCard
                    label="No-Shows"
                    value={dashboard.registrations.no_shows}
                    sub="registered but not checked in"
                  />
                  <StatCard
                    label="Check-In %"
                    value={dashboard.registrations.total > 0
                      ? Math.round((dashboard.registrations.checked_in / dashboard.registrations.total) * 100) + '%'
                      : '0%'
                    }
                  />
                </div>

                {/* Status Breakdown + Shirts by Size */}
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
                    <h3 className="font-semibold text-gray-800 mb-4">Shirts by Size</h3>
                    {(!dashboard.shirts_by_size || dashboard.shirts_by_size.length === 0) ? (
                      <p className="text-gray-500 text-sm">No shirt data from registrations.</p>
                    ) : (
                      <div className="space-y-2">
                        {dashboard.shirts_by_size.map(row => (
                          <div key={row.size} className="flex justify-between text-sm border-b pb-2">
                            <span className="text-gray-700 uppercase">{row.size}</span>
                            <span className="font-mono font-bold text-green-700">{row.total}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t font-bold text-gray-800 text-sm">
                          <span>TOTAL</span>
                          <span>{dashboard.shirts_by_size.reduce((sum, r) => sum + parseInt(r.total), 0)}</span>
                        </div>
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
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
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
                            <td className="px-6 py-3 text-sm text-right">
                              <button
                                onClick={() => openEdit(reg)}
                                className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingReg(reg)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
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
              <p className="text-sm text-gray-500 mt-1">Current inventory counts for this event</p>
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
                No inventory items for this event.
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
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inventory.map(item => {
                      const remaining = (item.total_available || 0) - (item.total_checked_in || 0);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-800 capitalize">{item.item_type}</td>
                          <td className="px-6 py-3 text-sm text-gray-800 uppercase">{item.size}</td>
                          <td className="px-6 py-3 text-sm text-center text-gray-800">{item.total_available || 0}</td>
                          <td className="px-6 py-3 text-sm text-center text-gray-800">{item.total_allocated || 0}</td>
                          <td className="px-6 py-3 text-sm text-center font-mono">{item.total_checked_in || 0}</td>
                          <td className={`px-6 py-3 text-sm text-center font-bold ${remaining <= 2 ? 'text-red-600' : 'text-gray-800'}`}>
                            {remaining}
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

        {/* ════════ USERS TAB ════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-semibold text-gray-800">Admin Users</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage who can access the admin portal</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Change My Password
                  </button>
                  <button
                    onClick={() => { setShowCreateUser(true); setCreateUserError(''); }}
                    className="px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium"
                  >
                    + Add User
                  </button>
                </div>
              </div>

              {usersLoading ? (
                <div className="text-center py-12 text-gray-500">Loading users...</div>
              ) : usersError ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-2">{usersError}</p>
                  <button onClick={fetchUsers} className="text-green-700 hover:underline text-sm">Retry</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {adminUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-800">
                            {user.email}
                            {user.must_change_password && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                                Pending password set
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600 capitalize">{user.role}</td>
                          <td className="px-6 py-3 text-sm text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-sm text-right space-x-2">
                            <button
                              onClick={() => { setResetPasswordUser(user); setResetPasswordValue(''); }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Reset PW
                            </button>
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`font-medium ${user.active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                            >
                              {user.active ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ MODALS ═══════════════ */}

      {/* Edit Registration Modal */}
      {editingReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingReg(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Edit Registration</h3>
              <button onClick={() => setEditingReg(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shirt Size</label>
                  <input
                    type="text"
                    value={editForm.shirt_size}
                    onChange={e => setEditForm(f => ({ ...f, shirt_size: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <input
                    type="text"
                    value={editForm.event_type}
                    onChange={e => setEditForm(f => ({ ...f, event_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="registered">Registered</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Due ($)</label>
                  <input
                    type="number"
                    value={editForm.total_due}
                    onChange={e => setEditForm(f => ({ ...f, total_due: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {editError && (
                <p className="text-red-600 text-sm">{editError}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingReg(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-4 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50"
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeletingReg(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-red-600 font-bold">!</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Registration?</h3>
              <p className="text-sm text-gray-600 mb-6">
                This will permanently delete the registration for <strong>{deletingReg.first_name} {deletingReg.last_name}</strong>. This cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeletingReg(null)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateUser(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Add Admin User</h3>
              <button onClick={() => setShowCreateUser(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateUser} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="user@example.com"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={e => setNewUserForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="admin">Admin</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="text"
                  value={newUserForm.temp_password}
                  onChange={e => setNewUserForm(f => ({ ...f, temp_password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="At least 6 characters"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">User will be asked to set their own password on first login.</p>
              </div>

              {createUserError && (
                <p className="text-red-600 text-sm">{createUserError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setResetPasswordUser(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Reset Password</h3>
              <button onClick={() => setResetPasswordUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                Set a new temporary password for <strong>{resetPasswordUser.email}</strong>. They will be asked to change it on next login.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Temporary Password</label>
                <input
                  type="text"
                  value={resetPasswordValue}
                  onChange={e => setResetPasswordValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="At least 6 characters"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setResetPasswordUser(null)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResetPassword(resetPasswordUser.id)}
                  disabled={resettingPassword}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {resettingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Own Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowChangePassword(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
              <button onClick={() => setShowChangePassword(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleChangeOwnPassword} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={changePasswordForm.current}
                  onChange={e => setChangePasswordForm(f => ({ ...f, current: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={changePasswordForm.newPw}
                  onChange={e => setChangePasswordForm(f => ({ ...f, newPw: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="At least 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={changePasswordForm.confirm}
                  onChange={e => setChangePasswordForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {changePasswordError && <p className="text-red-600 text-sm">{changePasswordError}</p>}
              {changePasswordSuccess && <p className="text-green-600 text-sm">{changePasswordSuccess}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingOwnPassword}
                  className="px-4 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                  {changingOwnPassword ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
