'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/Header';
import MarketingFooter from '@/components/marketing/Footer';
import {
  ChevronDown,
  ShieldCheck,
  Zap,
  Layers,
  Target,
  School,
  ClipboardList,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATS = [
  { value: '500+', label: 'Teachers' },
  { value: '200+', label: 'Schools' },
  { value: '1,000+', label: 'Placements' },
  { value: 'Free', label: 'To Use' },
];

const BENEFITS = [
  {
    icon: <ShieldCheck size={24} />,
    title: 'Verified Teachers',
    description:
      'All teachers go through document verification including qualifications, ID, and criminal record checks.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: <Zap size={24} />,
    title: 'Fast Hiring',
    description:
      'Post a job and receive applications from qualified teachers within hours. Fill urgent positions quickly.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: <Layers size={24} />,
    title: 'Flexible Job Types',
    description:
      'Post permanent, temporary, invigilator, or coaching positions. Reach the right candidates for every need.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: <Target size={24} />,
    title: 'Subject Matching',
    description:
      'Our platform automatically matches your job postings with teachers qualified in the specific subjects you need.',
    color: 'bg-blue-100 text-blue-600',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Post a Job',
    description:
      'Create a detailed job listing specifying the subject, education phase, job type, and required qualifications.',
  },
  {
    number: '2',
    title: 'Review Applicants',
    description:
      'View teacher profiles, qualifications, and experience. Shortlist your top candidates and track progress.',
  },
  {
    number: '3',
    title: 'Hire',
    description:
      'Contact your preferred candidates directly. Update the job status as you move through the hiring process.',
  },
];

const FAQS = [
  {
    question: 'How much does it cost for schools?',
    answer:
      'TempEd is free to use during our launch period. Post unlimited jobs and connect with verified teachers at no cost.',
  },
  {
    question: 'What information do I need to get started?',
    answer:
      'You will need your school name, EMIS number, and email address to create an account. You can then add your school description, address, and registration certificate.',
  },
  {
    question: 'How are teachers verified?',
    answer:
      'Teachers upload their qualifications, ID documents, and criminal record checks. Our admin team reviews these documents and marks verified teachers with a badge on their profile.',
  },
  {
    question: 'Can I post urgent positions?',
    answer:
      'Yes! You can add an "Urgent" tag to any job posting to highlight time-sensitive positions. These appear prominently in teacher job feeds.',
  },
  {
    question: 'How do I manage applications?',
    answer:
      'Each job posting has an applicants view where you can see all applications, shortlist candidates, update statuses, and contact teachers directly through the platform.',
  },
];

export default function SchoolHomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <Badge variant="secondary" className="mb-6">
                For Schools
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Find Qualified Teachers for Your School
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                TempEd helps schools across South Africa find verified, qualified
                teachers for permanent, temporary, and coaching positions. Post a
                job and start receiving applications today.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Register Your School</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/login">Log In</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Free during launch. No hidden fees.
              </p>
            </div>

            {/* Right — decorative grid */}
            <div className="hidden lg:grid grid-cols-3 grid-rows-3 gap-4 max-w-md ml-auto">
              <div className="bg-green-100 rounded-2xl p-6 flex items-center justify-center col-span-2 row-span-2">
                <School size={48} className="text-green-600" />
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 flex items-center justify-center">
                <ClipboardList size={32} className="text-primary" />
              </div>
              <div className="bg-yellow-100 rounded-2xl p-6 flex items-center justify-center">
                <Zap size={32} className="text-yellow-600" />
              </div>
              <div className="bg-purple-100 rounded-2xl p-6 flex items-center justify-center row-span-2">
                <GraduationCap size={32} className="text-purple-600" />
              </div>
              <div className="bg-blue-100 rounded-2xl p-6 flex items-center justify-center">
                <UserCheck size={32} className="text-blue-600" />
              </div>
              <div className="bg-orange-100 rounded-2xl p-6 flex items-center justify-center">
                <Target size={32} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Schools Choose TempEd
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Streamline your hiring process and connect with verified educators
            ready to teach.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex gap-5">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${benefit.color}`}
                >
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-border" />
            {STEPS.map((step) => (
              <div key={step.number} className="text-center relative">
                <p className="text-6xl font-bold text-primary mb-4">
                  {step.number}
                </p>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Contrast Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">About TempEd</h2>
          <p className="text-background/70 text-lg mb-4">
            TempEd was built to address the challenge schools face when they need
            qualified educators quickly. Whether it&apos;s a maternity leave
            replacement, exam invigilation, sports coaching, or a permanent hire,
            our platform connects you with vetted professionals.
          </p>
          <p className="text-background/70 text-lg mb-8">
            Every teacher on TempEd goes through a verification process, giving
            you confidence in every candidate you review.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-background/30 text-background hover:bg-background/10"
            asChild
          >
            <Link href="/auth/signup">Register Your School</Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-border">
            {FAQS.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex items-center justify-between w-full py-5 text-left gap-4"
                >
                  <span className="font-medium text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-muted-foreground flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="pb-5">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to find your next hire?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join hundreds of schools already using TempEd to find qualified
            teachers across South Africa.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <Link href="/auth/signup">Register Your School</Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
