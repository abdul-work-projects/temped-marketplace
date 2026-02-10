import Link from 'next/link';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase size={18} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TempEd</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Connecting teachers with schools for short-term teaching placements across South Africa.
            </p>
          </div>

          {/* For Teachers */}
          <div>
            <h3 className="font-bold mb-4">For Teachers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/teacher-home" className="hover:text-background transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-background transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-background transition-colors">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Schools */}
          <div>
            <h3 className="font-bold mb-4">For Schools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/school-home" className="hover:text-background transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-background transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-background transition-colors">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:support@temped.co.za" className="hover:text-background transition-colors">
                  support@temped.co.za
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>+27 (0) 21 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Cape Town, South Africa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TempEd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
