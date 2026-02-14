"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminSearchTeachers } from "@/lib/hooks/useAdmin";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import { isTeacherVerified } from "@/lib/utils/verification";
import {
  Loader2,
  Search,
  Eye,
  GraduationCap,
  ShieldCheck,
  User,
  X as XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

export default function AdminTeachers() {
  const { teachers, loading, searchTeachers } = useAdminSearchTeachers();
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchTeachers(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Teachers
            </h1>
            <p className="text-muted-foreground">
              Search and manage teacher accounts
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-10 py-3 h-auto"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Teachers Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : teachers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No teachers found
                </h3>
                <p className="text-muted-foreground">
                  {query
                    ? "No teachers match your search query."
                    : "No teachers registered yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-5 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">Verified</div>
                <div className="col-span-1">Profile Completeness</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4 border-b border-border items-center hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-1 flex items-center gap-2">
                    <TeacherAvatar profilePicture={teacher.profilePicture} />
                    <p className="text-sm font-medium text-foreground truncate">
                      {teacher.firstName} {teacher.surname}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {teacher.email}
                    </p>
                  </div>
                  <div className="col-span-1">
                    {isTeacherVerified(teacher.documents) ? (
                      <Badge className="bg-green-100 text-green-700">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
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
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/teachers/${teacher.id}`}>
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
