"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  useAdminTestimonials,
  type TestimonialProfileInfo,
} from "@/lib/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Check,
  X,
  MessageSquare,
  MapPin,
  GraduationCap,
  BookOpen,
  Building2,
  User,
} from "lucide-react";

const TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <Badge
      variant="outline"
      className={
        styles[status] || "bg-muted text-muted-foreground border-border"
      }
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function ProfileHoverLink({ profile }: { profile: TestimonialProfileInfo }) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(true), 300);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(false), 200);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {profile.profileUrl ? (
        <Link
          href={profile.profileUrl}
          className="text-primary hover:underline font-medium"
        >
          {profile.name}
        </Link>
      ) : (
        <span>{profile.name}</span>
      )}

      {show && (
        <div
          className="absolute left-0 top-full mt-2 z-50 w-72 bg-card border border-border rounded-lg shadow-lg p-4"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              {profile.type === "teacher" ? (
                <User size={18} className="text-muted-foreground" />
              ) : (
                <Building2 size={18} className="text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm truncate">
                {profile.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile.type}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            {profile.email && <p className="truncate">{profile.email}</p>}

            {profile.address && (
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-muted-foreground shrink-0" />
                <span className="truncate">{profile.address}</span>
              </div>
            )}

            {profile.educationPhases && profile.educationPhases.length > 0 && (
              <div className="flex items-start gap-1.5">
                <GraduationCap
                  size={12}
                  className="text-muted-foreground shrink-0 mt-0.5"
                />
                <div className="flex flex-wrap gap-1">
                  {profile.educationPhases.map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.subjects && profile.subjects.length > 0 && (
              <div className="flex items-start gap-1.5">
                <BookOpen
                  size={12}
                  className="text-muted-foreground shrink-0 mt-0.5"
                />
                <div className="flex flex-wrap gap-1">
                  {profile.subjects.map((s) => (
                    <span
                      key={s}
                      className="px-1.5 py-0.5 bg-primary/5 text-primary rounded text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.schoolType && (
              <div className="flex items-center gap-1.5">
                <Building2
                  size={12}
                  className="text-muted-foreground shrink-0"
                />
                <span>{profile.schoolType}</span>
              </div>
            )}

            {profile.curriculum && (
              <div className="flex items-center gap-1.5">
                <BookOpen
                  size={12}
                  className="text-muted-foreground shrink-0"
                />
                <span>{profile.curriculum}</span>
              </div>
            )}
          </div>

          {profile.profileUrl && (
            <Link
              href={profile.profileUrl}
              className="mt-3 block text-center text-xs font-bold text-primary hover:text-primary/90 border-t border-border pt-2"
            >
              View Full Profile
            </Link>
          )}
        </div>
      )}
    </span>
  );
}

export default function AdminTestimonials() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { testimonials, loading, updateTestimonialStatus, bulkUpdateStatus } =
    useAdminTestimonials(statusFilter);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const pendingTestimonials = testimonials.filter((t) => t.status === "pending");
  const allPendingSelected =
    pendingTestimonials.length > 0 &&
    pendingTestimonials.every((t) => selectedIds.has(t.id));

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    await updateTestimonialStatus(id, status);
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkUpdate = async (status: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkUpdating(true);
    setUpdatingIds(new Set(ids));
    await bulkUpdateStatus(ids, status);
    setUpdatingIds(new Set());
    setSelectedIds(new Set());
    setBulkUpdating(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingTestimonials.map((t) => t.id)));
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Testimonials
            </h1>
            <p className="text-muted-foreground">
              Review and manage user testimonials
            </p>
          </div>

          {/* Tab Filter */}
          <div className="flex gap-1 mb-6 bg-card border border-border rounded-lg p-1 w-fit shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === tab.value
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                {selectedIds.size} selected
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  onClick={() => handleBulkUpdate("approved")}
                  disabled={bulkUpdating}
                >
                  {bulkUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Approve All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkUpdate("rejected")}
                  disabled={bulkUpdating}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {bulkUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  Reject All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Testimonials List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : testimonials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No testimonials found
                </h3>
                <p className="text-muted-foreground">
                  {statusFilter === "all"
                    ? "There are no testimonials yet."
                    : `No ${statusFilter} testimonials found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {/* Select All header for pending */}
              {pendingTestimonials.length > 1 && (
                <div className="px-5 py-3 bg-muted/30 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allPendingSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    Select all pending ({pendingTestimonials.length})
                  </span>
                </div>
              )}
              {testimonials.map((testimonial) => {
                const isUpdating = updatingIds.has(testimonial.id);
                const isPending = testimonial.status === "pending";
                return (
                <div key={testimonial.id} className={`p-5 transition-opacity ${isUpdating ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    {isPending && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(testimonial.id)}
                        onChange={() => toggleSelect(testimonial.id)}
                        disabled={isUpdating}
                        className="w-4 h-4 mt-1 rounded border-border accent-primary cursor-pointer shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="text-sm">
                          <span className="font-medium text-foreground">
                            From:
                          </span>{" "}
                          <ProfileHoverLink profile={testimonial.fromProfile} />
                          <span className="mx-2 text-muted-foreground">|</span>
                          <span className="font-medium text-foreground">
                            To:
                          </span>{" "}
                          <ProfileHoverLink profile={testimonial.toProfile} />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {new Date(testimonial.createdAt).toLocaleDateString(
                          "en-ZA",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                        <span className="mx-2">|</span>
                        Type: {testimonial.fromType}
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">
                        &ldquo;{testimonial.comment}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={testimonial.status} />
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(testimonial.id, "approved")
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(testimonial.id, "rejected")
                            }
                            disabled={isUpdating}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
