export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: 'teacher' | 'school' | 'admin';
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_type: 'teacher' | 'school' | 'admin';
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_type?: 'teacher' | 'school' | 'admin';
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          surname: string;
          email: string;
          description: string | null;
          profile_picture: string | null;
          education_phases: string[];
          subjects: Json;
          address: string | null;
          location: Json | null;
          distance_radius: number;
          date_of_birth: string | null;
          id_number: string | null;
          sports: Json;
          arts_culture: Json;
          teacher_references: Json | null;
          profile_completeness: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          surname: string;
          email: string;
          description?: string | null;
          profile_picture?: string | null;
          education_phases?: string[];
          subjects?: Json;
          address?: string | null;
          location?: Json | null;
          distance_radius?: number;
          date_of_birth?: string | null;
          id_number?: string | null;
          sports?: Json;
          arts_culture?: Json;
          teacher_references?: Json | null;
          profile_completeness?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          surname?: string;
          email?: string;
          description?: string | null;
          profile_picture?: string | null;
          education_phases?: string[];
          subjects?: Json;
          address?: string | null;
          location?: Json | null;
          distance_radius?: number;
          date_of_birth?: string | null;
          id_number?: string | null;
          sports?: Json;
          arts_culture?: Json;
          teacher_references?: Json | null;
          profile_completeness?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      teacher_experiences: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          company: string;
          start_date: string;
          end_date: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          company: string;
          start_date: string;
          end_date?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          title?: string;
          company?: string;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      schools: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          description: string | null;
          profile_picture: string | null;
          emis_number: string | null;
          district: string | null;
          school_type: string | null;
          ownership_type: string | null;
          education_district: string | null;
          curriculum: string | null;
          address: string | null;
          location: Json | null;
          registration_certificate: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          description?: string | null;
          profile_picture?: string | null;
          emis_number?: string | null;
          district?: string | null;
          school_type?: string | null;
          ownership_type?: string | null;
          education_district?: string | null;
          curriculum?: string | null;
          address?: string | null;
          location?: Json | null;
          registration_certificate?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          description?: string | null;
          profile_picture?: string | null;
          emis_number?: string | null;
          district?: string | null;
          school_type?: string | null;
          ownership_type?: string | null;
          education_district?: string | null;
          curriculum?: string | null;
          address?: string | null;
          location?: Json | null;
          registration_certificate?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          school_id: string;
          title: string;
          description: string;
          subject: string;
          start_date: string;
          end_date: string;
          application_deadline: string;
          required_qualifications: string;
          education_phase: string;
          job_type: 'Permanent' | 'Temporary' | 'Invigilator' | 'Coach';
          progress: 'Open' | 'Interviewing' | 'Hired';
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          title: string;
          description: string;
          subject: string;
          start_date: string;
          end_date: string;
          application_deadline: string;
          required_qualifications: string;
          education_phase: string;
          job_type?: 'Permanent' | 'Temporary' | 'Invigilator' | 'Coach';
          progress?: 'Open' | 'Interviewing' | 'Hired';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          title?: string;
          description?: string;
          subject?: string;
          start_date?: string;
          end_date?: string;
          application_deadline?: string;
          required_qualifications?: string;
          education_phase?: string;
          job_type?: 'Permanent' | 'Temporary' | 'Invigilator' | 'Coach';
          progress?: 'Open' | 'Interviewing' | 'Hired';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          teacher_id: string;
          status: 'Applied' | 'In Progress' | 'Hired' | 'Closed';
          shortlisted: boolean;
          applied_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          teacher_id: string;
          status?: 'Applied' | 'In Progress' | 'Hired' | 'Closed';
          shortlisted?: boolean;
          applied_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          teacher_id?: string;
          status?: 'Applied' | 'In Progress' | 'Hired' | 'Closed';
          shortlisted?: boolean;
          applied_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          from_type: 'teacher' | 'school';
          comment: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          from_type: 'teacher' | 'school';
          comment: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_user_id?: string;
          from_type?: 'teacher' | 'school';
          comment?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
      };
      teacher_documents: {
        Row: {
          id: string;
          teacher_id: string;
          document_type: string;
          file_url: string;
          file_name: string | null;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          document_type: string;
          file_url: string;
          file_name?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          document_type?: string;
          file_url?: string;
          file_name?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
      };
    };
    Enums: {
      user_type: 'teacher' | 'school' | 'admin';
      school_type: 'Primary' | 'Secondary' | 'Pre-primary' | 'Combined';
      ownership_type: 'Public' | 'Private';
      curriculum_type: 'CAPS' | 'Cambridge' | 'IEB' | 'Other';
      job_type: 'Permanent' | 'Temporary' | 'Invigilator' | 'Coach';
      job_progress: 'Open' | 'Interviewing' | 'Hired';
      application_status: 'Applied' | 'In Progress' | 'Hired' | 'Closed';
      testimonial_status: 'pending' | 'approved' | 'rejected';
    };
  };
};
