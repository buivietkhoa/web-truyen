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
CLOUDINARY_UPLOAD_PRESET="your-unsigned-upload-preset"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_FOLDER="web-truyen/covers"
```

If `CLOUDINARY_UPLOAD_PRESET` is present, uploads use Cloudinary unsigned upload and do not need `CLOUDINARY_API_KEY` or `CLOUDINARY_API_SECRET`. If no upload preset is configured, the app falls back to signed upload with API key and secret. If Cloudinary variables are missing, uploads fall back to `public/uploads` for local testing only.

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
