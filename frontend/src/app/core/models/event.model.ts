export enum EventType {
  EXAM = 'exam',
  DS = 'ds',
  ASSIGNMENT = 'assignment',
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD format
  description?: string;
  subjectId: string;
  subject?: {
    id: string;
    name: string;
    color: string;
  };
  daysUntil?: number;
  isPast?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDto {
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD format
  description?: string;
  subjectId: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}
