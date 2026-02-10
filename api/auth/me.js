import { requireAdmin } from '../_lib/auth.js';
import { getSupabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPayload = await requireAdmin(req);
  if (!adminPayload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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
