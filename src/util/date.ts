import { format } from 'date-fns';

export enum DATE_FORMAT_PATTERN {
  DEFAULT = 'DD/MM/YYYY, HH:mm:ss a',
}

export function formatDateTime(
    date: Date, pattern: 
    DATE_FORMAT_PATTERN = DATE_FORMAT_PATTERN.DEFAULT
  ): string {
  return format(date, pattern);
}
