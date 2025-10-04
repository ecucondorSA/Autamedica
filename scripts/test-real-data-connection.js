#!/usr/bin/env node

/**
 * Script to test real data connections across all apps
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase client for testing
const supabase = createClient(
  'https://gtyvdircfhmdjiaelqkg.supabase.co',
  'REPLACE_WITH_ROTATED_KEY.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4'
);

async function testRealDataConnections() {
  logger.info('🔗 Testing Real Data Connections\n');

  try {
    // 1. Test profiles table access
    logger.info('1️⃣ Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, numeric_id')
      .limit(3);

    if (profilesError) {
      logger.info('❌ Profiles table error:', profilesError.message);
    } else {
      logger.info(`✅ Profiles table accessible - ${profiles?.length || 0} records found`);
      profiles?.forEach(p => {
        logger.info(`   - ${p.email} (${p.role}) - ID numérico: ${p.numeric_id || 'null'}`);
      });
    }

    // 2. Test numeric ID system
    logger.info('\n2️⃣ Testing numeric ID system...');
    const { data: numericIds, error: numericError } = await supabase
      .from('user_identifiers')
      .select('*')
      .limit(3);

    if (numericError) {
      logger.info('❌ Numeric ID system error:', numericError.message);
    } else {
      logger.info(`✅ Numeric ID system working - ${numericIds?.length || 0} formatted IDs found`);
      numericIds?.forEach(id => {
        logger.info(`   - ${id.display_id} (${id.email})`);
      });
    }

    // 3. Test user counts by role
    logger.info('\n3️⃣ Testing user distribution by role...');

    const roles = ['patient', 'doctor', 'company', 'company_admin'];

    for (const role of roles) {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', role);

      if (error) {
        logger.info(`❌ Error counting ${role}s:`, error.message);
      } else {
        logger.info(`   - ${role}s: ${count || 0} users`);
      }
    }

    // 4. Test recent activity
    logger.info('\n4️⃣ Testing recent user activity...');
    const { data: recentUsers, error: recentError } = await supabase
      .from('profiles')
      .select('email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      logger.info('❌ Recent activity error:', recentError.message);
    } else {
      logger.info(`✅ Recent activity found - ${recentUsers?.length || 0} recent users`);
      recentUsers?.forEach(user => {
        const date = new Date(user.created_at).toLocaleDateString();
        logger.info(`   - ${user.email} (${user.role}) - Registered: ${date}`);
      });
    }

    // 5. Check for mock data patterns
    logger.info('\n5️⃣ Checking for remaining mock data patterns...');

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
        logger.info(`⚠️  Found potential mock data with pattern "${pattern}":`);
        data.forEach(user => {
          logger.info(`   - ${user.email}`);
        });
      }
    }

    if (!foundMockData) {
      logger.info('✅ No obvious mock data patterns found in database');
    }

    // 6. Summary
    logger.info('\n📊 Summary:');
    logger.info('================================');

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: numericIdUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('numeric_id', 'is', null);

    logger.info(`Total users: ${totalUsers || 0}`);
    logger.info(`Users with numeric IDs: ${numericIdUsers || 0}`);
    logger.info(`Numeric ID coverage: ${totalUsers ? Math.round((numericIdUsers / totalUsers) * 100) : 0}%`);

    if (totalUsers && totalUsers > 0) {
      logger.info('\n🎉 Database is populated with real user data!');
      logger.info('✅ Apps should now display real information instead of mock data');
    } else {
      logger.info('\n⚠️  Database is empty - consider registering some test users');
    }

  } catch (error) {
    logger.error('❌ Connection test failed:', error.message);
  }
}

// Run the test
testRealDataConnections().catch(console.error);