'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminTeacherDetail } from '@/lib/hooks/useAdmin';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { isTeacherVerified } from '@/lib/utils/verification';
import { DocumentType } from '@/types';

const ORDERED_DOCUMENT_TYPES: DocumentType[] = [
  'selfie',
  'id_document',
  'cv',
  'qualification',
  'criminal_record',
];
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  ChevronLeft,
  Edit,
  Save,
  ShieldCheck,
  User,
  FileText,
  Eye,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

function SignedDocLink({ fileUrl, children, className }: { fileUrl: string; children: React.ReactNode; className?: string }) {
  const url = useSignedUrl('documents', fileUrl);
  if (!url) return <span className={className}>{children}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

const DOC_LABELS: Record<DocumentType, string> = {
  cv: 'CV / Resume',
  qualification: 'Qualifications',
  id_document: 'ID / Passport / Driver\'s License',
  criminal_record: 'Criminal Record Check',
  selfie: 'Face Verification Selfie',
};

export default function AdminTeacherDetail() {
  const { teacherId } = useParams() as { teacherId: string };
  const { teacher, documents, loading, updateTeacher } = useAdminTeacherDetail(teacherId);
  const profilePicUrl = useSignedUrl('profile-pictures', teacher?.profilePicture);
  const verified = teacher ? isTeacherVerified(documents) : false;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    surname: '',
    description: '',
    address: '',
  });

  useEffect(() => {
    if (teacher) {
      setEditData({
        first_name: teacher.firstName || '',
        surname: teacher.surname || '',
        description: teacher.description || '',
        address: teacher.address || '',
      });
    }
  }, [teacher]);

  const handleSave = async () => {
    setSaving(true);
    await updateTeacher(teacherId, editData);
    setSaving(false);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center py-16">
            <h2 className="text-xl font-bold text-foreground mb-2">Teacher not found</h2>
            <Link href="/admin/teachers" className="text-primary hover:underline text-sm">
              Back to teachers list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="py-8 px-12">
        <div className="max-w-3xl">
          {/* Back Button */}
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to teachers
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={`${teacher.firstName} ${teacher.surname}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">
                    {teacher.firstName} {teacher.surname}
                  </h1>
                  {verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{teacher.email}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Profile: {teacher.profileCompleteness}%</span>
                  {teacher.dateOfBirth && (
                    <span>DOB: {new Date(teacher.dateOfBirth).toLocaleDateString('en-ZA')}</span>
                  )}
                  {teacher.idNumber && <span>ID: {teacher.idNumber}</span>}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  if (teacher) {
                    setEditData({
                      first_name: teacher.firstName || '',
                      surname: teacher.surname || '',
                      description: teacher.description || '',
                      address: teacher.address || '',
                    });
                  }
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          <div className="divide-y divide-border [&>*]:py-6">
          {/* Editable Fields */}
          <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                    First Name
                  </Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData.first_name}
                      onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-foreground">{teacher.firstName}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                    Surname
                  </Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData.surname}
                      onChange={(e) => setEditData({ ...editData, surname: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-foreground">{teacher.surname}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                  Address
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-foreground">{teacher.address || 'Not provided'}</p>
                )}
              </div>

              <div className="mb-4">
                <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                  Description
                </Label>
                {isEditing ? (
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-sm text-foreground">{teacher.description || 'No description provided'}</p>
                )}
              </div>

              {isEditing && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              )}
          </div>

          {/* Education & Subjects */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Education Phases
                </h2>
                {teacher.educationPhases.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {teacher.educationPhases.map((phase) => (
                      <Badge key={phase} variant="secondary" className="bg-primary/5 text-primary">
                        {phase}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No education phases specified</p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Subjects</h2>
                {Object.keys(teacher.subjects).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(teacher.subjects).map(([phase, subjects]) => (
                      <div key={phase}>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{phase}</p>
                        <div className="flex flex-wrap gap-1">
                          {subjects.map((subject) => (
                            <Badge key={subject} variant="outline" className="bg-muted text-muted-foreground border-border">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No subjects specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Extra-curricular */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Sports</h2>
                {Object.keys(teacher.sports).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(teacher.sports).map(([phase, items]) => (
                      <div key={phase}>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{phase}</p>
                        <div className="flex flex-wrap gap-1">
                          {items.map((sport) => (
                            <Badge key={sport} variant="secondary" className="bg-green-50 text-green-700">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No sports specified</p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Arts & Culture</h2>
                {Object.keys(teacher.artsCulture).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(teacher.artsCulture).map(([phase, items]) => (
                      <div key={phase}>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{phase}</p>
                        <div className="flex flex-wrap gap-1">
                          {items.map((item) => (
                            <Badge key={item} variant="secondary" className="bg-purple-50 text-purple-700">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No arts & culture specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documents
              </h2>
              <div className="space-y-4">
                {ORDERED_DOCUMENT_TYPES.map(type => {
                  const docsOfType = documents.filter(d => d.documentType === type);
                  return (
                    <div key={type}>
                      <p className="text-sm font-bold text-foreground mb-2">{DOC_LABELS[type]}</p>
                      {docsOfType.length === 0 ? (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Not uploaded</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {docsOfType.map(doc => (
                            <div key={doc.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                              <FileText className="w-5 h-5 text-primary" />
                              <div className="flex-1 min-w-0">
                                <Badge
                                  variant="outline"
                                  className={
                                    doc.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                    doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                    'bg-red-100 text-red-700 border-red-200'
                                  }
                                >
                                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </Badge>
                                {doc.rejectionReason && (
                                  <p className="text-xs text-red-600 mt-1">Reason: {doc.rejectionReason}</p>
                                )}
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <SignedDocLink fileUrl={doc.fileUrl}>
                                  <Eye className="w-3 h-3" />
                                  View
                                </SignedDocLink>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>

          {/* Experience */}
          {teacher.experience && teacher.experience.length > 0 && (
            <div>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Experience
                </h2>
                <div className="space-y-4">
                  {teacher.experience.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-primary pl-4">
                      <p className="text-sm font-bold text-foreground">{exp.title}</p>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(exp.startDate).toLocaleDateString('en-ZA')}
                        {' - '}
                        {exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString('en-ZA')
                          : 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
            </div>
          )}

          {/* References */}
          {teacher.teacherReferences && teacher.teacherReferences.length > 0 && (
            <div>
                <h2 className="text-lg font-bold text-foreground mb-4">References</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacher.teacherReferences.map((ref, index) => (
                    <div key={index} className="border border-border p-4 rounded-lg">
                      <p className="text-sm font-medium text-foreground">{ref.name}</p>
                      <p className="text-xs text-muted-foreground">{ref.relationship}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{ref.email}</span>
                        <span>{ref.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
