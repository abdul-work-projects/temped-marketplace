'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { UserType } from '@/types';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<UserType>('teacher');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [emisNumber, setEmisNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const result = await signup({
      email,
      password,
      type: accountType,
      firstName: accountType === 'teacher' ? firstName : undefined,
      lastName: accountType === 'teacher' ? lastName : undefined,
      schoolName: accountType === 'school' ? schoolName : undefined,
      emisNumber: accountType === 'school' ? emisNumber : undefined,
    });

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Signup failed');
    }

    setIsLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsLoading(true);

    const result = await loginWithGoogle();

    if (!result.success) {
      setError(result.error || 'Google signup failed');
      setIsLoading(false);
    }
    // On success, the page will redirect via OAuth flow
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 w-full">
          <div className="w-12 h-12 bg-[#2563eb] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-3xl font-bold text-[#1c1d1f]">TempEd</span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-[#1c1d1f] mb-2">
          Create Your TempEd Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="account-type" className="block text-sm font-bold text-[#1c1d1f] mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('teacher')}
                  className={`py-3 px-4 border-2 font-bold transition-colors ${
                    accountType === 'teacher'
                      ? 'border-[#1c1d1f] bg-gray-50 text-[#1c1d1f]'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('school')}
                  className={`py-3 px-4 border-2 font-bold transition-colors ${
                    accountType === 'school'
                      ? 'border-[#1c1d1f] bg-gray-50 text-[#1c1d1f]'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  School
                </button>
              </div>
            </div>

            {accountType === 'teacher' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-bold text-[#1c1d1f] mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded text-[#1c1d1f] placeholder-gray-400 focus:outline-none focus:border-[#1c1d1f] transition-colors"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-bold text-[#1c1d1f] mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded text-[#1c1d1f] placeholder-gray-400 focus:outline-none focus:border-[#1c1d1f] transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="schoolName" className="block text-sm font-bold text-[#1c1d1f] mb-1">
                    School Name
                  </label>
                  <input
                    id="schoolName"
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded text-[#1c1d1f] placeholder-gray-400 focus:outline-none focus:border-[#1c1d1f] transition-colors"
                    placeholder="School name"
                  />
                </div>
                <div>
                  <label htmlFor="emisNumber" className="block text-sm font-bold text-[#1c1d1f] mb-1">
                    EMIS Number
                  </label>
                  <input
                    id="emisNumber"
                    type="text"
                    required
                    value={emisNumber}
                    onChange={(e) => setEmisNumber(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded text-[#1c1d1f] placeholder-gray-400 focus:outline-none focus:border-[#1c1d1f] transition-colors"
                    placeholder="EMIS number"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#1c1d1f] mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded text-[#1c1d1f] placeholder-gray-400 focus:outline-none focus:border-[#1c1d1f] transition-colors"
                placeholder="Email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#1c1d1f] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded text-[#1c1d1f] placeholder-gray-400 focus:outline-none focus:border-[#1c1d1f] transition-colors"
                  placeholder="Password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 text-[#1c1d1f] font-bold hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2563eb] font-bold hover:text-[#1d4ed8]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
