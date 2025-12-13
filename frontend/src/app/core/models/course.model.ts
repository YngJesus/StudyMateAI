export interface Course {
  id: string;
  name: string;
  description?: string;
  orderNumber: number;
  subjectId: string;
  createdAt: Date;
  lastStudied?: Date;
}

export interface CreateCourseDto {
  name: string;
  description?: string;
  orderNumber?: number;
  subjectId: string;
  lastStudied?: string;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}
