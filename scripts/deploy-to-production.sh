#!/bin/bash

#===============================================================================
# AUTAMEDICA - Script de Deployment a Producción
#===============================================================================
# Este script facilita el deployment de todas las apps a Vercel o Cloudflare
#
# Uso:
#   ./scripts/deploy-to-production.sh vercel
#   ./scripts/deploy-to-production.sh cloudflare
#   ./scripts/deploy-to-production.sh check
#
#===============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Apps to deploy
APPS=("web-app" "doctors" "patients" "companies" "admin")

#===============================================================================
# Functions
#===============================================================================

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

#===============================================================================
# Pre-deployment Checks
#===============================================================================

check_environment() {
    print_header "Pre-Deployment Checks"

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Must be run from monorepo root"
        exit 1
    fi

    # Check for required tools
    print_info "Checking required tools..."

    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        exit 1
    fi
    print_success "pnpm found"

    if ! command -v node &> /dev/null; then
        print_error "node is not installed"
        exit 1
    fi
    print_success "node found ($(node --version))"

    # Run validation
    print_info "Running pre-deployment validation..."

    # Type check
    print_info "Type checking..."
    pnpm type-check || {
        print_error "Type check failed"
        exit 1
    }
    print_success "Type check passed"

    # Lint
    print_info "Linting..."
    pnpm lint || {
        print_error "Lint failed"
        exit 1
    }
    print_success "Lint passed"

    # Build
    print_info "Building all apps..."
    pnpm build || {
        print_error "Build failed"
        exit 1
    }
    print_success "Build passed"

    print_success "All pre-deployment checks passed!"
}

#===============================================================================
# Deployment Functions
#===============================================================================

deploy_to_vercel() {
    print_header "Deploying to Vercel"

    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        pnpm add -g vercel
    fi

    # Deploy each app
    for app in "${APPS[@]}"; do
        print_info "Deploying $app to Vercel..."

        cd "apps/$app"

        vercel --prod --yes || {
            print_error "Failed to deploy $app"
            cd ../..
            exit 1
        }

        print_success "$app deployed successfully"
        cd ../..
    done

    print_success "All apps deployed to Vercel!"
}

deploy_to_cloudflare() {
    print_header "Deploying to Cloudflare Pages"

    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler CLI not found. Installing..."
        pnpm add -g wrangler
    fi

    # Deploy each app
    for app in "${APPS[@]}"; do
        print_info "Deploying $app to Cloudflare Pages..."

        cd "apps/$app"

        # Build the app
        pnpm build || {
            print_error "Build failed for $app"
            cd ../..
            exit 1
        }

        # Deploy
        wrangler pages deploy .next \
            --project-name "autamedica-$app" \
            --branch main || {
            print_error "Failed to deploy $app"
            cd ../..
            exit 1
        }

        print_success "$app deployed successfully"
        cd ../..
    done

    print_success "All apps deployed to Cloudflare Pages!"
}

#===============================================================================
# Environment Check
#===============================================================================

check_production_env() {
    print_header "Production Environment Check"

    print_info "Checking for mock flags..."

    # Check common locations for .env files
    for app in "${APPS[@]}"; do
        env_file="apps/$app/.env.production"

        if [ -f "$env_file" ]; then
            print_info "Checking $env_file..."

            # Check for mock flags
            if grep -q "NEXT_PUBLIC_USE_MOCK.*=true" "$env_file"; then
                print_error "MOCKS ARE ENABLED in $env_file"
                print_warning "Production should NOT have mocks enabled!"
                exit 1
            fi

            print_success "$env_file looks good (no mocks enabled)"
        else
            print_warning "$env_file not found"
        fi
    done

    print_success "Environment check passed!"
}

#===============================================================================
# Main
#===============================================================================

main() {
    case "${1:-}" in
        vercel)
            check_environment
            check_production_env
            deploy_to_vercel
            ;;
        cloudflare)
            check_environment
            check_production_env
            deploy_to_cloudflare
            ;;
        check)
            check_environment
            check_production_env
            ;;
        *)
            echo "Usage: $0 {vercel|cloudflare|check}"
            echo ""
            echo "Commands:"
            echo "  vercel      - Deploy to Vercel"
            echo "  cloudflare  - Deploy to Cloudflare Pages"
            echo "  check       - Run pre-deployment checks only"
            exit 1
            ;;
    esac

    print_header "Deployment Complete! 🎉"
    print_info "URLs de producción:"
    echo "  - Web-App:   https://www.autamedica.com"
    echo "  - Doctors:   https://doctors.autamedica.com"
    echo "  - Patients:  https://patients.autamedica.com"
    echo "  - Companies: https://companies.autamedica.com"
    echo "  - Admin:     https://admin.autamedica.com"
}

# Run main
main "$@"
