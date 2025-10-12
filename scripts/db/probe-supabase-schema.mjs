#!/usr/bin/env node
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

function loadDotEnv(file) {
  try {
    const c = readFileSync(file, 'utf-8');
    for (const line of c.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) {
        const k = m[1];
        let v = m[2];
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        process.env[k] = v;
      }
    }
  } catch {}
}

async function existsTable(admin, table) {
  try {
    const { error } = await admin.from(table).select('*').limit(1);
    if (error) return { exists: false, error };
    return { exists: true };
  } catch (e) {
    return { exists: false, error: e };
  }
}

async function hasColumns(admin, table, columns) {
  const results = {};
  for (const col of columns) {
    try {
      const { error } = await admin.from(table).select(col).limit(1);
      results[col] = !error;
    } catch {
      results[col] = false;
    }
  }
  return results;
}

async function main() {
  // Load envs from app files
  loadDotEnv(resolve('apps/patients/.env.local'));
  loadDotEnv(resolve('apps/auth/.env.local'));

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const checks = [
    { table: 'profiles', columns: ['id', 'email', 'full_name', 'role', 'portal'] },
    { table: 'patients', columns: ['user_id', 'active', 'birth_date', 'height_cm', 'weight_kg'] },
    { table: 'auth_audit', columns: ['user_id', 'event', 'created_at'] },
  ];

  const out = [];
  for (const c of checks) {
    const t = c.table;
    const ex = await existsTable(admin, t);
    if (!ex.exists) {
      out.push({ table: t, exists: false, error: ex.error?.message || String(ex.error || '') });
      continue;
    }
    const cols = await hasColumns(admin, t, c.columns);
    out.push({ table: t, exists: true, columns: cols });
  }

  console.log('Supabase schema probe:');
  for (const r of out) {
    if (!r.exists) {
      console.log(`- ${r.table}: MISSING (${r.error || 'no access'})`);
    } else {
      const cols = Object.entries(r.columns)
        .map(([k, v]) => `${k}:${v ? 'OK' : 'NO'}`)
        .join(', ');
      console.log(`- ${r.table}: OK [${cols}]`);
    }
  }
}

main().catch(e => { console.error('Probe failed', e); process.exit(1); });
