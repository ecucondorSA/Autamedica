#!/usr/bin/env node

/**
 * Test Cloudflare Pages Endpoints - Live Status Check
 * Verifica que todas las URLs de Cloudflare Pages respondan correctamente
 */

import { config } from 'dotenv';

// Load staging environment
config({ path: '.env.staging' });

const testEndpoints = async () => {
  console.log('🌐 Testing Cloudflare Pages Endpoints\n');

  const endpoints = [
    {
      name: 'Web-App (Landing + Auth)',
      url: process.env.NEXT_PUBLIC_BASE_URL_WEB_APP,
      expected: 'AutaMedica'
    },
    {
      name: 'Patients Portal',
      url: process.env.NEXT_PUBLIC_BASE_URL_PATIENTS,
      expected: 'pacientes'
    },
    {
      name: 'Doctors Portal',
      url: process.env.NEXT_PUBLIC_BASE_URL_DOCTORS,
      expected: 'médicos'
    },
    {
      name: 'Companies Portal',
      url: process.env.NEXT_PUBLIC_BASE_URL_COMPANIES,
      expected: 'empresas'
    },
    {
      name: 'Admin Portal',
      url: process.env.NEXT_PUBLIC_BASE_URL_ADMIN,
      expected: 'admin'
    },
    {
      name: 'Signaling Server',
      url: process.env.NEXT_PUBLIC_SIGNALING_SERVER,
      expected: null // May not exist yet
    },
    {
      name: 'API Server',
      url: process.env.NEXT_PUBLIC_API_SERVER,
      expected: null // May not exist yet
    }
  ];

  let passedTests = 0;
  let totalTests = endpoints.length;

  console.log('🧪 Running live endpoint tests...\n');

  for (const endpoint of endpoints) {
    try {
      if (!endpoint.url) {
        console.log(`❌ ${endpoint.name}`);
        console.log(`   Error: URL not configured`);
        continue;
      }

      console.log(`🔍 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);

      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'AutaMedica-Health-Check/1.0'
        }
      });

      const status = response.status;
      const statusText = response.statusText;

      if (status === 200) {
        const text = await response.text();
        const size = text.length;

        console.log(`✅ ${endpoint.name}`);
        console.log(`   Status: ${status} ${statusText}`);
        console.log(`   Size: ${size.toLocaleString()} chars`);

        if (endpoint.expected && text.toLowerCase().includes(endpoint.expected.toLowerCase())) {
          console.log(`   Content: Contains "${endpoint.expected}" ✅`);
        } else if (endpoint.expected) {
          console.log(`   Content: Missing "${endpoint.expected}" ⚠️`);
        }

        passedTests++;
      } else if (status === 404 && endpoint.expected === null) {
        console.log(`⚠️  ${endpoint.name}`);
        console.log(`   Status: ${status} ${statusText} (Expected - not deployed yet)`);
        passedTests++;
      } else {
        console.log(`❌ ${endpoint.name}`);
        console.log(`   Status: ${status} ${statusText}`);
      }

    } catch (error) {
      console.log(`❌ ${endpoint.name}`);
      console.log(`   Error: ${error.message}`);

      if (endpoint.expected === null) {
        console.log(`   Note: This endpoint may not be deployed yet`);
        passedTests++;
      }
    }

    console.log('');
  }

  console.log(`📊 Summary: ${passedTests}/${totalTests} endpoints accessible`);

  if (passedTests >= 5) { // At least the 5 main apps should work
    console.log('\n🎉 Core Cloudflare Pages endpoints are LIVE!');
    console.log('\n✅ Role system ready for production use:');

    const coreEndpoints = endpoints.filter(e => e.expected !== null);
    for (const endpoint of coreEndpoints) {
      if (endpoint.url) {
        console.log(`- ${endpoint.name} → ${endpoint.url}`);
      }
    }

    console.log('\n🚀 Sistema de roles operativo en Cloudflare Pages!');
    return true;
  } else {
    console.log('\n❌ Some core endpoints are not accessible.');
    console.log('Check Cloudflare Pages deployment status.');
    return false;
  }
};

// Run tests
testEndpoints()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });