'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher, School, Job, Application } from '@/types';
import { mockTeachers, mockSchools, mockJobs, mockApplications } from '@/lib/data/mockData';

interface DataContextType {
  teachers: Teacher[];
  schools: School[];
  jobs: Job[];
  applications: Application[];
  getTeacherByUserId: (userId: string) => Teacher | undefined;
  getSchoolByUserId: (userId: string) => School | undefined;
  getSchoolById: (schoolId: string) => School | undefined;
  getJobById: (jobId: string) => Job | undefined;
  getTeacherById: (teacherId: string) => Teacher | undefined;
  getApplicationsByTeacherId: (teacherId: string) => Application[];
  getApplicationsByJobId: (jobId: string) => Application[];
  addApplication: (application: Omit<Application, 'id'>) => void;
  updateTeacher: (teacherId: string, updates: Partial<Teacher>) => void;
  updateSchool: (schoolId: string, updates: Partial<School>) => void;
  createJob: (job: Omit<Job, 'id' | 'createdAt'>) => void;
  updateApplication: (applicationId: string, updates: Partial<Application>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Initialize data from localStorage or mock data
  useEffect(() => {
    const storedTeachers = localStorage.getItem('teachers');
    const storedSchools = localStorage.getItem('schools');
    const storedJobs = localStorage.getItem('jobs');
    const storedApplications = localStorage.getItem('applications');

    setTeachers(storedTeachers ? JSON.parse(storedTeachers) : mockTeachers);
    setSchools(storedSchools ? JSON.parse(storedSchools) : mockSchools);
    setJobs(storedJobs ? JSON.parse(storedJobs) : mockJobs);
    setApplications(storedApplications ? JSON.parse(storedApplications) : mockApplications);
  }, []);

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    if (teachers.length > 0) localStorage.setItem('teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    if (schools.length > 0) localStorage.setItem('schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    if (jobs.length > 0) localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    if (applications.length > 0) localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  const getTeacherByUserId = (userId: string) => {
    return teachers.find(t => t.userId === userId);
  };

  const getSchoolByUserId = (userId: string) => {
    return schools.find(s => s.userId === userId);
  };

  const getSchoolById = (schoolId: string) => {
    return schools.find(s => s.id === schoolId);
  };

  const getJobById = (jobId: string) => {
    return jobs.find(j => j.id === jobId);
  };

  const getTeacherById = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId);
  };

  const getApplicationsByTeacherId = (teacherId: string) => {
    return applications.filter(a => a.teacherId === teacherId);
  };

  const getApplicationsByJobId = (jobId: string) => {
    return applications.filter(a => a.jobId === jobId);
  };

  const addApplication = (application: Omit<Application, 'id'>) => {
    const newApplication: Application = {
      ...application,
      id: `app-${Date.now()}`
    };
    setApplications(prev => [...prev, newApplication]);
  };

  const updateTeacher = (teacherId: string, updates: Partial<Teacher>) => {
    setTeachers(prev =>
      prev.map(teacher =>
        teacher.id === teacherId ? { ...teacher, ...updates } : teacher
      )
    );
  };

  const updateSchool = (schoolId: string, updates: Partial<School>) => {
    setSchools(prev =>
      prev.map(school =>
        school.id === schoolId ? { ...school, ...updates } : school
      )
    );
  };

  const createJob = (job: Omit<Job, 'id' | 'createdAt'>) => {
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setJobs(prev => [...prev, newJob]);
  };

  const updateApplication = (applicationId: string, updates: Partial<Application>) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, ...updates } : app
      )
    );
  };

  return (
    <DataContext.Provider
      value={{
        teachers,
        schools,
        jobs,
        applications,
        getTeacherByUserId,
        getSchoolByUserId,
        getSchoolById,
        getJobById,
        getTeacherById,
        getApplicationsByTeacherId,
        getApplicationsByJobId,
        addApplication,
        updateTeacher,
        updateSchool,
        createJob,
        updateApplication
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
