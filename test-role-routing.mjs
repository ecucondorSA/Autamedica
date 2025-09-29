#!/usr/bin/env node

/**
 * Test Role Routing System
 * Validates organization_admin and other role mappings
 */

import { getTargetUrlByRole, getPortalForRole, isValidRole, getRoleForPortal } from './packages/shared/dist/index.js';

console.log('🔐 Testing Role System Implementation\n');

// Test 1: organization_admin routing
console.log('📋 Test 1: organization_admin → admin portal');
try {
  const portal = getPortalForRole('organization_admin');
  const url = getTargetUrlByRole('organization_admin');
  const dashboardUrl = getTargetUrlByRole('organization_admin', '/dashboard');

  console.log(`✅ Portal: ${portal}`);
  console.log(`✅ Base URL: ${url}`);
  console.log(`✅ Dashboard URL: ${dashboardUrl}`);
  console.log(`✅ Valid role: ${isValidRole('organization_admin')}\n`);
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

// Test 2: company routing
console.log('📋 Test 2: company → companies portal');
try {
  const portal = getPortalForRole('company');
  const url = getTargetUrlByRole('company');

  console.log(`✅ Portal: ${portal}`);
  console.log(`✅ Base URL: ${url}`);
  console.log(`✅ Valid role: ${isValidRole('company')}\n`);
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

// Test 3: Legacy company_admin compatibility
console.log('📋 Test 3: company_admin (legacy) → companies portal');
try {
  const portal = getPortalForRole('company_admin');
  const url = getTargetUrlByRole('company_admin');

  console.log(`✅ Portal: ${portal}`);
  console.log(`✅ Base URL: ${url}`);
  console.log(`✅ Valid role: ${isValidRole('company_admin')}\n`);
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

// Test 4: Portal to role mapping
console.log('📋 Test 4: Portal → Role reverse mapping');
try {
  console.log(`✅ companies portal → ${getRoleForPortal('companies')} role`);
  console.log(`✅ admin portal → ${getRoleForPortal('admin')} role`);
  console.log(`✅ doctors portal → ${getRoleForPortal('doctors')} role`);
  console.log(`✅ patients portal → ${getRoleForPortal('patients')} role\n`);
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

// Test 5: All roles validation
console.log('📋 Test 5: All UserRole types validation');
const allRoles = ['patient', 'doctor', 'company', 'company_admin', 'organization_admin', 'admin', 'platform_admin'];
let validCount = 0;

allRoles.forEach(role => {
  try {
    const isValid = isValidRole(role);
    const portal = getPortalForRole(role);
    const url = getTargetUrlByRole(role);

    if (isValid && portal && url) {
      console.log(`✅ ${role} → ${portal} (${url})`);
      validCount++;
    } else {
      console.log(`❌ ${role} → Invalid configuration`);
    }
  } catch (error) {
    console.log(`❌ ${role} → Error: ${error.message}`);
  }
});

console.log(`\n📊 Summary: ${validCount}/${allRoles.length} roles configured correctly`);

// Test 6: Error handling
console.log('\n📋 Test 6: Error handling for invalid roles');
try {
  getPortalForRole('invalid_role');
  console.log('❌ Should have thrown error for invalid role');
} catch (error) {
  console.log(`✅ Correctly throws error: ${error.message}`);
}

console.log('\n🎉 Role System Testing Complete!');
console.log('\n🎯 Expected behavior:');
console.log('- organization_admin → https://admin.autamedica.com');
console.log('- company → https://companies.autamedica.com');
console.log('- company_admin → https://companies.autamedica.com (legacy)');
console.log('- All role mappings should be consistent and valid');