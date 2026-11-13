import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
const storage=multer.diskStorage({destination:'uploads/',filename:(req,file,cb)=>cb(null,`${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname).toLowerCase()}`)});
const fileFilter=(req,file,cb)=>['image/jpeg','image/png','image/webp'].includes(file.mimetype)?cb(null,true):cb(new Error('Only JPEG, PNG and WebP images are allowed'));
export const listingImageUpload=multer({storage,fileFilter,limits:{fileSize:5*1024*1024}});
