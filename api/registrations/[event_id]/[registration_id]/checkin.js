import { getSupabase } from '../../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event_id, registration_id } = req.query;
  const { undo } = req.body || {};

  try {
    const supabase = getSupabase();

    const updateData = undo
      ? { checked_in: false, checked_in_at: null }
      : { checked_in: true, checked_in_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('registrations')
      .update(updateData)
      .eq('id', registration_id)
      .eq('event_id', event_id)
      .select()
      .single();

    if (error) {
      console.error('Check-in error:', error);
      return res.status(500).json({ error: undo ? 'Undo check-in failed' : 'Check-in failed' });
    }

    return res.status(200).json({ success: true, registration: data });
  } catch (err) {
    console.error('Check-in error:', err);
    return res.status(500).json({ error: undo ? 'Undo check-in failed' : 'Check-in failed' });
  }
}
