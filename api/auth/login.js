import bcrypt from 'bcryptjs';
import { getSupabase } from '../_lib/supabase.js';
import { signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const supabase = getSupabase();

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, role, active')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = await signToken({ id: admin.id, email: admin.email, role: admin.role });

    return res.status(200).json({
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}
