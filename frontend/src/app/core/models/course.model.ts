export interface Course {
  id: string;
  name: string;
  description?: string;
  orderNumber: number;
  subjectId: string;
  createdAt: Date;
  lastStudied?: Date;
}
