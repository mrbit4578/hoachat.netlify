# 🧪 Chemical Control System - ZDHC Compliance

A comprehensive web application for managing and controlling chemicals according to ZDHC (Zero Discharge of Hazardous Chemicals) standards.

## ✨ Features

- **📊 Dashboard**: View all chemicals and their ZDHC compliance status
- **✅ ZDHC Validation**: Automatic compliance checking against ZDHC restrictions
- **🔐 GitHub OAuth**: Secure authentication using GitHub accounts
- **👥 Role-Based Access Control**: 
  - **Viewers**: Can view and export chemical data
  - **Editors**: Can create and edit chemical records
  - **Admins**: Full access including user management
- **📈 Compliance Reports**: Generate detailed ZDHC compliance reports
- **🌍 Multi-language Support**: Ready for internationalization
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- GitHub Account (for OAuth setup)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd chemical-control-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup GitHub OAuth**

   a. Go to GitHub → Settings → Developer settings → OAuth Apps
   
   b. Click "New OAuth App" and fill in:
   - Application name: "Chemical Control System"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   
   c. Copy your `Client ID` and generate a `Client Secret`

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_GITHUB_ID=your_github_app_id
GITHUB_SECRET=your_github_app_secret
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Usage

### For Viewers
- Visit the Dashboard to see all chemicals
- Filter by ZDHC certification status
- Click on any chemical to see detailed information
- View compliance reports and certifications

### For Editors
- Sign in with a GitHub account
- Click "+ Add Chemical" to create new records
- Edit existing chemical records
- View detailed compliance information

### For Admins
- All editor features plus:
- Delete chemical records
- Manage user access permissions
- View audit logs

## 🏗️ Project Structure

```
chemical-control-system/
├── app/
│   ├── api/
│   │   ├── auth/              # NextAuth authentication routes
│   │   └── chemicals/         # Chemical API endpoints
│   ├── auth/
│   │   └── signin/            # Sign in page
│   ├── chemical/
│   │   ├── new/               # Create new chemical
│   │   ├── [id]/              # View chemical details
│   │   └── [id]/edit/         # Edit chemical
│   ├── components/
│   │   ├── Navigation.tsx      # Main navigation bar
│   │   └── ChemicalForm.tsx    # Reusable chemical form
│   ├── config/
│   │   └── auth.ts            # NextAuth configuration
│   ├── dashboard/             # Dashboard page
│   ├── lib/
│   │   └── zdhc.ts            # ZDHC compliance logic
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   └── page.tsx               # Home page
├── middleware.ts              # Next.js middleware
├── auth.ts                    # Auth configuration export
├── netlify.toml              # Netlify deployment config
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Dependencies
```

## 🔐 Authentication & Authorization

### GitHub OAuth Flow
1. User clicks "Sign in with GitHub"
2. Redirected to GitHub authentication
3. User approves access
4. Redirected back with auth token
5. User role determined based on GitHub username

### User Roles
- **Viewer**: No special permissions, can view all public data
- **Editor**: Can create and edit chemical records
- **Admin**: Full access, can delete records and manage users

To set authorized users, add to `.env.local`:
```env
GITHUB_AUTHORIZED_USERS=username1,username2
GITHUB_ADMIN_USERS=adminusername1,adminusername2
```

## 🧪 ZDHC Compliance

### ZDHC Certification Levels
1. **ZDHC Gateway**: Products meeting ZDHC standards
2. **ZDHC Approved**: Certified by ZDHC approved manufacturers
3. **ZDHC Audited**: Passed third-party audit

### Restricted Substances
The system checks chemical components against ZDHC Restricted Substances List (RSL):
- Banned substances: Arsenic, Mercury, etc.
- Restricted substances: Nickel, Chromium (with % limits), etc.

### Compliance Status
- **Full**: No ZDHC issues detected
- **Partial**: Minor issues that don't block usage
- **Non-Compliant**: Critical issues must be resolved

## 📊 API Endpoints

### Chemicals
- `GET /api/chemicals` - List all chemicals (public, filterable)
- `POST /api/chemicals` - Create new chemical (requires editor role)
- `GET /api/chemicals/[id]` - Get chemical details (public)
- `PUT /api/chemicals/[id]` - Update chemical (requires editor role)
- `DELETE /api/chemicals/[id]` - Delete chemical (requires admin role)

## 🎨 Customization

### Styles
- Uses Tailwind CSS for styling
- Customize colors in `tailwind.config.ts`
- Global styles in `app/globals.css`

### ZDHC Substances
Edit `app/lib/zdhc.ts` to:
- Update restricted substances list
- Modify compliance checking logic
- Add new certification levels

## 📦 Deployment

### Netlify Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository
   - Click "Deploy site"

3. **Set Environment Variables**
   - In Netlify: Site Settings → Build & Deploy → Environment
   - Add all variables from `.env.local.example`

4. **Configure Domain**
   - Go to Netlify Domain Management
   - Add your custom domain or use Netlify's subdomain

## 🔄 Database (Optional)

Currently uses in-memory storage. To integrate with Supabase:

1. Create Supabase account: https://supabase.com
2. Create tables for chemicals, users, audit logs
3. Update API routes to use `@supabase/supabase-js`
4. Add Supabase credentials to `.env.local`

## 🧪 Testing

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📝 Database Schema (Supabase Ready)

```sql
-- Chemicals table
CREATE TABLE chemicals (
  id uuid PRIMARY KEY,
  product_name varchar NOT NULL,
  product_code varchar UNIQUE NOT NULL,
  manufacturer varchar NOT NULL,
  zdhc_certified boolean DEFAULT false,
  zdhc_level varchar,
  zdhc_certificate_url varchar,
  zdhc_certificate_expiry date,
  created_by uuid NOT NULL,
  updated_by uuid,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Chemical components table
CREATE TABLE chemical_components (
  id uuid PRIMARY KEY,
  chemical_id uuid REFERENCES chemicals(id),
  component_name varchar NOT NULL,
  cas_number varchar NOT NULL,
  percentage decimal NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  entity_type varchar NOT NULL,
  entity_id uuid NOT NULL,
  action varchar NOT NULL,
  user_id uuid NOT NULL,
  changes jsonb,
  timestamp timestamp DEFAULT now()
);
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Create an issue on GitHub
- Contact the development team

## 🔗 Resources

- [ZDHC Gateway](https://www.zdhcgateway.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Netlify Documentation](https://docs.netlify.com/)

---

**Made with ❤️ for sustainable chemistry**
