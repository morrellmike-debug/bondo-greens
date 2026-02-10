import { getSupabase } from '../../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event_id, registration_id } = req.query;

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('registrations')
      .update({ checked_in: false, checked_in_at: null })
      .eq('id', registration_id)
      .eq('event_id', event_id)
      .select()
      .single();

    if (error) {
      console.error('Undo check-in error:', error);
      return res.status(500).json({ error: 'Undo check-in failed' });
    }

    return res.status(200).json({ success: true, registration: data });
  } catch (err) {
    console.error('Undo check-in error:', err);
    return res.status(500).json({ error: 'Undo check-in failed' });
  }
}
