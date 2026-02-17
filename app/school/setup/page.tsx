"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { schoolSidebarLinks } from "@/components/shared/Sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { useSchoolProfile, useUpdateSchool } from "@/lib/hooks/useSchool";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import { createClient } from "@/lib/supabase/client";
import AddressAutocomplete from "@/components/shared/AddressAutocomplete";
import { SchoolType, OwnershipType, Curriculum } from "@/types";
import { Loader2, Building2, Camera, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SELECT_CLASS } from "@/lib/utils";
import dynamic from "next/dynamic";
const ImageLightbox = dynamic(
  () => import("@/components/shared/ImageLightbox"),
  { ssr: false }
);

export default function SchoolSetupPage() {
  const { user } = useAuth();
  const { school, loading, refetch } = useSchoolProfile(user?.id);
  const { updateSchool, saving, error: saveError } = useUpdateSchool();
  const supabaseRef = useRef(createClient());

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    emisNumber: "",
    district: "",
    schoolType: "Secondary" as SchoolType,
    ownershipType: "Public" as OwnershipType,
    educationDistrict: "",
    curriculum: "CAPS" as Curriculum,
    address: "",
  });

  const [profilePicture, setProfilePicture] = useState<string[]>([]);
  const [registrationCertificate, setRegistrationCertificate] = useState<
    string[]
  >([]);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Deferred profile picture upload
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [draggingPic, setDraggingPic] = useState(false);
  const [pendingPicFile, setPendingPicFile] = useState<File | null>(null);
  const [pendingPicPreview, setPendingPicPreview] = useState<string | null>(
    null
  );
  const [removedPic, setRemovedPic] = useState(false);

  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
    fileName?: string;
  } | null>(null);

  // Deferred registration certificate upload
  const certInputRef = useRef<HTMLInputElement>(null);
  const [draggingCert, setDraggingCert] = useState(false);
  const [pendingCertFile, setPendingCertFile] = useState<File | null>(null);
  const [pendingCertPreview, setPendingCertPreview] = useState<string | null>(
    null
  );
  const [removedCert, setRemovedCert] = useState(false);

  const profilePicUrl = useSignedUrl("profile-pictures", profilePicture[0]);
  const displayPicUrl =
    pendingPicPreview || (removedPic ? null : profilePicUrl);
  const hasPic = pendingPicFile
    ? true
    : !removedPic && profilePicture.length > 0;

  const certUrl = useSignedUrl(
    "registration-certificates",
    registrationCertificate[0]
  );
  const displayCertName =
    pendingCertFile?.name ||
    (removedCert
      ? null
      : registrationCertificate[0]
      ? "Registration Certificate"
      : null);
  const hasCert = pendingCertFile
    ? true
    : !removedCert && registrationCertificate.length > 0;
  const displayCertUrl = pendingCertPreview || (removedCert ? null : certUrl);
  const isCertImage = pendingCertFile
    ? pendingCertFile.type.startsWith("image/")
    : /\.(jpg|jpeg|png|gif|webp)$/i.test(registrationCertificate[0] || "");

  const extractPath = (value: string, bucket: string) => {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = value.indexOf(marker);
    return idx !== -1 ? value.substring(idx + marker.length) : value;
  };

  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const handleProfilePicSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setFileSizeError("Profile picture must be under 5MB");
      return;
    }
    setFileSizeError(null);
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

  const handleCertSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setFileSizeError("Certificate must be under 10MB");
      return;
    }
    setFileSizeError(null);
    if (pendingCertPreview) URL.revokeObjectURL(pendingCertPreview);
    setPendingCertFile(file);
    setPendingCertPreview(URL.createObjectURL(file));
    setRemovedCert(false);
  };

  const handleRemoveCert = () => {
    if (pendingCertPreview) URL.revokeObjectURL(pendingCertPreview);
    setPendingCertFile(null);
    setPendingCertPreview(null);
    setRemovedCert(true);
  };

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || "",
        description: school.description || "",
        emisNumber: school.emisNumber || "",
        district: school.district || "",
        schoolType: school.schoolType || "Secondary",
        ownershipType: school.ownershipType || "Public",
        educationDistrict: school.educationDistrict || "",
        curriculum: school.curriculum || "CAPS",
        address: school.address || "",
      });
      if (school.profilePicture) setProfilePicture([school.profilePicture]);
      if (school.registrationCertificate)
        setRegistrationCertificate([school.registrationCertificate]);
      if (school.location) setLocation(school.location);
    }
  }, [school]);

  // Track unsaved changes
  useEffect(() => {
    if (!school) return;
    const changed =
      formData.name !== (school.name || "") ||
      formData.description !== (school.description || "") ||
      formData.emisNumber !== (school.emisNumber || "") ||
      formData.district !== (school.district || "") ||
      formData.schoolType !== (school.schoolType || "Secondary") ||
      formData.ownershipType !== (school.ownershipType || "Public") ||
      formData.educationDistrict !== (school.educationDistrict || "") ||
      formData.curriculum !== (school.curriculum || "CAPS") ||
      formData.address !== (school.address || "") ||
      pendingPicFile !== null ||
      removedPic ||
      pendingCertFile !== null ||
      removedCert;
    setHasChanges(changed);
  }, [
    school,
    formData,
    pendingPicFile,
    removedPic,
    pendingCertFile,
    removedCert,
  ]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!school) return;

    // Handle profile picture upload/removal
    let picPath = profilePicture[0] || null;

    if (removedPic && profilePicture[0]) {
      const oldPath = extractPath(profilePicture[0], "profile-pictures");
      await supabaseRef.current.storage
        .from("profile-pictures")
        .remove([oldPath]);
      picPath = null;
    }

    if (pendingPicFile) {
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

    // Handle registration certificate upload/removal
    let certPath = registrationCertificate[0] || null;

    if (removedCert && registrationCertificate[0]) {
      const oldPath = extractPath(
        registrationCertificate[0],
        "registration-certificates"
      );
      await supabaseRef.current.storage
        .from("registration-certificates")
        .remove([oldPath]);
      certPath = null;
    }

    if (pendingCertFile) {
      if (registrationCertificate[0]) {
        const oldPath = extractPath(
          registrationCertificate[0],
          "registration-certificates"
        );
        await supabaseRef.current.storage
          .from("registration-certificates")
          .remove([oldPath]);
      }
      const ext = pendingCertFile.name.split(".").pop();
      const fileName = `cert-${Date.now()}.${ext}`;
      const filePath = `${user?.id}/${fileName}`;
      const { error } = await supabaseRef.current.storage
        .from("registration-certificates")
        .upload(filePath, pendingCertFile);
      if (!error) {
        certPath = filePath;
      }
    }

    // Determine verification_status based on certificate state
    let verificationStatus: string | undefined;
    if (certPath) {
      // Certificate present — if previously rejected or unverified, set to pending
      const current = school.verificationStatus;
      if (!current || current === "unverified" || current === "rejected") {
        verificationStatus = "pending";
      }
      // If re-uploading a new cert while pending/approved, reset to pending
      if (pendingCertFile) {
        verificationStatus = "pending";
      }
    } else {
      // Certificate removed
      verificationStatus = "unverified";
    }

    const updates: Record<string, unknown> = {
      name: formData.name,
      description: formData.description,
      emis_number: formData.emisNumber,
      district: formData.district,
      school_type: formData.schoolType,
      ownership_type: formData.ownershipType,
      education_district: formData.educationDistrict,
      curriculum: formData.curriculum,
      address: formData.address,
      profile_picture: picPath,
      registration_certificate: certPath,
    };

    if (verificationStatus !== undefined) {
      updates.verification_status = verificationStatus;
      // Clear rejection reason when re-submitting
      if (verificationStatus === "pending") {
        updates.rejection_reason = null;
      }
    }

    if (location) {
      updates.location = location;
    }

    const success = await updateSchool(school.id, updates);
    if (success) {
      // Clean up pending state
      if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
      if (pendingCertPreview) URL.revokeObjectURL(pendingCertPreview);
      setPendingPicFile(null);
      setPendingPicPreview(null);
      setRemovedPic(false);
      setPendingCertFile(null);
      setPendingCertPreview(null);
      setRemovedCert(false);
      setHasChanges(false);
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleReset = () => {
    if (school) {
      setFormData({
        name: school.name || "",
        description: school.description || "",
        emisNumber: school.emisNumber || "",
        district: school.district || "",
        schoolType: school.schoolType || "Secondary",
        ownershipType: school.ownershipType || "Public",
        educationDistrict: school.educationDistrict || "",
        curriculum: school.curriculum || "CAPS",
        address: school.address || "",
      });
      if (school.location) setLocation(school.location);
    }
    if (pendingPicPreview) URL.revokeObjectURL(pendingPicPreview);
    setPendingPicFile(null);
    setPendingPicPreview(null);
    setRemovedPic(false);
    if (pendingCertPreview) URL.revokeObjectURL(pendingCertPreview);
    setPendingCertFile(null);
    setPendingCertPreview(null);
    setRemovedCert(false);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarLinks={schoolSidebarLinks}
        requiredUserType="school"
      >
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarLinks={schoolSidebarLinks}
      requiredUserType="school"
    >
      <div className="p-8 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              School Profile Setup
            </h1>
            <p className="text-muted-foreground">
              Complete your school profile to start posting jobs
            </p>
          </div>

          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">
                Profile saved successfully!
              </p>
            </div>
          )}

          {saveError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Error: {saveError}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="divide-y divide-border [&>*]:pt-6 space-y-6"
          >
            {/* Profile Picture */}
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
                  if (file && file.type.startsWith("image/")) {
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
                      <Building2 size={32} className="text-muted-foreground" />
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
                    Drag & drop or click to upload. JPG or PNG, max 5MB
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

            {/* School Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                School Information
              </h2>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  School Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  maxLength={500}
                  className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  placeholder="Tell teachers about your school, its values, and environment..."
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {formData.description.length}/500
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    EMIS Number
                  </label>
                  <input
                    type="text"
                    value={formData.emisNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, emisNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    placeholder="e.g., Cape Winelands"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    School Type *
                  </label>
                  <select
                    required
                    value={formData.schoolType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schoolType: e.target.value as SchoolType,
                      })
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Pre-primary">Pre-primary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Ownership Type *
                  </label>
                  <select
                    required
                    value={formData.ownershipType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ownershipType: e.target.value as OwnershipType,
                      })
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Education District
                  </label>
                  <input
                    type="text"
                    value={formData.educationDistrict}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        educationDistrict: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-base md:text-sm border border-border rounded-md focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    placeholder="e.g., Metro East"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Curriculum *
                  </label>
                  <select
                    required
                    value={formData.curriculum}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        curriculum: e.target.value as Curriculum,
                      })
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="CAPS">CAPS</option>
                    <option value="Cambridge">Cambridge</option>
                    <option value="IEB">IEB</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Address *
                </label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={(addr) =>
                    setFormData({ ...formData, address: addr })
                  }
                  onSelect={({ address: addr, lat, lng }) => {
                    setFormData((prev) => ({ ...prev, address: addr }));
                    setLocation({ lat, lng });
                  }}
                  required
                  placeholder="Start typing your school address..."
                />
              </div>
            </div>

            {/* Registration Certificate */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Registration Certificate
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Upload your school registration certificate for verification
                  </p>
                </div>
                {school?.verificationStatus === "approved" && (
                  <span className="px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                    Approved
                  </span>
                )}
                {school?.verificationStatus === "pending" && (
                  <span className="px-2 py-0.5 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
                    Pending Review
                  </span>
                )}
                {school?.verificationStatus === "rejected" && (
                  <span className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full">
                    Rejected
                  </span>
                )}
                {(!school?.verificationStatus ||
                  school.verificationStatus === "unverified") && (
                  <span className="px-2 py-0.5 text-xs font-bold text-muted-foreground bg-muted rounded-full">
                    Not uploaded
                  </span>
                )}
              </div>

              {/* Rejection reason */}
              {school?.verificationStatus === "rejected" &&
                school.rejectionReason && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <span className="font-medium">Reason: </span>
                    {school.rejectionReason}
                  </div>
                )}

              <div
                className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                  draggingCert ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggingCert(true);
                }}
                onDragLeave={() => setDraggingCert(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggingCert(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleCertSelect(file);
                }}
              >
                {hasCert ? (
                  <div className="flex items-center gap-3">
                    {isCertImage && displayCertUrl ? (
                      <img
                        src={displayCertUrl}
                        alt="Certificate"
                        className="w-16 h-16 rounded object-cover border border-border shrink-0 cursor-pointer hover:border-primary transition-colors"
                        onClick={() =>
                          displayCertUrl &&
                          setLightbox({
                            src: displayCertUrl,
                            alt: "Registration Certificate",
                          })
                        }
                      />
                    ) : displayCertUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({
                            src: displayCertUrl,
                            alt: "Registration Certificate",
                            fileName:
                              pendingCertFile?.name || "certificate.pdf",
                          })
                        }
                        className="w-16 h-16 rounded bg-red-50 border border-border flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-primary transition-colors"
                      >
                        <FileText size={20} className="text-red-500" />
                        <span className="text-[9px] text-red-600 font-medium mt-0.5">
                          PDF
                        </span>
                      </button>
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted border border-border flex items-center justify-center shrink-0">
                        <Loader2
                          size={16}
                          className="animate-spin text-muted-foreground"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {displayCertName || "Certificate uploaded"}
                      </p>
                      {displayCertUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setLightbox({
                              src: displayCertUrl,
                              alt: "Registration Certificate",
                              fileName:
                                pendingCertFile?.name || "certificate.pdf",
                            })
                          }
                          className="text-xs text-primary hover:underline"
                        >
                          Preview
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCert}
                      className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => certInputRef.current?.click()}
                    >
                      Upload Certificate
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Drag & drop or click. PDF, JPG, or PNG, max 10MB
                    </p>
                  </div>
                )}
                <input
                  ref={certInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCertSelect(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Floating save bar */}
      <div
        className={`fixed bottom-0 left-0 md:left-64 right-0 z-50 transition-all duration-300 ${
          hasChanges
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-center px-8 pb-6">
          <div className="w-full max-w-2xl bg-foreground text-white rounded-lg shadow-lg px-6 py-3 flex items-center justify-between">
            <p className="text-sm font-medium">
              Careful — you have unsaved changes!
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
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
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
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
