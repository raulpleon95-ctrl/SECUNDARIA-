

import { SchoolGradeStructure, Student, SchoolData, User } from './types';

export const roundGrade = (grade: number): number => {
  return Math.round(grade);
};

export const SCHOOL_GRADES: SchoolGradeStructure[] = [
  {
    grade: "1°",
    groups: ['A', 'B', 'C', 'D'],
    subjects: ['Español', 'Matemáticas', 'Biología', 'Inglés', 'Formación Cívica y Ética', 'Artes', 'Educación Física', 'Tecnología'],
    hiddenSubjects: []
  },
  {
    grade: "2°",
    groups: ['A', 'B', 'C', 'D'],
    subjects: ['Español', 'Matemáticas', 'Física', 'Inglés', 'Formación Cívica y Ética', 'Artes', 'Educación Física', 'Tecnología'],
    hiddenSubjects: []
  },
  {
    grade: "3°",
    groups: ['A', 'B', 'C', 'D'],
    subjects: ['Español', 'Matemáticas', 'Química', 'Inglés', 'Formación Cívica y Ética', 'Artes', 'Educación Física', 'Tecnología'],
    hiddenSubjects: []
  },
];

export const TECHNOLOGIES = [
  'Cocina',
  'Circuitos eléctricos',
  'Electrónica',
  'Diseño arquitectónico',
  'Industria del vestido'
];

export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
export const CLASS_PERIODS = [1, 2, 3, 4, 5, 6, 7];

// Generate empty grade structure for a student (New Inter-Trimester Structure)
export const generateEmptyGrades = (grade: string): Record<string, any> => {
  const gradeInfo = SCHOOL_GRADES.find(g => g.grade === grade);
  const studentGrades: Record<string, any> = {};
  
  if (gradeInfo) {
    gradeInfo.subjects.forEach(subject => {
      studentGrades[subject] = {
        inter_1: '', trim_1: '',
        inter_2: '', trim_2: '',
        inter_3: '', trim_3: '',
      };
    });
  }
  return studentGrades;
};

export const generateInitialData = (): SchoolData => {
  const studentsData: Student[] = [];

  const initialUsers: User[] = [
    {
      id: 'admin',
      name: 'Director Gerardo Durán',
      username: 'director',
      password: '123',
      role: 'admin'
    },
    {
      id: 'sub1',
      name: 'Subdirector General',
      username: 'subdirector',
      password: '123',
      role: 'subdirector'
    },
    {
      id: 't1',
      name: 'Prof. Juan Pérez (Matemáticas)',
      username: 'profe',
      password: '123',
      role: 'teacher',
      assignments: [
        { grade: '1°', group: 'A', subject: 'Matemáticas' },
        { grade: '1°', group: 'B', subject: 'Matemáticas' },
        { grade: '2°', group: 'A', subject: 'Matemáticas' },
      ]
    }
  ];

  const defaultData: SchoolData = {
    name: "Escuela Secundaria Diurna No. 27 TV. “Alfredo E Uruchurtu”",
    director: "Gerardo Durán Diaz",
    subdirector: "Nombre del Subdirector(a)", // Valor por defecto
    teachers: 25,
    studentsCount: 0, 
    gradesStructure: SCHOOL_GRADES,
    technologies: TECHNOLOGIES, // Inicializar con la lista por defecto
    studentsData: studentsData,
    users: initialUsers,
    allowedPeriods: ['inter_1'], // Start with 1st Inter-period open
    periodDeadlines: {}, // Inicializar mapa de fechas límite vacío
    citations: [],
    visitLogs: [],
    minutas: [],
    schedules: [],
    // Inicializar layout de sábana con el profesor de ejemplo para que no esté vacío al inicio
    sabanaLayout: {
        academic: ['t1'],
        technology: [],
        support: []
    },
    alcaldia: "LA MAGDALENA CONTRERAS",
    zonaEscolar: "069",
    turno: "VESPERTINO"
  };
  
  return defaultData;
};

export const MOCK_USERS: User[] = [];