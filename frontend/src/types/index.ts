export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  college: string;
  stream: string;
  year: string;
  profilePicture?: string;
  bio: string;
  reputation: number;
  uploadedResources: string[];
  bookmarkedResources: string[];
  isVerified: boolean;
  role: 'student' | 'moderator' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'notes' | 'book' | 'blog' | 'recommendation' | 'project' | 'assignment' | 'research_paper';
  category: string;
  subject: string;
  semester: string;
  tags: string[];
  author: User;
  files: FileData[];
  externalLinks: ExternalLink[];
  content: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  votes: {
    upvotes: number;
    downvotes: number;
    score: number;
  };
  views: number;
  downloads: number;
  bookmarks: number;
  comments: Comment[];
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileData {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadDate: string;
}

export interface ExternalLink {
  title: string;
  url: string;
  description: string;
}

export interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  college: string;
  stream: string;
  year: string;
}

export interface ResourceFormData {
  title: string;
  description: string;
  type: Resource['type'];
  category: string;
  subject: string;
  semester: string;
  difficulty: Resource['difficulty'];
  tags: string[];
  content?: string;
  externalLinks?: ExternalLink[];
  files?: File[];
}

export interface ResourceFilters {
  category?: string;
  type?: string;
  semester?: string;
  difficulty?: string;
  search?: string;
  sortBy?: 'createdAt' | 'votes.score' | 'views' | 'downloads';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResources: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ResourcesResponse {
  resources: Resource[];
  pagination: PaginationInfo;
}

export const STREAMS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Biomedical Engineering',
  'Industrial Engineering',
  'Other'
] as const;

export const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduate'
] as const;

export const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
  'All Semesters'
] as const;

export const CATEGORIES = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Biomedical Engineering',
  'Industrial Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'General Engineering',
  'Other'
] as const;

export const RESOURCE_TYPES = [
  'notes',
  'book',
  'blog',
  'recommendation',
  'project',
  'assignment',
  'research_paper'
] as const;
