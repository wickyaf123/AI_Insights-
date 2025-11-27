# Google RAG Quick Reference Card
## Essential Information for Implementation

---

## 🔑 API Key Setup

### Get Your API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key (format: `AIzaSy...`)

### Environment Setup
```env
# .env file
GEMINI_API_KEY=AIzaSy...your-key-here
PORT=3000
```

**⚠️ IMPORTANT: Add to `.gitignore`:**
```
.env
.env.local
```

---

## 📦 Dependencies

```bash
npm install @google/generative-ai dotenv express cors
npm install -D @types/express @types/cors @types/node typescript ts-node nodemon
```

---

## 💻 Minimal Working Example

### 1. Service File (`services/gemini.ts`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/files';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');
const fileManager = new GoogleAIFileManager(apiKey || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

let fileUris: string[] = [];

async function uploadFiles() {
    const files = [
        path.resolve(__dirname, '../../../data/file1.csv'),
        path.resolve(__dirname, '../../../data/file2.csv'),
    ];

    console.log('Uploading files...');
    fileUris = [];

    for (const filePath of files) {
        const upload = await fileManager.uploadFile(filePath, {
            mimeType: "text/csv",
            displayName: path.basename(filePath),
        });
        fileUris.push(upload.file.uri);
        console.log(`Uploaded: ${upload.file.uri}`);
    }

    // Wait for files to be active
    let active = false;
    while (!active) {
        const states = await Promise.all(
            fileUris.map(async (uri) => {
                const name = uri.split('/').pop() || '';
                const file = await fileManager.getFile(name);
                return file.state === "ACTIVE";
            })
        );
        active = states.every(s => s);
        if (!active) {
            console.log("Waiting for files...");
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    console.log("Files ready!");
}

uploadFiles();

export async function generateInsights(query: any) {
    if (fileUris.length === 0) await uploadFiles();

    const prompt = `
    Analyze the data and provide insights.
    Query: ${JSON.stringify(query)}
    Return JSON format.
    `;

    const fileRefs = fileUris.map(uri => ({
        fileData: { mimeType: "text/csv", fileUri: uri }
    }));

    const result = await model.generateContent([
        ...fileRefs,
        { text: prompt }
    ] as any);

    const text = result.response.text();
    const json = text.replace(/```json\n|\n```/g, '').trim();
    return JSON.parse(json);
}
```

### 2. Server File (`server.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateInsights } from './services/gemini';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-insights', async (req, res) => {
    try {
        const insights = await generateInsights(req.body);
        res.json(insights);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
});

app.listen(3000, () => console.log('Server running on :3000'));
```

### 3. Frontend Call

```typescript
const response = await fetch('/api/generate-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: "your query" })
});
const data = await response.json();
```

---

## 🎯 Key Concepts

### File Upload Flow
1. Upload files at startup → Get URIs
2. Wait for files to be ACTIVE
3. Reuse URIs for all requests (no re-upload needed)

### RAG Request Flow
1. Prepare file references (URIs + mimeType)
2. Create prompt with user query
3. Send both to Gemini API
4. Parse JSON response

---

## 📝 Prompt Template

```typescript
const prompt = `
SYSTEM: You are an AI that analyzes data from CSV files.

REQUIREMENTS:
1. Use REAL DATA from the files
2. Include SPECIFIC NUMBERS
3. Be CONCISE (1-2 sentences per insight)
4. Return VALID JSON

User Query: ${userQuery}

OUTPUT FORMAT:
{
  "insights": ["insight with numbers", "another insight"],
  "summary": "overall summary"
}

IMPORTANT: Every insight must include actual statistics from the data.
`;
```

---

## ✅ Checklist

- [ ] Get API key from Google AI Studio
- [ ] Create `.env` file with `GEMINI_API_KEY`
- [ ] Add `.env` to `.gitignore`
- [ ] Install dependencies
- [ ] Create `services/gemini.ts`
- [ ] Create `server.ts`
- [ ] Place data files in `data/` folder
- [ ] Update file paths in `uploadFiles()`
- [ ] Test with `npm run dev`
- [ ] Verify files upload successfully
- [ ] Test API endpoint

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| API key not found | Check `.env` file exists and `dotenv.config()` is called |
| Files not uploading | Verify file paths are absolute, check file format |
| Generic responses | Make prompt more specific, request numbers explicitly |
| CORS errors | Enable `cors()` middleware in Express |
| Files stuck processing | Wait longer, check file size/format |

---

## 📊 Supported File Types

- ✅ CSV (text/csv)
- ✅ PDF (application/pdf)
- ✅ TXT (text/plain)
- ✅ Images (image/jpeg, image/png)
- ✅ Audio (audio/mp3, audio/wav)
- ✅ Video (video/mp4)

Max file size: 2GB per file

---

## 🚀 Models Available

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| gemini-2.5-flash | Quick responses, simple tasks | ⚡ Fast | 💰 Cheap |
| gemini-1.5-pro | Complex analysis, accuracy | 🐢 Slower | 💰💰 Higher |
| gemini-1.5-flash | Balanced performance | ⚡ Fast | 💰 Cheap |

---

## 📈 Free Tier Limits

- **Requests**: 60/min, 1,500/day
- **File uploads**: Generous limits
- **File storage**: 20GB total
- **Context window**: Up to 2M tokens

---

## 🔗 Quick Links

- API Keys: https://aistudio.google.com/app/apikey
- Documentation: https://ai.google.dev/docs
- File API: https://ai.google.dev/api/files
- Pricing: https://ai.google.dev/pricing

---

**Last Updated:** 2025-11-20  
**Version:** 1.0.0
