'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/Header';
import MarketingFooter from '@/components/marketing/Footer';
import { CheckCircle, ChevronDown, ChevronUp, FileText, Users, UserCheck } from 'lucide-react';

const BENEFITS = [
  {
    title: 'Verified Teachers',
    description: 'All teachers on our platform go through document verification including qualifications, ID, and criminal record checks.',
  },
  {
    title: 'Fast Hiring',
    description: 'Post a job and receive applications from qualified teachers within hours. Fill urgent positions quickly.',
  },
  {
    title: 'Flexible Job Types',
    description: 'Post permanent, temporary, invigilator, or coaching positions. Reach the right candidates for every need.',
  },
  {
    title: 'Subject Matching',
    description: 'Our platform automatically matches your job postings with teachers qualified in the specific subjects you need.',
  },
];

const PROCESS_STEPS = [
  {
    icon: <FileText size={32} />,
    title: 'Post a Job',
    description: 'Create a detailed job listing specifying the subject, education phase, job type, and required qualifications.',
  },
  {
    icon: <Users size={32} />,
    title: 'Review Applicants',
    description: 'View teacher profiles, qualifications, and experience. Shortlist your top candidates and track progress.',
  },
  {
    icon: <UserCheck size={32} />,
    title: 'Hire',
    description: 'Contact your preferred candidates directly. Update the job status as you move through the hiring process.',
  },
];

const FAQS = [
  {
    question: 'How much does it cost for schools?',
    answer: 'TempEd is free to use during our launch period. Post unlimited jobs and connect with verified teachers at no cost.',
  },
  {
    question: 'What information do I need to get started?',
    answer: 'You will need your school name, EMIS number, and email address to create an account. You can then add your school description, address, and registration certificate.',
  },
  {
    question: 'How are teachers verified?',
    answer: 'Teachers upload their qualifications, ID documents, and criminal record checks. Our admin team reviews these documents and marks verified teachers with a badge on their profile.',
  },
  {
    question: 'Can I post urgent positions?',
    answer: 'Yes! You can add an "Urgent" tag to any job posting to highlight time-sensitive positions. These appear prominently in teacher job feeds.',
  },
  {
    question: 'How do I manage applications?',
    answer: 'Each job posting has an applicants view where you can see all applications, shortlist candidates, update statuses, and contact teachers directly through the platform.',
  },
];

export default function SchoolHomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1c1d1f] mb-6">
              Find Qualified Teachers for Your School
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              TempEd helps schools across South Africa find verified, qualified teachers for permanent, temporary, and coaching positions. Post a job and start receiving applications today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors text-lg"
              >
                Register Your School
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 border-2 border-[#1c1d1f] text-[#1c1d1f] font-bold hover:bg-gray-50 transition-colors text-lg"
              >
                Log In
              </Link>
            </div>

            {/* VSL Placeholder */}
            <div className="mt-12 bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <p className="text-gray-500 font-medium">Video Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1c1d1f] text-center mb-12">
            Why Schools Choose TempEd
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={24} className="text-[#2563eb]" />
                </div>
                <h3 className="text-lg font-bold text-[#1c1d1f] mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1c1d1f] text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className="text-center bg-white p-8 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#2563eb]">
                  {step.icon}
                </div>
                <div className="text-sm font-bold text-[#2563eb] mb-2">Step {index + 1}</div>
                <h3 className="text-xl font-bold text-[#1c1d1f] mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1c1d1f] mb-6">About TempEd</h2>
          <p className="text-gray-600 text-lg mb-4">
            TempEd was built to address the challenge schools face when they need qualified educators quickly. Whether it&apos;s a maternity leave replacement, exam invigilation, sports coaching, or a permanent hire, our platform connects you with vetted professionals.
          </p>
          <p className="text-gray-600 text-lg">
            Every teacher on TempEd goes through a verification process, giving you confidence in every candidate you review.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1c1d1f] text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full px-6 py-4 text-left"
                >
                  <span className="font-bold text-[#1c1d1f]">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1c1d1f] mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions about bringing TempEd to your school? We&apos;d love to hear from you.
          </p>
          <a
            href="mailto:support@temped.co.za"
            className="inline-block px-8 py-3 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
