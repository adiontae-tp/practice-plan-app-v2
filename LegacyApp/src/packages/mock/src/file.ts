export type FileCategory = 'document' | 'image' | 'spreadsheet' | 'video' | 'audio' | 'archive' | 'other';

export interface MockFile {
  id: string;
  name: string;
  category: FileCategory;
  uploadedBy: string;
  date: number;
  size: number; // in bytes
  description?: string;
}

export const mockFiles: MockFile[] = [
  {
    id: 'file-001',
    name: 'Practice Playbook.pdf',
    category: 'document',
    uploadedBy: 'John S.',
    date: Date.now() - 12 * 24 * 60 * 60 * 1000, // 12 days ago
    size: 2.4 * 1024 * 1024, // 2.4 MB
    description: 'Main playbook for the season',
  },
  {
    id: 'file-002',
    name: 'Team Photo.jpg',
    category: 'image',
    uploadedBy: 'Jane D.',
    date: Date.now() - 17 * 24 * 60 * 60 * 1000, // 17 days ago
    size: 1.2 * 1024 * 1024, // 1.2 MB
  },
  {
    id: 'file-003',
    name: 'Training Schedule.docx',
    category: 'document',
    uploadedBy: 'John S.',
    date: Date.now() - 19 * 24 * 60 * 60 * 1000, // 19 days ago
    size: 156 * 1024, // 156 KB
    description: 'Weekly training schedule',
  },
  {
    id: 'file-004',
    name: 'Player Stats.xlsx',
    category: 'spreadsheet',
    uploadedBy: 'Mike J.',
    date: Date.now() - 22 * 24 * 60 * 60 * 1000, // 22 days ago
    size: 89 * 1024, // 89 KB
    description: 'Season player statistics',
  },
  {
    id: 'file-005',
    name: 'Game Highlights.mp4',
    category: 'video',
    uploadedBy: 'Jane D.',
    date: Date.now() - 26 * 24 * 60 * 60 * 1000, // 26 days ago
    size: 45.6 * 1024 * 1024, // 45.6 MB
    description: 'Highlights from last game',
  },
];
