# Local Setup Instructions

This guide will help you run the Stimmung movie recommendation app on your local machine.

---

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

---

## Step 1: Clone or Download the Project

If you have the project as a zip file, extract it to your desired location.

If you're cloning from a repository:
```bash
git clone <repository-url>
cd <project-folder>
```

---

## Step 2: Install Dependencies

Open a terminal in the project root directory and run:

```bash
npm install
```

This will install all required packages for both frontend and backend.

---

## Step 3: Set Up API Keys

You'll need to obtain API keys from the following services:

### Required API Keys:

1. **Google Gemini AI** (for mood interpretation)
   - Visit: https://aistudio.google.com/apikey
   - Create or sign in to your Google account
   - Generate an API key
   - Free tier available

2. **The Movie Database (TMDb)** (for movie/TV data)
   - Visit: https://www.themoviedb.org/settings/api
   - Create a free account
   - Request an API key (free)
   - Accept the terms and conditions

3. **Watchmode** (for streaming availability)
   - Visit: https://api.watchmode.com/
   - Sign up for a free account
   - Free tier: 1,000 requests/month
   - Get your API key from the dashboard

4. **OMDb** (for additional movie data)
   - Visit: https://www.omdbapi.com/apikey.aspx
   - Request a free API key
   - Free tier: 1,000 requests/day
   - Check your email for the key

### Configure Environment Variables:

Create a `.env` file in the root directory of the project:

```bash
# In the project root folder
touch .env
```

Open the `.env` file in a text editor and add your API keys:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# The Movie Database (TMDb)
TMDB_API_KEY=your_tmdb_api_key_here

# Watchmode
WATCHMODE_API_KEY=your_watchmode_api_key_here

# Open Movie Database (OMDb)
OMDB_API_KEY=your_omdb_api_key_here

# Node environment
NODE_ENV=development
```

**Important:** Replace `your_*_api_key_here` with your actual API keys.

---

## Step 4: Run the Application

### Development Mode (Recommended)

Start the development server with hot-reload:

```bash
npm run dev
```

This command will:
- Start the Express backend server on port 5000
- Start the Vite frontend dev server
- Open your browser automatically (or visit http://localhost:5000)

You should see the application running at: **http://localhost:5000**

### Production Mode

To build and run the optimized production version:

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

---

## Step 5: Verify Everything Works

Once the application is running:

1. **Open your browser** to http://localhost:5000
2. **Test the mood selector** - Click on different moods (Happy, Sad, etc.)
3. **Select filters** - Choose a language, genre, or decade
4. **Click "Search"** - You should see movie/TV recommendations
5. **Check streaming availability** - Click on a movie card to see where it's available

---

## Troubleshooting

### Issue: "Port 5000 is already in use"

**Solution:** Another application is using port 5000. Either:
- Stop the other application
- Or change the port in `server/index.ts`:
  ```typescript
  const PORT = process.env.PORT || 5001; // Change to 5001 or another port
  ```

### Issue: "API key not found" or empty results

**Solution:** 
- Double-check your `.env` file exists in the root directory
- Verify all API keys are correctly copied (no extra spaces)
- Restart the development server after adding keys:
  - Press `Ctrl+C` to stop the server
  - Run `npm run dev` again

### Issue: "Module not found" errors

**Solution:** 
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Issue: Vite errors or TypeScript errors

**Solution:**
- Delete the `.vite` cache folder: `rm -rf .vite`
- Restart the dev server

### Issue: Streaming availability not showing

**Solution:**
- Verify your WATCHMODE_API_KEY is correct
- Check the browser console for errors (F12 → Console tab)
- Watchmode free tier has limited requests - you may have exceeded the limit

---

## Project Structure Quick Reference

```
project-root/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components (Home, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and libraries
│   └── index.html
├── server/                # Backend Express application
│   ├── config/           # API configurations
│   ├── services/         # API integrations (Gemini, TMDb, etc.)
│   ├── index.ts          # Server entry point
│   └── routes.ts         # API routes
├── shared/               # Shared types and schemas
│   └── schema.ts
├── .env                  # Environment variables (YOU CREATE THIS)
├── package.json          # Dependencies and scripts
└── vite.config.ts       # Vite configuration
```

---

## Available Scripts

- **`npm run dev`** - Start development server (frontend + backend)
- **`npm run build`** - Build frontend for production
- **`npm start`** - Run production server
- **`npm run check`** - Type-check the code

---

## Features to Try

1. **Quick Mood Search**
   - Select a mood from the grid (e.g., "Happy", "Nostalgic")
   - Choose filters like language, genre, decade
   - Click "Search" to get recommendations

2. **Multi-Language Support**
   - Filter by Hindi, Tamil, Telugu, Korean, Turkish, and more
   - Mix and match languages for diverse content

3. **Decade Slider**
   - Use the slider to focus on specific eras (1950s to 2020s)
   - Great for finding classic films

4. **Streaming Availability**
   - Hover over movie cards to see streaming badges
   - Click a movie to view full details and streaming options
   - Direct links to Netflix, Prime Video, etc.

5. **Like/Dislike Feedback**
   - Heart icon to like a movie
   - Thumbs down to dislike
   - Helps personalize future recommendations

---

## Getting Help

If you encounter issues:

1. **Check the browser console** (F12 → Console tab) for frontend errors
2. **Check the terminal** where you ran `npm run dev` for backend errors
3. **Verify your API keys** are valid and have not exceeded free tier limits
4. **Read the FILE_DOCUMENTATION.md** for detailed information about each file

---

## Development Tips

### Hot Reload
- The development server automatically reloads when you make changes
- Frontend changes: Instant browser update
- Backend changes: Server restarts automatically

### Debugging
- Use browser DevTools (F12) to inspect elements and network requests
- Check the Network tab to see API calls and responses
- Use `console.log()` in the code to debug issues

### Making Changes
- **Frontend**: Edit files in `client/src/`
- **Backend**: Edit files in `server/`
- **Shared types**: Edit `shared/schema.ts`

---

## API Rate Limits

Be aware of free tier limitations:

- **Gemini**: Generous free tier
- **TMDb**: 1,000 requests per day (free)
- **Watchmode**: 1,000 requests per month (free)
- **OMDb**: 1,000 requests per day (free)

If you exceed limits, the app may show reduced results or errors.

---

## Next Steps

- **Customize the UI**: Edit colors in `client/src/index.css`
- **Add new moods**: Update `shared/schema.ts`
- **Extend filtering**: Modify `client/src/pages/Home.tsx`
- **Add features**: Check `FILE_DOCUMENTATION.md` for architecture details

Enjoy discovering movies that match your mood! 🎬✨
