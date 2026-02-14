"use client";

import Link from "next/link";
import { useUnverifiedTeachers } from "@/lib/hooks/useAdmin";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import { getPendingCount } from "@/lib/utils/verification";
import { Loader2, ShieldCheck, Eye, FileText, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function TeacherAvatar({ profilePicture }: { profilePicture?: string }) {
  const url = useSignedUrl("profile-pictures", profilePicture);
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
      {url ? (
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <User className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
}

export default function AdminVerifyTeachers() {
  const { teachers, loading } = useUnverifiedTeachers();

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Verify Teachers
            </h1>
            <p className="text-muted-foreground">
              Review and verify teacher profiles and documents
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : teachers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  All caught up!
                </h3>
                <p className="text-muted-foreground">
                  There are no unverified teachers at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Profile</div>
                <div className="col-span-1">Documents</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {teachers.map((teacher) => {
                const pendingDocs = getPendingCount(teacher.documents);
                const totalDocs = teacher.documents.length;

                return (
                  <div
                    key={teacher.id}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 px-6 py-4 border-b border-border items-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-1 flex items-center gap-2">
                      <TeacherAvatar profilePicture={teacher.profilePicture} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {teacher.firstName} {teacher.surname}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden truncate">
                          {teacher.email}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-1 hidden md:block">
                      <p className="text-sm text-muted-foreground truncate">
                        {teacher.email}
                      </p>
                    </div>
                    <div className="col-span-1">
                      {pendingDocs > 0 ? (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {pendingDocs} pending
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Incomplete</Badge>
                      )}
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${teacher.profileCompleteness}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {teacher.profileCompleteness}%
                        </span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{totalDocs} uploaded</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button size="sm" asChild>
                        <Link href={`/admin/verify/${teacher.id}`}>
                          <Eye className="w-4 h-4" />
                          Review
                        </Link>
                      </Button>
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
