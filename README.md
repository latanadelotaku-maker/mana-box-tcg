Mana Box TCG Scanner — minimal Next.js app

Quick start locally:
1) cd mana-box-web
2) npm install
3) npm run dev

Deploy to Vercel:
1) Push repo to GitHub
2) In Vercel, import the Git repository and deploy (Next.js auto-detected)

Notes:
- API /api/scan is a serverless stub that detects by filename; replace with ML service for production.
- The UI is mobile-first and styled after Mana Box (inspiration).
