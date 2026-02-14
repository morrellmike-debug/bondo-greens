import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const email = 'morrell.mike@gmail.com';
  const password = 'bondo123';

  try {
    const supabase = getSupabaseAdmin();
    const password_hash = await bcrypt.hash(password, 10);

    // Delete any existing admin with this email, then insert fresh
    await supabase.from('admin_users').delete().eq('email', email);

    const { data: newAdmin, error: insertErr } = await supabase
      .from('admin_users')
      .insert([{
        email,
        password_hash,
        role: 'admin',
        active: true,
        must_change_password: false,
      }])
      .select('id, email, role')
      .maybeSingle();

    if (insertErr) {
      console.error('Seed insert error:', insertErr);
      return res.status(500).json({ error: 'Failed to seed admin', detail: insertErr.message });
    }

    return res.status(200).json({
      success: true,
      message: `Admin seeded. Login with email: ${email} / password: ${password}`,
      admin: newAdmin,
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ error: 'Seed failed', detail: err.message });
  }
}
