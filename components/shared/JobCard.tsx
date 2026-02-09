import Link from 'next/link';
import { Job, School } from '@/types';
import { MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import { format } from 'date-fns';

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
}

export default function JobCard({
  job,
  school,
  teacherLocation,
  onApply,
  applied,
  linkPrefix = '/teacher',
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
  const endDate = format(new Date(job.endDate), 'MMM d, yyyy');
  const deadline = format(new Date(job.applicationDeadline), 'MMM d, yyyy');

  return (
    <Link href={`${linkPrefix}/jobs/${job.id}`} className="block">
      <div className="bg-white border border-gray-300 p-5 hover:shadow-lg transition-shadow cursor-pointer">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#1c1d1f] mb-1">
                {job.title}
              </h3>
              <Link
                href={`${linkPrefix}/schools/${school.id}`}
                className="text-sm text-gray-600 hover:text-[#2563eb] font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {school.name}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {job.jobType && (
                <span className={`px-2 py-1 text-xs font-bold ${JOB_TYPE_COLORS[job.jobType] || 'bg-gray-100 text-gray-700'}`}>
                  {job.jobType}
                </span>
              )}
              {isUrgent && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold">
                  <AlertCircle size={12} />
                  URGENT
                </span>
              )}
            </div>
          </div>

          {/* Distance Badge */}
          {distance !== null && (
            <div className="text-sm text-gray-600 mb-3 flex items-center gap-1">
              <MapPin size={14} />
              <span>{formatDistance(distance)}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>

          {/* Date Info */}
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{startDate} - {endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Apply by {deadline}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
              {job.educationPhase}
            </span>
            <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
              {job.subject}
            </span>
            {job.tags.filter(t => t !== 'Urgent').map(tag => (
              <span key={tag} className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* View Details Button */}
          <div className="w-full py-2.5 px-4 font-bold transition-colors bg-[#2563eb] text-white hover:bg-[#1d4ed8] text-center">
            {applied ? 'View Application' : 'View Details'}
          </div>
        </div>
      </div>
    </Link>
  );
}
