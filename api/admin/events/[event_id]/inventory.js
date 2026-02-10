import { requireAdmin } from '../../../_lib/auth.js';
import { getSupabase } from '../../../_lib/supabase.js';

export default async function handler(req, res) {
  const admin = await requireAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  const { event_id } = req.query;
  const supabase = getSupabase();

  // GET — list inventory
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('merchandise_inventory')
        .select('*')
        .eq('event_id', event_id)
        .order('item_type')
        .order('size');

      if (error) {
        console.error('Inventory error:', error);
        return res.status(500).json({ error: 'Failed to load inventory' });
      }

      return res.status(200).json({ inventory: data || [] });
    } catch (err) {
      console.error('Inventory error:', err);
      return res.status(500).json({ error: 'Failed to load inventory' });
    }
  }

  // PATCH — update inventory item (item_id in body)
  if (req.method === 'PATCH') {
    const { item_id, total_available, total_allocated, total_checked_in } = req.body || {};
    if (!item_id) {
      return res.status(400).json({ error: 'item_id is required' });
    }

    try {
      const updates = { updated_at: new Date().toISOString() };
      if (total_available !== undefined) updates.total_available = total_available;
      if (total_allocated !== undefined) updates.total_allocated = total_allocated;
      if (total_checked_in !== undefined) updates.total_checked_in = total_checked_in;

      const { data, error } = await supabase
        .from('merchandise_inventory')
        .update(updates)
        .eq('id', item_id)
        .eq('event_id', event_id)
        .select()
        .single();

      if (error) {
        console.error('Inventory update error:', error);
        return res.status(500).json({ error: 'Failed to update inventory' });
      }

      return res.status(200).json(data);
    } catch (err) {
      console.error('Inventory update error:', err);
      return res.status(500).json({ error: 'Failed to update inventory' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
