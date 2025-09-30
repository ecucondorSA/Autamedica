import { createClient } from '@supabase/supabase-js';

// Asume que las variables de entorno están configuradas para un script de admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL and service role key must be provided.');
}

// Se recomienda usar el cliente de admin para operaciones de seed
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const COMPANY_ID = 'a8a5e8f8-2de3-4217-b29e-4a7d55c62748'; // UUID estático para la compañía de prueba

/**
 * Crea usuarios de prueba en Supabase Auth, perfiles y membresías de compañía.
 */
export async function seedCompanyExample() {
  console.log('Seeding company example...');

  try {
    // 1. Crear usuarios en auth.users
    const adminUser = {
      email: 'alice@company.test',
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: 'Alice Admin' },
    };

    const memberUser = {
      email: 'bob@company.test',
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: 'Bob Member' },
    };

    const { data: adminAuthData, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser(adminUser);
    if (adminAuthError) throw adminAuthError;
    console.log(`Created auth user: ${adminAuthData.user.email}`);

    const { data: memberAuthData, error: memberAuthError } = await supabaseAdmin.auth.admin.createUser(memberUser);
    if (memberAuthError) throw memberAuthError;
    console.log(`Created auth user: ${memberAuthData.user.email}`);

    const adminUserId = adminAuthData.user.id;
    const memberUserId = memberAuthData.user.id;

    // 2. Insertar perfiles en public.profiles
    const profilesToInsert = [
      { user_id: adminUserId, role: 'company', external_id: `test-admin-${adminUserId}` },
      { user_id: memberUserId, role: 'company', external_id: `test-member-${memberUserId}` },
    ];
    const { error: profilesError } = await supabaseAdmin.from('profiles').insert(profilesToInsert);
    if (profilesError) throw profilesError;
    console.log('Inserted user profiles.');

    // 3. Insertar compañía y membresías
    const { error: companyError } = await supabaseAdmin.from('companies').upsert([
      { id: COMPANY_ID, owner_user_id: adminUserId, company_name: 'TestCorp' },
    ]);
    if (companyError) throw companyError;
    console.log('Inserted company.');

    const membersToInsert = [
      { company_id: COMPANY_ID, user_id: adminUserId, role: 'admin' },
      { company_id: COMPANY_ID, user_id: memberUserId, role: 'member' },
    ];
    const { error: membersError } = await supabaseAdmin.from('company_members').insert(membersToInsert);
    if (membersError) throw membersError;
    console.log('Inserted company members.');

    console.log('✅ Company example seeded successfully!');

  } catch (error) {
    console.error('Error seeding company example:', error);
    // Opcional: Limpiar datos creados en caso de error
  }
}

// Permite ejecutar el script directamente
if (require.main === module) {
  seedCompanyExample();
}

export default seedCompanyExample;
