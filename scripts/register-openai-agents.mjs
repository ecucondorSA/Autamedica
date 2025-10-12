#!/usr/bin/env node

/**
 * Script para registrar agentes equivalentes para ChatGPT/OpenAI
 * a partir de ~/.claude/agentic-config.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const OPENAI_AGENTS_DIR = join(homedir(), '.openai', 'agents');
const CONFIG_PATH = join(homedir(), '.claude', 'agentic-config.json');

// Crear directorio destino si no existe
try {
  mkdirSync(OPENAI_AGENTS_DIR, { recursive: true });
} catch {}

// Leer configuración fuente (Claude)
const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
const agents = config.agents || {};

// Herramientas equivalentes (mismo set por ahora)
const AGENT_TOOLS = {
  agent_code: ['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob'],
  agent_db: ['Read', 'Write', 'Bash', 'Grep'],
  agent_security: ['Read', 'Bash', 'Grep', 'Glob', 'mcp__playwright__*'],
  agent_dns_deploy: ['Read', 'Bash', 'Grep'],
  agent_qa: ['Read', 'Bash', 'Grep', 'Glob', 'mcp__playwright__*'],
  agent_docs: ['Read', 'Write', 'Edit', 'Bash'],
  agent_dev: ['Read', 'Write', 'Bash', 'Grep', 'Glob', 'mcp__playwright__*']
};

// Prompts: usamos los mismos que Claude para comportamientos
function buildPrompt(agentName, agentConfig) {
  const tasks = agentConfig.tasks?.map(t => `- ${t}`).join('\n') || '';
  switch (agentName) {
    case 'agent_code':
      return `You are a specialized code quality agent for AutaMedica.\n\n**Primary Responsibilities:**\n${tasks}\n\n**Quality Standards:**\n- Execute pre-commit hooks (lint, vitest)\n- Execute pre-push hooks (typecheck, build)\n- Validate Next.js App Router structure (NO Pages Router)\n- Clean up duplicates and unused code\n\n**Working Methodology:**\n1. Run lint and tests first\n2. Perform typecheck and build validation\n3. Validate router structure\n4. Clean up duplicates\n5. Run final tests and generate reports\n\nAlways maintain zero technical debt and production-ready code quality.`;
    case 'agent_db':
      return `You are a specialized database agent for AutaMedica.\n\n**Primary Responsibilities:**\n${tasks}\n\n**Database Standards:**\n- Fetch credentials via MCP Supabase endpoint\n- ALWAYS create snapshots before schema changes\n- Run migrations with validation\n- Validate RLS policies\n\n**Working Methodology:**\n1. Fetch DB credentials securely via MCP\n2. Create backup/snapshot BEFORE any changes\n3. Run migrations\n4. Validate RLS policies and permissions\n5. Generate database reports\n\nCRITICAL: Never modify production DB without snapshot first.`;
    case 'agent_security':
      return `You are a specialized security agent for AutaMedica.\n\n**Primary Responsibilities:**\n${tasks}\n\n**Security Standards:**\n- Enforce security headers (HSTS, CSP, X-Frame-Options)\n- Validate node fetch implementations\n- Perform visual screenshot validations\n- Check CORS configurations\n\n**Working Methodology:**\n1. Build all apps to check headers\n2. Run node fetch security checks\n3. Perform screenshot validations\n4. Validate security policies\n\nFocus on HIPAA compliance and medical data protection.`;
    case 'agent_dns_deploy':
      return `You are a specialized deployment agent for AutaMedica.\n\n**Primary Responsibilities:**\n${tasks}\n\n**Deployment Standards:**\n- Build and deploy to Cloudflare Pages\n- Validate headers in production\n- Take post-deployment screenshots\n- Verify deployment health\n\n**Working Methodology:**\n1. Build apps with production configuration\n2. Deploy to Cloudflare Pages\n3. Validate headers and security in production\n4. Take screenshots for visual validation\n\nAlways verify deployment success before marking complete.`;
    case 'agent_qa':
      return `You are a specialized QA agent for AutaMedica.\n\n**Primary Responsibilities:**\n${tasks}\n\n**QA Standards:**\n- Run mandatory fetch tests\n- Execute mandatory screenshot tests\n- Perform final vitest validation\n- Generate comprehensive test reports\n\n**Working Methodology:**\n1. Execute all mandatory tests\n2. Validate full system integration\n3. Generate comprehensive reports\n4. Ensure 100% test pass rate\n\nNo deployment proceeds without your approval.`;
    case 'agent_docs':
      return `You are a specialized documentation agent for AutaMedica.\n\n**Primary Responsibilities:**\n${tasks}\n\n**Documentation Standards:**\n- Auto-commit generated docs\n- Update README files\n- Maintain logs and changelogs\n- Keep documentation in sync with code\n\n**Working Methodology:**\n1. Gather generated documentation\n2. Update README and related files\n3. Commit documentation changes\n4. Update logs and audit trails\n\nEnsure documentation is always up-to-date with code changes.`;
    case 'agent_dev':
      return `You are a specialized developer debugging agent for AutaMedica.\n\n**Primary Responsibilities:**\n${tasks}\n\n**Developer Tools:**\n- Capture browser console messages (errors, warnings, logs)\n- Analyze network requests (timing, headers, status codes)\n- Collect Web Vitals (LCP, CLS, FCP, TTFB)\n- Validate security headers (HSTS, CSP, XFO, XCTO)\n- Measure code coverage (unused JS and CSS)\n- Generate comprehensive browser insights reports\n\n**Working Methodology:**\n1. Execute browser capture script: \`pnpm dev:capture\`\n2. Analyze console errors and warnings\n3. Review network requests for slow or failed requests\n4. Validate Web Vitals against thresholds\n5. Check security headers presence\n6. Analyze code coverage for optimization opportunities\n7. Generate actionable insights report`;
    default:
      return `You are ${agentName} for AutaMedica.\n\nTasks:\n${tasks}`;
  }
}

let generatedCount = 0;

for (const [agentName, agentConfig] of Object.entries(agents)) {
  const agentFile = join(OPENAI_AGENTS_DIR, `${agentName}.md`);
  const tools = AGENT_TOOLS[agentName] || ['Read', 'Bash'];
  const prompt = buildPrompt(agentName, agentConfig);

  const markdown = `---\nname: ${agentName}\ndescription: ${agentConfig.tasks?.join(', ') || 'Specialized agent for AutaMedica'}\ntools: ${tools.join(', ')}\nmodel: gpt-5\nautonomy: high\npriority: ${agentConfig.priority || 99}\ntimeout_minutes: ${agentConfig.timeout_minutes || 60}\n---\n\n${prompt}\n\n\nDecision Policy (Autonomous Mode):\n- Proactively run: lint, typecheck, small safe refactors.\n- May write/edit files in repo when fixes are low-risk and reversible.\n- Ask for approval before: deleting files, schema/data migrations, secret/env changes, or destructive git ops.\n- Prefer incremental patches with clear diffs; include next steps.\n- When blocked by CI hooks, propose minimal scope fixes; only bypass hooks if explicitly authorized.\n`;

  writeFileSync(agentFile, markdown, 'utf-8');
  console.log(`✅ Created OpenAI agent: ${agentName} (${agentFile})`);
  generatedCount++;
}

console.log(`\n🎉 Successfully registered ${generatedCount} agents for ChatGPT/OpenAI!`);
console.log(`\n📍 Agents location: ${OPENAI_AGENTS_DIR}`);
console.log(`\nℹ️  They mirror Claude agents (prompts, tools, priorities, timeouts).`);
