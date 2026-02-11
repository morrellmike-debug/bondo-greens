import bcrypt from 'bcryptjs';
import { getSupabase } from '../_lib/supabase.js';
import { signToken, requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { action } = req.query;

  // ── LOGIN ──
  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const supabase = getSupabase();
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('id, email, password_hash, role, active, must_change_password')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        console.error('Admin lookup error:', JSON.stringify(error));
        return res.status(401).json({ error: `Login failed: ${error.message || error.code || 'user lookup error'}` });
      }
      if (!admin) return res.status(401).json({ error: 'No account found for that email' });
      if (!admin.active) return res.status(401).json({ error: 'Account is disabled' });

      const passwordMatch = await bcrypt.compare(password, admin.password_hash);
      if (!passwordMatch) return res.status(401).json({ error: 'Incorrect password' });

      const token = await signToken({ id: admin.id, email: admin.email, role: admin.role });

      return res.status(200).json({
        token,
        admin: { id: admin.id, email: admin.email, role: admin.role },
        must_change_password: !!admin.must_change_password,
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: `Login error: ${err.message || String(err)}` });
    }
  }

  // ── ME (token validation) ──
  if (action === 'me') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const adminPayload = await requireAdmin(req);
    if (!adminPayload) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const supabase = getSupabase();
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('id, email, role, active')
        .eq('id', adminPayload.id)
        .single();

      if (error || !admin || !admin.active) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({
        admin: { id: admin.id, email: admin.email, role: admin.role },
      });
    } catch (err) {
      console.error('Auth check error:', err);
      return res.status(500).json({ error: 'Authentication check failed' });
    }
  }

  // ── CHANGE PASSWORD ──
  if (action === 'change-password') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const admin = await requireAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    const { current_password, new_password } = req.body || {};
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    try {
      const supabase = getSupabase();

      const { data: user, error: fetchErr } = await supabase
        .from('admin_users')
        .select('id, password_hash, must_change_password')
        .eq('id', admin.id)
        .single();

      if (fetchErr || !user) return res.status(404).json({ error: 'User not found' });

      if (!user.must_change_password) {
        if (!current_password) return res.status(400).json({ error: 'Current password is required' });
        const match = await bcrypt.compare(current_password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const password_hash = await bcrypt.hash(new_password, 10);
      const { error: updateErr } = await supabase
        .from('admin_users')
        .update({ password_hash, must_change_password: false })
        .eq('id', admin.id);

      if (updateErr) return res.status(500).json({ error: `Failed to update password: ${updateErr.message}` });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: `Failed to update password: ${err.message}` });
    }
  }

  return res.status(404).json({ error: 'Unknown auth action' });
}
