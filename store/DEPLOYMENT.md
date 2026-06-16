# 🍎 Apple Store — Deployment Guide

## ✨ Features

- Next.js 16 with Turbopack
- Real-time product data from Supabase
- Responsive design with Tailwind CSS
- Image carousel with Framer Motion
- Dark mode support
- Mobile-optimized UI

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account with a `kho_hang_iphone` table
- Vercel account (for production deployment)

## 🚀 Local Development

1. **Clone the repository:**
   ```bash
   cd store
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and update:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

## 📊 Database Schema

Ensure your Supabase `kho_hang_iphone` table has these columns:

| Column | Type | Description |
|--------|------|-------------|
| `stt` | number | Sort order (higher = newer) |
| `Tên sản phẩm` | text | Product name (e.g., "iPhone 16 Pro") |
| `Giá` | text | Price (formatted as "12.990.000") |
| `Dung Lượng RAM/ROM` | text | Spec (e.g., "256GB/8GB") |
| `Mô tả` | text | Product description |
| `Hình ảnh sản phẩm 1-6` | text | Image paths (Windows paths or filenames) |

## 🔧 Vercel Deployment

### Setup Instructions:

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Vercel deployment config"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Next.js" as framework

3. **Add Environment Variables in Vercel Dashboard:**
   - Go to Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Troubleshooting:

**Build fails with "Processing image failed":**
- Ensure all image paths in Supabase are valid filenames
- Images should be uploaded to Supabase Storage under `anh-iphone/` bucket

**Products not showing:**
- Verify Supabase URL and Anon Key are correct
- Check that `kho_hang_iphone` table has data
- Ensure column names match exactly (Vietnamese names are case-sensitive)

**Images not loading:**
- Check Supabase Storage public access permissions
- Verify image bucket name is `anh-iphone`
- Test image URLs directly in browser

## 🎨 Customization

### Brand Assets:
- **Logo**: Update `store/public/logo.png`
- **Hero banner**: Update `store/public/hero.png`
- **Favicon**: Update `store/app/favicon.ico`

### Contact Info:
Edit `store/lib/constants.js`:
```javascript
export const HOTLINE = '0123456789';
export const HOTLINE_DISPLAY = '0123 456 789';
export const TEL_URL = `tel:${HOTLINE}`;
export const ZALO_URL = `https://zalo.me/${HOTLINE}`;
```

## 📁 Project Structure

```
store/
├── app/               # Next.js App Router
│   ├── layout.js      # Root layout with metadata
│   ├── page.js        # Home page (server component)
│   ├── globals.css    # Global styles
│   └── favicon.ico    # Favicon
├── components/        # React components
│   ├── Navbar.jsx
│   ├── HeroSection.jsx
│   ├── ProductCard.jsx
│   ├── ProductModal.jsx
│   └── ...
├── lib/               # Utilities
│   ├── supabase.js    # Supabase client
│   ├── helpers.js     # Data processing functions
│   └── constants.js   # App constants
├── public/            # Static assets
├── .env.local         # Local environment variables (git-ignored)
├── .env.example       # Example env variables
├── next.config.mjs    # Next.js config
├── tailwind.config.js # Tailwind CSS config
└── package.json       # Dependencies

../ (root)
└── vercel.json        # Vercel build config
```

## 🔐 Security Notes

- ⚠️ **Never commit `.env.local`** - it's in `.gitignore`
- Use `NEXT_PUBLIC_` prefix only for client-safe variables
- Supabase Anon Key is publicly accessible (this is by design for read-only access)
- Use RLS (Row Level Security) policies in Supabase to protect sensitive data

## 📱 Supported Devices

- ✅ Mobile (iOS Safari, Chrome Android)
- ✅ Tablet (iPad, Android tablets)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)

## 📞 Support

For issues or questions:
- Email: contact@applestore.vn
- Zalo: [0123456789](https://zalo.me/0123456789)
- Phone: 0123 456 789
