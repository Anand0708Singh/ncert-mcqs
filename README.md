# NCERT Chapter-wise MCQ Practice & Mock Test Platform

This project is a mobile-first, responsive, static MCQ practice and mock-test website built using React, Vite, and Tailwind CSS. The website reads its question bank from a generated JSON file (`question_bank.json`), making it entirely serverless and perfectly suited for GitHub Pages deployment.

## Features
- **Practice Mode**: Test your knowledge chapter by chapter with immediate feedback and explanations.
- **Mock Test Mode**: Take a timed mock test spanning multiple subjects/chapters with a final score evaluation.
- **Dashboard**: Track your tests taken, questions attempted, overall accuracy, and review test history.
- **State Management**: Uses Zustand to persist your test history and bookmarked questions across sessions in your browser.
- **Static Hosting**: Configured out of the box to be hosted on GitHub Pages or any static file server.

## Project Structure

```
ncert-mcqs/
├── README.md                      # This file
├── scripts/
│   └── generate_mcqs.py           # Python script to extract MCQs from PDF using Gemini
├── frontend/                      # React Frontend application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts             # Vite configuration with base path set for GH Pages
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css              # Tailwind CSS v4 entrypoint
│   │   ├── types/
│   │   │   └── index.ts           # Typescript definitions (Question, Attempt, TestResult)
│   │   ├── store/
│   │   │   └── useStore.ts        # Zustand persistent state management
│   │   ├── pages/                 # React Pages (Home, ChapterSelect, TestConfig, TestRunner, Results, Dashboard)
│   │   └── components/            # Reusable components (Layout, etc.)
│   └── public/
│       └── question_bank.json     # The generated JSON question bank used by the app
```

## Requirements

### For the Frontend:
- **Node.js**: v18 or newer
- **npm** or **yarn**

### For the Generation Script:
- **Python**: 3.10+
- **Gemini API Key**: Requires a Google Gemini API Key for vision-based OCR and MCQ generation.
- Python Libraries: `PyPDF2`, `google-genai`

## 1. Extracting More Questions (Python Script)

The provided script `scripts/generate_mcqs.py` uses the new `google-genai` SDK and the `gemini-3.6-flash` model to process the image-based NCERT PDF and extract structured MCQs.

### Setup

```bash
cd scripts
pip install PyPDF2 google-genai
```

### Configuration
1. Open `scripts/generate_mcqs.py` in a text editor.
2. Update the `API_KEY` variable with your Gemini API key (or set it via environment variables if preferred).
3. Adjust the `START_PAGE` and `END_PAGE` variables. The PDF is extremely long (~300 pages), so it is highly recommended to run extraction in smaller chunks (e.g., 5-10 pages at a time) to avoid hitting Gemini API rate limits (503 Service Unavailable).

### Run the script
```bash
python generate_mcqs.py
```
This will append the newly generated questions directly to `frontend/public/question_bank.json`.

## 2. Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## 3. Building and Deploying to GitHub Pages

The project is already configured for deployment on GitHub Pages. The Vite `base` path in `vite.config.ts` is set to `'./'`, making the built assets relative and portable.

### Manual Deployment via `gh-pages` branch
1. Ensure your repository is pushed to GitHub.
2. Build the project locally:
   ```bash
   cd frontend
   npm run build
   ```
3. The built static files will be in the `frontend/dist/` directory.
4. You can use a tool like `gh-pages` to deploy this folder:
   ```bash
   npx gh-pages -d dist
   ```

### Automated Deployment via GitHub Actions
To automatically deploy when pushing to `main`, create a file at `.github/workflows/deploy.yml` in your repository root:

```yaml
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      - name: Build
        working-directory: ./frontend
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend/dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Question Stats & Build Result
- **Build Status**: Successful (Build time: ~650ms, Size: ~300KB)
- **Question Stats**: A mock sample of questions across Physics, Chemistry, and Biology has been seeded into `public/question_bank.json` to verify the frontend logic. Use the Python script to continuously populate this bank with real questions from the NCERT PDFs.
