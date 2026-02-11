import { requireAdmin } from '../../../_lib/auth.js';
import { getSupabase } from '../../../_lib/supabase.js';

export default async function handler(req, res) {
  const admin = await requireAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  const { event_id, page = '0' } = req.query;
  const supabase = getSupabase();

  // GET — paginated list
  if (req.method === 'GET') {
    const pageNum = parseInt(page) || 0;
    const pageSize = 100;
    const from = pageNum * pageSize;
    const to = from + pageSize - 1;

    try {
      const { count, error: countErr } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event_id);

      if (countErr) {
        return res.status(500).json({ error: 'Failed to count registrations' });
      }

      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', event_id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        return res.status(500).json({ error: 'Failed to load registrations' });
      }

      return res.status(200).json({
        registrations: data || [],
        page: pageNum,
        total: count || 0,
        hasMore: (from + pageSize) < (count || 0),
      });
    } catch (err) {
      return res.status(500).json({ error: `Failed to load registrations: ${err.message}` });
    }
  }

  // PATCH — edit a registration
  if (req.method === 'PATCH') {
    const { registration_id, ...updates } = req.body || {};
    if (!registration_id) {
      return res.status(400).json({ error: 'registration_id is required' });
    }

    // Only allow updating safe fields
    const allowed = ['first_name', 'last_name', 'email', 'phone', 'shirt_size', 'event_type', 'status', 'total_due'];
    const safeUpdates = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .update(safeUpdates)
        .eq('id', registration_id)
        .eq('event_id', event_id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: `Update failed: ${error.message}` });
      }

      return res.status(200).json({ registration: data });
    } catch (err) {
      return res.status(500).json({ error: `Update failed: ${err.message}` });
    }
  }

  // DELETE — remove a registration
  if (req.method === 'DELETE') {
    const { registration_id } = req.body || {};
    if (!registration_id) {
      return res.status(400).json({ error: 'registration_id is required' });
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registration_id)
        .eq('event_id', event_id);

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
