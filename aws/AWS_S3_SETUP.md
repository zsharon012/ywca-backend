# AWS S3 Setup — Images & PDFs

Step-by-step playbook matching the sprint task list. Do these in order.

## 1. Create the bucket

AWS Console → **S3** → **Create bucket**.

- **Bucket type:** General purpose
- **Bucket name:** `ywca-ens-uploads` (must be globally unique — adjust if taken)
- **AWS Region:** `us-east-2` (or whichever region is standard for the team)
- **Object Ownership:** **ACLs enabled** → select **Bucket owner preferred**
- **Block Public Access settings:**
  - **Uncheck "Block *all* public access"**
  - Acknowledge the warning (this bucket is public-read by design)
- **Bucket Versioning:** Disable
- **Default encryption:** Server-side encryption with Amazon S3 managed keys (**SSE-S3**)
- Click **Create bucket**

## 2. Grant public read access

Open the new bucket → **Permissions** tab.

### Bucket policy
Click **Edit** under *Bucket policy* and paste the contents of `s3-bucket-policy.json`, replacing `REPLACE_WITH_YOUR_BUCKET_NAME` with your actual bucket name.

### CORS (optional but recommended for future browser-direct uploads)
Click **Edit** under *Cross-origin resource sharing (CORS)* and paste `s3-cors-policy.json`. Update `AllowedOrigins` to match your frontend URL.

## 3. Create IAM credentials for the backend

IAM → **Users** → **Create user** → name it `ywca-backend-s3`. Attach a custom inline policy scoped to just your bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::REPLACE_WITH_YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Then **Security credentials** → **Create access key** → *Application running outside AWS*. Copy the access key ID and secret — you'll paste them into `.env`.

## 4. Fill in `.env`

In `ywca-backend-main/.env` add:

```
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=<from IAM>
AWS_SECRET_ACCESS_KEY=<from IAM>
S3_BUCKET_NAME=ywca-ens-uploads
```

## 5. Run the SQL migration

In Supabase → SQL Editor, re-run `ywca-backend-main/sql/create_tables.sql`. The `imagebucket` block is now uncommented and idempotent (uses `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN IF NOT EXISTS`), so it's safe against an existing partial install.

## 6. Restart the backend

Double-click `start-backend.command` at the project root (or run `npm run dev` in `ywca-backend-main`). You should NOT see the `[s3Provider] AWS_REGION or S3_BUCKET_NAME not set` warning anymore.

## 7. Test the upload

```bash
# Grab a Firebase ID token for an authenticated user (frontend console or curl to /auth/login)

curl -X POST http://localhost:5050/uploads \
  -H "Authorization: Bearer <firebase-id-token>" \
  -F "file=@/path/to/test.jpg"
```

Expected response (201):

```json
{
  "data": {
    "imageid": "b3d1...",
    "imageurl": "https://ywca-ens-uploads.s3.us-east-2.amazonaws.com/uploads/2026/04/<uuid>.jpg",
    "s3key": "uploads/2026/04/<uuid>.jpg",
    "mimetype": "image/jpeg",
    "size_bytes": 123456,
    "uploaded_by": 1,
    "uploaded_at": "2026-04-24T14:00:00.000Z"
  }
}
```

Open `imageurl` in a browser — should load the file.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| 500 with "S3 not configured" | `S3_BUCKET_NAME` or `AWS_REGION` missing from `.env` |
| 403 AccessDenied on PutObject | IAM user doesn't have `s3:PutObject` on that bucket |
| 403 AccessDenied when opening the public URL | Bucket policy missing or "Block all public access" still on |
| 400 Unsupported file type | File is not `image/*` or `application/pdf` |
| 413 | File larger than 10 MB — raise `MAX_BYTES` in `s3Provider.js` if needed |
