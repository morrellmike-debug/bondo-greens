import bcrypt from 'bcryptjs';
import { requireAdmin } from '../_lib/auth.js';
import { getSupabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  const admin = await requireAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabase();

  // GET — list all admin users
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, role, active, must_change_password, created_at')
        .order('created_at', { ascending: true });

      if (error) {
        return res.status(500).json({ error: `Failed to load users: ${error.message}` });
      }

      return res.status(200).json({ users: data || [] });
    } catch (err) {
      return res.status(500).json({ error: `Failed to load users: ${err.message}` });
    }
  }

  // POST — create a new admin user
  if (req.method === 'POST') {
    const { email, role = 'admin', temp_password } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!temp_password || temp_password.length < 6) {
      return res.status(400).json({ error: 'Temporary password must be at least 6 characters' });
    }

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        return res.status(409).json({ error: 'An admin user with that email already exists' });
      }

      const password_hash = await bcrypt.hash(temp_password, 10);

      const { data, error } = await supabase
        .from('admin_users')
        .insert([{
          email: email.toLowerCase(),
          password_hash,
          role,
          active: true,
          must_change_password: true,
        }])
        .select('id, email, role, active, must_change_password, created_at')
        .single();

      if (error) {
        return res.status(500).json({ error: `Failed to create user: ${error.message}` });
      }

      return res.status(201).json({ user: data });
    } catch (err) {
      return res.status(500).json({ error: `Failed to create user: ${err.message}` });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
