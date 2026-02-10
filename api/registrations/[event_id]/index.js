import { getSupabase } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event_id } = req.query;

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', event_id)
      .order('last_name')
      .order('first_name');

    if (error) {
      console.error('Registrations fetch error:', error);
      return res.status(500).json({ error: 'Failed to load registrations' });
    }

    return res.status(200).json({ registrations: data || [] });
  } catch (err) {
    console.error('Registrations error:', err);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}
