import bcrypt from 'bcryptjs';
import { getSupabase, getSupabaseAdmin } from '../_lib/supabase.js';
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
        .maybeSingle();

      if (error) {
        console.error('Admin lookup error:', JSON.stringify(error));
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      if (!admin) return res.status(401).json({ error: 'Invalid email or password' });
      if (!admin.active) return res.status(401).json({ error: 'Invalid email or password' });

      const passwordMatch = await bcrypt.compare(password, admin.password_hash);
      if (!passwordMatch) return res.status(401).json({ error: 'Invalid email or password' });

      const token = await signToken({ id: admin.id, email: admin.email, role: admin.role });

      return res.status(200).json({
        token,
        admin: { id: admin.id, email: admin.email, role: admin.role },
        must_change_password: !!admin.must_change_password,
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
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
        .maybeSingle();

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
        .maybeSingle();

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

  // ── RESET PASSWORD (gated by ADMIN_RESET_TOKEN env var) ──
  if (action === 'reset-password') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, new_password, reset_token } = req.body || {};

    const serverToken = process.env.ADMIN_RESET_TOKEN;
    if (!serverToken) {
      return res.status(403).json({ error: 'Password reset is not configured. Set the ADMIN_RESET_TOKEN environment variable.' });
    }

    if (!reset_token || reset_token !== serverToken) {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    try {
      const supabase = getSupabaseAdmin();

      const { data: admin, error: lookupErr } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (lookupErr || !admin) {
        return res.status(404).json({ error: 'No admin account found for that email' });
      }

      const password_hash = await bcrypt.hash(new_password, 10);
      const { error: updateErr } = await supabase
        .from('admin_users')
        .update({ password_hash, must_change_password: false, active: true })
        .eq('id', admin.id);

      if (updateErr) {
        console.error('Reset password update error:', updateErr);
        return res.status(500).json({ error: 'Failed to reset password' });
      }

      return res.status(200).json({ success: true, message: 'Password has been reset. You can now log in.' });
    } catch (err) {
      console.error('Reset password error:', err);
      return res.status(500).json({ error: 'Password reset failed' });
    }
  }

  // ── SETUP (bootstrap first admin — only works when no admins exist) ──
  if (action === 'setup') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body || {};
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Email and password (min 6 chars) are required' });
    }

    try {
      const supabase = getSupabaseAdmin();

      // Only allow setup if zero admin users exist
      const { count, error: countErr } = await supabase
        .from('admin_users')
        .select('id', { count: 'exact', head: true });

      if (countErr) {
        console.error('Setup count error:', countErr);
        return res.status(500).json({ error: 'Unable to check existing users' });
      }

      if (count > 0) {
        return res.status(403).json({ error: 'Setup is disabled — admin users already exist' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const { data: newAdmin, error: insertErr } = await supabase
        .from('admin_users')
        .insert([{
          email: email.toLowerCase(),
          password_hash,
          role: 'admin',
          active: true,
          must_change_password: false,
        }])
        .select('id, email, role')
        .maybeSingle();

      if (insertErr) {
        console.error('Setup insert error:', insertErr);
        return res.status(500).json({ error: 'Failed to create admin user' });
      }

      const token = await signToken({ id: newAdmin.id, email: newAdmin.email, role: newAdmin.role });

      return res.status(201).json({
        token,
        admin: { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role },
        must_change_password: false,
      });
    } catch (err) {
      console.error('Setup error:', err);
      return res.status(500).json({ error: 'Setup failed' });
    }
  }

  return res.status(404).json({ error: 'Unknown auth action' });
}
