'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeacherProfile, useUpdateTeacher, useTeacherDocuments, useUploadDocument, useDeleteDocument } from '@/lib/hooks/useTeacher';
import { EducationPhase, SportType, ArtsCultureType, Experience, Reference, DocumentType, REQUIRED_DOCUMENT_TYPES } from '@/types';
import { getVerificationSummary } from '@/lib/utils/verification';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { subjectsByPhase } from '@/lib/data/subjects';

const SPORT_OPTIONS: SportType[] = ['Tennis', 'Rugby', 'Netball', 'Cricket', 'Table tennis', 'Soccer', 'Hockey', 'Athletics', 'Cross country', 'Other'];
const ARTS_CULTURE_OPTIONS: ArtsCultureType[] = ['Drama', 'Debate', 'Choir', 'Other'];
import { createClient } from '@/lib/supabase/client';
import { geocodeAddress } from '@/lib/utils/geocode';
import { Plus, Trash2, MapPin, Loader2, ChevronDown, User, Camera, X, FileText, ShieldCheck, Info } from 'lucide-react';
import SelfieCapture from '@/components/shared/SelfieCapture';

function SignedDocPreview({ fileUrl, fileName, onExpand }: { fileUrl: string; fileName?: string; onExpand?: (url: string) => void }) {
  const url = useSignedUrl('documents', fileUrl);
  const isImage = fileName ? /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) : /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
  const [imgError, setImgError] = useState(false);

  if (isImage && url && !imgError) {
    return (
      <img
        src={url}
        alt="Document"
        className="w-16 h-16 rounded object-cover border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onError={() => setImgError(true)}
        onClick={() => onExpand?.(url)}
      />
    );
  }

  if (isImage && !url && !imgError) {
    return (
      <div className="w-16 h-16 rounded bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
        <Loader2 size={16} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
      <FileText size={20} className="text-gray-500" />
    </div>
  );
}

const EDUCATION_PHASES: EducationPhase[] = [
  'Foundation Phase',
  'Primary',
  'Secondary',
  'Tertiary',
];

