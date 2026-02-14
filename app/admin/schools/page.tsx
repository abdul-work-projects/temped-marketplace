"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminSearchSchools } from "@/lib/hooks/useAdmin";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Eye,
  School,
  Building2,
  X as XIcon,
} from "lucide-react";

function SchoolAvatar({ profilePicture }: { profilePicture?: string }) {
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
        <Building2 className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
}

export default function AdminSchools() {
  const { schools, loading, searchSchools } = useAdminSearchSchools();
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchSchools(query);
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Schools</h1>
            <p className="text-muted-foreground">
              Search and manage school accounts
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or EMIS number..."
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

          {/* Schools Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : schools.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No schools found
                </h3>
                <p className="text-muted-foreground">
                  {query
                    ? "No schools match your search query."
                    : "No schools registered yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">EMIS Number</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1">Verified</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 px-6 py-4 border-b border-border items-center hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-1 flex items-center gap-2">
                    <SchoolAvatar profilePicture={school.profilePicture} />
                    <p className="text-sm font-medium text-foreground truncate">
                      {school.name}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {school.email}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-muted-foreground">
                      {school.emisNumber || "-"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    {school.schoolType ? (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {school.schoolType}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="col-span-1">
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
                        ? "Approved"
                        : school.verificationStatus === "pending"
                        ? "Pending"
                        : school.verificationStatus === "rejected"
                        ? "Rejected"
                        : "Unverified"}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/schools/${school.id}`}>
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
