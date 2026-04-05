-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Document request status enum
CREATE TYPE request_status AS ENUM (
  'pending',
  'processing',
  'ready',
  'released',
  'rejected'
);

-- Document type enum
CREATE TYPE document_type AS ENUM (
  'barangay_clearance',
  'barangay_certificate',
  'certificate_of_indigency',
  'certificate_of_residency',
  'business_clearance',
  'first_time_jobseeker',
  'solo_parent',
  'good_moral'
);

-- Residents table
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  date_of_birth DATE,
  address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  purok TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document requests table
CREATE TABLE document_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  control_number TEXT UNIQUE NOT NULL DEFAULT '',
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  purpose TEXT NOT NULL,
  status request_status DEFAULT 'pending',
  priority BOOLEAN DEFAULT FALSE,
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded documents (Cloudinary)
CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin profiles (linked to auth.users)
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  avatar_cloudinary_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to generate control number
CREATE OR REPLACE FUNCTION generate_control_number()
RETURNS TEXT AS $$
DECLARE
  yr TEXT := TO_CHAR(NOW(), 'YYYY');
  seq INT;
  ctrl TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(control_number FROM 10) AS INT)
  ), 0) + 1
  INTO seq
  FROM document_requests
  WHERE control_number LIKE 'BKK-' || yr || '-%';

  ctrl := 'BKK-' || yr || '-' || LPAD(seq::TEXT, 5, '0');
  RETURN ctrl;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate control number
CREATE OR REPLACE FUNCTION set_control_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.control_number IS NULL OR NEW.control_number = '' THEN
    NEW.control_number := generate_control_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_control_number
  BEFORE INSERT ON document_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_control_number();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_residents_updated_at
  BEFORE UPDATE ON residents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_requests_updated_at
  BEFORE UPDATE ON document_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Public can insert residents and document requests (for submission)
CREATE POLICY "Public can insert residents"
  ON residents FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can view residents"
  ON residents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can update residents"
  ON residents FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Public can insert document requests"
  ON document_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public can view requests"
  ON document_requests FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can update document requests"
  ON document_requests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can view uploaded documents"
  ON uploaded_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert uploaded documents"
  ON uploaded_documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can view admin profiles"
  ON admin_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can update own profile"
  ON admin_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated can insert logs"
  ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can view logs"
  ON activity_logs FOR SELECT TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX idx_document_requests_status ON document_requests(status);
CREATE INDEX idx_document_requests_control_number ON document_requests(control_number);
CREATE INDEX idx_document_requests_resident_id ON document_requests(resident_id);
CREATE INDEX idx_document_requests_created_at ON document_requests(created_at DESC);
CREATE INDEX idx_uploaded_documents_request_id ON uploaded_documents(request_id);
