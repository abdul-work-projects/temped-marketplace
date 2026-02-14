"use client";

import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { teacherSidebarLinks } from "@/components/shared/Sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { useTeacherProfile, useTeacherDocuments } from "@/lib/hooks/useTeacher";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import { useTestimonials } from "@/lib/hooks/useTestimonials";
import {
  isTeacherVerified,
  getVerificationSummary,
} from "@/lib/utils/verification";
import {
  REQUIRED_DOCUMENT_TYPES,
  DocumentType,
  TeacherDocument,
} from "@/types";
import dynamic from "next/dynamic";
const ImageLightbox = dynamic(
  () => import("@/components/shared/ImageLightbox"),
  { ssr: false }
);
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  BadgeCheck,
  Clock,
  Dumbbell,
  Palette,
  Users,
  Shield,
  MessageSquare,
  Pencil,
  Phone,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DOC_LABELS: Record<DocumentType, string> = {
  cv: "CV",
  qualification: "Qualifications",
  id_document: "ID Document",
  criminal_record: "Criminal Record Check",
  selfie: "Face Verification",
};

function DocThumbnail({
  doc,
  onOpen,
}: {
  doc: TeacherDocument;
  onOpen: (src: string, alt: string, fileName?: string) => void;
}) {
  const signedUrl = useSignedUrl("documents", doc.fileUrl);
  const name = (doc.fileName || doc.fileUrl || "").toLowerCase();
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  const isPdf = /\.pdf$/i.test(name);

  if (isImage && signedUrl) {
    return (
      <img
        src={signedUrl}
        alt={doc.fileName || DOC_LABELS[doc.documentType]}
        className="w-14 h-14 object-cover rounded-md cursor-pointer border border-border hover:border-primary transition-colors"
        onClick={() =>
          onOpen(
            signedUrl,
            doc.fileName || DOC_LABELS[doc.documentType],
            doc.fileName
          )
        }
      />
    );
  }

  if (isPdf && signedUrl) {
    return (
      <button
        onClick={() =>
          onOpen(
            signedUrl,
            doc.fileName || DOC_LABELS[doc.documentType],
            doc.fileName || "document.pdf"
          )
        }
        className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 bg-red-50 rounded-md border border-border hover:border-primary cursor-pointer transition-colors"
      >
        <FileText className="w-5 h-5 text-red-500" />
        <span className="text-[9px] text-red-600 font-medium">PDF</span>
      </button>
    );
  }

  if (signedUrl) {
    return (
      <button
        onClick={() =>
          onOpen(
            signedUrl,
            doc.fileName || DOC_LABELS[doc.documentType],
            doc.fileName
          )
        }
        className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 bg-muted rounded-md border border-border hover:border-primary cursor-pointer transition-colors"
      >
        <FileText className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="w-14 h-14 flex items-center justify-center bg-muted rounded-md border border-border">
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { teacher, experiences, loading } = useTeacherProfile(user?.id);
  const { documents } = useTeacherDocuments(teacher?.id);
  const profilePicUrl = useSignedUrl(
    "profile-pictures",
    teacher?.profilePicture
  );
  const { testimonials } = useTestimonials(user?.id);
  const verified = teacher ? isTeacherVerified(documents) : false;
  const docSummary = getVerificationSummary(documents);
  const hasPendingDocs = documents.some((d) => d.status === "pending");
  const hasRejectedDocs = docSummary.some(
    (s) => !s.hasApproved && s.latestRejection
  );
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
    fileName?: string;
  } | null>(null);
  const openLightbox = (src: string, alt: string, fileName?: string) =>
    setLightbox({ src, alt, fileName });

  if (loading || !teacher) {
    return (
      <DashboardLayout
        sidebarLinks={teacherSidebarLinks}
        requiredUserType="teacher"
      >
        <div className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate completeness bar color
  const completenessColor =
    teacher.profileCompleteness >= 80
      ? "bg-green-500"
      : teacher.profileCompleteness >= 50
      ? "bg-yellow-500"
      : "bg-red-500";

  // All subjects flattened for display
  const allPhaseKeys = Object.keys(teacher.subjects);

  return (
    <DashboardLayout
      sidebarLinks={teacherSidebarLinks}
      requiredUserType="teacher"
    >
      <div className="py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={`${teacher.firstName} ${teacher.surname}`}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User size={28} className="text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {teacher.firstName} {teacher.surname}
                </h1>
                {verified && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <BadgeCheck size={14} />
                    Verified
                  </Badge>
                )}
                {!verified && hasPendingDocs && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Clock size={14} />
                    Pending Verification
                  </Badge>
                )}
                {!verified && hasRejectedDocs && !hasPendingDocs && (
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    <Shield size={14} />
                    Action Required
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {teacher.address && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                  <MapPin size={14} />
                  <span>{teacher.address}</span>
                </div>
              )}
              {teacher.phoneNumber && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                  <Phone size={14} />
                  <span>{teacher.phoneNumber}</span>
                </div>
              )}
              {teacher.distanceRadius > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Willing to travel up to {teacher.distanceRadius}km
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/teacher/setup">
                <Pencil size={18} />
              </Link>
            </Button>
          </div>

          {/* Profile Completeness Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-foreground">
                Profile Completeness
              </h2>
              <span className="text-sm font-bold text-foreground">
                {teacher.profileCompleteness}%
              </span>
            </div>
            <div className="w-full bg-muted h-2.5 rounded-full">
              <div
                className={`h-2.5 rounded-full transition-all ${completenessColor}`}
                style={{ width: `${teacher.profileCompleteness}%` }}
              ></div>
            </div>
            {teacher.profileCompleteness < 100 && (
              <p className="text-sm text-yellow-700 mt-2">
                Your profile is {teacher.profileCompleteness}% complete.{" "}
                <Link href="/teacher/setup" className="font-medium underline">
                  Complete it now
                </Link>
              </p>
            )}
          </div>

          <div className="divide-y divide-border *:py-6">
            {/* Description */}
            {teacher.description && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  About
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {teacher.description}
                </p>
              </div>
            )}

            {/* Education & Subjects */}
            {(teacher.educationPhases.length > 0 ||
              allPhaseKeys.length > 0) && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teacher.educationPhases.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <GraduationCap size={20} />
                        Education Phases
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {teacher.educationPhases.map((phase) => (
                          <Badge
                            key={phase}
                            variant="secondary"
                            className="bg-primary/5 text-primary"
                          >
                            {phase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {allPhaseKeys.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <Briefcase size={20} />
                        Subjects
                      </h2>
                      <div className="space-y-2">
                        {allPhaseKeys.map((phase) => (
                          <div key={phase}>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                              {phase}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {teacher.subjects[phase].map((subject) => (
                                <Badge
                                  key={`${phase}-${subject}`}
                                  variant="outline"
                                  className="bg-muted text-muted-foreground border-border"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sports & Arts */}
            {(Object.keys(teacher.sports).length > 0 ||
              Object.keys(teacher.artsCulture).length > 0) && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(teacher.sports).length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <Dumbbell size={20} />
                        Sports
                      </h2>
                      <div className="space-y-2">
                        {Object.entries(teacher.sports).map(
                          ([phase, items]) => (
                            <div key={phase}>
                              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                                {phase}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {items.map((sport) => (
                                  <Badge
                                    key={`${phase}-${sport}`}
                                    variant="secondary"
                                    className="bg-green-50 text-green-700"
                                  >
                                    {sport}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {Object.keys(teacher.artsCulture).length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <Palette size={20} />
                        Arts &amp; Culture
                      </h2>
                      <div className="space-y-2">
                        {Object.entries(teacher.artsCulture).map(
                          ([phase, items]) => (
                            <div key={phase}>
                              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                                {phase}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {items.map((art) => (
                                  <Badge
                                    key={`${phase}-${art}`}
                                    variant="secondary"
                                    className="bg-purple-50 text-purple-700"
                                  >
                                    {art}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">
                  Experience
                </h2>
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="border-l-4 border-primary pl-4"
                    >
                      <h3 className="font-bold text-foreground">{exp.title}</h3>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.startDate
                          ? format(new Date(exp.startDate), "MMM yyyy")
                          : "N/A"}{" "}
                        -{" "}
                        {exp.endDate
                          ? format(new Date(exp.endDate), "MMM yyyy")
                          : "Present"}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {teacher.teacherReferences.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Users size={20} />
                  References
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacher.teacherReferences.map((ref, idx) => (
                    <div
                      key={idx}
                      className="border border-border p-4 rounded-lg"
                    >
                      <p className="font-bold text-foreground">{ref.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ref.relationship}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ref.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ref.phone}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews from Schools */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare size={20} />
                Reviews from Schools
              </h2>
              {testimonials.length > 0 ? (
                <div className="space-y-4">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-foreground">
                          {t.senderName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(t.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {t.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 border border-border p-6 text-center rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No reviews yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reviews will appear here after you complete jobs
                  </p>
                </div>
              )}
            </div>

            {/* Documents & Verification */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">
                Documents & Verification
              </h2>
              <div className="space-y-4">
                {docSummary.map(
                  ({ type, hasApproved, hasPending, latestRejection }) => {
                    const docsOfType = documents.filter(
                      (d) => d.documentType === type
                    );
                    let dotColor = "bg-gray-300";
                    if (hasApproved) dotColor = "bg-green-500";
                    else if (hasPending) dotColor = "bg-yellow-500";
                    else if (latestRejection) dotColor = "bg-red-500";

                    return (
                      <div
                        key={type}
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-3 h-3 rounded-full ${dotColor}`}
                          ></div>
                          <span className="text-sm font-bold text-foreground">
                            {DOC_LABELS[type]}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              hasApproved
                                ? "bg-green-100 text-green-700 border-green-200 ml-auto"
                                : hasPending
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200 ml-auto"
                                : latestRejection
                                ? "bg-red-100 text-red-700 border-red-200 ml-auto"
                                : "bg-muted text-muted-foreground border-border ml-auto"
                            }
                          >
                            {hasApproved
                              ? "Approved"
                              : hasPending
                              ? "Pending"
                              : latestRejection
                              ? "Rejected"
                              : "Not uploaded"}
                          </Badge>
                        </div>
                        {docsOfType.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {docsOfType.map((doc) => (
                              <DocThumbnail
                                key={doc.id}
                                doc={doc}
                                onOpen={openLightbox}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Not uploaded yet.{" "}
                            <Link
                              href="/teacher/setup"
                              className="text-primary hover:underline"
                            >
                              Upload
                            </Link>
                          </p>
                        )}
                        {latestRejection?.rejectionReason &&
                          !hasApproved &&
                          !hasPending && (
                            <p className="text-xs text-red-600 mt-2">
                              Reason: {latestRejection.rejectionReason}
                            </p>
                          )}
                      </div>
                    );
                  }
                )}
              </div>
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
    </DashboardLayout>
  );
}
