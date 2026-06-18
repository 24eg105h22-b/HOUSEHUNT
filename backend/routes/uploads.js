const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
let multer
try { multer = require('multer') } catch (e) { multer = null }

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer ? multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = (file.mimetype || '').split('/')[1] || 'bin'
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
    cb(null, name)
  }
}) : null
const upload = multer ? multer({ storage }) : null

router.post('/', async (req, res) => {
  try {
    const { images } = req.body
    if (!images || !Array.isArray(images)) return res.status(400).json({ message: 'images array required' })
    const urls = []
    for (const img of images) {
      const match = /^data:(image\/[a-zA-Z0-9+]+);base64,(.+)$/.exec(img)
      if (!match) continue
      const ext = match[1].split('/')[1]
      const data = match[2]
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)
      const buffer = Buffer.from(data, 'base64')
        if (process.env.S3_BUCKET) {
          try {
            const key = `uploads/${filename}`
            const url = await uploadToS3Buffer(buffer, key, match[1])
            urls.push(url)
            continue
          } catch (e) {
          }
      }
      fs.writeFileSync(filepath, buffer)
      urls.push(`/uploads/${filename}`)
    }
    res.json({ urls })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

if (upload) {
  router.post('/multipart', upload.array('images', 6), async (req, res) => {
    try {
      const files = req.files || []
      const urls = []
      for (const f of files) {
        const buffer = fs.readFileSync(f.path)
        if (process.env.S3_BUCKET) {
          try {
            const key = `uploads/${f.filename}`
            const url = await uploadToS3Buffer(buffer, key, f.mimetype)
            urls.push(url)
            try { fs.unlinkSync(f.path) } catch(e){}
            continue
          } catch (e) {
          }
        }
        urls.push(`/uploads/${f.filename}`)
      }
      res.json({ urls })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
} else {
  router.post('/multipart', (req, res) => {
    res.status(501).json({ message: 'multipart uploads are not enabled on this server (multer missing)' })
  })
}

module.exports = router

let s3client = null
let PutObjectCommand = null

function initS3Client(){
  if (s3client !== null || !process.env.S3_BUCKET) return
  try {
    const sdk = require('@aws-sdk/client-s3')
    const S3Client = sdk.S3Client || sdk.default || sdk
    PutObjectCommand = sdk.PutObjectCommand
    const opts = {}
    if (process.env.AWS_REGION) opts.region = process.env.AWS_REGION
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      opts.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
      if (process.env.AWS_SESSION_TOKEN) opts.credentials.sessionToken = process.env.AWS_SESSION_TOKEN
    }
    if (S3Client) s3client = new S3Client(opts)
  } catch (e) {
    s3client = null
    PutObjectCommand = null
  }
}

async function uploadToS3Buffer(buffer, key, contentType){
  initS3Client()
  if(!s3client || !PutObjectCommand) throw new Error('S3 not configured or SDK missing')
  try{
    const cmd = new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: buffer, ContentType: contentType, ACL: 'public-read' })
    await s3client.send(cmd)
    const base = process.env.S3_BASE_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`
    return `${base.replace(/\/$/, '')}/${key}`
  }catch(e){
    const msg = e && e.message ? e.message : String(e)
    throw new Error('S3 upload failed: '+msg)
  }
}

module.exports.uploadToS3Buffer = uploadToS3Buffer
