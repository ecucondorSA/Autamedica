# Vercel Deployment Guide - Patients App

## 🚀 Quick Deployment

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ecucondorSA/Autamedica&root-directory=apps/patients)

### Option 2: Manual Deployment

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com/new](https://vercel.com/new)
   - Click "Import Project"

2. **Import Repository**
   - Enter repository URL: `https://github.com/ecucondorSA/Autamedica`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/patients`
   - **Build Command**: `cd ../.. && pnpm build:packages && pnpm build --filter ./apps/patients`
   - **Install Command**: `cd ../.. && corepack enable && corepack prepare pnpm@9.15.2 --activate && HUSKY=0 pnpm install --frozen-lockfile`
   - **Output Directory**: `.next`

4. **Environment Variables**
   Add these environment variables in Vercel dashboard:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

## 🔧 Local Development

```bash
# Install dependencies
cd apps/patients
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## 📁 Project Structure

```
apps/patients/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   └── lib/                 # Utility functions
├── public/                  # Static assets
├── vercel.json             # Vercel configuration
├── .vercelignore           # Vercel ignore file
└── package.json            # Dependencies
```

## 🛡️ Security Features

- **CSP Headers**: Content Security Policy configured
- **HSTS**: HTTP Strict Transport Security enabled
- **XSS Protection**: Cross-site scripting protection
- **Frame Options**: Clickjacking protection
- **Content Type**: MIME type sniffing protection

## 🔗 Related Apps

- **Auth Hub**: [autamedica-auth.vercel.app](https://autamedica-auth.vercel.app)
- **Doctors Portal**: [autamedica-doctors.vercel.app](https://autamedica-doctors.vercel.app)
- **Companies Portal**: [autamedica-companies.vercel.app](https://autamedica-companies.vercel.app)

## 📞 Support

For issues or questions, please contact the development team or create an issue in the repository.