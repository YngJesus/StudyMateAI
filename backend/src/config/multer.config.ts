import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';

export const pdfStorage = diskStorage({
  destination: (req: Request, file, cb) => {
    // Use a temporary location that doesn't require user context
    const uploadPath = path.join('uploads', 'pdfs', 'temp');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuid()}${ext}`;
    cb(null, uniqueName);
  },
});
