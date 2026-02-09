'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/Header';
import MarketingFooter from '@/components/marketing/Footer';
import { CheckCircle, ChevronDown, ChevronUp, UserPlus, FileText, Briefcase } from 'lucide-react';

const BENEFITS = [
  {
    title: 'Flexible Placements',
    description: 'Find short-term, permanent, or coaching positions that fit your schedule and expertise.',
  },
  {
    title: 'Verified Schools',
    description: 'All schools on our platform are verified with valid EMIS numbers and registration certificates.',
  },
  {
    title: 'Easy Applications',
    description: 'Apply to multiple positions with a single profile. Track all your applications in one place.',
  },
  {
    title: 'Distance Matching',
    description: 'See jobs within your preferred distance radius. No more commuting surprises.',
  },
];

const PROCESS_STEPS = [
  {
    icon: <UserPlus size={32} />,
    title: 'Sign Up',
    description: 'Create your free account in minutes. Choose "Teacher" as your account type.',
  },
  {
    icon: <FileText size={32} />,
    title: 'Complete Your Profile',
    description: 'Add your qualifications, experience, subjects, and upload your documents for verification.',
  },
  {
    icon: <Briefcase size={32} />,
    title: 'Get Matched',
    description: 'Browse available positions matched to your subjects and location. Apply with one click.',
  },
];

const FAQS = [
  {
    question: 'How much does it cost to use TempEd?',
    answer: 'TempEd is completely free for teachers. Create your profile, browse jobs, and apply at no cost.',
  },
  {
    question: 'What documents do I need to upload?',
    answer: 'You will need your CV, academic qualifications (degrees/diplomas), a copy of your ID or passport, and a criminal record check. These documents help schools verify your credentials.',
  },
  {
    question: 'How does the matching work?',
    answer: 'Jobs are matched based on your selected subjects, education phases, and distance from the school. You set your preferred distance radius, and we show you relevant opportunities within that range.',
  },
  {
    question: 'Can I apply for permanent positions?',
    answer: 'Yes! Schools post permanent, temporary, invigilator, and coaching positions. You can filter by job type to find what suits you best.',
  },
  {
    question: 'How long does verification take?',
    answer: 'Once you upload all required documents, our admin team reviews them within 2-3 business days. Verified profiles are prioritized by schools.',
  },
];

export default function TeacherHomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1c1d1f] mb-6">
              Find Your Next Teaching Opportunity
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              TempEd connects qualified teachers with schools across South Africa for short-term, permanent, and coaching positions. Create your profile and start applying today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors text-lg"
              >
                Get Started Free
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
            Why Teachers Choose TempEd
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
            TempEd is a South African platform designed to solve the staffing challenges faced by schools. Whether a school needs a temporary replacement, a permanent hire, an invigilator, or a sports coach, TempEd makes it easy to find qualified educators.
          </p>
          <p className="text-gray-600 text-lg">
            For teachers, TempEd provides access to opportunities that match your qualifications, preferred subjects, and location — all in one place.
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
            Have questions? Our support team is here to help.
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
