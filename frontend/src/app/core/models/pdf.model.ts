export interface Pdf {
  id: string;
  fileName: string;
  fileSize: string;
  description?: string;
  tags?: string[];
  courseId?: string;
  uploadDate: Date;
  lastAccessed?: Date;
}

export interface UploadPdfDto {
  courseId?: string;
  fileName?: string;
  description?: string;
  tags?: string[];
}

export interface UpdatePdfDto {
  fileName?: string;
  description?: string;
  tags?: string[];
}
