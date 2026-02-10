'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/Header';
import MarketingFooter from '@/components/marketing/Footer';
import { CheckCircle, ChevronDown, ChevronUp, UserPlus, FileText, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <section className="bg-gradient-to-br from-primary/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Find Your Next Teaching Opportunity
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              TempEd connects qualified teachers with schools across South Africa for short-term, permanent, and coaching positions. Create your profile and start applying today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
            </div>

            {/* VSL Placeholder */}
            <div className="mt-12 bg-muted rounded-lg aspect-video flex items-center justify-center">
              <p className="text-muted-foreground font-medium">Video Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Why Teachers Choose TempEd
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit, index) => (
              <Card key={index} className="text-center border-0 shadow-none">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {step.icon}
                  </div>
                  <Badge className="mb-2">Step {index + 1}</Badge>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">About TempEd</h2>
          <p className="text-muted-foreground text-lg mb-4">
            TempEd is a South African platform designed to solve the staffing challenges faced by schools. Whether a school needs a temporary replacement, a permanent hire, an invigilator, or a sports coach, TempEd makes it easy to find qualified educators.
          </p>
          <p className="text-muted-foreground text-lg">
            For teachers, TempEd provides access to opportunities that match your qualifications, preferred subjects, and location — all in one place.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <Card key={index}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full px-6 py-4 text-left"
                >
                  <span className="font-bold text-foreground">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp size={20} className="text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have questions? Our support team is here to help.
          </p>
          <Button asChild>
            <a href="mailto:support@temped.co.za">Contact Us</a>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
