import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dbUrl || !supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const migrationSql = `
-- ====================================================================
-- ESTATIA: APPOINTMENTS TABLE (REQ-4.5 Site Visit Scheduling)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'declined', 'cancelled', 'completed')),
    notes TEXT,
    alternate_date DATE,
    alternate_time_slot TEXT,
    host_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_appointments_property_id ON public.appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_appointments_requester_id ON public.appointments(requester_id);
CREATE INDEX IF NOT EXISTS idx_appointments_host_id ON public.appointments(host_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_visit_date ON public.appointments(visit_date);

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON public.appointments;
CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
CREATE POLICY "Users can view their appointments" 
ON public.appointments FOR SELECT 
USING (
    auth.uid() = requester_id 
    OR auth.uid() = host_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Requesters can create appointments" ON public.appointments;
CREATE POLICY "Requesters can create appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Parties can update appointments" ON public.appointments;
CREATE POLICY "Parties can update appointments" 
ON public.appointments FOR UPDATE 
USING (
    auth.uid() = requester_id 
    OR auth.uid() = host_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

GRANT ALL ON public.appointments TO anon, authenticated, service_role;
`;

async function main() {
  console.log('Connecting to PostgreSQL database for Appointments migration...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');

    console.log('Executing Appointments DDL...');
    await client.query(migrationSql);
    console.log('Appointments table created and configured!');

    await client.end();

    // Append to supabase/schema.sql if not already present
    const schemaFile = 'supabase/schema.sql';
    const schemaContent = fs.readFileSync(schemaFile, 'utf8');
    if (!schemaContent.includes('public.appointments')) {
      fs.appendFileSync(schemaFile, '\n\n' + migrationSql);
      console.log('Appended Appointments DDL to supabase/schema.sql.');
    }

    // Seed sample appointment between demo buyer and seller
    console.log('Seeding demo appointment...');
    const { data: users } = await supabaseAdmin.from('profiles').select('id, role, email');
    const buyer = users?.find(u => u.email === 'buyer@estatia.com');
    const seller = users?.find(u => u.email === 'seller@estatia.com');

    const { data: properties } = await supabaseAdmin
      .from('properties')
      .select('id, title, owner_id')
      .eq('owner_id', seller?.id)
      .limit(2);

    if (buyer && seller && properties && properties.length > 0) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 4);
      const visitDateStr = nextWeek.toISOString().split('T')[0];

      await supabaseAdmin.from('appointments').upsert([
        {
          property_id: properties[0].id,
          requester_id: buyer.id,
          host_id: seller.id,
          visit_date: visitDateStr,
          time_slot: '11:00 AM - 12:30 PM (Morning)',
          status: 'pending',
          notes: 'Interested in the duplex layout and private terrace. Would like to view along with an architect.'
        }
      ]);
      console.log('Demo appointment seeded successfully!');
    }

    console.log('--- APPOINTMENTS MIGRATION COMPLETE! ---');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
