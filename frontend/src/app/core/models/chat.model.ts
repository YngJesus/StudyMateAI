export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  message: string; // user's message
  response: string; // AI's response
  pdfFileId: string | null;
  pdfFileName: string | null;
  createdAt: Date;
}

export interface CreateSessionDto {
  title?: string;
}

export interface RenameSessionDto {
  title: string;
}

export interface SendMessageDto {
  message: string;
  pdfFileId?: string;
}
