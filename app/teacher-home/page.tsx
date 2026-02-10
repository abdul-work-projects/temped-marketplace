'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/Header';
import MarketingFooter from '@/components/marketing/Footer';
import {
  ChevronDown,
  MapPin,
  Clock,
  Shield,
  Briefcase,
  BookOpen,
  GraduationCap,
  Users,
  Award,
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
    icon: <Clock size={24} />,
    title: 'Flexible Placements',
    description:
      'Find short-term, permanent, or coaching positions that fit your schedule and expertise.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: <Shield size={24} />,
    title: 'Verified Schools',
    description:
      'All schools on our platform are verified with valid EMIS numbers and registration certificates.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: <Briefcase size={24} />,
    title: 'Easy Applications',
    description:
      'Apply to multiple positions with a single profile. Track all your applications in one place.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: <MapPin size={24} />,
    title: 'Distance Matching',
    description:
      'See jobs within your preferred distance radius. No more commuting surprises.',
    color: 'bg-orange-100 text-orange-600',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Sign Up',
    description:
      'Create your free account in minutes. Choose "Teacher" as your account type.',
  },
  {
    number: '2',
    title: 'Complete Your Profile',
    description:
      'Add your qualifications, experience, subjects, and upload your documents for verification.',
  },
  {
    number: '3',
    title: 'Get Matched',
    description:
      'Browse available positions matched to your subjects and location. Apply with one click.',
  },
];

const FAQS = [
  {
    question: 'How much does it cost to use TempEd?',
    answer:
      'TempEd is completely free for teachers. Create your profile, browse jobs, and apply at no cost.',
  },
  {
    question: 'What documents do I need to upload?',
    answer:
      'You will need your CV, academic qualifications (degrees/diplomas), a copy of your ID or passport, and a criminal record check. These documents help schools verify your credentials.',
  },
  {
    question: 'How does the matching work?',
    answer:
      'Jobs are matched based on your selected subjects, education phases, and distance from the school. You set your preferred distance radius, and we show you relevant opportunities within that range.',
  },
  {
    question: 'Can I apply for permanent positions?',
    answer:
      'Yes! Schools post permanent, temporary, invigilator, and coaching positions. You can filter by job type to find what suits you best.',
  },
  {
    question: 'How long does verification take?',
    answer:
      'Once you upload all required documents, our admin team reviews them within 2-3 business days. Verified profiles are prioritised by schools.',
  },
];

export default function TeacherHomePage() {
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
                For Teachers
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Find Your Next Teaching Opportunity
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                TempEd connects qualified teachers with schools across South
                Africa for short-term, permanent, and coaching positions. Create
                your profile and start applying today.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Get Started Free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/login">Log In</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required. Free for teachers, always.
              </p>
            </div>

            {/* Right — decorative grid */}
            <div className="hidden lg:grid grid-cols-3 grid-rows-3 gap-4 max-w-md ml-auto">
              <div className="bg-primary/10 rounded-2xl p-6 flex items-center justify-center">
                <BookOpen size={32} className="text-primary" />
              </div>
              <div className="bg-green-100 rounded-2xl p-6 flex items-center justify-center col-span-2 row-span-2">
                <GraduationCap size={48} className="text-green-600" />
              </div>
              <div className="bg-orange-100 rounded-2xl p-6 flex items-center justify-center row-span-2">
                <Users size={32} className="text-orange-600" />
              </div>
              <div className="bg-purple-100 rounded-2xl p-6 flex items-center justify-center">
                <Award size={32} className="text-purple-600" />
              </div>
              <div className="bg-blue-100 rounded-2xl p-6 flex items-center justify-center">
                <Briefcase size={32} className="text-blue-600" />
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
            Why Teachers Choose TempEd
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Everything you need to find and land your next teaching position, in one platform.
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
            TempEd is a South African platform designed to solve the staffing
            challenges faced by schools. Whether a school needs a temporary
            replacement, a permanent hire, an invigilator, or a sports coach,
            TempEd makes it easy to find qualified educators.
          </p>
          <p className="text-background/70 text-lg mb-8">
            For teachers, TempEd provides access to opportunities that match
            your qualifications, preferred subjects, and location — all in one
            place.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-background/30 text-background hover:bg-background/10"
            asChild
          >
            <Link href="/auth/signup">Join TempEd Today</Link>
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
            Ready to find your next opportunity?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join hundreds of teachers already using TempEd to find placements
            across South Africa.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
