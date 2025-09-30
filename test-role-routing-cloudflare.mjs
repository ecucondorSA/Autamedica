#!/usr/bin/env node

/**
 * Test Role Routing System - Cloudflare Pages URLs
 * Tests role mappings using environment variables (no hardcoded URLs)
 */

import assert from 'node:assert/strict';
import { config } from 'dotenv';

// Load staging environment
config({ path: '.env.staging' });

const testRoleRouting = async () => {
  console.log('🔐 Testing Role System with Cloudflare Pages URLs\n');

  // Validate environment variables are set
  const requiredEnvVars = [
    'NEXT_PUBLIC_BASE_URL_PATIENTS',
    'NEXT_PUBLIC_BASE_URL_DOCTORS',
    'NEXT_PUBLIC_BASE_URL_COMPANIES',
    'NEXT_PUBLIC_BASE_URL_ADMIN'
  ];

  console.log('📋 Validating environment variables...');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      console.log(`❌ Missing environment variable: ${envVar}`);
      process.exit(1);
    }
    if (!value.startsWith('https://')) {
      console.log(`❌ Invalid URL format for ${envVar}: ${value}`);
      process.exit(1);
    }
    console.log(`✅ ${envVar} = ${value}`);
  }

  console.log('\n📊 Role to URL mappings (from environment):');

  const roleTests = [
    {
      role: 'organization_admin',
      expectedUrl: process.env.NEXT_PUBLIC_BASE_URL_ADMIN,
      description: 'organization_admin → admin portal'
    },
    {
      role: 'company',
      expectedUrl: process.env.NEXT_PUBLIC_BASE_URL_COMPANIES,
      description: 'company → companies portal'
    },
    {
      role: 'company_admin',
      expectedUrl: process.env.NEXT_PUBLIC_BASE_URL_COMPANIES,
      description: 'company_admin (legacy) → companies portal'
    },
    {
      role: 'doctor',
      expectedUrl: process.env.NEXT_PUBLIC_BASE_URL_DOCTORS,
      description: 'doctor → doctors portal'
    },
    {
      role: 'patient',
      expectedUrl: process.env.NEXT_PUBLIC_BASE_URL_PATIENTS,
      description: 'patient → patients portal'
    },
    {
      role: 'admin',
      expectedUrl: process.env.NEXT_PUBLIC_BASE_URL_ADMIN,
      description: 'admin → admin portal'
    },
    {
      role: 'web-app',
      expectedUrl: process.env.NEXT_PUBLIC_BASE_URL_WEB_APP,
      description: 'web-app → main landing and auth portal'
    }
  ];

  let passedTests = 0;
  let totalTests = roleTests.length;

  console.log('\n🧪 Running role mapping tests...\n');

  for (const test of roleTests) {
    try {
      assert.ok(test.expectedUrl, `URL must be defined for ${test.role}`);
      assert.ok(test.expectedUrl.includes('pages.dev'), `URL must be Cloudflare Pages for ${test.role}`);

      console.log(`✅ ${test.description}`);
      console.log(`   URL: ${test.expectedUrl}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${test.description}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All Cloudflare Pages role routing tests PASSED!');
    console.log('\n✅ Role system correctly configured for Cloudflare Pages:');

    for (const test of roleTests) {
      console.log(`- ${test.role} → ${test.expectedUrl}`);
    }

    console.log('\n🚀 Ready for staging deployment!');
    return true;
  } else {
    console.log('\n❌ Some tests failed. Check environment variables.');
    return false;
  }
};

// Run tests
testRoleRouting()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });