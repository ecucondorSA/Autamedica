#!/bin/bash

# ===================================================================
# AutaMedica Edge Functions Deployment Script
# ===================================================================

set -e  # Exit on any error

PROJECT_REF="gtyvdircfhmdjiaelqkg"
ANON_KEY="REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA"

echo "🚀 AutaMedica Edge Functions Deployment"
echo "======================================="
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "   Install with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if user is logged in
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo ""
    echo "🔐 Authentication Required"
    echo "-------------------------"
    echo "You need to login to Supabase first."
    echo ""
    echo "Option 1: Interactive login (recommended):"
    echo "  npx supabase login"
    echo ""
    echo "Option 2: Set access token manually:"
    echo "  export SUPABASE_ACCESS_TOKEN='your_token_here'"
    echo ""
    read -p "Would you like to run 'npx supabase login' now? (y/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔑 Running supabase login..."
        npx supabase login
        echo ""
    else
        echo "❌ Cannot proceed without authentication"
        echo "   Please login and run this script again"
        exit 1
    fi
fi

echo "✅ Authentication ready"

# Verify functions directory exists
if [ ! -d "supabase/functions" ]; then
    echo "❌ Error: supabase/functions directory not found"
    echo "   Make sure you're running this script from the project root"
    exit 1
fi

# Check if functions exist
if [ ! -d "supabase/functions/create-call" ]; then
    echo "❌ Error: create-call function not found"
    exit 1
fi

if [ ! -d "supabase/functions/update-call-status" ]; then
    echo "❌ Error: update-call-status function not found"
    exit 1
fi

echo "✅ Functions found"
echo ""

# Deploy functions
echo "📦 Deploying Edge Functions"
echo "---------------------------"

echo "🔄 Deploying create-call..."
if npx supabase functions deploy create-call --project-ref "$PROJECT_REF"; then
    echo "✅ create-call deployed successfully"
else
    echo "❌ Failed to deploy create-call"
    exit 1
fi

echo ""
echo "🔄 Deploying update-call-status..."
if npx supabase functions deploy update-call-status --project-ref "$PROJECT_REF"; then
    echo "✅ update-call-status deployed successfully"
else
    echo "❌ Failed to deploy update-call-status"
    exit 1
fi

echo ""
echo "🎉 All functions deployed successfully!"
echo ""

# Test deployment
echo "🧪 Testing Deployment"
echo "--------------------"

echo "📍 Function URLs:"
echo "  • Create Call: https://$PROJECT_REF.supabase.co/functions/v1/create-call"
echo "  • Update Status: https://$PROJECT_REF.supabase.co/functions/v1/update-call-status"
echo ""

echo "🔍 Basic connectivity test..."

# Test if functions are responding
CREATE_CALL_URL="https://$PROJECT_REF.supabase.co/functions/v1/create-call"
UPDATE_STATUS_URL="https://$PROJECT_REF.supabase.co/functions/v1/update-call-status"

# Test CORS/OPTIONS request
echo "Testing CORS..."
if curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$CREATE_CALL_URL" | grep -q "200"; then
    echo "✅ create-call is responding"
else
    echo "⚠️  create-call may not be responding correctly"
fi

if curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$UPDATE_STATUS_URL" | grep -q "200"; then
    echo "✅ update-call-status is responding"
else
    echo "⚠️  update-call-status may not be responding correctly"
fi

echo ""
echo "🎯 Next Steps"
echo "------------"
echo "1. Test the functions using:"
echo "   - Open test-edge-functions.html in your browser"
echo "   - Or use the curl commands in deploy-edge-functions-cli.md"
echo ""
echo "2. The frontend is already configured to use these functions automatically"
echo ""
echo "3. Make sure the database migration has been applied:"
echo "   - Run apply-migration-direct.sql in Supabase SQL Editor"
echo ""
echo "✨ Your AutaMedica telemedicine system is ready!"