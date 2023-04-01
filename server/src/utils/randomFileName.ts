import { v4 as uuidv4 } from 'uuid';

export function generateUniqueFilename(prefix: string, extension: string): string {
  const uniqueId = uuidv4();
  return `${prefix}-${uniqueId}.${extension}`;
}
