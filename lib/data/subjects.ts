export interface SubjectCategory {
  category: 'Academic' | 'Coaching' | 'Arts & Culture';
  subjects: string[];
}

export const subjectsByPhase: Record<string, SubjectCategory[]> = {
  'Foundation Phase': [
    {
      category: 'Academic',
      subjects: [
        'Life Skills',
        'Mathematics',
        'English Home Language',
        'English First Additional Language',
        'Afrikaans Home Language',
        'Afrikaans First Additional Language',
        'IsiZulu Home Language',
        'IsiXhosa Home Language',
        'Sesotho Home Language',
      ],
    },
    {
      category: 'Coaching',
      subjects: ['Cricket', 'Rugby', 'Netball', 'Soccer', 'Athletics', 'Cross country', 'Tennis', 'Hockey', 'Table tennis', 'Other'],
    },
    {
      category: 'Arts & Culture',
      subjects: ['Drama', 'Choir', 'Other'],
    },
  ],
  'Primary': [
    {
      category: 'Academic',
      subjects: [
        'Mathematics',
        'English Home Language',
        'English First Additional Language',
        'Afrikaans Home Language',
        'Afrikaans First Additional Language',
        'IsiZulu Home Language',
        'IsiXhosa Home Language',
        'Natural Sciences',
        'Social Sciences',
        'Technology',
        'Economic and Management Sciences',
        'Life Orientation',
        'Creative Arts',
      ],
    },
    {
      category: 'Coaching',
      subjects: ['Cricket', 'Rugby', 'Netball', 'Soccer', 'Athletics', 'Cross country', 'Tennis', 'Hockey', 'Table tennis', 'Other'],
    },
    {
      category: 'Arts & Culture',
      subjects: ['Drama', 'Debate', 'Choir', 'Other'],
    },
  ],
  'Secondary': [
    {
      category: 'Academic',
      subjects: [
        'Mathematics',
        'Mathematical Literacy',
        'English Home Language',
        'English First Additional Language',
        'Afrikaans Home Language',
        'Afrikaans First Additional Language',
        'Physical Sciences',
        'Life Sciences',
        'Accounting',
        'Business Studies',
        'Economics',
        'Geography',
        'History',
        'Life Orientation',
        'Information Technology',
        'Computer Applications Technology',
        'Engineering Graphics and Design',
        'Visual Arts',
        'Dramatic Arts',
        'Music',
        'Consumer Studies',
        'Tourism',
        'Agricultural Sciences',
      ],
    },
    {
      category: 'Coaching',
      subjects: ['Cricket', 'Rugby', 'Netball', 'Soccer', 'Athletics', 'Cross country', 'Tennis', 'Hockey', 'Table tennis', 'Other'],
    },
    {
      category: 'Arts & Culture',
      subjects: ['Drama', 'Debate', 'Choir', 'Other'],
    },
  ],
  'Tertiary': [
    {
      category: 'Academic',
      subjects: [
        'Education Studies',
        'Research Methodology',
        'Curriculum Development',
        'Educational Psychology',
        'Teaching Practice',
        'Other',
      ],
    },
    {
      category: 'Coaching',
      subjects: ['Cricket', 'Rugby', 'Netball', 'Soccer', 'Athletics', 'Other'],
    },
    {
      category: 'Arts & Culture',
      subjects: ['Drama', 'Debate', 'Choir', 'Other'],
    },
  ],
};

// Flat list of all unique subjects across all phases
export function getAllSubjects(): string[] {
  const subjects = new Set<string>();
  Object.values(subjectsByPhase).forEach(categories => {
    categories.forEach(cat => {
      cat.subjects.forEach(s => subjects.add(s));
    });
  });
  return Array.from(subjects).sort();
}

// Get subjects for a specific phase as a flat list
export function getSubjectsForPhase(phase: string): string[] {
  const categories = subjectsByPhase[phase];
  if (!categories) return [];
  const subjects: string[] = [];
  categories.forEach(cat => {
    cat.subjects.forEach(s => {
      if (!subjects.includes(s)) subjects.push(s);
    });
  });
  return subjects;
}
