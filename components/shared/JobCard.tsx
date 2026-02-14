import Link from 'next/link';
import { Job, School } from '@/types';
import { MapPin, Calendar, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const JOB_TYPE_COLORS: Record<string, string> = {
  Permanent: 'bg-green-100 text-green-700',
  Temporary: 'bg-blue-100 text-blue-700',
  Invigilator: 'bg-orange-100 text-orange-700',
  Coach: 'bg-teal-100 text-teal-700',
};

interface JobCardProps {
  job: Job;
  school: School;
  teacherLocation?: { lat: number; lng: number };
  onApply?: (jobId: string) => void;
  applied?: boolean;
  linkPrefix?: string;
  variant?: 'card' | 'list';
}

export default function JobCard({
  job,
  school,
  teacherLocation,
  onApply,
  applied,
  linkPrefix = '/teacher',
  variant = 'card',
}: JobCardProps) {
  const distance = teacherLocation && school.location
    ? calculateDistance(
        teacherLocation.lat,
        teacherLocation.lng,
        school.location.lat,
        school.location.lng
      )
    : null;

  const isUrgent = job.tags.includes('Urgent');
  const startDate = format(new Date(job.startDate), 'MMM d, yyyy');
  const endDate = job.endDate ? format(new Date(job.endDate), 'MMM d, yyyy') : null;
  const deadline = format(new Date(job.applicationDeadline), 'MMM d, yyyy');

  if (variant === 'list') {
    return (
      <Link href={`${linkPrefix}/jobs/${job.id}`} className="block hover:bg-muted/50 transition-colors">
        <div className="py-4 px-5">
          {/* Title */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-foreground">{job.title}</h3>
            <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
          </div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge variant="outline">{job.educationPhase}</Badge>
            <Badge variant="outline">{job.subject}</Badge>
            {job.jobType && (
              <Badge className={JOB_TYPE_COLORS[job.jobType] || 'bg-muted text-muted-foreground'}>
                {job.jobType}
              </Badge>
            )}
            {applied && (
              <Badge className="bg-purple-100 text-purple-700">Applied</Badge>
            )}
            {isUrgent && (
              <Badge className="bg-red-100 text-red-700 border-red-200"><AlertCircle size={12} />URGENT</Badge>
            )}
          </div>
          {/* Bottom row: school · distance · dates */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span>{school.name}</span>
            {distance !== null && (
              <>
                <span className="text-muted-foreground/50">&middot;</span>
                <span className="inline-flex items-center gap-0.5 text-blue-600 font-medium">
                  <MapPin size={12} />
                  {formatDistance(distance)}
                </span>
              </>
            )}
            <span className="text-muted-foreground/50">&middot;</span>
            <span className="inline-flex items-center gap-0.5">
              <Calendar size={12} />
              {startDate}{endDate ? ` – ${endDate}` : ' – Ongoing'}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`${linkPrefix}/jobs/${job.id}`} className="block h-full">
      <div className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">
                {job.title}
              </h3>
              <Link
                href={`${linkPrefix}/schools/${school.id}`}
                className="text-sm text-muted-foreground hover:text-primary font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {school.name}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {applied && (
                <Badge className="bg-purple-100 text-purple-700">Applied</Badge>
              )}
              {job.jobType && (
                <Badge className={JOB_TYPE_COLORS[job.jobType] || 'bg-muted text-muted-foreground'}>{job.jobType}</Badge>
              )}
              {isUrgent && (
                <Badge className="bg-red-100 text-red-700 border-red-200"><AlertCircle size={12} />URGENT</Badge>
              )}
            </div>
          </div>

          {/* Distance Badge */}
          {distance !== null && (
            <div className="mb-3">
              <Badge className="bg-blue-50 text-blue-700 text-xs">
                <MapPin size={12} />
                {formatDistance(distance)}
              </Badge>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

          {/* Date Info */}
          <div className="space-y-2 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{startDate}{endDate ? ` - ${endDate}` : ' - Ongoing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Apply by {deadline}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="outline">{job.educationPhase}</Badge>
            <Badge variant="outline">{job.subject}</Badge>
            {job.tags.filter(t => t !== 'Urgent').map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          {/* View Details Button */}
          <div className="w-full py-2.5 px-4 font-bold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 text-center mt-auto rounded-md">
            {applied ? 'View Application' : 'View Details'}
          </div>
        </div>
      </div>
    </Link>
  );
}
