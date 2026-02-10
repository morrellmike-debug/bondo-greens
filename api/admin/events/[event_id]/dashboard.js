import { requireAdmin } from '../../../_lib/auth.js';
import { getSupabase } from '../../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  const { event_id } = req.query;

  try {
    const supabase = getSupabase();

    // Fetch event
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventErr || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Fetch all registrations for this event
    const { data: regs, error: regsErr } = await supabase
      .from('registrations')
      .select('id, status, checked_in, shirts, shirt_size, raw_data')
      .eq('event_id', event_id);

    if (regsErr) {
      console.error('Dashboard regs error:', regsErr);
      return res.status(500).json({ error: 'Failed to load registrations' });
    }

    const allRegs = regs || [];
    const total = allRegs.length;
    const checkedIn = allRegs.filter(r => r.checked_in).length;
    const byStatus = { registered: 0, confirmed: 0, cancelled: 0 };
    allRegs.forEach(r => {
      const s = r.status || 'registered';
      if (byStatus[s] !== undefined) byStatus[s]++;
    });

    // Aggregate shirt sizes from both JSONB shirts array and flat shirt_size
    const shirtCounts = {};
    allRegs.forEach(r => {
      if (Array.isArray(r.shirts) && r.shirts.length > 0) {
        r.shirts.forEach(s => {
          if (s.size && s.size !== 'none') {
            shirtCounts[s.size] = (shirtCounts[s.size] || 0) + (s.qty || 1);
          }
        });
      } else if (r.shirt_size && r.shirt_size !== 'none') {
        shirtCounts[r.shirt_size] = (shirtCounts[r.shirt_size] || 0) + 1;
      }
      // Also check raw_data for partner/guest shirts
      if (r.raw_data) {
        if (r.raw_data.partnerShirtSize && r.raw_data.partnerShirtSize !== 'none') {
          shirtCounts[r.raw_data.partnerShirtSize] = (shirtCounts[r.raw_data.partnerShirtSize] || 0) + 1;
        }
        (r.raw_data.registrantGuests || []).forEach(g => {
          if (g.shirtSize && g.shirtSize !== 'none') {
            shirtCounts[g.shirtSize] = (shirtCounts[g.shirtSize] || 0) + 1;
          }
        });
        (r.raw_data.partnerGuests || []).forEach(g => {
          if (g.shirtSize && g.shirtSize !== 'none') {
            shirtCounts[g.shirtSize] = (shirtCounts[g.shirtSize] || 0) + 1;
          }
        });
      }
    });

    const shirtsBySize = Object.entries(shirtCounts)
      .map(([size, total]) => ({ size, total }))
      .sort((a, b) => b.total - a.total);

    // Fetch inventory
    const { data: inv } = await supabase
      .from('merchandise_inventory')
      .select('*')
      .eq('event_id', event_id);

    return res.status(200).json({
      event,
      registrations: {
        total,
        checked_in: checkedIn,
        no_shows: total - checkedIn,
        by_status: byStatus,
      },
      shirts_by_size: shirtsBySize,
      inventory: inv || [],
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard' });
  }
}
