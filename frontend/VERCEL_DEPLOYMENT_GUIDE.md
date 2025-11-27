# Vercel Deployment Guide

This guide will help you deploy your unified sports analytics application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [Google Gemini API key](https://makersuite.google.com/app/apikey)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Project Structure

The application has been restructured for Vercel serverless deployment:

```
frontend/
├── api/                          # Serverless API routes
│   ├── generate-insights.ts      # NBA endpoint: POST /api/generate-insights
│   ├── [sport]/
│   │   └── generate-insights.ts  # Multi-sport: POST /api/{sport}/generate-insights
│   └── health.ts                 # Health check: GET /api/health
├── src/
│   ├── services/                 # Gemini AI services
│   │   ├── gemini.ts            # NBA insights generation
│   │   └── multiSportGemini.ts  # Multi-sport insights
│   └── ...                       # React components and pages
├── data/                         # CSV data files
├── vercel.json                   # Vercel configuration
└── package.json                  # Updated with backend dependencies
```

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install the new dependencies:
- `@google/generative-ai` - Google Gemini AI SDK
- `dotenv` - Environment variable management
- `@vercel/node` - Vercel serverless function types

### 2. Set Up Environment Variables Locally

Create a `.env` file in the `frontend/` directory:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Never commit the `.env` file to Git. It's already in `.gitignore`.

### 3. Test Locally

Test the application locally before deploying:

```bash
npm run dev
```

The app should run on `http://localhost:8080` with API routes accessible at:
- `http://localhost:8080/api/health`
- `http://localhost:8080/api/generate-insights` (POST)
- `http://localhost:8080/api/{sport}/generate-insights` (POST)

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the frontend directory:
```bash
cd frontend
vercel
```

4. Follow the prompts:
   - Link to existing project or create new one
   - Confirm settings
   - Wait for deployment

5. Set environment variable:
```bash
vercel env add GEMINI_API_KEY
```
Then paste your API key when prompted.

6. Redeploy with environment variable:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New..." → "Project"

4. Import your repository

5. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. Add environment variable:
   - Go to Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key
   - Select all environments (Production, Preview, Development)

7. Deploy!

## API Endpoints

After deployment, your API will be available at:

### Health Check
```
GET https://your-app.vercel.app/api/health
```

### NBA Insights
```
POST https://your-app.vercel.app/api/generate-insights
Content-Type: application/json

{
  "selectedPlayers": ["LeBron James", "Stephen Curry"],
  "team1": "Lakers",
  "team2": "Warriors"
}
```

### Multi-Sport Insights
```
POST https://your-app.vercel.app/api/{sport}/generate-insights
Content-Type: application/json

{
  "selectedPlayers": ["Player 1", "Player 2"],
  "team1": "Team A",
  "team2": "Team B"
}
```

Supported sports: `nba`, `afl`, `nrl`, `epl`, `ipl`

## Important Notes

### Serverless Functions

- **Cold Starts:** First request may take 5-10 seconds as files upload to Gemini
- **Timeout:** Functions have 60-second max execution time (configurable in vercel.json)
- **Stateless:** Each function invocation is independent

### File Uploads

The application uploads CSV files to Google Gemini on-demand:
- First request per sport uploads the required CSV files
- Subsequent requests may need to re-upload if the function cold-starts
- Files are stored temporarily in Gemini's cache during the function lifecycle

### Performance Tips

1. **Warm-up requests:** Consider implementing a cron job to keep functions warm
2. **Caching:** For production, consider implementing Redis/Vercel KV to cache file URIs
3. **Monitoring:** Use Vercel Analytics to monitor function performance

## Troubleshooting

### "GEMINI_API_KEY is not set"
- Ensure you've added the environment variable in Vercel Dashboard
- Redeploy after adding environment variables

### "Failed to upload files"
- Check that CSV files are in the `data/` directory
- Verify file paths in service files match your data structure
- Ensure Gemini API key is valid and has proper permissions

### API returns 404
- Verify the `api/` folder is at the root of your frontend directory
- Check that `vercel.json` is properly configured
- Ensure you're using the correct endpoint URLs

### Function Timeout
- Large CSV files may take longer to upload
- Consider splitting into smaller files or implementing caching
- Increase timeout in `vercel.json` if needed (max 60s on Pro plan)

## Cost Considerations

### Vercel
- **Free Tier:** 100GB bandwidth, serverless function executions included
- **Pro Tier ($20/mo):** More bandwidth, longer function timeouts

### Google Gemini
- Check [Google AI pricing](https://ai.google.dev/pricing) for current rates
- File uploads and API calls count towards quota

## Next Steps

1. **Set up custom domain** in Vercel Dashboard
2. **Enable Vercel Analytics** for monitoring
3. **Implement caching** for production (Redis/KV)
4. **Set up CI/CD** for automatic deployments
5. **Add monitoring** for API performance and errors

## Support

- Vercel Docs: https://vercel.com/docs
- Gemini API Docs: https://ai.google.dev/docs
- Project Issues: [Your GitHub Repo]

---

**Migration Complete! 🎉**

Your application is now ready for serverless deployment on Vercel.

