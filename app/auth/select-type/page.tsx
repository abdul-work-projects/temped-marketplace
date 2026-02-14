"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { UserType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export default function SelectTypePage() {
  const { user, isLoading, confirmUserType } = useAuth();
  const [selecting, setSelecting] = useState<UserType | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSelect = async (type: UserType) => {
    setSelecting(type);
    setError("");

    try {
      const result = await confirmUserType(type);

      if (!result.success) {
        setError(
          result.error || "Failed to update account type. Please try again."
        );
        setSelecting(null);
        return;
      }

      router.push(
        type === "school" ? "/school/dashboard" : "/teacher/dashboard"
      );
    } catch {
      setError("Something went wrong. Please try again.");
      setSelecting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 mb-6 w-full"
        >
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-3xl font-bold text-foreground">TempEd</span>
        </Link>

        <h2 className="text-center text-2xl font-bold text-foreground mb-2">
          Welcome to TempEd
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          How will you be using TempEd?
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md hover:border-primary ${
              selecting === "teacher" ? "border-primary shadow-md" : ""
            } ${selecting !== null ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => selecting === null && handleSelect("teacher")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {selecting === "teacher" ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <GraduationCap className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground text-lg">
                  I&apos;m a Teacher
                </p>
                <p className="text-sm text-muted-foreground">
                  Find teaching opportunities at schools
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md hover:border-primary ${
              selecting === "school" ? "border-primary shadow-md" : ""
            } ${selecting !== null ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => selecting === null && handleSelect("school")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {selecting === "school" ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <Building2 className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground text-lg">
                  I&apos;m a School
                </p>
                <p className="text-sm text-muted-foreground">
                  Post jobs and find qualified teachers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
