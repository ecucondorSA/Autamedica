#!/usr/bin/env node

/**
 * Script to test real data connections across all apps
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase client for testing
const supabase = createClient(
  'https://gtyvdircfhmdjiaelqkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4'
);

async function testRealDataConnections() {
  console.log('🔗 Testing Real Data Connections\n');

  try {
    // 1. Test profiles table access
    console.log('1️⃣ Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, numeric_id')
      .limit(3);

    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log(`✅ Profiles table accessible - ${profiles?.length || 0} records found`);
      profiles?.forEach(p => {
        console.log(`   - ${p.email} (${p.role}) - ID numérico: ${p.numeric_id || 'null'}`);
      });
    }

    // 2. Test numeric ID system
    console.log('\n2️⃣ Testing numeric ID system...');
    const { data: numericIds, error: numericError } = await supabase
      .from('user_identifiers')
      .select('*')
      .limit(3);

    if (numericError) {
      console.log('❌ Numeric ID system error:', numericError.message);
    } else {
      console.log(`✅ Numeric ID system working - ${numericIds?.length || 0} formatted IDs found`);
      numericIds?.forEach(id => {
        console.log(`   - ${id.display_id} (${id.email})`);
      });
    }

    // 3. Test user counts by role
    console.log('\n3️⃣ Testing user distribution by role...');

    const roles = ['patient', 'doctor', 'company', 'company_admin'];

    for (const role of roles) {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', role);

      if (error) {
        console.log(`❌ Error counting ${role}s:`, error.message);
      } else {
        console.log(`   - ${role}s: ${count || 0} users`);
      }
    }

    // 4. Test recent activity
    console.log('\n4️⃣ Testing recent user activity...');
    const { data: recentUsers, error: recentError } = await supabase
      .from('profiles')
      .select('email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.log('❌ Recent activity error:', recentError.message);
    } else {
      console.log(`✅ Recent activity found - ${recentUsers?.length || 0} recent users`);
      recentUsers?.forEach(user => {
        const date = new Date(user.created_at).toLocaleDateString();
        console.log(`   - ${user.email} (${user.role}) - Registered: ${date}`);
      });
    }

    // 5. Check for mock data patterns
    console.log('\n5️⃣ Checking for remaining mock data patterns...');

    const mockPatterns = ['mock', 'test', 'demo', 'sample', 'fake'];
    let foundMockData = false;

    for (const pattern of mockPatterns) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', `%${pattern}%`)
        .limit(5);

      if (!error && data && data.length > 0) {
        foundMockData = true;
        console.log(`⚠️  Found potential mock data with pattern "${pattern}":`);
        data.forEach(user => {
          console.log(`   - ${user.email}`);
        });
      }
    }

    if (!foundMockData) {
      console.log('✅ No obvious mock data patterns found in database');
    }

    // 6. Summary
    console.log('\n📊 Summary:');
    console.log('================================');

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: numericIdUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('numeric_id', 'is', null);

    console.log(`Total users: ${totalUsers || 0}`);
    console.log(`Users with numeric IDs: ${numericIdUsers || 0}`);
    console.log(`Numeric ID coverage: ${totalUsers ? Math.round((numericIdUsers / totalUsers) * 100) : 0}%`);

    if (totalUsers && totalUsers > 0) {
      console.log('\n🎉 Database is populated with real user data!');
      console.log('✅ Apps should now display real information instead of mock data');
    } else {
      console.log('\n⚠️  Database is empty - consider registering some test users');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Run the test
testRealDataConnections().catch(console.error);