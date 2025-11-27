# Google RAG Implementation Guide
## Using Gemini API with File Search for Retrieval-Augmented Generation

This guide documents how to implement Google's RAG (Retrieval-Augmented Generation) service using the Gemini API with file uploads. This approach allows you to perform semantic search and analysis over your custom datasets.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [API Keys & Environment Setup](#api-keys--environment-setup)
6. [Code Implementation](#code-implementation)
7. [Frontend Integration](#frontend-integration)
8. [Testing & Verification](#testing--verification)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**What is RAG?**
Retrieval-Augmented Generation combines:
- **Retrieval**: Searching through your custom data files
- **Generation**: Using AI to generate insights based on retrieved data

**Why Google Gemini File Search?**
- Upload CSV, PDF, TXT, and other file formats
- Perform semantic search across uploaded files
- Generate contextual insights from your data
- No need for vector databases or embeddings management

---

## 🔑 Prerequisites

### 1. Google AI Studio API Key

**How to Get Your API Key:**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key (format: `AIza...`)

**Important Notes:**
- Keep your API key secure and never commit it to version control
- Free tier includes generous quotas for testing
- API key format: `AIzaSy...` (starts with `AIza`)

### 2. Required Dependencies

```bash
npm install @google/generative-ai dotenv express cors
npm install --save-dev @types/express @types/cors @types/node typescript ts-node nodemon
```

---

## 📁 Project Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── gemini.ts          # RAG service implementation
│   │   └── server.ts               # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                        # API keys (DO NOT COMMIT)
├── data/
│   ├── your_data_file_1.csv       # Your data files
│   └── your_data_file_2.csv
└── frontend/
    └── src/
        └── pages/
            └── YourPage.tsx        # Frontend component
```

---

## 🚀 Step-by-Step Implementation

### Step 1: Environment Configuration

Create `.env` file in your backend directory:

```env
# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...your-actual-key-here

# Server Configuration
PORT=3000
```

**⚠️ CRITICAL: Add `.env` to `.gitignore`**

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

---

### Step 2: Backend Package Configuration

**`backend/package.json`:**

```json
{
  "name": "rag-backend",
  "version": "1.0.0",
  "description": "Backend for RAG with Gemini File Search",
  "main": "src/server.ts",
  "scripts": {
    "start": "ts-node src/server.ts",
    "dev": "nodemon src/server.ts"
  },
  "dependencies": {
    "@google/generative-ai": "^0.12.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.2",
    "nodemon": "^3.1.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

**`backend/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

### Step 3: RAG Service Implementation

**`backend/src/services/gemini.ts`:**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/files';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const fileManager = new GoogleAIFileManager(apiKey || '');

// Choose your model
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // or "gemini-1.5-pro" for more complex tasks
});

// Store file URIs globally
let uploadedFileUris: string[] = [];

/**
 * Upload files to Gemini File API
 * Files are uploaded once at startup and reused for all requests
 */
async function uploadFiles() {
    try {
        // Define paths to your data files
        const filePaths = [
            path.resolve(__dirname, '../../../data/your_data_file_1.csv'),
            path.resolve(__dirname, '../../../data/your_data_file_2.csv'),
            // Add more files as needed
        ];

        console.log('Uploading files...');
        uploadedFileUris = [];

        for (const filePath of filePaths) {
            const uploadResult = await fileManager.uploadFile(filePath, {
                mimeType: "text/csv", // Change based on file type
                displayName: path.basename(filePath),
            });
            
            uploadedFileUris.push(uploadResult.file.uri);
            console.log(`Uploaded: ${uploadResult.file.uri}`);
        }

        // Wait for files to be active
        let allActive = false;
        while (!allActive) {
            const fileStates = await Promise.all(
                uploadedFileUris.map(async (uri) => {
                    const fileName = uri.split('/').pop() || '';
                    const file = await fileManager.getFile(fileName);
                    return file.state === "ACTIVE";
                })
            );
            
            allActive = fileStates.every(state => state);
            
            if (!allActive) {
                console.log("Waiting for files to process...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        console.log("All files are active and ready for use.");
    } catch (error) {
        console.error('Error uploading files:', error);
    }
}

// Upload files on startup
uploadFiles();

/**
 * Generate insights using RAG
 * @param userQuery - The user's query or parameters
 * @returns AI-generated insights based on uploaded files
 */
export async function generateInsights(userQuery: any) {
    // Re-upload if files aren't ready
    if (uploadedFileUris.length === 0) {
        await uploadFiles();
    }

    // Construct your prompt
    const prompt = `
    SYSTEM PROMPT — Your AI Task Description
    
    You are an AI that analyzes data from the provided files.
    
    User Query: ${JSON.stringify(userQuery)}
    
    INSTRUCTIONS:
    1. Analyze the data from the uploaded CSV files
    2. Extract specific statistics and numbers
    3. Provide concise, data-driven insights
    4. Return results in JSON format
    
    OUTPUT FORMAT:
    {
      "insights": ["insight 1", "insight 2", "insight 3"],
      "summary": "Overall summary"
    }
    
    IMPORTANT: Use actual data from the files. Include specific numbers and statistics.
  `;

    try {
        // Prepare file references for the API
        const fileReferences = uploadedFileUris.map(uri => ({
            fileData: {
                mimeType: "text/csv",
                fileUri: uri
            }
        }));

        // Generate content with file context
        const result = await model.generateContent([
            ...fileReferences,
            { text: prompt }
        ] as any);

        const response = result.response;
        const text = response.text();

        // Clean up JSON response (remove markdown code blocks if present)
        const jsonString = text.replace(/```json\n|\n```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error generating content:', error);
        throw error;
    }
}
```

---

### Step 4: Express Server Setup

**`backend/src/server.ts`:**

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateInsights } from './services/gemini';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// RAG endpoint
app.post('/api/generate-insights', async (req, res) => {
    try {
        const userQuery = req.body;

        if (!userQuery || Object.keys(userQuery).length === 0) {
            return res.status(400).json({ error: 'No query provided' });
        }

        const insights = await generateInsights(userQuery);
        res.json(insights);
    } catch (error) {
        console.error('Error generating insights:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'RAG service is running' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```

---

### Step 5: Frontend Integration

**Example React Component:**

```typescript
import { useState } from 'react';

export default function RAGComponent() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Your query parameters
          query: "Analyze the data",
          filters: ["filter1", "filter2"]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Insights'}
      </button>
      
      {insights && (
        <div>
          <h2>Insights:</h2>
          <pre>{JSON.stringify(insights, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 🔐 API Keys & Environment Setup

### Obtaining Google Gemini API Key

1. **Visit Google AI Studio**
   - URL: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Get API Key" or "Create API Key"
   - Select your Google Cloud project (or create a new one)
   - Copy the generated key

3. **API Key Format**
   ```
   AIzaSy...your-key-here (starts with AIza)
   ```

4. **Free Tier Limits**
   - 60 requests per minute
   - 1,500 requests per day
   - Generous file upload limits

### Environment Variables Template

```env
# Google Gemini API Configuration
GEMINI_API_KEY=AIzaSy...your-actual-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Add other API keys as needed
# DATABASE_URL=...
# OTHER_SERVICE_KEY=...
```

---

## 🧪 Testing & Verification

### 1. Test Backend Locally

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
Uploading files...
Server running at http://localhost:3000
Uploaded: https://generativelanguage.googleapis.com/v1beta/files/...
Files are active and ready for use.
```

### 2. Test API Endpoint

```bash
curl -X POST http://localhost:3000/api/generate-insights \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'
```

### 3. Test Health Check

```bash
curl http://localhost:3000/api/health
```

---

## ✅ Best Practices

### 1. Security
- ✅ Never commit `.env` files to version control
- ✅ Use environment variables for all sensitive data
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate API keys periodically
- ✅ Use HTTPS in production

### 2. Performance
- ✅ Upload files once at startup, reuse URIs
- ✅ Implement caching for repeated queries
- ✅ Use `gemini-2.5-flash` for faster responses
- ✅ Use `gemini-1.5-pro` for complex analysis
- ✅ Implement rate limiting

### 3. Error Handling
- ✅ Check if files are active before generating
- ✅ Implement retry logic for file uploads
- ✅ Validate API responses
- ✅ Log errors for debugging
- ✅ Provide user-friendly error messages

### 4. Prompt Engineering
- ✅ Be specific about data requirements
- ✅ Request structured JSON output
- ✅ Provide examples in prompts
- ✅ Specify output format clearly
- ✅ Test prompts iteratively

---

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY is not set"
**Solution:**
- Ensure `.env` file exists in backend directory
- Check that `dotenv.config()` is called before using the key
- Verify API key format (should start with `AIza`)

### Issue: "Files not uploading"
**Solution:**
- Check file paths are correct (use absolute paths)
- Verify file format is supported (CSV, PDF, TXT, etc.)
- Ensure file size is within limits (max 2GB per file)
- Check API key has proper permissions

### Issue: "Files stuck in PROCESSING state"
**Solution:**
- Wait longer (large files take time)
- Check file format and encoding
- Verify file isn't corrupted
- Try uploading a smaller test file first

### Issue: "Generic responses instead of data-driven insights"
**Solution:**
- Make prompt more specific
- Explicitly request numbers and statistics
- Provide examples of desired output
- Use stricter output format requirements

### Issue: "CORS errors in frontend"
**Solution:**
- Ensure `cors()` middleware is enabled in Express
- Check frontend proxy configuration
- Verify API endpoint URLs are correct

---

## 📚 Additional Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [File API Reference](https://ai.google.dev/api/files)
- [Supported File Formats](https://ai.google.dev/gemini-api/docs/vision#supported-formats)

---

## 🎓 Key Takeaways

1. **RAG with Gemini is Simple**: Upload files → Send prompt with file references → Get insights
2. **No Vector DB Needed**: Google handles embeddings and search internally
3. **Flexible File Support**: CSV, PDF, TXT, images, and more
4. **Cost-Effective**: Generous free tier for development
5. **Scalable**: Easy to add more files and data sources

---

## 📝 License & Usage

This guide is provided as-is for educational and development purposes. Ensure you comply with Google's Terms of Service when using the Gemini API.

---

**Created:** 2025-11-20  
**Last Updated:** 2025-11-20  
**Version:** 1.0.0
