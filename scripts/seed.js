// ============================================================
// Brgy. Bakakeng DMS — Auto Seed Script
// ============================================================
// Usage:
//   node scripts/seed.js
//
// This script will:
//   1. Create an admin account in Supabase Auth
//   2. Create the admin profile
//   3. Insert sample residents
//   4. Insert sample document requests
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ── Load .env.local ──────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('\n❌  .env.local not found! Please create it first.\n');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌  Missing Supabase credentials in .env.local\n');
  process.exit(1);
}

// Use service role key if available, otherwise anon key
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ── Helpers ──────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

function log(msg) { console.log(`  ${msg}`); }
function ok(msg)  { console.log(`  ✅  ${msg}`); }
function err(msg) { console.log(`  ❌  ${msg}`); }
function info(msg){ console.log(`  ℹ️   ${msg}`); }

// ── Sample Data ──────────────────────────────────────────────
const SAMPLE_RESIDENTS = [
  { first_name: 'Juan',   last_name: 'Dela Cruz', middle_name: 'Santos',  date_of_birth: '1990-05-15', address: '123 Maharlika St., Brgy. Bakakeng', purok: 'Purok 1', contact_number: '09171234567', email: 'juan@email.com' },
  { first_name: 'Maria',  last_name: 'Reyes',     middle_name: 'Garcia',  date_of_birth: '1985-08-22', address: '456 Kalayaan Ave., Brgy. Bakakeng', purok: 'Purok 2', contact_number: '09281234567', email: 'maria@email.com' },
  { first_name: 'Pedro',  last_name: 'Bautista',  middle_name: 'Cruz',    date_of_birth: '1995-03-10', address: '789 Mabini St., Brgy. Bakakeng',   purok: 'Purok 3', contact_number: '09391234567', email: null },
  { first_name: 'Ana',    last_name: 'Santiago',  middle_name: 'Lopez',   date_of_birth: '2000-11-30', address: '321 Rizal St., Brgy. Bakakeng',    purok: 'Purok 1', contact_number: '09451234567', email: null },
  { first_name: 'Jose',   last_name: 'Aquino',    middle_name: 'Manuel',  date_of_birth: '1978-07-04', address: '654 Bonifacio St., Brgy. Bakakeng',purok: 'Purok 4', contact_number: '09561234567', email: 'jose@email.com' },
  { first_name: 'Rosa',   last_name: 'Fernandez', middle_name: 'Valdez',  date_of_birth: '1992-01-18', address: '11 Pine St., Brgy. Bakakeng',      purok: 'Purok 2', contact_number: '09671234567', email: null },
  { first_name: 'Carlos', last_name: 'Mendoza',   middle_name: 'Torres',  date_of_birth: '1988-09-25', address: '22 Cedar Ave., Brgy. Bakakeng',    purok: 'Purok 5', contact_number: '09781234567', email: 'carlos@email.com' },
];

