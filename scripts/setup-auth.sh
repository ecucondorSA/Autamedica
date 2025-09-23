#!/bin/bash

# Setup script for AutaMedica authentication using Supabase and Cloudflare CLIs
# This script configures SSO with minimal friction for development

set -e

echo "🚀 Setting up AutaMedica Authentication System"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 is installed${NC}"
    fi
}

echo ""
echo "📋 Checking prerequisites..."
check_command "supabase"
check_command "wrangler"
check_command "pnpm"

# Step 1: Initialize Supabase if not already done
echo ""
echo "🔧 Step 1: Configuring Supabase..."

if [ ! -f "supabase/.gitignore" ]; then
    echo "Initializing Supabase project..."
    supabase init
fi

# Link to remote project
echo "Linking to Supabase project..."
supabase link --project-ref gtyvdircfhmdjiaelqkg

# Update redirect URLs in Supabase
echo "Updating Supabase Auth configuration..."
cat > supabase/update-auth.sql << 'EOF'
-- Update auth configuration for Cloudflare Pages domains
UPDATE auth.config
SET redirect_urls = array[
    'https://autamedica-web-app.pages.dev/**',
    'https://autamedica-patients.pages.dev/**',
    'https://autamedica-doctors.pages.dev/**',
    'https://autamedica-companies.pages.dev/**',
    'https://autamedica-admin.pages.dev/**',
    'http://localhost:3000/**',
    'http://localhost:3002/**',
    'http://localhost:3003/**',
    'http://localhost:3004/**',
    'http://localhost:3005/**'
]
WHERE id = 1;
EOF

# Step 2: Setup Cloudflare KV namespaces
echo ""
echo "☁️ Step 2: Setting up Cloudflare KV for SSO..."

# Create KV namespaces if they don't exist
echo "Creating KV namespaces..."
wrangler kv:namespace create "AUTH_SESSIONS" || true
wrangler kv:namespace create "USER_PROFILES" || true
wrangler kv:namespace create "AUTH_SESSIONS" --preview || true
wrangler kv:namespace create "USER_PROFILES" --preview || true

# Step 3: Deploy Cloudflare Pages Functions
echo ""
echo "📦 Step 3: Creating Pages Functions for each app..."

# Create functions directories for each app
apps=("web-app" "patients" "doctors" "companies" "admin")

for app in "${apps[@]}"; do
    echo "Setting up functions for $app..."

    # Create functions directory
    mkdir -p "apps/$app/functions"

    # Create auth middleware function
    cat > "apps/$app/functions/_middleware.js" << 'EOF'
// Cloudflare Pages Function Middleware for Authentication
import { onRequest } from '@autamedica/auth/middleware/cloudflare-auth';

export { onRequest };
EOF

    # Create API route for session validation
    cat > "apps/$app/functions/api/auth/session.js" << 'EOF'
// API endpoint to validate session
export async function onRequestGet({ request, env }) {
    const { validateKVSession, parseSessionFromCookie } = await import('@autamedica/auth/utils/cloudflare-sso');

    const cookieHeader = request.headers.get('cookie');
    const sessionId = parseSessionFromCookie(cookieHeader);

    if (!sessionId) {
        return new Response(JSON.stringify({ authenticated: false }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const profile = await validateKVSession(sessionId);

    if (!profile) {
        return new Response(JSON.stringify({ authenticated: false }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
        authenticated: true,
        user: profile
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
EOF
done

# Step 4: Create login handler for web-app
echo ""
echo "🔐 Step 4: Creating login handler..."

cat > "apps/web-app/functions/api/auth/login.js" << 'EOF'
// Cloudflare Pages Function for handling login
export async function onRequestPost({ request, env }) {
    const { createKVSession, createSSOCookie } = await import('@autamedica/auth/utils/cloudflare-sso');
    const { createClient } = await import('@supabase/supabase-js');

    const { email, password } = await request.json();

    // Initialize Supabase client
    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error || !data.user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Create session in KV
    const sessionId = crypto.randomUUID();
    const profile = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'patient',
        first_name: data.user.user_metadata?.first_name,
        last_name: data.user.user_metadata?.last_name,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at
    };

    await createKVSession(sessionId, data.user.id, profile);

    // Create SSO cookie
    const cookie = createSSOCookie(sessionId);

    return new Response(JSON.stringify({
        success: true,
        profile,
        redirectUrl: getRoleRedirectUrl(profile.role)
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie
        }
    });
}

function getRoleRedirectUrl(role) {
    const redirects = {
        'patient': 'https://autamedica-patients.pages.dev/dashboard',
        'doctor': 'https://autamedica-doctors.pages.dev/dashboard',
        'company': 'https://autamedica-companies.pages.dev/dashboard',
        'company_admin': 'https://autamedica-companies.pages.dev/dashboard',
        'platform_admin': 'https://autamedica-admin.pages.dev/dashboard'
    };
    return redirects[role] || 'https://autamedica-web-app.pages.dev';
}
EOF

# Step 5: Build auth package
echo ""
echo "📦 Step 5: Building @autamedica/auth package..."
cd packages/auth
pnpm install
pnpm build
cd ../..

# Step 6: Create deployment script
echo ""
echo "🚀 Step 6: Creating deployment helper script..."

cat > deploy-apps.sh << 'EOF'
#!/bin/bash
# Deploy all apps to Cloudflare Pages

echo "Deploying AutaMedica apps to Cloudflare Pages..."

apps=("web-app" "patients" "doctors" "companies" "admin")

for app in "${apps[@]}"; do
    echo "Deploying $app..."
    cd "apps/$app"

    # Build the app
    pnpm build

    # Deploy to Cloudflare Pages
    wrangler pages deploy .next --project-name "autamedica-$app"

    cd ../..
done

echo "✅ All apps deployed successfully!"
EOF

chmod +x deploy-apps.sh

# Step 7: Update package.json scripts
echo ""
echo "📝 Step 7: Updating package.json scripts..."

# Add helpful scripts to root package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts = {
    ...pkg.scripts,
    'auth:setup': './scripts/setup-auth.sh',
    'auth:build': 'cd packages/auth && pnpm build',
    'deploy:all': './deploy-apps.sh',
    'kv:list-sessions': 'wrangler kv:key list --namespace-id=auth_sessions_kv',
    'kv:clear-sessions': 'wrangler kv:bulk delete --namespace-id=auth_sessions_kv',
    'supabase:start': 'supabase start',
    'supabase:stop': 'supabase stop'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo ""
echo -e "${GREEN}✅ Authentication setup complete!${NC}"
echo ""
echo "📚 Quick Reference:"
echo "==================="
echo ""
echo "🔧 Development Commands:"
echo "  pnpm supabase:start    - Start local Supabase"
echo "  pnpm dev              - Start all apps in dev mode"
echo "  pnpm auth:build       - Build auth package"
echo ""
echo "☁️ Deployment Commands:"
echo "  pnpm deploy:all       - Deploy all apps to Cloudflare"
echo "  wrangler pages deploy - Deploy individual app"
echo ""
echo "🔍 Debug Commands:"
echo "  pnpm kv:list-sessions  - List active sessions in KV"
echo "  pnpm kv:clear-sessions - Clear all sessions"
echo "  supabase db diff      - Check database changes"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "1. Update your Cloudflare account ID in wrangler.toml"
echo "2. Set environment variables in Cloudflare Pages dashboard"
echo "3. Configure custom domain for proper SSO (optional)"
echo ""
echo "Happy coding! 🚀"