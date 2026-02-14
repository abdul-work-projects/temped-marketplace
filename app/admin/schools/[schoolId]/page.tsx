"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAdminSchoolDetail } from "@/lib/hooks/useAdmin";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import dynamic from "next/dynamic";
const ImageLightbox = dynamic(
  () => import("@/components/shared/ImageLightbox"),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ChevronLeft,
  Edit,
  Save,
  School,
  FileText,
  MapPin,
  Check,
  X as XIcon,
} from "lucide-react";

function hasImageExtension(path?: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path || "");
}

function hasPdfExtension(path?: string): boolean {
  return /\.pdf$/i.test(path || "");
}

/** Thumbnail-only component — renders just the clickable preview square */
function CertThumbnail({
  url,
  onOpen,
}: {
  url?: string;
  onOpen: (src: string) => void;
}) {
  const signedUrl = useSignedUrl("registration-certificates", url);

  if (!signedUrl) {
    return (
      <div className="w-20 h-20 flex items-center justify-center bg-muted rounded-md border border-border">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isImage = hasImageExtension(url);
  const isPdf = hasPdfExtension(url);

  if (isImage) {
    return (
      <img
        src={signedUrl}
        alt="Registration Certificate"
        className="w-20 h-20 object-cover rounded-md cursor-pointer border border-border hover:border-primary transition-colors"
        onClick={() => onOpen(signedUrl)}
      />
    );
  }

  if (isPdf) {
    return (
      <button
        onClick={() => onOpen(signedUrl)}
        className="w-20 h-20 flex flex-col items-center justify-center gap-1 bg-red-50 rounded-md border border-border hover:border-primary cursor-pointer transition-colors"
      >
        <FileText className="w-6 h-6 text-red-500" />
        <span className="text-[10px] text-red-600 font-medium">PDF</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onOpen(signedUrl)}
      className="w-20 h-20 flex flex-col items-center justify-center gap-1 bg-muted rounded-md border border-border hover:border-primary cursor-pointer transition-colors"
    >
      <FileText className="w-6 h-6 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">View</span>
    </button>
  );
}

export default function AdminSchoolDetail() {
  const { schoolId } = useParams() as { schoolId: string };
  const { school, loading, updateSchool, reviewSchool } =
    useAdminSchoolDetail(schoolId);
  const profilePicUrl = useSignedUrl(
    "profile-pictures",
    school?.profilePicture
  );

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    address: "",
    district: "",
    emis_number: "",
    education_district: "",
  });

  useEffect(() => {
    if (school) {
      setEditData({
        name: school.name || "",
        description: school.description || "",
        address: school.address || "",
        district: school.district || "",
        emis_number: school.emisNumber || "",
        education_district: school.educationDistrict || "",
      });
    }
  }, [school]);

  const handleSave = async () => {
    setSaving(true);
    await updateSchool(schoolId, editData);
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

  if (!school) {
    return (
      <div className="min-h-screen">
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center py-16">
            <h2 className="text-xl font-bold text-foreground mb-2">
              School not found
            </h2>
            <Link
              href="/admin/schools"
              className="text-primary hover:underline text-sm"
            >
              Back to schools list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl">
          {/* Back Button */}
          <Link
            href="/admin/schools"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to schools
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={school.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <School className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {school.name}
                </h1>
                <p className="text-muted-foreground text-sm">{school.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {school.emisNumber && (
                    <span className="text-xs text-muted-foreground">
                      EMIS: {school.emisNumber}
                    </span>
                  )}
                  {school.schoolType && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {school.schoolType}
                    </Badge>
                  )}
                  {school.ownershipType && (
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground border-border"
                    >
                      {school.ownershipType}
                    </Badge>
                  )}
                  {school.curriculum && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      {school.curriculum}
                    </Badge>
                  )}
                  <Badge
                    className={
                      school.verificationStatus === "approved"
                        ? "bg-green-100 text-green-700"
                        : school.verificationStatus === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : school.verificationStatus === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {school.verificationStatus === "approved"
                      ? "Verified"
                      : school.verificationStatus === "pending"
                      ? "Pending Verification"
                      : school.verificationStatus === "rejected"
                      ? "Rejected"
                      : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  if (school) {
                    setEditData({
                      name: school.name || "",
                      description: school.description || "",
                      address: school.address || "",
                      district: school.district || "",
                      emis_number: school.emisNumber || "",
                      education_district: school.educationDistrict || "",
                    });
                  }
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <Edit className="w-4 h-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="divide-y divide-border [&>*]:py-6">
            {/* Editable Fields */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">
                School Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                    School Name
                  </Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{school.name}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                    EMIS Number
                  </Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData.emis_number}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          emis_number: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {school.emisNumber || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                    District
                  </Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData.district}
                      onChange={(e) =>
                        setEditData({ ...editData, district: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {school.district || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                    Education District
                  </Label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData.education_district}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          education_district: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {school.educationDistrict || "Not provided"}
                    </p>
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
                    onChange={(e) =>
                      setEditData({ ...editData, address: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm text-foreground flex items-center gap-1">
                    {school.address ? (
                      <>
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {school.address}
                      </>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <Label className="text-xs font-bold text-muted-foreground uppercase mb-1">
                  Description
                </Label>
                {isEditing ? (
                  <Textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-sm text-foreground">
                    {school.description || "No description provided"}
                  </p>
                )}
              </div>

              {isEditing && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>

            {/* Read-only Details */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                    School Type
                  </h3>
                  <p className="text-sm text-foreground font-medium">
                    {school.schoolType || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                    Ownership
                  </h3>
                  <p className="text-sm text-foreground font-medium">
                    {school.ownershipType || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                    Curriculum
                  </h3>
                  <p className="text-sm text-foreground font-medium">
                    {school.curriculum || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents & Verification */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documents & Verification
              </h2>

              <div className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">
                  Registration Certificate
                </h3>

                {!school.registrationCertificate ? (
                  <p className="text-sm text-muted-foreground">
                    Not uploaded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Document row — matches teacher pattern */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                      <CertThumbnail
                        url={school.registrationCertificate}
                        onOpen={setLightboxSrc}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground truncate">
                            Registration Certificate
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              school.verificationStatus === "approved"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : school.verificationStatus === "pending"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : school.verificationStatus === "rejected"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-muted text-foreground border-border"
                            }
                          >
                            {school.verificationStatus === "approved"
                              ? "Approved"
                              : school.verificationStatus === "pending"
                              ? "Pending"
                              : school.verificationStatus === "rejected"
                              ? "Rejected"
                              : "Unverified"}
                          </Badge>
                        </div>
                        {school.verifiedAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Reviewed{" "}
                            {new Date(school.verifiedAt).toLocaleDateString(
                              "en-ZA",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        )}
                        {school.verificationStatus === "rejected" &&
                          school.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">
                              Reason: {school.rejectionReason}
                            </p>
                          )}
                      </div>

                      {/* Inline action buttons — only when pending */}
                      {school.verificationStatus === "pending" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={async () => {
                              setReviewing(true);
                              await reviewSchool(school.id, "approved");
                              setReviewing(false);
                            }}
                            disabled={reviewing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {reviewing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRejectInput(!showRejectInput)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XIcon className="w-3 h-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Inline rejection reason input */}
                    {showRejectInput &&
                      school.verificationStatus === "pending" && (
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection (optional)..."
                            className="flex-1"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              setReviewing(true);
                              await reviewSchool(
                                school.id,
                                "rejected",
                                rejectionReason.trim() || undefined
                              );
                              setReviewing(false);
                              setShowRejectInput(false);
                              setRejectionReason("");
                            }}
                            disabled={reviewing}
                          >
                            {reviewing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Confirm Reject"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowRejectInput(false);
                              setRejectionReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt="Registration Certificate"
          fileName={school.registrationCertificate}
          open={true}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}
