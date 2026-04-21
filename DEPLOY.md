# EV Priority - Deployment Guide

## Render Deployment

### Prerequisites
1. Push code to GitHub repository
2. Create account on [Render](https://render.com)

### Deployment Steps

1. **Create New Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Name**: `ev-priority`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy

### Project Structure for Deployment

```
ev-priority-website/
├── app/                  # Next.js app router
├── components/           # React components
├── public/              # Static assets
│   ├── icon.svg         # App icon
│   ├── favicon.svg      # Favicon
│   └── apple-touch-icon.png  # Apple icon
├── render.yaml          # Render configuration
├── next.config.ts       # Next.js config (output: export)
└── package.json
```

### Features

- **17 Road Layouts**: Various intersection types for simulation
- **ML Algorithm**: Random Forest with 99.2% accuracy
- **60% Faster Response**: Optimized emergency vehicle routing
- **100% Preemption Success**: All signals properly preempted
- **PWA Ready**: Icons and manifest configured

### Environment Variables

No environment variables required for static deployment.

### Custom Domain (Optional)

1. In Render dashboard, go to your site settings
2. Click "Custom Domain"
3. Add your domain and follow DNS instructions

### Troubleshooting

- **Build fails**: Check `next.config.ts` has `output: 'export'`
- **Assets not loading**: Ensure `distDir: 'dist'` is set
- **404 errors**: Check `trailingSlash: true` is enabled

### Live Demo

Once deployed, your site will be available at:
`https://ev-priority.onrender.com`
