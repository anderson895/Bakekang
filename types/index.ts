export type RequestStatus = 'pending' | 'processing' | 'ready' | 'released' | 'rejected';

export type DocumentType =
  | 'barangay_clearance'
  | 'barangay_certificate'
  | 'certificate_of_indigency'
  | 'certificate_of_residency'
  | 'business_clearance'
  | 'first_time_jobseeker'
  | 'solo_parent'
  | 'good_moral';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  barangay_clearance: 'Barangay Clearance',
  barangay_certificate: 'Barangay Certificate',
  certificate_of_indigency: 'Certificate of Indigency',
  certificate_of_residency: 'Certificate of Residency',
  business_clearance: 'Business Clearance',
  first_time_jobseeker: 'First Time Jobseeker Certificate',
  solo_parent: 'Solo Parent Certificate',
  good_moral: 'Certificate of Good Moral Character',
};

export const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  ready: { label: 'Ready for Release', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  released: { label: 'Released', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export interface Resident {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  address: string;
  contact_number: string;
  email?: string;
  purok?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRequest {
  id: string;
  control_number: string;
  resident_id: string;
  document_type: DocumentType;
  purpose: string;
  status: RequestStatus;
  priority: boolean;
  notes?: string;
  processed_by?: string;
  processed_at?: string;
  released_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  residents?: Resident;
  uploaded_documents?: UploadedDocument[];
}

export interface UploadedDocument {
  id: string;
  request_id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  file_name: string;
  file_type: string;
  uploaded_by?: string;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  full_name: string;
  role: 'captain' | 'secretary' | 'staff';
  avatar_cloudinary_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

// Form types
export interface RequestFormData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  address: string;
  purok?: string;
  contact_number: string;
  email?: string;
  document_type: DocumentType;
  purpose: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  processing: number;
  ready: number;
  released: number;
  rejected: number;
  today: number;
}
