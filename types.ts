

export interface GradeScores {
  // Periodo 1
  inter_1: 'GREEN' | 'RED' | ''; // Semáforo
  trim_1: string; // Numérico
  
  // Periodo 2
  inter_2: 'GREEN' | 'RED' | '';
  trim_2: string;

  // Periodo 3
  inter_3: 'GREEN' | 'RED' | '';
  trim_3: string;
  
  [key: string]: string;
}

export interface Student {
  id: number;
  name: string;
  grade: string; // "1°", "2°", "3°", "Egresado"
  group: string; // "A", "B", "C", "D"
  technology?: string; // Nuevo campo para el Taller
  grades: Record<string, GradeScores>; // Key is Subject Name
  status?: 'active' | 'graduated'; // Nuevo campo de estatus
}

export interface SchoolGradeStructure {
  grade: string;
  groups: string[];
  subjects: string[];
  hiddenSubjects?: string[]; // Asignaturas que no aparecen en boleta ni promedio
}

export type Role = 'admin' | 'teacher' | 'subdirector' | 'administrative' | 'red_escolar' | 'laboratorista' | 'apoyo';

export interface SubjectAssignment {
  grade: string;
  group: string;
  subject: string;
  technology?: string; // Opcional: Solo si la materia es Tecnología
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // Added for credential management simulation
  role: Role;
  assignments?: SubjectAssignment[]; // Only for teachers
  workSchedule?: Record<string, string>; // Para personal de apoyo: { "Lunes": "14:00-19:00", ... }
}

export interface Citation {
  id: string;
  studentId?: number | null; // Made optional for manual entry
  studentName: string;
  group: string; // Now stores full string like "1° A"
  date: string;
  time: string;
  reason: string;
  createdAt: string;
  teacherId?: string; // ID del profesor que cita
  teacherName?: string; // Nombre del profesor que cita
}

export interface VisitLog {
  id: string;
  logType: 'inasistencia' | 'conducta' | 'accidente'; // Distingue el formato
  studentId?: number | null;
  studentName: string;
  grade: string; 
  group: string; 
  parentName: string; 
  date: string;
  startTime: string; // HORA
  endTime: string; // Only for generic use or internal tracking
  
  // Common Fields
  location: string; // LUGAR
  whoReported: string; // QUIEN REPORTA
  involvedStudents: string; // ALUMNO(A)S INVOLUCRADO (S)
  narrative: string; // NARRACIÓN DE LOS HECHOS
  
  // Checkboxes "A QUIÉN INFORMÉ"
  informedDirector: boolean;
  informedSubdirector: boolean;
  informedParent: boolean;
  informedUdeei: boolean;

  // INASISTENCIA Specifics (INAS-APR)
  teacherActions: string; // ACCIONES QUE APLIQUÉ COMO DOCENTE
  formativeAction: string; // ACCIÓN FORMATIVA APLICADA
  generatedCitation: boolean; // ¿SE GENERÓ CITATORIO?
  udeeiActions: string; // QUÉ ACCIONES REALIZARÉ CON APOYO UDEEI
  technicalMeasure: string; // MEDIDAS TECNICO PEDAGÓGICA (No asista)

  // CONDUCTA Specifics (C / AE) & ACCIDENTE (AE)
  pedagogicalMeasure: string; // ACCIONES QUE APLIQUÉ (MEDIDAS TÉCNICO PEDAGÓGICAS)
  conciliation: boolean; // ¿SE REALIZÓ CONCILIACIÓN?
  canalization: boolean; // ¿REQUIRIÓ CANALIZACIÓN?
  canalizationInstitution: string; // A QUE INSTITUCIÓN
  bullyingProtocol: boolean; // ¿SE VA APLICAR PROTOCOLO ACOSO?
  bullyingProtocolReason: string; // PORQUÉ
  vaSeguro: boolean; // ¿SE ACTIVÓ VA SEGURO?
  vaSeguroObservation: string; // OBSERVACIÓN

  // Footer Fields
  agreementsParent: string; // ACUERDOS PADRE
  agreementsStudent: string; // ACUERDOS ALUMNOS (Conducta)
  attentionToParent: string; // QUÉ ATENCIÓN SE LE DIO AL PADRE

  conformityStaffId?: string; // ID del personal que atiende (para aviso conformidad)
}

export interface Minuta {
  id: string;
  studentId?: number | null; // Made optional
  studentName: string;
  grade: string;
  group: string;
  parentName: string;
  date: string;
  startTime: string;
  subject: string; // Motivo de la atencion/queja
  description: string; // Descripción de la situación
  previousActions: string; // Acciones realizadas / Respuesta previa
  agreements: string; // Acuerdos
  attendedBy?: string; // Nombre de quien atiende (manual)
}

export interface ScheduleEntry {
  id: string;
  teacherId: string;
  day: string; // 'Lunes', 'Martes', etc.
  period: number; // 1 to 7
  gradeGroup: string; // "1A", "2B" for Academic OR "11", "12" for Tech
  type?: 'academic' | 'technology' | 'support'; // Added 'technology' type
}

export interface SchoolData {
  name: string;
  director: string;
  subdirector: string; // Nuevo campo
  teachers: number;
  studentsCount: number;
  gradesStructure: SchoolGradeStructure[];
  technologies: string[]; // Lista dinámica de talleres
  studentsData: Student[];
  users: User[];
  allowedPeriods: string[]; // Changed from allowedMonths to allowedPeriods (inter_1, trim_1, etc)
  periodDeadlines?: Record<string, string>; // Map period key to ISO date string deadline
  citations: Citation[];
  visitLogs: VisitLog[];
  minutas: Minuta[];
  schedules: ScheduleEntry[]; // Horarios
  
  // Layout persistente de la sábana para guardar el orden y selección de filas
  sabanaLayout?: {
      academic: string[]; // Array de teacherIds
      technology: string[]; // Array de teacherIds (Nuevo)
      support: string[];  // Array de teacherIds
  };

  subdirectorName?: string;
  // New Official Fields
  alcaldia: string;
  zonaEscolar: string;
  turno: string;
}

export type PageId = 'dashboard' | 'grades' | 'grade-registration' | 'teachers' | 'subdireccion' | 'students-list' | 'subjects-selection' | 'grade-entry' | 'reports' | 'teacher-classes' | 'grade-control' | 'subjects-config' | 'schedules';