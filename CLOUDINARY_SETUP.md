# Cloudinary Setup Instructions

## 🌤️ Setting up Cloudinary for File Storage

### 1. Create a Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials
1. After logging in, go to your Dashboard
2. You'll see your account details:
   - **Cloud name**: Your unique cloud name
   - **API Key**: Your API key
   - **API Secret**: Your API secret (keep this private!)

### 3. Configure Backend Environment
✅ **COMPLETED** - Your backend is configured with Cloudinary credentials:

```env
# Cloudinary Configuration (CONFIGURED)
CLOUDINARY_CLOUD_NAME=dbrc1s7sw
CLOUDINARY_API_KEY=326858653991146
CLOUDINARY_API_SECRET=fx9iCUbHOcpiUA5VZsnGk8lab8U
```

### 4. Features Included

✅ **Automatic File Upload**: Files are uploaded directly to Cloudinary
✅ **CDN Delivery**: Fast global content delivery
✅ **File Transformation**: Automatic image optimization
✅ **Multiple Formats**: Support for PDF, DOC, images, etc.
✅ **Secure Storage**: Files stored securely in the cloud
✅ **Easy Management**: Delete files when resources are deleted

### 5. Benefits

- **No Local Storage**: Files don't consume server disk space
- **Scalability**: Handle unlimited file uploads
- **Performance**: Fast CDN delivery worldwide
- **Reliability**: 99.9% uptime guarantee
- **Security**: Built-in security features

### 6. Testing

1. Register/login to the application
2. Go to Upload Resource page
3. Fill the form and upload files
4. Files will be stored in Cloudinary under `educate/resources/` folder
5. Download links will point directly to Cloudinary URLs

### 7. Free Tier Limits

- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations per month

This is more than enough for educational platforms!

## 📁 File Organization

Files are organized in Cloudinary as:
```
educate/
└── resources/
    ├── files-timestamp-random.pdf
    ├── files-timestamp-random.docx
    └── files-timestamp-random.jpg
```

## 🔧 Troubleshooting

**Issue**: Files not uploading
**Solution**: Check your Cloudinary credentials in `.env`

**Issue**: Download not working  
**Solution**: Ensure files have valid Cloudinary URLs

**Issue**: "Invalid file type"
**Solution**: Check file extension is supported (PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, JPG, PNG, GIF)
