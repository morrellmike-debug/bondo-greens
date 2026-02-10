import { getSupabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Events fetch error:', error);
      return res.status(500).json({ error: 'Failed to load events' });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Events error:', err);
    return res.status(500).json({ error: 'Failed to load events' });
  }
}