export default function TeacherSetupPage() {
  const { user } = useAuth();
  const { teacher, experiences: existingExperiences, loading, refetch: refetchTeacher } = useTeacherProfile(user?.id);
  const { updateTeacher, saving } = useUpdateTeacher();
  const { documents, refetch: refetchDocs } = useTeacherDocuments(teacher?.id);
  const { uploadDocument, uploading: uploadingDoc } = useUploadDocument();
  const { deleteDocument } = useDeleteDocument();

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [description, setDescription] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedPhases, setSelectedPhases] = useState<EducationPhase[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string[]>>({});
  const [sports, setSports] = useState<Record<string, string[]>>({});
  const [artsCulture, setArtsCulture] = useState<Record<string, string[]>>({});
  const [address, setAddress] = useState('');
  const [distanceRadius, setDistanceRadius] = useState(50);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [idNumber, setIdNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});

  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createClient());
  const [draggingPic, setDraggingPic] = useState(false);
  const [pendingPicFile, setPendingPicFile] = useState<File | null>(null);
  const [pendingPicPreview, setPendingPicPreview] = useState<string | null>(null);
  const [removedPic, setRemovedPic] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<Partial<Record<DocumentType, { file: File; preview: string; fileName: string }>>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [selfieModalOpen, setSelfieModalOpen] = useState(false);
  const [draggingDocType, setDraggingDocType] = useState<string | null>(null);

  // Extract storage path from a full URL or return as-is if already a path
  const extractPath = (value: string, bucket: string) => {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = value.indexOf(marker);
    return idx !== -1 ? value.substring(idx + marker.length) : value;
  };

  // Signed URL for the saved profile picture (from DB)
  const profilePicUrl = useSignedUrl('profile-pictures', profilePicture[0]);
  // Display URL: pending local preview takes priority over saved signed URL
  const displayPicUrl = pendingPicPreview || (removedPic ? null : profilePicUrl);
  const hasPic = pendingPicFile ? true : (!removedPic && profilePicture.length > 0);

  const handleProfilePicSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return;
    // Revoke old preview URL to avoid memory leaks
    if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
    setPendingPicFile(file);
    setPendingPicPreview(URL.createObjectURL(file));
    setRemovedPic(false);
  };

  const handleRemoveProfilePic = () => {
    if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
    setPendingPicFile(null);
    setPendingPicPreview(null);
    setRemovedPic(true);
  };

  const handleDocSelect = (type: DocumentType, file: File) => {
    // Revoke old preview if replacing
    const old = pendingDocs[type];
    if (old) URL.revokeObjectURL(old.preview);
    setPendingDocs(prev => ({
      ...prev,
      [type]: { file, preview: URL.createObjectURL(file), fileName: file.name },
    }));
  };

  const handleDocRemove = (type: DocumentType) => {
    const old = pendingDocs[type];
    if (old) URL.revokeObjectURL(old.preview);
    setPendingDocs(prev => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  };

  // Load existing data
  useEffect(() => {
    if (teacher) {
      setFirstName(teacher.firstName);
      setSurname(teacher.surname);
      setDescription(teacher.description || '');
      setDateOfBirth(teacher.dateOfBirth || '');
      setSelectedPhases(teacher.educationPhases);
      setSubjects(teacher.subjects || {});
      setSports(teacher.sports || {});
      setArtsCulture(teacher.artsCulture || {});
      setAddress(teacher.address || '');
      setDistanceRadius(teacher.distanceRadius || 50);
      setLocation(teacher.location || null);
      setIdNumber(teacher.idNumber || '');
      setProfilePicture(teacher.profilePicture ? [teacher.profilePicture] : []);
      if (teacher.teacherReferences?.length > 0) {
        setReferences([...teacher.teacherReferences]);
      }
    }
    if (existingExperiences.length > 0) {
      setExperiences(existingExperiences);
    }
  }, [teacher, existingExperiences]);

  // Track unsaved changes
  useEffect(() => {
    if (!teacher) return;
    const changed =
      firstName !== teacher.firstName ||
      surname !== teacher.surname ||
      (description || '') !== (teacher.description || '') ||
      (dateOfBirth || '') !== (teacher.dateOfBirth || '') ||
      JSON.stringify(selectedPhases) !== JSON.stringify(teacher.educationPhases) ||
      JSON.stringify(subjects) !== JSON.stringify(teacher.subjects || {}) ||
      JSON.stringify(sports) !== JSON.stringify(teacher.sports || {}) ||
      JSON.stringify(artsCulture) !== JSON.stringify(teacher.artsCulture || {}) ||
      (address || '') !== (teacher.address || '') ||
      distanceRadius !== (teacher.distanceRadius || 50) ||
      (idNumber || '') !== (teacher.idNumber || '') ||
      pendingPicFile !== null ||
      removedPic ||
      Object.keys(pendingDocs).length > 0 ||
      JSON.stringify(references) !== JSON.stringify(teacher.teacherReferences || []) ||
      JSON.stringify(experiences) !== JSON.stringify(existingExperiences);
    setHasChanges(changed);
  }, [teacher, existingExperiences, firstName, surname, description, dateOfBirth, selectedPhases, subjects, sports, artsCulture, address, distanceRadius, idNumber, pendingPicFile, removedPic, pendingDocs, references, experiences]);

  const docSummary = getVerificationSummary(documents);

  const calculateCompleteness = () => {
    const fields = [
      firstName,
      surname,
      description,
      selectedPhases.length > 0,
      Object.values(subjects).some(s => s.length > 0),
      address,
      idNumber,
      hasPic,
      // Check each required doc type has at least one upload (saved or pending)
      ...REQUIRED_DOCUMENT_TYPES.map(type =>
        documents.some(d => d.documentType === type) || !!pendingDocs[type]
      ),
      experiences.length > 0,
      references.some(r => r.name && r.email),
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const handlePhaseToggle = (phase: EducationPhase) => {
    setSelectedPhases(prev => {
      if (prev.includes(phase)) {
        const newPhases = prev.filter(p => p !== phase);
        // Remove subjects/sports/artsCulture for deselected phase
        const newSubjects = { ...subjects };
        delete newSubjects[phase];
        setSubjects(newSubjects);
        const newSports = { ...sports };
        delete newSports[phase];
        setSports(newSports);
        const newArts = { ...artsCulture };
        delete newArts[phase];
        setArtsCulture(newArts);
        return newPhases;
      }
      return [...prev, phase];
    });
  };

  const handleSubjectToggle = (phase: string, subject: string) => {
    setSubjects(prev => {
      const phaseSubjects = prev[phase] || [];
      if (phaseSubjects.includes(subject)) {
        return { ...prev, [phase]: phaseSubjects.filter(s => s !== subject) };
      }
      return { ...prev, [phase]: [...phaseSubjects, subject] };
    });
  };

  const handleSportToggle = (phase: string, sport: string) => {
    setSports(prev => {
      const phaseSports = prev[phase] || [];
      if (phaseSports.includes(sport)) {
        return { ...prev, [phase]: phaseSports.filter(s => s !== sport) };
      }
      return { ...prev, [phase]: [...phaseSports, sport] };
    });
  };

  const handleArtsCultureToggle = (phase: string, item: string) => {
    setArtsCulture(prev => {
      const phaseArts = prev[phase] || [];
      if (phaseArts.includes(item)) {
        return { ...prev, [phase]: phaseArts.filter(s => s !== item) };
      }
      return { ...prev, [phase]: [...phaseArts, item] };
    });
  };

  const handleGeocode = async () => {
    if (!address) return;
    setGeocoding(true);
    const result = await geocodeAddress(address);
    if (result) {
      setLocation(result);
    }
    setGeocoding(false);
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, {
      id: `exp-${Date.now()}`,
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setExperiences(prev => prev.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    ));
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    setReferences(prev => prev.map((ref, i) =>
      i === index ? { ...ref, [field]: value } : ref
    ));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!teacher) return;

    let picPath = profilePicture[0] || null;

    // Handle profile picture removal
    if (removedPic && profilePicture[0]) {
      const oldPath = extractPath(profilePicture[0], 'profile-pictures');
      await supabaseRef.current.storage.from('profile-pictures').remove([oldPath]);
      picPath = null;
    }

    // Handle new profile picture upload
    if (pendingPicFile) {
      // Delete old picture from storage if replacing
      if (profilePicture[0]) {
        const oldPath = extractPath(profilePicture[0], 'profile-pictures');
        await supabaseRef.current.storage.from('profile-pictures').remove([oldPath]);
      }
      const ext = pendingPicFile.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${user?.id}/${fileName}`;
      const { error } = await supabaseRef.current.storage
        .from('profile-pictures')
        .upload(filePath, pendingPicFile);
      if (!error) {
        picPath = filePath;
      }
    }

    const updates = {
      first_name: firstName,
      surname: surname,
      description: description || null,
      date_of_birth: dateOfBirth || null,
      education_phases: selectedPhases,
      subjects: subjects,
      sports: sports,
      arts_culture: artsCulture,
      address: address || null,
      location: location,
      distance_radius: distanceRadius,
      id_number: idNumber || null,
      profile_picture: picPath,
      teacher_references: references.filter(r => r.name || r.email),
      profile_completeness: completeness,
    };

    const success = await updateTeacher(teacher.id, updates, experiences.filter(e => e.title));
    if (!success) return;

    // Upload pending documents to storage + insert rows
    for (const [docType, pending] of Object.entries(pendingDocs)) {
      const ext = pending.file.name.split('.').pop();
      const fileName = `${docType}-${Date.now()}.${ext}`;
      const filePath = `${user?.id}/${fileName}`;
      const { error: uploadErr } = await supabaseRef.current.storage
        .from('documents')
        .upload(filePath, pending.file);
      if (!uploadErr) {
        await uploadDocument(teacher.id, docType as DocumentType, filePath, pending.fileName);
      }
    }

    // Clean up pending state
    if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
    Object.values(pendingDocs).forEach(p => URL.revokeObjectURL(p.preview));
    setPendingPicFile(null);
    setPendingPicPreview(null);
    setRemovedPic(false);
    setPendingDocs({});
    setSaved(true);
    setHasChanges(false);
    refetchTeacher();
    refetchDocs();
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Profile Setup</h1>
            <p className="text-gray-600">Complete your profile to start applying for jobs</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white border border-gray-300 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">Profile Completeness</span>
              <span className="text-sm font-bold text-[#2563eb]">{completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3">
              <div
                className="bg-[#2563eb] h-3 transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">Profile saved successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Profile Picture */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-[#1c1d1f] mb-4">Profile Picture</h2>
              <div
                className={`flex items-center gap-6 p-4 rounded-lg border-2 border-dashed transition-colors ${
                  draggingPic ? 'border-[#2563eb] bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDraggingPic(true); }}
                onDragLeave={() => setDraggingPic(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggingPic(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
                    handleProfilePicSelect(file);
                  }
                }}
              >
                <div className="relative shrink-0">
                  {hasPic ? (
                    <div className="relative">
                      {displayPicUrl ? (
                        <img
                          src={displayPicUrl}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveProfilePic}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <User size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => profilePicInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded hover:bg-[#1d4ed8] transition-colors"
                  >
                    <Camera size={16} />
                    {hasPic ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Drag & drop or click to upload. JPG or PNG, max 5MB</p>
                </div>
                <input
                  ref={profilePicInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProfilePicSelect(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            {/* Section 2: Personal Information */}
            <div className="bg-white border border-gray-300 p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#1c1d1f]">Personal Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1c1d1f] mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1c1d1f] mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">
                  Short Description (up to 500 words)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={3000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                  placeholder="Tell schools about yourself, your teaching philosophy, and experience..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {description.split(/\s+/).filter(Boolean).length}/500 words
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1c1d1f] mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1c1d1f] mb-2">ID Number</label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                    placeholder="South African ID number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1c1d1f] mb-2">Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                    placeholder="Street, City, Province, Postal Code"
                  />
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding || !address}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {geocoding ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                    Geocode
                    <span className="relative group">
                      <Info size={14} className="text-gray-400 cursor-help" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1c1d1f] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                        Converts your address into map coordinates for distance matching
                      </span>
                    </span>
                  </button>
                </div>
                {location && (
                  <p className="mt-1 text-xs text-green-600">
                    Location set: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[#1c1d1f] mb-2">
                  Distance Radius: {distanceRadius}km
                  <span className="relative group">
                    <Info size={14} className="text-gray-400 cursor-help" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1c1d1f] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                      Maximum distance you&apos;re willing to travel to a school
                    </span>
                  </span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={distanceRadius}
                  onChange={(e) => setDistanceRadius(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5km</span>
                  <span>200km</span>
                </div>
              </div>
            </div>

            {/* Section 3: Education Phases */}
            <div className="bg-white border border-gray-300 p-6 space-y-3">
              <h2 className="text-lg font-bold text-[#1c1d1f]">Education Phases *</h2>
              <p className="text-sm text-gray-600">Select the phases you teach, then choose your subjects, sports, and arts &amp; culture for each.</p>

              {EDUCATION_PHASES.map(phase => {
                const isSelected = selectedPhases.includes(phase);
                const isOpen = openPhases[phase] || false;
                const categories = subjectsByPhase[phase] || [];
                const academicCat = categories.find(c => c.category === 'Academic');
                const coachingCat = categories.find(c => c.category === 'Coaching');
                const artsCat = categories.find(c => c.category === 'Arts & Culture');
                const selectedCount =
                  (subjects[phase]?.length || 0) +
                  (sports[phase]?.length || 0) +
                  (artsCulture[phase]?.length || 0);

                return (
                  <div key={phase} className={`border-2 rounded-lg overflow-hidden transition-colors ${isSelected ? 'border-[#2563eb]' : 'border-gray-300'}`}>
                    {/* Phase header */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!isSelected) {
                          handlePhaseToggle(phase);
                          setOpenPhases(prev => ({ ...prev, [phase]: true }));
                        } else {
                          setOpenPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
                        }
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                      className={`w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-[#2563eb] border-[#2563eb]' : 'border-gray-400'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#1c1d1f]">{phase}</span>
                        {isSelected && selectedCount > 0 && (
                          <span className="text-xs text-[#2563eb] bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                            {selectedCount} selected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePhaseToggle(phase);
                              setOpenPhases(prev => ({ ...prev, [phase]: false }));
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                          >
                            Remove
                          </button>
                        )}
                        {isSelected && (
                          <ChevronDown
                            size={18}
                            className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Dropdown content */}
                    {isSelected && isOpen && (
                      <div className="border-t border-gray-200 p-4 space-y-5 bg-white">
                        {/* Subjects */}
                        {academicCat && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Subjects</p>
                            <div className="flex flex-wrap gap-2">
                              {academicCat.subjects.map(subject => {
                                const isSubSelected = (subjects[phase] || []).includes(subject);
                                return (
                                  <button
                                    key={subject}
                                    type="button"
                                    onClick={() => handleSubjectToggle(phase, subject)}
                                    className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${
                                      isSubSelected
                                        ? 'bg-[#1c1d1f] text-white border-[#1c1d1f]'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {subject}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Sports */}
                        {coachingCat && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sports / Coaching</p>
                            <div className="flex flex-wrap gap-2">
                              {coachingCat.subjects.map(sport => {
                                const isSportSelected = (sports[phase] || []).includes(sport);
                                return (
                                  <button
                                    key={sport}
                                    type="button"
                                    onClick={() => handleSportToggle(phase, sport)}
                                    className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${
                                      isSportSelected
                                        ? 'bg-green-700 text-white border-green-700'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {sport}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Arts & Culture */}
                        {artsCat && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Arts &amp; Culture</p>
                            <div className="flex flex-wrap gap-2">
                              {artsCat.subjects.map(item => {
                                const isArtSelected = (artsCulture[phase] || []).includes(item);
                                return (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => handleArtsCultureToggle(phase, item)}
                                    className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${
                                      isArtSelected
                                        ? 'bg-purple-700 text-white border-purple-700'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {item}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Section 4: Teaching Experience */}
            <div className="bg-white border border-gray-300 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1c1d1f]">Teaching Experience</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {experiences.map((exp, index) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-gray-500">Experience #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                        placeholder="e.g., Mathematics Teacher"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">School/Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                    />
                  </div>
                </div>
              ))}

              {experiences.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No experience added yet</p>
              )}
            </div>

            {/* Section 8: References */}
            <div className="bg-white border border-gray-300 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1c1d1f]">References</h2>
                <button
                  type="button"
                  onClick={() => setReferences(prev => [...prev, { name: '', relationship: '', email: '', phone: '' }])}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {references.map((ref, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-gray-500">Reference #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setReferences(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={ref.name}
                        onChange={(e) => updateReference(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={ref.relationship}
                        onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                        placeholder="e.g., Former Principal"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={ref.email}
                        onChange={(e) => updateReference(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={ref.phone}
                        onChange={(e) => updateReference(index, 'phone', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1c1d1f]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {references.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No references added yet</p>
              )}
            </div>

            {/* Section 8: Face Verification */}
            {(() => {
              const selfieSummary = docSummary.find(d => d.type === 'selfie');
              const selfieDocsOfType = documents.filter(d => d.documentType === 'selfie');
              const canUploadSelfie = selfieSummary && !selfieSummary.hasApproved && !selfieSummary.hasPending;

              return (
                <div className="bg-white border border-gray-300 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={22} className="text-[#2563eb]" />
                    <div>
                      <h2 className="text-lg font-bold text-[#1c1d1f]">Face Verification</h2>
                      <p className="text-sm text-gray-600">Take a live photo using your device camera to verify your identity</p>
                    </div>
                    {selfieSummary?.hasApproved && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">Approved</span>
                    )}
                    {selfieSummary && !selfieSummary.hasApproved && selfieSummary.hasPending && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">Pending Review</span>
                    )}
                    {selfieSummary && !selfieSummary.hasApproved && !selfieSummary.hasPending && selfieSummary.latestRejection && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full">Rejected</span>
                    )}
                    {selfieSummary && !selfieSummary.latest && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold text-gray-500 bg-gray-100 rounded-full">Not submitted</span>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {selfieSummary?.latestRejection?.rejectionReason && !selfieSummary.hasApproved && !selfieSummary.hasPending && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <span className="font-medium">Reason: </span>{selfieSummary.latestRejection.rejectionReason}
                    </div>
                  )}

                  {/* Existing selfie docs */}
                  {selfieDocsOfType.length > 0 && (
                    <div className="space-y-1">
                      {selfieDocsOfType.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                          <SignedDocPreview fileUrl={doc.fileUrl} fileName={doc.fileName} onExpand={setLightboxUrl} />
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            doc.status === 'approved' ? 'bg-green-500' :
                            doc.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-500 flex-1">
                            {new Date(doc.createdAt).toLocaleDateString('en-ZA')}
                          </span>
                          {doc.status === 'pending' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteDocument(doc.id);
                                refetchDocs();
                              }}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pending selfie preview */}
                  {pendingDocs.selfie && (
                    <div className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-200 rounded">
                      <img
                        src={pendingDocs.selfie.preview}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setLightboxUrl(pendingDocs.selfie?.preview ?? null)}
                      />
                      <span className="text-xs text-blue-600 font-medium flex-1">Unsaved</span>
                      <button
                        type="button"
                        onClick={() => handleDocRemove('selfie')}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Start button */}
                  {canUploadSelfie && !pendingDocs.selfie && (
                    <button
                      type="button"
                      onClick={() => setSelfieModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors w-fit"
                    >
                      <Camera size={18} />
                      Start Face Verification
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Section 9: Documents */}
            <div className="bg-white border border-gray-300 p-6 space-y-6">
              <h2 className="text-lg font-bold text-[#1c1d1f]">Documents</h2>
              <p className="text-sm text-gray-600">
                Upload the required documents below. Each document will be reviewed by an admin before your profile is verified.
              </p>

              {docSummary.filter(d => d.type !== 'selfie').map(({ type, hasApproved, hasPending, latestRejection, latest }) => {
                const labels: Record<string, { label: string; accept: string; description: string }> = {
                  cv: { label: 'CV', accept: '.pdf,.doc,.docx', description: 'Your curriculum vitae' },
                  qualification: { label: 'Qualifications', accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png', description: 'Degrees, diplomas, certificates' },
                  id_document: { label: 'ID / Passport / Driver\'s License', accept: '.pdf,.jpg,.jpeg,.png', description: 'Government-issued identification' },
                  criminal_record: { label: 'Criminal Record Check', accept: '.pdf', description: 'Police clearance certificate' },
                };
                const config = labels[type];
                if (!config) return null;
                const canUpload = !hasApproved && !hasPending;
                const docsOfType = documents.filter(d => d.documentType === type);

                const isDraggingOver = draggingDocType === type;

                return (
                  <div
                    key={type}
                    className={`border-2 rounded-lg p-4 transition-colors ${
                      isDraggingOver ? 'border-[#2563eb] bg-blue-50' : 'border-gray-200'
                    }`}
                    onDragOver={(e) => {
                      if (!canUpload || pendingDocs[type]) return;
                      e.preventDefault();
                      setDraggingDocType(type);
                    }}
                    onDragLeave={() => setDraggingDocType(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDraggingDocType(null);
                      if (!canUpload || pendingDocs[type]) return;
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleDocSelect(type as DocumentType, file);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#1c1d1f]">{config.label}</h3>
                        <p className="text-xs text-gray-500">{config.description}</p>
                      </div>
                      {hasApproved && (
                        <span className="px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">Approved</span>
                      )}
                      {!hasApproved && hasPending && (
                        <span className="px-2 py-0.5 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">Pending Review</span>
                      )}
                      {!hasApproved && !hasPending && latestRejection && (
                        <span className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full">Rejected</span>
                      )}
                      {!latest && (
                        <span className="px-2 py-0.5 text-xs font-bold text-gray-500 bg-gray-100 rounded-full">Not uploaded</span>
                      )}
                    </div>

                    {/* Show rejection reason */}
                    {latestRejection?.rejectionReason && !hasApproved && !hasPending && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <span className="font-medium">Reason: </span>{latestRejection.rejectionReason}
                      </div>
                    )}

                    {/* Existing documents */}
                    {docsOfType.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {docsOfType.map(doc => (
                          <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                            <SignedDocPreview fileUrl={doc.fileUrl} fileName={doc.fileName} onExpand={setLightboxUrl} />
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              doc.status === 'approved' ? 'bg-green-500' :
                              doc.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="text-xs text-gray-500 flex-1">
                              {new Date(doc.createdAt).toLocaleDateString('en-ZA')}
                            </span>
                            {doc.status === 'pending' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteDocument(doc.id);
                                  refetchDocs();
                                }}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending file preview */}
                    {pendingDocs[type] && (
                      <div className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-200 rounded mb-3">
                        {pendingDocs[type].file.type.startsWith('image/') ? (
                          <img
                            src={pendingDocs[type].preview}
                            alt="Preview"
                            className="w-16 h-16 rounded object-cover border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setLightboxUrl(pendingDocs[type]?.preview ?? null)}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <FileText size={20} className="text-gray-500" />
                          </div>
                        )}
                        <span className="text-xs text-blue-600 font-medium flex-1">Unsaved</span>
                        <button
                          type="button"
                          onClick={() => handleDocRemove(type)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* Upload button */}
                    {canUpload && !pendingDocs[type] && (
                      <label className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors cursor-pointer w-full justify-center ${
                        isDraggingOver ? 'border-[#2563eb] bg-blue-100' : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <Plus size={20} className={isDraggingOver ? 'text-[#2563eb]' : 'text-gray-400'} />
                        <span className={`text-sm ${isDraggingOver ? 'text-[#2563eb] font-medium' : 'text-gray-600'}`}>
                          {isDraggingOver ? 'Drop file here' : 'Drag & drop or click to choose file'}
                        </span>
                        <input
                          type="file"
                          accept={config.accept}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocSelect(type as DocumentType, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

          </form>
        </div>
      </div>

      {/* Discord-style floating save bar */}
      <div
        className={`fixed bottom-0 left-64 right-0 z-50 transition-all duration-300 ${
          hasChanges ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex justify-center px-4 pb-4">
          <div className="w-full max-w-3xl">
          <div className="bg-[#1c1d1f] text-white rounded-lg shadow-2xl px-6 py-3 flex items-center justify-between">
            <p className="text-sm font-medium">
              Careful — you have unsaved changes!
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (teacher) {
                    setFirstName(teacher.firstName);
                    setSurname(teacher.surname);
                    setDescription(teacher.description || '');
                    setDateOfBirth(teacher.dateOfBirth || '');
                    setSelectedPhases(teacher.educationPhases);
                    setSubjects(teacher.subjects || {});
                    setSports(teacher.sports || {});
                    setArtsCulture(teacher.artsCulture || {});
                    setAddress(teacher.address || '');
                    setDistanceRadius(teacher.distanceRadius || 50);
                    setLocation(teacher.location || null);
                    setIdNumber(teacher.idNumber || '');
                    setProfilePicture(teacher.profilePicture ? [teacher.profilePicture] : []);
                    setReferences(teacher.teacherReferences?.length > 0 ? [...teacher.teacherReferences] : []);
                  }
                  if (existingExperiences.length > 0) {
                    setExperiences(existingExperiences);
                  } else {
                    setExperiences([]);
                  }
                  if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
                  setPendingPicFile(null);
                  setPendingPicPreview(null);
                  setRemovedPic(false);
                  Object.values(pendingDocs).forEach(p => URL.revokeObjectURL(p.preview));
                  setPendingDocs({});
                  setHasChanges(false);
                }}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={saving}
                className="px-4 py-1.5 bg-[#2563eb] text-white text-sm font-bold rounded hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Selfie capture modal */}
      <SelfieCapture
        open={selfieModalOpen}
        onClose={() => setSelfieModalOpen(false)}
        onCapture={(file) => {
          handleDocSelect('selfie', file);
          setSelfieModalOpen(false);
        }}
      />

      {/* Image lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
          <img
            src={lightboxUrl}
            alt="Document preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
