import { format } from 'date-fns';

export enum DATE_FORMAT_PATTERN {
  LONG_FULL = 'dd/MM/yyyy, hh:mm:ss a',
}

export function formatDateTime(
    date: Date, 
    pattern: DATE_FORMAT_PATTERN = DATE_FORMAT_PATTERN.LONG_FULL
  ): string {
  return format(date, pattern);
}
