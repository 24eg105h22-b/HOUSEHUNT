# HouseHunt — Backend (Starter)

This folder contains a minimal Express + MongoDB backend scaffold for the HouseHunt project.

Prerequisites
- Node.js (16+ recommended)
- MongoDB (local or Atlas)

Quick start
1. Copy `.env.example` to `.env` and update `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:

```
npm install
```

3. Run in development with nodemon:

```
npm run dev
```

API endpoints
- `POST /api/auth/register` — register user (name, email, password)
- `POST /api/auth/login` — login (email, password)
- `GET /api/properties` — list properties (query params: location, minPrice, maxPrice, type, approved)
- `POST /api/properties` — create property (authenticated)
- `GET /api/properties/:id` — get property
- `PUT /api/properties/:id` — update property (owner or admin)
- `DELETE /api/properties/:id` — delete property (owner or admin)
- `PATCH /api/properties/:id/approve` — approve property (admin only)

Frontend
This scaffold focuses on the backend. To create the frontend quickly, from workspace root run:

```
npx create-react-app frontend
```

Then follow the instructions in the project plan to wire up Axios, React Router, and Bootstrap.

Uploads
- Images are stored locally in the `uploads/` folder and served at `/uploads/<filename>`, or uploaded to S3 when S3 env vars are configured.

Deployment notes
- Set `MONGO_URI` to your production MongoDB and `JWT_SECRET` to a secure value.
- If deploying to services like Heroku or Vercel, ensure `PORT` and environment variables are set.
- Serve the frontend build (`frontend/dist`) from a static host or integrate with the backend by copying build files into a `public/` folder.

**Final Project — How to run**

- Copy `.env.example` to `.env` in `c:/intern` and set `MONGO_URI` and `JWT_SECRET`. A default `.env` may already exist for local dev.
- Install backend deps and start:

```powershell
cd C:\intern
npm install
npm run dev
```

- Install frontend deps and start:

```powershell
cd C:\intern\frontend
npm install
npm run dev
```

- Quick checks:
	- Frontend: http://localhost:5173
	- Backend API: http://localhost:5000/api
	- Run smoke test: `cd C:\intern && npm run smoke`

**Notes**
- Images uploaded through the Create Property form are sent as base64 to `/api/uploads` and saved in `uploads/`. For production, replace with S3 or another CDN-backed storage.
- To seed sample data run: `cd C:\intern && npm run seed`.
- Docker: build and run services with `docker-compose up --build` (requires Docker). By default Docker Compose maps ports: backend `5000`, frontend `5173`, mongo `27017`.


```
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET=your-bucket-name
S3_BASE_URL=https://your-cdn-domain-or-s3-base-url  # optional
```

When configured, uploaded images are stored in S3 and returned URLs point to S3. If S3 upload fails, server falls back to local storage.
### Optional: S3 uploads

To enable server-side uploads to S3 set the following environment variables in your `.env`:

- `S3_BUCKET` — your S3 bucket name
- `AWS_REGION` — bucket region (e.g. `ap-south-1`)
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — AWS credentials (optional; if omitted the SDK will use the default provider chain)
- `S3_BASE_URL` — optional custom base URL (e.g. CloudFront)

When `S3_BUCKET` is present the server will attempt to upload files to S3 and return public URLs. If S3 upload fails the server falls back to local `/uploads` files.
- CI: a GitHub Actions workflow `ci.yml` is included to run tests and build frontend on push.

