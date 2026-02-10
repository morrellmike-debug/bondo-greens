import { requireAdmin } from '../../../_lib/auth.js';
import { getSupabase } from '../../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  const { event_id, page = '0' } = req.query;
  const pageNum = parseInt(page) || 0;
  const pageSize = 100;
  const from = pageNum * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = getSupabase();

    // Get total count
    const { count, error: countErr } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event_id);

    if (countErr) {
      console.error('Count error:', countErr);
      return res.status(500).json({ error: 'Failed to count registrations' });
    }

    // Get paginated results
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', event_id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Registrations error:', error);
      return res.status(500).json({ error: 'Failed to load registrations' });
    }

    return res.status(200).json({
      registrations: data || [],
      page: pageNum,
      total: count || 0,
      hasMore: (from + pageSize) < (count || 0),
    });
  } catch (err) {
    console.error('Registrations error:', err);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}
