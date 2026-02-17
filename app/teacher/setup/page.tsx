"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { teacherSidebarLinks } from "@/components/shared/Sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import {
  useTeacherProfile,
  useUpdateTeacher,
  useTeacherDocuments,
  useUploadDocument,
  useDeleteDocument,
} from "@/lib/hooks/useTeacher";
import {
  EducationPhase,
  SportType,
  ArtsCultureType,
  Experience,
  Reference,
  DocumentType,
  REQUIRED_DOCUMENT_TYPES,
} from "@/types";
import { getVerificationSummary } from "@/lib/utils/verification";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import { subjectsByPhase } from "@/lib/data/subjects";

const SPORT_OPTIONS: SportType[] = [
  "Tennis",
  "Rugby",
  "Netball",
  "Cricket",
  "Table tennis",
  "Soccer",
  "Hockey",
  "Athletics",
  "Cross country",
  "Other",
];
const ARTS_CULTURE_OPTIONS: ArtsCultureType[] = [
  "Drama",
  "Debate",
  "Choir",
  "Other",
];
import { createClient } from "@/lib/supabase/client";
import AddressAutocomplete from "@/components/shared/AddressAutocomplete";
import {
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  User,
  Camera,
  X,
  FileText,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SelfieCapture from "@/components/shared/SelfieCapture";
import dynamic from "next/dynamic";
const ImageLightbox = dynamic(
  () => import("@/components/shared/ImageLightbox"),
  { ssr: false }
);

function SignedDocPreview({
  fileUrl,
  fileName,
  onExpand,
}: {
  fileUrl: string;
  fileName?: string;
  onExpand?: (url: string, fileName?: string) => void;
}) {
  const url = useSignedUrl("documents", fileUrl);
  const name = fileName || fileUrl || "";
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  const isPdf = /\.pdf$/i.test(name);
  const [imgError, setImgError] = useState(false);

  if (isImage && url && !imgError) {
    return (
      <img
        src={url}
        alt="Document"
        className="w-16 h-16 rounded object-cover border border-border shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onError={() => setImgError(true)}
        onClick={() => onExpand?.(url, fileName)}
      />
    );
  }

  if (isImage && !url && !imgError) {
    return (
      <div className="w-16 h-16 rounded bg-muted/50 border border-border flex items-center justify-center shrink-0">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isPdf && url) {
    return (
      <button
        type="button"
        onClick={() => onExpand?.(url, fileName || "document.pdf")}
        className="w-16 h-16 rounded bg-red-50 border border-border flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-primary transition-colors"
      >
        <FileText size={18} className="text-red-500" />
        <span className="text-[9px] text-red-600 font-medium mt-0.5">PDF</span>
      </button>
    );
  }

  if (isPdf && !url) {
    return (
      <div className="w-16 h-16 rounded bg-muted/50 border border-border flex items-center justify-center shrink-0">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded bg-muted border border-border flex items-center justify-center shrink-0">
      <FileText size={20} className="text-muted-foreground" />
    </div>
  );
}

const EDUCATION_PHASES: EducationPhase[] = [
  "Foundation Phase",
  "Primary",
  "Secondary",
  "Tertiary",
];

export default function TeacherSetupPage() {
  const { user } = useAuth();
  const {
    teacher,
    experiences: existingExperiences,
    loading,
    refetch: refetchTeacher,
  } = useTeacherProfile(user?.id);
  const { updateTeacher } = useUpdateTeacher();
  const [saving, setSaving] = useState(false);
  const { documents, refetch: refetchDocs } = useTeacherDocuments(teacher?.id);
  const { uploadDocument, uploading: uploadingDoc } = useUploadDocument();
  const { deleteDocument } = useDeleteDocument();

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [description, setDescription] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedPhases, setSelectedPhases] = useState<EducationPhase[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string[]>>({});
  const [sports, setSports] = useState<Record<string, string[]>>({});
  const [artsCulture, setArtsCulture] = useState<Record<string, string[]>>({});
  const [address, setAddress] = useState("");
  const [distanceRadius, setDistanceRadius] = useState(50);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [idNumber, setIdNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});

  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createClient());
  const [draggingPic, setDraggingPic] = useState(false);
  const [pendingPicFile, setPendingPicFile] = useState<File | null>(null);
  const [pendingPicPreview, setPendingPicPreview] = useState<string | null>(
    null
  );
  const [removedPic, setRemovedPic] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<
    Partial<
      Record<DocumentType, { file: File; preview: string; fileName: string }>
    >
  >({});
  const [lightbox, setLightbox] = useState<{
    src: string;
    fileName?: string;
  } | null>(null);
  const [selfieModalOpen, setSelfieModalOpen] = useState(false);
  const [draggingDocType, setDraggingDocType] = useState<string | null>(null);

  // Extract storage path from a full URL or return as-is if already a path
  const extractPath = (value: string, bucket: string) => {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = value.indexOf(marker);
    return idx !== -1 ? value.substring(idx + marker.length) : value;
  };

  // Signed URL for the saved profile picture (from DB)
  const profilePicUrl = useSignedUrl("profile-pictures", profilePicture[0]);
  // Display URL: pending local preview takes priority over saved signed URL
  const displayPicUrl =
    pendingPicPreview || (removedPic ? null : profilePicUrl);
  const hasPic = pendingPicFile
    ? true
    : !removedPic && profilePicture.length > 0;

  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const handleProfilePicSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setFileSizeError("Profile picture must be under 10MB");
      return;
    }
    setFileSizeError(null);
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
    if (file.size > 10 * 1024 * 1024) {
      setFileSizeError("Document must be under 10MB");
      return;
    }
    setFileSizeError(null);
    // Revoke old preview if replacing
    const old = pendingDocs[type];
    if (old) URL.revokeObjectURL(old.preview);
    setPendingDocs((prev) => ({
      ...prev,
      [type]: { file, preview: URL.createObjectURL(file), fileName: file.name },
    }));
  };

  const handleDocRemove = (type: DocumentType) => {
    const old = pendingDocs[type];
    if (old) URL.revokeObjectURL(old.preview);
    setPendingDocs((prev) => {
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
      setDescription(teacher.description || "");
      setDateOfBirth(teacher.dateOfBirth || "");
      setSelectedPhases(teacher.educationPhases);
      setSubjects(teacher.subjects || {});
      setSports(teacher.sports || {});
      setArtsCulture(teacher.artsCulture || {});
      setAddress(teacher.address || "");
      setDistanceRadius(teacher.distanceRadius || 50);
      setLocation(teacher.location || null);
      setIdNumber(teacher.idNumber || "");
      setPhoneNumber(teacher.phoneNumber || "");
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
      (description || "") !== (teacher.description || "") ||
      (dateOfBirth || "") !== (teacher.dateOfBirth || "") ||
      JSON.stringify(selectedPhases) !==
        JSON.stringify(teacher.educationPhases) ||
      JSON.stringify(subjects) !== JSON.stringify(teacher.subjects || {}) ||
      JSON.stringify(sports) !== JSON.stringify(teacher.sports || {}) ||
      JSON.stringify(artsCulture) !==
        JSON.stringify(teacher.artsCulture || {}) ||
      (address || "") !== (teacher.address || "") ||
      distanceRadius !== (teacher.distanceRadius || 50) ||
      (idNumber || "") !== (teacher.idNumber || "") ||
      (phoneNumber || "") !== (teacher.phoneNumber || "") ||
      pendingPicFile !== null ||
      removedPic ||
      Object.keys(pendingDocs).length > 0 ||
      JSON.stringify(references) !==
        JSON.stringify(teacher.teacherReferences || []) ||
      JSON.stringify(experiences) !== JSON.stringify(existingExperiences);
    setHasChanges(changed);
  }, [
    teacher,
    existingExperiences,
    firstName,
    surname,
    description,
    dateOfBirth,
    selectedPhases,
    subjects,
    sports,
    artsCulture,
    address,
    distanceRadius,
    idNumber,
    phoneNumber,
    pendingPicFile,
    removedPic,
    pendingDocs,
    references,
    experiences,
  ]);

  const docSummary = getVerificationSummary(documents);

  const calculateCompleteness = () => {
    const fields = [
      firstName,
      surname,
      description,
      selectedPhases.length > 0,
      Object.values(subjects).some((s) => s.length > 0),
      address,
      idNumber,
      phoneNumber,
      hasPic,
      // Check each required doc type has at least one upload (saved or pending)
      ...REQUIRED_DOCUMENT_TYPES.map(
        (type) =>
          documents.some((d) => d.documentType === type) || !!pendingDocs[type]
      ),
      references.some((r) => r.name && r.email),
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const handlePhaseToggle = (phase: EducationPhase) => {
    setSelectedPhases((prev) => {
      if (prev.includes(phase)) {
        const newPhases = prev.filter((p) => p !== phase);
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
    setSubjects((prev) => {
      const phaseSubjects = prev[phase] || [];
      if (phaseSubjects.includes(subject)) {
        return { ...prev, [phase]: phaseSubjects.filter((s) => s !== subject) };
      }
      return { ...prev, [phase]: [...phaseSubjects, subject] };
    });
  };

  const handleSportToggle = (phase: string, sport: string) => {
    setSports((prev) => {
      const phaseSports = prev[phase] || [];
      if (phaseSports.includes(sport)) {
        return { ...prev, [phase]: phaseSports.filter((s) => s !== sport) };
      }
      return { ...prev, [phase]: [...phaseSports, sport] };
    });
  };

  const handleArtsCultureToggle = (phase: string, item: string) => {
    setArtsCulture((prev) => {
      const phaseArts = prev[phase] || [];
      if (phaseArts.includes(item)) {
        return { ...prev, [phase]: phaseArts.filter((s) => s !== item) };
      }
      return { ...prev, [phase]: [...phaseArts, item] };
    });
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    setExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  };

  const updateReference = (
    index: number,
    field: keyof Reference,
    value: string
  ) => {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref))
    );
  };

  const clearFieldError = (key: string) => {
    if (!fieldErrors[key]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (Object.keys(next).length === 0) setFormError(null);
      return next;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!teacher) return;
    setFormError(null);
    setFieldErrors({});

    // Validate required fields
    const errors: Record<string, boolean> = {};
    if (!firstName.trim()) errors["firstName"] = true;
    if (!surname.trim()) errors["surname"] = true;

    // For experiences: if any field is filled, title + company + startDate are required
    experiences.forEach((exp, i) => {
      const hasAnyField =
        exp.title ||
        exp.company ||
        exp.startDate ||
        exp.endDate ||
        exp.description;
      if (hasAnyField) {
        if (!exp.title) errors[`exp-${i}-title`] = true;
        if (!exp.company) errors[`exp-${i}-company`] = true;
        if (!exp.startDate) errors[`exp-${i}-startDate`] = true;
      }
    });

    // Validate reference emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    references.forEach((ref, i) => {
      if (ref.email && !emailRegex.test(ref.email)) {
        errors[`ref-${i}-email`] = true;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fix the errors in the form before saving.");
      return;
    }

    setSaving(true);

    try {
      let picPath = profilePicture[0] || null;

      // Handle profile picture removal
      if (removedPic && profilePicture[0]) {
        const oldPath = extractPath(profilePicture[0], "profile-pictures");
        await supabaseRef.current.storage
          .from("profile-pictures")
          .remove([oldPath]);
        picPath = null;
      }

      // Handle new profile picture upload
      if (pendingPicFile) {
        // Delete old picture from storage if replacing
        if (profilePicture[0]) {
          const oldPath = extractPath(profilePicture[0], "profile-pictures");
          await supabaseRef.current.storage
            .from("profile-pictures")
            .remove([oldPath]);
        }
        const ext = pendingPicFile.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `${user?.id}/${fileName}`;
        const { error } = await supabaseRef.current.storage
          .from("profile-pictures")
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
        phone_number: phoneNumber || null,
        profile_picture: picPath,
        teacher_references: references.filter((r) => r.name || r.email),
        profile_completeness: completeness,
      };

      const success = await updateTeacher(
        teacher.id,
        updates,
        experiences.filter((e) => e.title && e.company && e.startDate)
      );
      if (!success) {
        setSaving(false);
        return;
      }

      // Upload pending documents to storage + insert rows
      for (const [docType, pending] of Object.entries(pendingDocs)) {
        const ext = pending.file.name.split(".").pop();
        const fileName = `${docType}-${Date.now()}.${ext}`;
        const filePath = `${user?.id}/${fileName}`;
        const { error: uploadErr } = await supabaseRef.current.storage
          .from("documents")
          .upload(filePath, pending.file);
        if (!uploadErr) {
          await uploadDocument(
            teacher.id,
            docType as DocumentType,
            filePath,
            pending.fileName
          );
        }
      }

      // Drop empty experience rows so local state matches what was saved
      setExperiences((prev) =>
        prev.filter((e) => e.title || e.company || e.startDate)
      );

      // Clean up pending state
      if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
      Object.values(pendingDocs).forEach((p) => URL.revokeObjectURL(p.preview));
      setPendingPicFile(null);
      setPendingPicPreview(null);
      setRemovedPic(false);
      setPendingDocs({});
      setSaved(true);
      setHasChanges(false);
      refetchTeacher();
      refetchDocs();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarLinks={teacherSidebarLinks}
        requiredUserType="teacher"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarLinks={teacherSidebarLinks}
      requiredUserType="teacher"
    >
      <div className="p-8 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Profile Setup
            </h1>
            <p className="text-muted-foreground">
              Complete your profile to start applying for jobs
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">
                Profile Completeness
              </span>
              <span className="text-sm font-bold text-primary">
                {completeness}%
              </span>
            </div>
            <div className="w-full bg-muted h-3">
              <div
                className="bg-primary h-3 transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="divide-y divide-border [&>*]:pt-6 space-y-6"
          >
            {/* Section 1: Profile Picture */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Profile Picture
              </h2>
              <div
                className={`flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg border-2 border-dashed transition-colors ${
                  draggingPic ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggingPic(true);
                }}
                onDragLeave={() => setDraggingPic(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggingPic(false);
                  const file = e.dataTransfer.files?.[0];
                  if (
                    file &&
                    (file.type === "image/jpeg" || file.type === "image/png")
                  ) {
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
                          className="w-24 h-24 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                          <Loader2
                            size={24}
                            className="animate-spin text-muted-foreground"
                          />
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
                    <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                      <User size={32} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => profilePicInputRef.current?.click()}
                  >
                    <Camera size={16} />
                    {hasPic ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Drag & drop or click to upload. JPG or PNG, max 10MB
                  </p>
                </div>
                <input
                  ref={profilePicInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProfilePicSelect(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            {/* Section 2: Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      fieldErrors["firstName"]
                        ? "text-red-600"
                        : "text-foreground"
                    }`}
                  >
                    First Name *{" "}
                    {fieldErrors["firstName"] && (
                      <span className="font-normal">— required</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearFieldError("firstName");
                    }}
                    className={`w-full px-3 py-2 text-base md:text-sm border rounded-md focus:outline-none ${
                      fieldErrors["firstName"]
                        ? "border-red-400 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]"
                        : "border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      fieldErrors["surname"]
                        ? "text-red-600"
                        : "text-foreground"
                    }`}
                  >
                    Last Name *{" "}
                    {fieldErrors["surname"] && (
                      <span className="font-normal">— required</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => {
                      setSurname(e.target.value);
                      clearFieldError("surname");
                    }}
                    className={`w-full px-3 py-2 text-base md:text-sm border rounded-md focus:outline-none ${
                      fieldErrors["surname"]
                        ? "border-red-400 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]"
                        : "border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Short Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  placeholder="Tell schools about yourself, your teaching philosophy, and experience..."
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {description.length}/500
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    placeholder="South African ID number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  placeholder="e.g., 071 234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Address
                </label>
                <AddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  onSelect={({ address: addr, lat, lng }) => {
                    setAddress(addr);
                    setLocation({ lat, lng });
                  }}
                  placeholder="Start typing your address..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                  Distance Radius: {distanceRadius}km
                  <span className="relative group">
                    <Info
                      size={14}
                      className="text-muted-foreground cursor-help"
                    />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5km</span>
                  <span>200km</span>
                </div>
              </div>
            </div>

            {/* Section 3: Education Phases */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                Education Phases *
              </h2>
              <p className="text-sm text-muted-foreground">
                Select the phases you teach, then choose your subjects, sports,
                and arts &amp; culture for each.
              </p>

              {EDUCATION_PHASES.map((phase) => {
                const isSelected = selectedPhases.includes(phase);
                const isOpen = openPhases[phase] || false;
                const categories = subjectsByPhase[phase] || [];
                const academicCat = categories.find(
                  (c) => c.category === "Academic"
                );
                const coachingCat = categories.find(
                  (c) => c.category === "Coaching"
                );
                const artsCat = categories.find(
                  (c) => c.category === "Arts & Culture"
                );
                const selectedCount =
                  (subjects[phase]?.length || 0) +
                  (sports[phase]?.length || 0) +
                  (artsCulture[phase]?.length || 0);

                return (
                  <div
                    key={phase}
                    className={`border-2 rounded-lg overflow-hidden transition-colors ${
                      isSelected ? "border-primary" : "border-border"
                    }`}
                  >
                    {/* Phase header */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!isSelected) {
                          handlePhaseToggle(phase);
                          setOpenPhases((prev) => ({ ...prev, [phase]: true }));
                        } else {
                          setOpenPhases((prev) => ({
                            ...prev,
                            [phase]: !prev[phase],
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                      className={`w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/5"
                          : "bg-card hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          {phase}
                        </span>
                        {isSelected && selectedCount > 0 && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
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
                              setOpenPhases((prev) => ({
                                ...prev,
                                [phase]: false,
                              }));
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                          >
                            Remove
                          </button>
                        )}
                        {isSelected && (
                          <ChevronDown
                            size={18}
                            className={`text-muted-foreground transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Dropdown content */}
                    {isSelected && isOpen && (
                      <div className="border-t border-border p-4 space-y-5 bg-card">
                        {/* Subjects */}
                        {academicCat && (
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                              Subjects
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {academicCat.subjects.map((subject) => {
                                const isSubSelected = (
                                  subjects[phase] || []
                                ).includes(subject);
                                return (
                                  <button
                                    key={subject}
                                    type="button"
                                    onClick={() =>
                                      handleSubjectToggle(phase, subject)
                                    }
                                    className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${
                                      isSubSelected
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-card text-muted-foreground border-border hover:border-muted-foreground"
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
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                              Sports / Coaching
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {coachingCat.subjects.map((sport) => {
                                const isSportSelected = (
                                  sports[phase] || []
                                ).includes(sport);
                                return (
                                  <button
                                    key={sport}
                                    type="button"
                                    onClick={() =>
                                      handleSportToggle(phase, sport)
                                    }
                                    className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${
                                      isSportSelected
                                        ? "bg-green-700 text-white border-green-700"
                                        : "bg-card text-muted-foreground border-border hover:border-muted-foreground"
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
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                              Arts &amp; Culture
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {artsCat.subjects.map((item) => {
                                const isArtSelected = (
                                  artsCulture[phase] || []
                                ).includes(item);
                                return (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                      handleArtsCultureToggle(phase, item)
                                    }
                                    className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${
                                      isArtSelected
                                        ? "bg-purple-700 text-white border-purple-700"
                                        : "bg-card text-muted-foreground border-border hover:border-muted-foreground"
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  Teaching Experience
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                >
                  <Plus size={16} />
                  Add
                </Button>
              </div>

              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-muted-foreground">
                      Experience #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`block text-xs font-bold mb-1 ${
                          fieldErrors[`exp-${index}-title`]
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        Title{" "}
                        {fieldErrors[`exp-${index}-title`] && (
                          <span className="font-normal">— required</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          updateExperience(index, "title", e.target.value);
                          clearFieldError(`exp-${index}-title`);
                        }}
                        className={`w-full px-3 py-2 text-base md:text-sm border rounded-md focus:outline-none ${
                          fieldErrors[`exp-${index}-title`]
                            ? "border-red-400 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]"
                            : "border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        }`}
                        placeholder="e.g., Mathematics Teacher"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-bold mb-1 ${
                          fieldErrors[`exp-${index}-company`]
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        School/Company{" "}
                        {fieldErrors[`exp-${index}-company`] && (
                          <span className="font-normal">— required</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          updateExperience(index, "company", e.target.value);
                          clearFieldError(`exp-${index}-company`);
                        }}
                        className={`w-full px-3 py-2 text-base md:text-sm border rounded-md focus:outline-none ${
                          fieldErrors[`exp-${index}-company`]
                            ? "border-red-400 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]"
                            : "border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`block text-xs font-bold mb-1 ${
                          fieldErrors[`exp-${index}-startDate`]
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        Start Date{" "}
                        {fieldErrors[`exp-${index}-startDate`] && (
                          <span className="font-normal">— required</span>
                        )}
                      </label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => {
                          updateExperience(index, "startDate", e.target.value);
                          clearFieldError(`exp-${index}-startDate`);
                        }}
                        className={`w-full px-3 py-2 text-base md:text-sm border rounded-md focus:outline-none ${
                          fieldErrors[`exp-${index}-startDate`]
                            ? "border-red-400 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]"
                            : "border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={exp.endDate || ""}
                        onChange={(e) =>
                          updateExperience(index, "endDate", e.target.value)
                        }
                        className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={exp.description || ""}
                      onChange={(e) =>
                        updateExperience(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    />
                    <p className="text-xs text-muted-foreground text-right mt-1">{(exp.description || "").length}/500</p>
                  </div>
                </div>
              ))}

              {experiences.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No experience added yet
                </p>
              )}
            </div>

            {/* Section 8: References */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  References
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setReferences((prev) => [
                      ...prev,
                      { name: "", relationship: "", email: "", phone: "" },
                    ])
                  }
                >
                  <Plus size={16} />
                  Add
                </Button>
              </div>

              {references.map((ref, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-muted-foreground">
                      Reference #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setReferences((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={ref.name}
                        onChange={(e) =>
                          updateReference(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={ref.relationship}
                        onChange={(e) =>
                          updateReference(index, "relationship", e.target.value)
                        }
                        className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        placeholder="e.g., Former Principal"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={ref.email}
                        onChange={(e) => {
                          updateReference(index, "email", e.target.value);
                          clearFieldError(`ref-${index}-email`);
                        }}
                        className={`w-full px-3 py-2 text-base md:text-sm border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                          fieldErrors[`ref-${index}-email`] ? "border-red-500" : "border-border"
                        }`}
                      />
                      {fieldErrors[`ref-${index}-email`] && (
                        <p className="text-xs text-red-500 mt-1">Invalid email address</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={ref.phone}
                        onChange={(e) =>
                          updateReference(index, "phone", e.target.value)
                        }
                        className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {references.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No references added yet
                </p>
              )}
            </div>

            {/* Section 8: Face Verification */}
            {(() => {
              const selfieSummary = docSummary.find((d) => d.type === "selfie");
              const selfieDocsOfType = documents.filter(
                (d) => d.documentType === "selfie"
              );
              const canUploadSelfie =
                selfieSummary &&
                !selfieSummary.hasApproved &&
                !selfieSummary.hasPending;

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={22} className="text-primary" />
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        Face Verification
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Take a live photo using your device camera to verify
                        your identity
                      </p>
                    </div>
                    {selfieSummary?.hasApproved && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                        Approved
                      </span>
                    )}
                    {selfieSummary &&
                      !selfieSummary.hasApproved &&
                      selfieSummary.hasPending && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
                          Pending Review
                        </span>
                      )}
                    {selfieSummary &&
                      !selfieSummary.hasApproved &&
                      !selfieSummary.hasPending &&
                      selfieSummary.latestRejection && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full">
                          Rejected
                        </span>
                      )}
                    {selfieSummary && !selfieSummary.latest && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold text-muted-foreground bg-muted rounded-full">
                        Not submitted
                      </span>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {selfieSummary?.latestRejection?.rejectionReason &&
                    !selfieSummary.hasApproved &&
                    !selfieSummary.hasPending && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <span className="font-medium">Reason: </span>
                        {selfieSummary.latestRejection.rejectionReason}
                      </div>
                    )}

                  {/* Existing selfie docs */}
                  {selfieDocsOfType.length > 0 && (
                    <div className="space-y-1">
                      {selfieDocsOfType.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-2 bg-muted/50 rounded border border-border text-sm"
                        >
                          <SignedDocPreview
                            fileUrl={doc.fileUrl}
                            fileName={doc.fileName}
                            onExpand={(url, fn) =>
                              setLightbox({ src: url, fileName: fn })
                            }
                          />
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              doc.status === "approved"
                                ? "bg-green-500"
                                : doc.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-xs text-muted-foreground flex-1">
                            {new Date(doc.createdAt).toLocaleDateString(
                              "en-ZA"
                            )}
                          </span>
                          {doc.status === "pending" && (
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
                    <div className="flex items-center gap-3 p-2 bg-primary/5 border border-primary/20 rounded">
                      <img
                        src={pendingDocs.selfie.preview}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border border-border shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          pendingDocs.selfie &&
                          setLightbox({ src: pendingDocs.selfie.preview })
                        }
                      />
                      <span className="text-xs text-primary font-medium flex-1">
                        Unsaved
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDocRemove("selfie")}
                        className="text-red-500 hover:text-red-700 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Start button */}
                  {canUploadSelfie && !pendingDocs.selfie && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setSelfieModalOpen(true)}
                    >
                      <Camera size={18} />
                      Start Face Verification
                    </Button>
                  )}
                </div>
              );
            })()}

            {/* Section 9: Documents */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Documents</h2>
              <p className="text-sm text-muted-foreground">
                Upload the required documents below. Each document will be
                reviewed by an admin before your profile is verified.
              </p>

              {docSummary
                .filter((d) => d.type !== "selfie")
                .map(
                  ({
                    type,
                    hasApproved,
                    hasPending,
                    latestRejection,
                    latest,
                  }) => {
                    const labels: Record<
                      string,
                      { label: string; accept: string; description: string }
                    > = {
                      cv: {
                        label: "CV",
                        accept: ".pdf,.doc,.docx",
                        description: "Your curriculum vitae",
                      },
                      qualification: {
                        label: "Qualifications",
                        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
                        description: "Degrees, diplomas, certificates",
                      },
                      id_document: {
                        label: "ID / Passport / Driver's License",
                        accept: ".pdf,.jpg,.jpeg,.png",
                        description: "Government-issued identification",
                      },
                      criminal_record: {
                        label: "Criminal Record Check",
                        accept: ".pdf",
                        description:
                          "Upload a Huru PDF or certified police clearance certificate",
                      },
                    };
                    const config = labels[type];
                    if (!config) return null;
                    const canUpload = !hasApproved && !hasPending;
                    const docsOfType = documents.filter(
                      (d) => d.documentType === type
                    );

                    const isDraggingOver = draggingDocType === type;

                    return (
                      <div
                        key={type}
                        className={`border-2 rounded-lg p-4 transition-colors ${
                          isDraggingOver
                            ? "border-primary bg-primary/5"
                            : "border-border"
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
                            <h3 className="text-sm font-bold text-foreground">
                              {config.label}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {config.description}
                            </p>
                          </div>
                          {hasApproved && (
                            <span className="px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                              Approved
                            </span>
                          )}
                          {!hasApproved && hasPending && (
                            <span className="px-2 py-0.5 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
                              Pending Review
                            </span>
                          )}
                          {!hasApproved && !hasPending && latestRejection && (
                            <span className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full">
                              Rejected
                            </span>
                          )}
                          {!latest && (
                            <span className="px-2 py-0.5 text-xs font-bold text-muted-foreground bg-muted rounded-full">
                              Not uploaded
                            </span>
                          )}
                        </div>

                        {/* Show rejection reason */}
                        {latestRejection?.rejectionReason &&
                          !hasApproved &&
                          !hasPending && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              <span className="font-medium">Reason: </span>
                              {latestRejection.rejectionReason}
                            </div>
                          )}

                        {/* Existing documents */}
                        {docsOfType.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {docsOfType.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center gap-3 p-2 bg-muted/50 rounded border border-border text-sm"
                              >
                                <SignedDocPreview
                                  fileUrl={doc.fileUrl}
                                  fileName={doc.fileName}
                                  onExpand={(url, fn) =>
                                    setLightbox({ src: url, fileName: fn })
                                  }
                                />
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    doc.status === "approved"
                                      ? "bg-green-500"
                                      : doc.status === "pending"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <span className="text-xs text-muted-foreground flex-1">
                                  {new Date(doc.createdAt).toLocaleDateString(
                                    "en-ZA"
                                  )}
                                </span>
                                {doc.status === "pending" && (
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
                          <div className="flex items-center gap-3 p-2 bg-primary/5 border border-primary/20 rounded mb-3">
                            {pendingDocs[type].file.type.startsWith(
                              "image/"
                            ) ? (
                              <img
                                src={pendingDocs[type].preview}
                                alt="Preview"
                                className="w-16 h-16 rounded object-cover border border-border shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  pendingDocs[type] &&
                                  setLightbox({
                                    src: pendingDocs[type].preview,
                                  })
                                }
                              />
                            ) : pendingDocs[type].file.type ===
                              "application/pdf" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  pendingDocs[type] &&
                                  setLightbox({
                                    src: pendingDocs[type].preview,
                                    fileName: pendingDocs[type].fileName,
                                  })
                                }
                                className="w-16 h-16 rounded bg-red-50 border border-border flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-primary transition-colors"
                              >
                                <FileText size={18} className="text-red-500" />
                                <span className="text-[9px] text-red-600 font-medium mt-0.5">
                                  PDF
                                </span>
                              </button>
                            ) : (
                              <div className="w-16 h-16 rounded bg-muted border border-border flex items-center justify-center shrink-0">
                                <FileText
                                  size={20}
                                  className="text-muted-foreground"
                                />
                              </div>
                            )}
                            <span className="text-xs text-primary font-medium flex-1">
                              Unsaved
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDocRemove(type)}
                              className="text-red-500 hover:text-red-700 shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        {/* Upload button */}
                        {canUpload && !pendingDocs[type] && (
                          <label
                            className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors cursor-pointer w-full justify-center ${
                              isDraggingOver
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <Plus
                              size={20}
                              className={
                                isDraggingOver
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }
                            />
                            <span
                              className={`text-sm ${
                                isDraggingOver
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {isDraggingOver
                                ? "Drop file here"
                                : "Drag & drop or click to choose file"}
                            </span>
                            <input
                              type="file"
                              accept={config.accept}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  handleDocSelect(type as DocumentType, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                    );
                  }
                )}
            </div>
          </form>
        </div>
      </div>

      {/* Discord-style floating save bar */}
      <div
        className={`fixed bottom-0 left-0 md:left-64 right-0 z-50 transition-all duration-300 ${
          hasChanges || saved
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-center px-8 pb-6">
          <div
            className={`w-full max-w-2xl rounded-lg shadow-lg px-6 py-3 flex items-center justify-between ${
              saved
                ? "bg-green-50 border border-green-200 text-green-700"
                : formError
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-foreground text-white"
            }`}
          >
            <div className="flex-1 min-w-0">
              {saved ? (
                <p className="text-sm font-medium">
                  Profile saved successfully!
                </p>
              ) : saving ? (
                <p className="text-sm font-medium flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Saving your
                  profile...
                </p>
              ) : formError ? (
                <p className="text-sm font-medium">{formError}</p>
              ) : (
                <p className="text-sm font-medium">
                  Careful — you have unsaved changes!
                </p>
              )}
            </div>
            {!saved && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (teacher) {
                      setFirstName(teacher.firstName);
                      setSurname(teacher.surname);
                      setDescription(teacher.description || "");
                      setDateOfBirth(teacher.dateOfBirth || "");
                      setSelectedPhases(teacher.educationPhases);
                      setSubjects(teacher.subjects || {});
                      setSports(teacher.sports || {});
                      setArtsCulture(teacher.artsCulture || {});
                      setAddress(teacher.address || "");
                      setDistanceRadius(teacher.distanceRadius || 50);
                      setLocation(teacher.location || null);
                      setIdNumber(teacher.idNumber || "");
                      setPhoneNumber(teacher.phoneNumber || "");
                      setProfilePicture(
                        teacher.profilePicture ? [teacher.profilePicture] : []
                      );
                      setReferences(
                        teacher.teacherReferences?.length > 0
                          ? [...teacher.teacherReferences]
                          : []
                      );
                    }
                    if (existingExperiences.length > 0) {
                      setExperiences(existingExperiences);
                    } else {
                      setExperiences([]);
                    }
                    if (pendingPicPreview)
                      URL.revokeObjectURL(pendingPicPreview);
                    setPendingPicFile(null);
                    setPendingPicPreview(null);
                    setRemovedPic(false);
                    Object.values(pendingDocs).forEach((p) =>
                      URL.revokeObjectURL(p.preview)
                    );
                    setPendingDocs({});
                    setHasChanges(false);
                    setFormError(null);
                    setFieldErrors({});
                  }}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Reset
                </button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSubmit()}
                  disabled={saving}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selfie capture modal */}
      <SelfieCapture
        open={selfieModalOpen}
        onClose={() => setSelfieModalOpen(false)}
        onCapture={(file) => {
          handleDocSelect("selfie", file);
          setSelfieModalOpen(false);
        }}
      />

      {/* Document lightbox (images + PDFs) */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          fileName={lightbox.fileName}
          open={true}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* File size error toast */}
      {fileSizeError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm animate-fadeIn">
          <p className="text-sm font-medium">{fileSizeError}</p>
          <button onClick={() => setFileSizeError(null)} className="text-white/70 hover:text-white shrink-0">
            <X size={16} />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
