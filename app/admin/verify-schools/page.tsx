"use client";

import Link from "next/link";
import { useUnverifiedSchools } from "@/lib/hooks/useAdmin";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import { Loader2, ShieldCheck, Eye, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export default function AdminVerifySchools() {
  const { schools, loading } = useUnverifiedSchools();

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Verify Schools
            </h1>
            <p className="text-muted-foreground">
              Review and verify school registration certificates
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : schools.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  All caught up!
                </h3>
                <p className="text-muted-foreground">
                  There are no schools pending verification at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-5 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">EMIS Number</div>
                <div className="col-span-1">Certificate</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4 border-b border-border items-center hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-1 flex items-center gap-2">
                    <SchoolAvatar profilePicture={school.profilePicture} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {school.name}
                      </p>
                      <p className="text-xs text-muted-foreground md:hidden truncate">
                        {school.email}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1 hidden md:block">
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
                    {school.registrationCertificate ? (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        Pending Review
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Uploaded</Badge>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Button size="sm" asChild>
                      <Link href={`/admin/schools/${school.id}`}>
                        <Eye className="w-4 h-4" />
                        Review
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
