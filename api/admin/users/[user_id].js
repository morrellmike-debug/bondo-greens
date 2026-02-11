import bcrypt from 'bcryptjs';
import { requireAdmin } from '../../_lib/auth.js';
import { getSupabase } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  const admin = await requireAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  const { user_id } = req.query;
  const supabase = getSupabase();

  // PATCH — update user (role, active status, or reset password)
  if (req.method === 'PATCH') {
    const { role, active, temp_password } = req.body || {};

    const updates = {};
    if (role !== undefined) updates.role = role;
    if (active !== undefined) updates.active = active;

    // If resetting password, hash the new temp password
    if (temp_password) {
      if (temp_password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updates.password_hash = await bcrypt.hash(temp_password, 10);
      updates.must_change_password = true;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', user_id)
        .select('id, email, role, active, must_change_password, created_at')
        .single();

      if (error) {
        return res.status(500).json({ error: `Update failed: ${error.message}` });
      }

      return res.status(200).json({ user: data });
    } catch (err) {
      return res.status(500).json({ error: `Update failed: ${err.message}` });
    }
  }

  // DELETE — remove admin user
  if (req.method === 'DELETE') {
    // Prevent self-deletion
    if (user_id === admin.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', user_id);

      if (error) {
        return res.status(500).json({ error: `Delete failed: ${error.message}` });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: `Delete failed: ${err.message}` });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
