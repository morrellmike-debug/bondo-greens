import bcrypt from 'bcryptjs';
import { requireAdmin } from '../_lib/auth.js';
import { getSupabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  const { current_password, new_password } = req.body || {};

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const supabase = getSupabase();

    // Get current user's password hash
    const { data: user, error: fetchErr } = await supabase
      .from('admin_users')
      .select('id, password_hash, must_change_password')
      .eq('id', admin.id)
      .single();

    if (fetchErr || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If not a forced change, require current password
    if (!user.must_change_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required' });
      }
      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    const { error: updateErr } = await supabase
      .from('admin_users')
      .update({ password_hash, must_change_password: false })
      .eq('id', admin.id);

    if (updateErr) {
      return res.status(500).json({ error: `Failed to update password: ${updateErr.message}` });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: `Failed to update password: ${err.message}` });
  }
}
