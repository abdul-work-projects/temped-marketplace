import Link from 'next/link';
import { Job, School, Teacher } from '@/types';
import { MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import { format } from 'date-fns';

interface JobCardProps {
  job: Job;
  school: School;
  teacherLocation?: { lat: number; lng: number };
  onApply?: (jobId: string) => void;
  applied?: boolean;
}

export default function JobCard({
  job,
  school,
  teacherLocation,
  onApply,
  applied
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
    <div className="bg-white border border-gray-300 p-5 hover:shadow-lg transition-shadow">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1c1d1f] mb-1">
              {job.title}
            </h3>
            <Link
              href={`/teacher/schools/${school.id}`}
              className="text-sm text-gray-600 hover:text-[#a435f0] font-medium"
            >
              {school.name}
            </Link>
          </div>
          {isUrgent && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold">
              <AlertCircle size={12} />
              URGENT
            </span>
          )}
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
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
            {job.educationPhase}
          </span>
          <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
            {job.subject}
          </span>
        </div>

        {/* Apply Button */}
        {onApply && (
          <button
            onClick={() => onApply(job.id)}
            disabled={applied}
            className={`w-full py-2.5 px-4 font-bold transition-colors ${
              applied
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#a435f0] text-white hover:bg-[#8710d8]'
            }`}
          >
            {applied ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Applied
              </span>
            ) : (
              'Apply Now'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