const SAMPLE_REQUESTS = [
  { first_name: 'Juan',   document_type: 'barangay_clearance',       purpose: 'Employment requirement for job application',    status: 'released' },
  { first_name: 'Maria',  document_type: 'certificate_of_residency', purpose: 'School enrollment requirement',                 status: 'ready' },
  { first_name: 'Pedro',  document_type: 'certificate_of_indigency', purpose: 'Medical assistance application at BGHMC',       status: 'processing' },
  { first_name: 'Ana',    document_type: 'barangay_certificate',     purpose: 'Travel requirement for passport application',   status: 'pending' },
  { first_name: 'Jose',   document_type: 'good_moral',               purpose: 'College application requirement',               status: 'pending' },
  { first_name: 'Rosa',   document_type: 'first_time_jobseeker',     purpose: 'First time jobseeker certificate for DOLE',     status: 'pending' },
  { first_name: 'Carlos', document_type: 'business_clearance',       purpose: 'Business permit renewal for sari-sari store',   status: 'processing' },
];

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('\n');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║   Brgy. Bakakeng DMS — Setup & Seed Script  ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('\n  Connected to:', SUPABASE_URL);
  console.log('');

  // ── Step 1: Admin credentials ────────────────────────────
  console.log('  ── Step 1: Admin Account Setup ─────────────────\n');
  info('Enter the admin credentials to create:');
  const adminEmail    = await ask('  Email    (e.g. admin@bakakeng.gov.ph): ');
  const adminPassword = await ask('  Password (min 6 chars):                ');
  const adminName     = await ask('  Full Name (e.g. Juan Dela Cruz):       ');
  const adminRole     = await ask('  Role [captain/secretary/staff]:        ') || 'secretary';
  console.log('');

  // ── Step 2: Create Auth User ──────────────────────────────
  console.log('  ── Step 2: Creating Admin Auth Account ──────────\n');
  
  // Try admin API first (requires service role key)
  let userId = null;
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminEmail.trim(),
    password: adminPassword.trim(),
    options: { data: { full_name: adminName.trim() } }
  });

  if (authError) {
    // Maybe user already exists — try signing in to get the ID
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      info('User already exists — fetching existing account...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword.trim(),
      });
      if (signInError) {
        err(`Could not sign in: ${signInError.message}`);
        err('Please manually create the user in Supabase Dashboard → Authentication → Users');
        rl.close();
        return;
      }
      userId = signInData.user?.id;
      ok(`Found existing user: ${userId}`);
    } else {
      err(`Auth error: ${authError.message}`);
      rl.close();
      return;
    }
  } else {
    userId = authData.user?.id;
    if (userId) {
      ok(`Admin account created: ${adminEmail}`);
    } else {
      info('Check your email to confirm the account, then run this script again with the same credentials.');
      rl.close();
      return;
    }
  }

  // ── Step 3: Create Admin Profile ─────────────────────────
  console.log('\n  ── Step 3: Creating Admin Profile ───────────────\n');
  const { error: profileError } = await supabase
    .from('admin_profiles')
    .upsert({
      id: userId,
      full_name: adminName.trim(),
      role: adminRole.trim(),
      is_active: true,
    });

  if (profileError) {
    err(`Profile error: ${profileError.message}`);
  } else {
    ok(`Admin profile created: ${adminName} (${adminRole})`);
  }

  // ── Step 4: Insert Sample Residents ──────────────────────
  console.log('\n  ── Step 4: Inserting Sample Residents ───────────\n');
  const { data: residents, error: residentsError } = await supabase
    .from('residents')
    .insert(SAMPLE_RESIDENTS)
    .select();

  if (residentsError) {
    if (residentsError.message.includes('duplicate') || residentsError.message.includes('unique')) {
      info('Sample residents already exist — skipping.');
    } else {
      err(`Residents error: ${residentsError.message}`);
    }
  } else {
    ok(`${residents.length} sample residents inserted.`);
  }

  // ── Step 5: Insert Sample Document Requests ──────────────
  console.log('\n  ── Step 5: Inserting Sample Requests ────────────\n');
  
  // Fetch inserted residents to get their IDs
  const { data: allResidents } = await supabase
    .from('residents')
    .select('id, first_name')
    .in('first_name', SAMPLE_REQUESTS.map(r => r.first_name));

  if (!allResidents || allResidents.length === 0) {
    err('Could not fetch residents. Skipping sample requests.');
  } else {
    const residentMap = {};
    allResidents.forEach(r => { residentMap[r.first_name] = r.id; });

    const requestsToInsert = SAMPLE_REQUESTS
      .filter(r => residentMap[r.first_name])
      .map(r => ({
        resident_id:   residentMap[r.first_name],
        document_type: r.document_type,
        purpose:       r.purpose,
        status:        r.status,
        control_number: '',
      }));

    const { data: requests, error: requestsError } = await supabase
      .from('document_requests')
      .insert(requestsToInsert)
      .select();

    if (requestsError) {
      err(`Requests error: ${requestsError.message}`);
    } else {
      ok(`${requests.length} sample document requests inserted.`);
    }
  }

  // ── Done ─────────────────────────────────────────────────
  console.log('\n  ╔══════════════════════════════════════════════╗');
  console.log('  ║               ✅  Setup Complete!            ║');
  console.log('  ╚══════════════════════════════════════════════╝\n');
  console.log(`  Admin Email:    ${adminEmail}`);
  console.log(`  Admin Password: ${adminPassword}`);
  console.log(`  Admin Name:     ${adminName}`);
  console.log('');
  console.log('  Login at: http://localhost:3000/login');
  console.log('');

  rl.close();
}

main().catch(e => {
  console.error('\n  ❌  Unexpected error:', e.message);
  rl.close();
  process.exit(1);
});