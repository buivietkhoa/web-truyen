# Web Truyen

Next.js app for a story reading website with an admin dashboard.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env` locally and configure the same variables in your deployment provider.

Required:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="change-this-secret"
```

Recommended for production uploads:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_FOLDER="web-truyen/covers"
```

If the Cloudinary variables are present, admin cover uploads are stored on Cloudinary and remain available after deploys. If they are missing, uploads fall back to `public/uploads` for local testing only.

## Database

```bash
npx prisma migrate dev
npx prisma generate
```

For production, set `DATABASE_URL` to your hosted Postgres database before running migrations/deploying.

## Build

```bash
npm run build
npm start
```
