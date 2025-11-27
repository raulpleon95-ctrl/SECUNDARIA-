

import React, { useState, useEffect } from 'react';
import { FileText, Printer, User as UserIcon, Cpu, Layers, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SchoolData, User, GradeScores } from '../types';

// Global Logo Constant
const LOGO_URL = "https://cdn1.sharemyimage.com/smi/2025/10/05/27tv.png";
const SEP_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDxcKIcMNGVUxi6N-EpVbrw1Y7HNcrm2FqqQ&s";
const CCT = "09DES4027P";

interface ReportsViewProps {
  data: SchoolData;
  currentUser: User;
  currentCycle: string;
}

type ReportType = 'attendance' | 'concentrado_mensual' | 'concentrado_trimestral' | 'boleta_monthly' | 'boleta_trimester' | 'boletin_anual' | 'cuadro_inasistencia';

const ReportsView: React.FC<ReportsViewProps> = ({ data, currentUser, currentCycle }) => {
  // Initial State Setup
  const initialGrade = currentUser.role === 'teacher' && currentUser.assignments && currentUser.assignments.length > 0
    ? currentUser.assignments[0].grade 
    : data.gradesStructure[0].grade;

  const [reportType, setReportType] = useState<ReportType>('attendance');
  
  // Selectors
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<string>(''); 
  const [selectedSection, setSelectedSection] = useState<string>('AC'); 
  const [selectedStudentId, setSelectedStudentId] = useState<string>(''); 
  
  // Ahora usamos "Periodo" en lugar de Mes para el concentrado mensual (Inter-trimestral)
  const [selectedInterPeriod, setSelectedInterPeriod] = useState<string>('1'); 
  const [selectedTrimester, setSelectedTrimester] = useState<string>('1'); 
  const [schoolCycle, setSchoolCycle] = useState(currentCycle);

  // Update local cycle if global cycle changes
  useEffect(() => {
      setSchoolCycle(currentCycle);
  }, [currentCycle]);

  // --- Filtering Logic ---
  const availableGrades = currentUser.role === 'admin' || currentUser.role === 'subdirector' || currentUser.role === 'administrative'
    ? data.gradesStructure.map(g => g.grade)
    : Array.from(new Set(currentUser.assignments?.map(a => a.grade) || []));

  const availableSubjects = currentUser.role === 'admin' || currentUser.role === 'subdirector' || currentUser.role === 'administrative'
    ? data.gradesStructure.find(g => g.grade === selectedGrade)?.subjects || []
    : Array.from(new Set(
        currentUser.assignments
            ?.filter(a => a.grade === selectedGrade)
            .map(a => a.subject) || []
      )).sort();

  const availableGroups = currentUser.role === 'admin' || currentUser.role === 'subdirector' || currentUser.role === 'administrative'
    ? data.gradesStructure.find(g => g.grade === selectedGrade)?.groups || []
    : Array.from(new Set(
        currentUser.assignments
            ?.filter(a => a.grade === selectedGrade)
            .map(a => a.group) || []
      )).sort();

  const isTechReport = selectedSubject === 'Tecnología' && !['boleta_monthly', 'boleta_trimester', 'boletin_anual', 'concentrado_mensual', 'concentrado_trimestral'].includes(reportType);
  
  // Solo concentrado trimestral es tipo matriz ahora
  const isMatrixReport = reportType === 'concentrado_trimestral';

  // Get Students (Filter out graduated)
  const studentsInGroup = data.studentsData.filter(s => {
      if (s.status === 'graduated') return false; // Hide graduated
      if (s.grade !== selectedGrade) return false;
      if (isTechReport) {
          if (selectedTech && s.technology !== selectedTech) return false;
          if (selectedSection === 'AC') return s.group === 'A' || s.group === 'C';
          if (selectedSection === 'BD') return s.group === 'B' || s.group === 'D';
          return false;
      } else {
          return s.group === selectedGroup;
      }
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Effects
  useEffect(() => {
    if (availableGroups.length > 0 && !availableGroups.includes(selectedGroup)) {
        setSelectedGroup(availableGroups[0]);
    } else if (availableGroups.length > 0 && selectedGroup === '') {
        setSelectedGroup(availableGroups[0]);
    }
  }, [selectedGrade, availableGroups]);

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.includes(selectedSubject)) {
        setSelectedSubject(availableSubjects[0]);
    } else if (availableSubjects.length > 0 && selectedSubject === '') {
        setSelectedSubject(availableSubjects[0]);
    }
  }, [selectedGrade, availableSubjects]);

  useEffect(() => {
      setSelectedTech('');
      if (selectedGroup === 'B' || selectedGroup === 'D') setSelectedSection('BD');
      else setSelectedSection('AC');
  }, [selectedSubject, selectedGroup]);
  
  useEffect(() => {
    setSelectedStudentId('');
  }, [selectedGrade, selectedGroup, selectedSubject, selectedTech, selectedSection]);


  // --- Data Helpers ---
  const getTeacherName = () => {
    if (currentUser.role === 'teacher') return currentUser.name;
    const assignedTeacher = data.users.find(u => 
        u.role === 'teacher' && 
        u.assignments?.some(a => {
            if (a.grade !== selectedGrade || a.subject !== selectedSubject) return false;
            if (isTechReport) {
                 if (selectedTech && a.technology !== selectedTech) return false;
                 if (selectedSection === 'AC') return a.group === 'A' || a.group === 'C';
                 if (selectedSection === 'BD') return a.group === 'B' || a.group === 'D';
            } else {
                 return a.group === selectedGroup;
            }
            return false;
        })
    );
    return assignedTeacher ? assignedTeacher.name : "Sin Asignar";
  };

  const getAdministrativeName = () => {
    const adminAssigned = data.users.find(u => 
        u.role === 'administrative' &&
        u.assignments?.some(a => {
             if (a.grade !== selectedGrade) return false;
             if (isTechReport) {
                if (selectedSection === 'AC') return a.group === 'A' || a.group === 'C';
                if (selectedSection === 'BD') return a.group === 'B' || a.group === 'D';
             } else {
                return a.group === selectedGroup;
             }
             return false;
        })
    );
    return adminAssigned ? adminAssigned.name : "";
  };

  const teacherName = getTeacherName();
  const administrativeName = getAdministrativeName();

  const handlePrint = () => window.print();

  const calculateFinalAverage = (t1: string, t2: string, t3: string): string => {
    const v1 = parseFloat(t1);
    const v2 = parseFloat(t2);
    const v3 = parseFloat(t3);
    if (!isNaN(v1) && !isNaN(v2) && !isNaN(v3)) {
        const avg = (v1 + v2 + v3) / 3;
        return avg.toFixed(1);
    }
    return '';
  };
  
  const calculateGeneralAverage = (studentId: number) => {
      const student = studentsInGroup.find(s => s.id === studentId);
      if (!student) return '';
      const gradeStruct = data.gradesStructure.find(g => g.grade === student.grade);
      const hiddenSubjects = gradeStruct?.hiddenSubjects || [];

      let sum = 0;
      let count = 0;
      Object.entries(student.grades).forEach(([subjectName, val]) => {
          if (hiddenSubjects.includes(subjectName)) return;
          const scores = val as GradeScores;
          const final = calculateFinalAverage(scores.trim_1, scores.trim_2, scores.trim_3);
          if (final) {
              sum += parseFloat(final);
              count++;
          }
      });
      return count > 0 ? (sum / count).toFixed(1) : '-';
  };

  // Helper for Concentrado Average (Trimestral only)
  const calculateRowAverageConcentrado = (studentId: number, subjects: string[]) => {
      const student = studentsInGroup.find(s => s.id === studentId);
      if (!student) return '';

      let sum = 0;
      let count = 0;
      subjects.forEach(subj => {
          const grades = student.grades[subj] as GradeScores;
          let val = parseFloat(grades?.[`trim_${selectedTrimester}`]);
          if (!isNaN(val)) {
              sum += val;
              count++;
          }
      });
      return count > 0 ? (sum / count).toFixed(1) : '-';
  };

  const calculateColumnAverage = (subject: string) => {
      let sum = 0;
      let count = 0;
      studentsInGroup.forEach(student => {
          const grades = student.grades[subject] as GradeScores;
          let val = parseFloat(grades?.[`trim_${selectedTrimester}`]);
          if (!isNaN(val)) {
              sum += val;
              count++;
          }
      });
      return count > 0 ? (sum / count).toFixed(1) : '-';
  };

  const isIndividualReport = ['boleta_monthly', 'boleta_trimester', 'boletin_anual'].includes(reportType);
  const isOfficialCuadro = reportType === 'cuadro_inasistencia';
  
  // Determinamos si el reporte actual debe ser horizontal (Landscape)
  // SOLO el Concentrado Trimestral es horizontal
  const isLandscapeReport = reportType === 'concentrado_trimestral';

  // Helper to get Status Text
  const getStatusText = (status: string) => {
      if (status === 'GREEN') return 'REGULAR';
      if (status === 'RED') return 'REQ. APOYO';
      return '-';
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="p-6 md:p-8 space-y-6 print:hidden bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Formatos y Reportes</h2>
            <p className="text-slate-500">Generación de listas, concentrados y boletas oficiales.</p>
          </div>
          <button onClick={handlePrint} className="flex items-center space-x-2 px-6 py-2 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors shadow-lg">
            <Printer size={18} /> <span>Imprimir / PDF</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
           <div className="flex flex-col min-w-[200px]">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Reporte</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <optgroup label="Listas de Grupo">
                    <option value="attendance">Lista de Asistencia</option>
                    <option value="concentrado_mensual">Informe de Alumnos en Riesgo (Semáforo Rojo)</option>
                    {/* Habilitamos para todos */}
                    <option value="concentrado_trimestral">Concentrado Trimestral (Matriz)</option>
                    <option value="cuadro_inasistencia">Cuadro de Inasistencia y Evaluación (Asignatura)</option>
                </optgroup>
                {currentUser.role !== 'teacher' && (
                    <optgroup label="Individuales">
                        <option value="boleta_monthly">Boleta Individual (Inter-trimestral)</option>
                        <option value="boleta_trimester">Boleta Individual (Trimestral)</option>
                        <option value="boletin_anual">Boletín Informativo (Anual)</option>
                    </optgroup>
                )}
              </select>
           </div>

           <div className="flex flex-col w-20">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1">Grado</label>
              <select value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); }} className="p-2 border border-slate-300 rounded-lg text-sm">
                {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
           </div>
           
           {!isIndividualReport && !isMatrixReport && reportType !== 'concentrado_mensual' && (
               <div className="flex flex-col flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1">Asignatura</label>
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm w-full" disabled={availableSubjects.length === 0}>
                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
           )}

           {isTechReport ? (
               <div className="flex flex-col min-w-[160px] animate-fade-in">
                   <label className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-1"><Layers size={12}/> Sección</label>
                   <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="p-2 border border-blue-200 bg-blue-50 text-blue-900 rounded-lg text-sm w-full font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                       <option value="AC">Sección 1 (A y C)</option>
                       <option value="BD">Sección 2 (B y D)</option>
                   </select>
               </div>
           ) : (
               <div className="flex flex-col w-24">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1">Grupo</label>
                  <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm" disabled={availableGroups.length === 0}>
                    {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
           )}
           
           {isIndividualReport && (
             <div className="flex flex-col flex-1 min-w-[250px]">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1">Seleccionar Alumno</label>
                <div className="relative">
                    <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full p-2 pl-8 border border-slate-300 rounded-lg text-sm appearance-none bg-white">
                        <option value="">-- Seleccione un alumno --</option>
                        {studentsInGroup.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <UserIcon size={14} className="absolute left-2.5 top-3 text-slate-400" />
                </div>
             </div>
           )}

           {isTechReport && (
               <div className="flex flex-col min-w-[200px] animate-fade-in">
                  <label className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-1"><Cpu size={12}/> Taller</label>
                  <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)} className="p-2 border border-blue-200 bg-blue-50 text-blue-900 rounded-lg text-sm w-full font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- Todos / Seleccionar --</option>
                    {data.technologies.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
               </div>
           )}

           {(reportType === 'concentrado_mensual' || reportType === 'boleta_monthly') && (
             <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1">Periodo Avance</label>
                <select value={selectedInterPeriod} onChange={(e) => setSelectedInterPeriod(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm w-32">
                  <option value="1">1° Avance</option>
                  <option value="2">2° Avance</option>
                  <option value="3">3° Avance</option>
                </select>
             </div>
           )}

           {(reportType === 'concentrado_trimestral' || reportType === 'boleta_trimester') && (
                <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Trimestre</label>
                    <select value={selectedTrimester} onChange={(e) => setSelectedTrimester(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm w-32">
                        <option value="1">1° Trim</option>
                        <option value="2">2° Trim</option>
                        <option value="3">3° Trim</option>
                    </select>
                </div>
           )}

            <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1">Ciclo Escolar</label>
                <input type="text" value={schoolCycle} onChange={(e) => setSchoolCycle(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm w-32 focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="flex-1 overflow-auto bg-slate-100 p-6 md:p-8 print:p-0 print:bg-white print:overflow-visible">
        
        {/* Force Landscape Printing for specific reports */}
        <style>{`
          @media print {
            @page {
              size: ${isLandscapeReport ? 'landscape' : 'portrait'};
            }
            .page-break { 
              page-break-before: always; 
              break-before: page;
              display: block;
            }
          }
        `}</style>

        {/* --- REPORT TYPE: INFORME DE RIESGO (LISTA ALUMNOS CON ROJO) --- */}
        {reportType === 'concentrado_mensual' && (
             <div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-[10mm] print:shadow-none print:w-full print:max-w-none">
                 <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-4">
                    <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
                    <div className="text-center flex-1">
                        <h1 className="text-base font-extrabold uppercase">ESCUELA SECUNDARIA DIURNA No. 27</h1>
                        <h1 className="text-base font-extrabold uppercase whitespace-nowrap">"ALFREDO E. URUCHURTU"</h1>
                        <h2 className="text-sm font-bold uppercase text-red-600 mt-1">
                            Informe de Alumnos en Riesgo (Semáforo Rojo)
                        </h2>
                        <p className="text-xs text-slate-500 uppercase font-bold mt-1">Avance Inter-trimestral {selectedInterPeriod} - Ciclo {schoolCycle}</p>
                    </div>
                    <div className="text-right min-w-[120px] text-xs font-bold border border-slate-300 p-2 rounded">
                        <p className="uppercase">Grado: <span className="text-sm">{selectedGrade}</span></p>
                        <p className="uppercase">Grupo: <span className="text-sm">{selectedGroup}</span></p>
                    </div>
                </div>

                <div className="mb-4 text-xs text-slate-600 italic">
                    * El siguiente listado muestra únicamente a los alumnos que presentan estatus de "Requiere Apoyo" (Semáforo Rojo) en una o más asignaturas durante el {selectedInterPeriod}° periodo de evaluación intermedia.
                </div>

                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-slate-200 print:bg-slate-200 print:print-color-adjust-exact">
                            <th className="border border-black p-2 w-10 text-center font-bold">No.</th>
                            <th className="border border-black p-2 text-left w-64 font-bold">NOMBRE DEL ALUMNO</th>
                            <th className="border border-black p-2 text-left font-bold">ASIGNATURAS EN RIESGO</th>
                            <th className="border border-black p-2 w-16 text-center font-bold">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const gradeStruct = data.gradesStructure.find(g => g.grade === selectedGrade);
                            let subjects = gradeStruct?.subjects.filter(s => !gradeStruct.hiddenSubjects?.includes(s)) || [];
                            
                            // Si es profesor, solo verificamos su materia asignada si está seleccionada
                            if (currentUser.role === 'teacher' && selectedSubject) {
                                subjects = [selectedSubject];
                            }

                            // Filtrar alumnos que tengan al menos una materia en ROJO (de las materias visibles)
                            const riskStudents = studentsInGroup.map(student => {
                                const riskSubjects = subjects.filter(subj => {
                                    const grades = student.grades[subj] as GradeScores;
                                    return grades?.[`inter_${selectedInterPeriod}`] === 'RED';
                                });
                                return { ...student, riskSubjects };
                            }).filter(s => s.riskSubjects.length > 0);

                            if (riskStudents.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan={4} className="border border-black p-8 text-center text-slate-500 italic">
                                            <div className="flex flex-col items-center justify-center">
                                                <CheckCircle2 size={32} className="text-green-500 mb-2" />
                                                <span>Felicidades. No se encontraron alumnos en riesgo para este periodo en las asignaturas seleccionadas.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }

                            return riskStudents.map((student, index) => (
                                <tr key={student.id} className="even:bg-slate-50 print:even:bg-transparent">
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black p-2 font-bold uppercase">{student.name}</td>
                                    <td className="border border-black p-2 text-red-700 font-medium">
                                        {student.riskSubjects.join(', ')}
                                    </td>
                                    <td className="border border-black p-2 text-center font-bold bg-red-50 text-red-700 print:bg-transparent print:text-black">
                                        {student.riskSubjects.length}
                                    </td>
                                </tr>
                            ));
                        })()}
                    </tbody>
                </table>
                
                <div className="mt-8 flex justify-center text-xs uppercase font-bold text-center">
                     <div className="w-64 border-t border-black pt-2">
                         <p>{currentUser.role === 'teacher' ? 'DOCENTE' : 'TUTOR DEL GRUPO'}</p>
                     </div>
                </div>
             </div>
        )}
        
        {/* --- REPORT TYPE: CONCENTRADO GRUPAL (Matrix - Trimestral) --- */}
        {isMatrixReport && (
            <div className="bg-white shadow-lg mx-auto max-w-[297mm] p-[10mm] print:shadow-none print:w-full print:max-w-none print:landscape">
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-2">
                    <img src={LOGO_URL} alt="Logo" className="w-14 h-14 object-contain" />
                    <div className="text-center flex-1">
                        <h1 className="text-base font-extrabold uppercase">ESCUELA SECUNDARIA DIURNA No. 27</h1>
                        <h1 className="text-base font-extrabold uppercase whitespace-nowrap">"ALFREDO E. URUCHURTU"</h1>
                        <h2 className="text-sm font-bold uppercase bg-slate-100 inline-block px-4 py-0.5 rounded border border-slate-300 mt-1">
                            Concentrado de Evaluación - Trimestre {selectedTrimester}
                        </h2>
                        <p className="text-xs text-slate-500 uppercase font-bold mt-1">Ciclo Escolar {schoolCycle}</p>
                    </div>
                    <div className="text-right min-w-[120px] text-xs font-bold border border-slate-300 p-2 rounded">
                        <p className="uppercase">Grado: <span className="text-sm">{selectedGrade}</span></p>
                        <p className="uppercase">Grupo: <span className="text-sm">{selectedGroup}</span></p>
                        {currentUser.role === 'teacher' && <p className="uppercase mt-1 text-[10px] text-blue-600">{selectedSubject}</p>}
                    </div>
                </div>

                <table className="w-full border-collapse border border-black text-[10px] table-fixed">
                    <thead>
                        <tr className="bg-slate-200 print:bg-slate-200 print:print-color-adjust-exact">
                            <th className="border border-black p-1 w-8 text-center font-bold">No.</th>
                            <th className="border border-black p-1 text-left w-64 pl-2 font-bold">NOMBRE DEL ALUMNO</th>
                            {(() => {
                                const gradeStruct = data.gradesStructure.find(g => g.grade === selectedGrade);
                                let subjects = gradeStruct?.subjects.filter(s => !gradeStruct.hiddenSubjects?.includes(s)) || [];
                                
                                // Si es profesor, filtrar solo su materia (si está seleccionada)
                                if (currentUser.role === 'teacher' && selectedSubject) {
                                    subjects = subjects.filter(s => s === selectedSubject);
                                }

                                return subjects.map(subj => (
                                    <th key={subj} className="border border-black p-0 w-7 h-64 align-bottom relative bg-slate-100 print:bg-slate-100">
                                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-end w-6 h-60">
                                            <span className="block transform -rotate-90 whitespace-nowrap origin-center text-[8px] font-bold uppercase tracking-tight leading-none">{subj}</span>
                                        </div>
                                    </th>
                                ));
                            })()}
                            <th className="border border-black p-1 w-12 font-bold bg-slate-300 print:bg-slate-300 print:print-color-adjust-exact text-center text-[8px] leading-tight">
                                PROM
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentsInGroup.map((student, index) => {
                            const gradeStruct = data.gradesStructure.find(g => g.grade === selectedGrade);
                            let subjects = gradeStruct?.subjects.filter(s => !gradeStruct.hiddenSubjects?.includes(s)) || [];
                            
                            // Si es profesor, filtrar solo su materia
                            if (currentUser.role === 'teacher' && selectedSubject) {
                                subjects = subjects.filter(s => s === selectedSubject);
                            }

                            const rowResult = calculateRowAverageConcentrado(student.id, subjects);
                            
                            const nameLen = student.name.length;
                            let nameSizeClass = "text-[10px]";
                            if (nameLen > 30) nameSizeClass = "text-[9px]";
                            if (nameLen > 40) nameSizeClass = "text-[8px] leading-tight";

                            return (
                                <tr key={student.id} className="even:bg-slate-50 print:even:bg-slate-50 h-5 hover:bg-slate-100">
                                    <td className="border border-black p-0.5 text-center font-medium">{index + 1}</td>
                                    <td className={`border border-black px-2 font-medium uppercase truncate ${nameSizeClass}`}>{student.name}</td>
                                    {subjects.map(subj => {
                                        const grades = student.grades[subj] as GradeScores;
                                        let val = '';
                                        let cellClass = '';

                                        val = grades?.[`trim_${selectedTrimester}`] || '';
                                        const numVal = parseFloat(val);
                                        if (!isNaN(numVal) && numVal < 6) cellClass = 'text-red-600 font-bold bg-red-50 print:text-black print:font-extrabold print:bg-transparent';
                                        
                                        return (
                                            <td key={subj} className={`border border-black p-0 text-center align-middle font-bold ${cellClass}`}>
                                                {val}
                                            </td>
                                        );
                                    })}
                                    <td className={`border border-black p-0 text-center font-bold print:print-color-adjust-exact bg-slate-200`}>
                                        {rowResult}
                                    </td>
                                </tr>
                            );
                        })}
                        {/* Footer Promedios */}
                        <tr className="font-bold bg-slate-300 print:bg-slate-300 border-t-2 border-black print:print-color-adjust-exact h-6">
                            <td colSpan={2} className="border border-black p-1 text-right pr-2 text-[9px]">PROMEDIO POR ASIGNATURA:</td>
                            {(() => {
                                const gradeStruct = data.gradesStructure.find(g => g.grade === selectedGrade);
                                let subjects = gradeStruct?.subjects.filter(s => !gradeStruct.hiddenSubjects?.includes(s)) || [];
                                
                                // Si es profesor, filtrar solo su materia
                                if (currentUser.role === 'teacher' && selectedSubject) {
                                    subjects = subjects.filter(s => s === selectedSubject);
                                }

                                return subjects.map(subj => (
                                    <td key={subj} className="border border-black p-0 text-center text-[9px] bg-white print:bg-white">{calculateColumnAverage(subj)}</td>
                                ));
                            })()}
                            <td className="border border-black bg-slate-400 print:bg-slate-400"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )}

        {/* --- OFFICIAL FORMAT: CUADRO DE INASISTENCIA (SEC-CE-01) --- */}
        {isOfficialCuadro && (
             <div className="bg-white shadow-lg mx-auto max-w-[215mm] p-[10mm] print:shadow-none print:w-full print:max-w-none relative print:text-black">
                 {/* PRIMERA HOJA: TABLA DE ALUMNOS */}
                 <div className="min-h-[260mm]">
                    <div className="flex items-center justify-between mb-2">
                        <img src={SEP_LOGO_URL} alt="SEP" className="h-14 object-contain" />
                        <div className="text-center font-bold text-xs"><p>AUTORIDAD EDUCATIVA FEDERAL EN LA CIUDAD DE MÉXICO</p></div>
                    </div>
                    <h2 className="text-center font-extrabold text-sm mb-2">CUADRO DE CONCENTRACIÓN DE INASISTENCIAS Y EVALUACIONES</h2>
                    <div className="text-right text-[9px] mb-1">SEC-CE-01</div>

                    <div className="border-2 border-black text-[10px] font-bold mb-4">
                        <div className="grid grid-cols-12 border-b border-black">
                            <div className="col-span-8 p-1 border-r border-black flex items-center">
                                <span className="w-36">NOMBRE DE LA ESCUELA:</span>
                                <div className="flex flex-col">
                                    <span className="font-normal uppercase">ESCUELA SECUNDARIA DIURNA No. 27</span>
                                    <span className="font-normal uppercase whitespace-nowrap">"ALFREDO E. URUCHURTU"</span>
                                </div>
                            </div>
                            <div className="col-span-4 p-1 flex items-center"><span className="w-32">ASIGNATURA/ÁREA:</span><span className="font-normal uppercase">{selectedSubject === 'Tecnología' && selectedTech ? `TECNOLOGÍA (${selectedTech})` : selectedSubject}</span></div>
                        </div>
                        <div className="grid grid-cols-12 border-b border-black">
                            <div className="col-span-8 p-1 border-r border-black flex"><span className="w-36">CLAVE C.C.T.:</span><span className="font-normal uppercase">09DES4027P</span></div>
                            <div className="col-span-4 p-1 flex"><span className="w-32">GRADO Y GRUPO:</span><span className="font-normal uppercase">{isTechReport ? `${selectedGrade} SECCIÓN ${selectedSection === 'AC' ? '1 (A y C)' : '2 (B y D)'}` : `${selectedGrade} ${selectedGroup}`}</span></div>
                        </div>
                        <div className="grid grid-cols-12 border-b border-black">
                            <div className="col-span-8 p-1 border-r border-black flex"><span className="w-36">ALCALDÍA:</span><span className="font-normal uppercase">{data.alcaldia}</span></div>
                            <div className="col-span-4 p-1 flex"><span className="w-32">TURNO:</span><span className="font-normal uppercase">{data.turno}</span></div>
                        </div>
                        <div className="grid grid-cols-12">
                            <div className="col-span-8 p-1 border-r border-black flex"><span className="w-36">ZONA ESCOLAR:</span><span className="font-normal uppercase">{data.zonaEscolar}</span></div>
                            <div className="col-span-4 p-1 flex"><span className="w-32">CICLO ESCOLAR:</span><span className="font-normal uppercase">{schoolCycle}</span></div>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-black text-[10px]">
                        <thead>
                            <tr>
                                <th rowSpan={2} className="border border-black p-1 w-8">No.<br/>PROG</th>
                                <th rowSpan={2} className="border border-black p-1">NOMBRE DEL ALUMNO<br/><span className="font-normal text-[8px]">(PRIMER APELLIDO, SEGUNDO APELLIDO Y NOMBRE)</span></th>
                                <th colSpan={3} className="border border-black p-1">INASISTENCIAS</th>
                                <th rowSpan={2} className="border border-black p-1 w-4 bg-slate-100 print:bg-transparent"><div className="transform -rotate-90 h-8 w-4 flex items-center justify-center">TOTAL</div></th>
                                <th colSpan={6} className="border border-black p-1">EVALUACIONES</th>
                                <th rowSpan={2} className="border border-black p-1 w-10">PROM.<br/>FINAL</th>
                                <th rowSpan={2} className="border border-black p-1 w-16">OBSERVACIONES</th>
                            </tr>
                            <tr>
                                <th className="border border-black p-1 w-6">NOV</th><th className="border border-black p-1 w-6">MAR</th><th className="border border-black p-1 w-6">JUN</th>
                                <th className="border border-black p-1 w-8">NOV</th><th className="border border-black p-1 w-8 bg-slate-50 print:bg-transparent text-[8px]">REC</th>
                                <th className="border border-black p-1 w-8">MAR</th><th className="border border-black p-1 w-8 bg-slate-50 print:bg-transparent text-[8px]">REC</th>
                                <th className="border border-black p-1 w-8">JUN</th><th className="border border-black p-1 w-8 bg-slate-50 print:bg-transparent text-[8px]">REC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsInGroup.map((student, index) => {
                                const grades = student.grades[selectedSubject] as GradeScores;
                                const final = grades ? calculateFinalAverage(grades.trim_1, grades.trim_2, grades.trim_3) : '';
                                
                                const nameLen = student.name.length;
                                let nameSizeClass = "text-[10px]";
                                if (nameLen > 30) nameSizeClass = "text-[9px]";
                                if (nameLen > 38) nameSizeClass = "text-[8px] leading-tight";

                                return (
                                    <tr key={student.id} className="h-5">
                                        <td className="border border-black text-center">{index + 1}</td>
                                        <td className={`border border-black px-1 uppercase ${nameSizeClass} font-medium py-0.5`}>
                                            <div className="flex justify-between items-center">
                                                <span>{student.name}</span>
                                                {isTechReport && <span className="text-[7px] text-slate-500 ml-1 font-normal print:text-black">({student.group})</span>}
                                            </div>
                                        </td>
                                        <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black bg-slate-100 print:bg-transparent"></td>
                                        <td className="border border-black text-center font-bold">{grades?.trim_1}</td><td className="border border-black bg-slate-50 print:bg-transparent"></td>
                                        <td className="border border-black text-center font-bold">{grades?.trim_2}</td><td className="border border-black bg-slate-50 print:bg-transparent"></td>
                                        <td className="border border-black text-center font-bold">{grades?.trim_3}</td><td className="border border-black bg-slate-50 print:bg-transparent"></td>
                                        <td className="border border-black text-center font-bold bg-slate-50 print:bg-transparent">{final}</td>
                                        <td className="border border-black"></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>

                 {/* SEGUNDA HOJA: ESTADÍSTICAS Y FIRMAS */}
                 <div className="w-full page-break" style={{ minHeight: '200mm' }}>
                    <div className="pt-8">
                        <div className="flex justify-between gap-8 mt-8">
                            {/* ESTADISTICA */}
                            <div className="w-1/2">
                                <table className="w-full border-collapse border border-black text-[10px] text-center">
                                    <tbody>
                                        <tr><td className="border border-black p-1 text-left">INSCRIPCIÓN</td><td className="border border-black w-20"></td></tr>
                                        <tr><td className="border border-black p-1 text-left">ALTAS</td><td className="border border-black"></td></tr>
                                        <tr><td className="border border-black p-1 text-left">BAJAS</td><td className="border border-black"></td></tr>
                                        <tr><td className="border border-black p-1 text-left font-bold">EXISTENCIA FINAL</td><td className="border border-black"></td></tr>
                                    </tbody>
                                </table>
                            </div>
                            {/* APROVECHAMIENTO */}
                            <div className="w-1/2">
                                <table className="w-full border-collapse border border-black text-[10px] text-center">
                                    <thead>
                                        <tr>
                                            <th className="border border-black"></th>
                                            <th className="border border-black">NOV</th>
                                            <th className="border border-black">MAR</th>
                                            <th className="border border-black">JUN</th>
                                            <th className="border border-black">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border border-black text-left pl-2">APROBADOS</td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td></tr>
                                        <tr><td className="border border-black text-left pl-2">REPROBADOS</td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td></tr>
                                        <tr><td className="border border-black text-left pl-2">EXISTENCIA</td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td></tr>
                                        <tr><td className="border border-black text-left pl-2">No. CLASES IMPARTIDAS</td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* FIRMAS */}
                        <div className="mt-20 grid grid-cols-2 gap-x-16 gap-y-20 text-center text-xs uppercase">
                            <div>
                                <p className="mb-8">NOMBRE Y FIRMA DEL PROFESOR(A)</p>
                                <div className="border-t border-black pt-1 font-bold">{teacherName}</div>
                            </div>
                            <div>
                                <p className="mb-8">NOMBRE Y FIRMA DEL SUBDIRECTOR(A)</p>
                                <div className="border-t border-black pt-1 font-bold">{data.subdirector}</div>
                            </div>
                            <div>
                                <p className="mb-8">NOMBRE Y FIRMA DEL PERSONAL ADMINISTRATIVO</p>
                                <div className="border-t border-black pt-1 font-bold">{administrativeName}</div>
                            </div>
                            <div>
                                <p className="mb-8">NOMBRE Y FIRMA DEL DIRECTOR(A)</p>
                                <div className="border-t border-black pt-1 font-bold">{data.director}</div>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
        )}

        {/* --- LISTAS (Attendance) --- */}
        {reportType === 'attendance' && (
          <div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-[10mm] print:shadow-none print:w-full print:max-w-none">
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6 relative">
               <img src={LOGO_URL} alt="Escudo" className="absolute top-0 left-0 w-24 h-24 object-contain" />
               <div className="w-full text-center pl-28 pr-4">
                  <h1 className="text-base font-bold uppercase tracking-wide mb-0">ESCUELA SECUNDARIA DIURNA No. 27</h1>
                  <h1 className="text-base font-bold uppercase tracking-wide mb-1 whitespace-nowrap">"ALFREDO E. URUCHURTU"</h1>
                  <p className="text-sm font-semibold uppercase text-slate-600 mb-2">Ciclo Escolar {schoolCycle}</p>
                  <h2 className="text-lg font-bold uppercase bg-slate-800 text-white inline-block px-4 py-1 rounded">Lista de Asistencia</h2>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6 border border-slate-200 rounded p-4 bg-slate-50 print:bg-transparent print:border-slate-800">
               <p><span className="font-bold text-slate-700 uppercase">Docente:</span> <span className="uppercase">{teacherName}</span></p>
               <p><span className="font-bold text-slate-700 uppercase">Asignatura:</span> <span className="uppercase ml-1">{selectedSubject === 'Tecnología' && selectedTech ? selectedTech : selectedSubject}</span></p>
               <p><span className="font-bold text-slate-700 uppercase">Grado y Grupo:</span> {isTechReport ? `${selectedGrade} Sección ${selectedSection === 'AC' ? '1 (A, C)' : '2 (B, D)'}` : `${selectedGrade} "${selectedGroup}"`}</p>
            </div>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead className="bg-slate-100 print:bg-slate-200">
                <tr>
                  <th className="border border-slate-300 p-2 w-10">No.</th>
                  <th className="border border-slate-300 p-2 text-left">Nombre del Alumno</th>
                  {Array.from({length: 20}).map((_, i) => <th key={i} className="border border-slate-300 p-1 w-6"></th>)}
                </tr>
              </thead>
              <tbody>
                {studentsInGroup.map((student, index) => (
                    <tr key={student.id} className="even:bg-slate-50 print:even:bg-transparent">
                        <td className="border border-slate-300 p-2 text-center text-slate-500">{index + 1}</td>
                        <td className="border border-slate-300 p-2 font-medium uppercase">{student.name}{isTechReport && <span className="ml-2 text-[9px] text-slate-500 font-normal">({student.group})</span>}</td>
                        {Array.from({length: 20}).map((_, i) => <td key={i} className="border border-slate-300 p-1"></td>)}
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- INDIVIDUAL REPORTS (Boletas) --- */}
        {isIndividualReport && selectedStudentId && (
            <div className={`bg-white shadow-lg mx-auto p-[15mm] print:shadow-none print:w-full print:max-w-none ${
                (reportType === 'boletin_anual')
                ? 'max-w-[297mm] min-h-[210mm] print:landscape' 
                : 'max-w-[210mm] min-h-[297mm]'
            }`}>
                 {(() => {
                    const student = studentsInGroup.find(s => s.id === parseInt(selectedStudentId));
                    if (!student) return null;
                    const gradeStruct = data.gradesStructure.find(g => g.grade === student.grade);
                    const allSubjects = gradeStruct?.subjects || [];
                    const hiddenSubjects = gradeStruct?.hiddenSubjects || [];
                    const subjectList = allSubjects.filter(s => !hiddenSubjects.includes(s));

                    return (
                        <div className="relative h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 border-b-4 border-slate-800 pb-4 mb-6">
                                    <img src={LOGO_URL} alt="Escudo" className="w-20 h-24 object-contain" />
                                    <div className="flex-1 text-center">
                                        <h1 className="text-lg font-bold uppercase tracking-wider">ESCUELA SECUNDARIA DIURNA No. 27</h1>
                                        <h1 className="text-lg font-bold uppercase tracking-wider whitespace-nowrap">"ALFREDO E. URUCHURTU"</h1>
                                        <p className="text-sm font-semibold text-slate-600">CLAVE DE CENTRO DE TRABAJO: {CCT}</p>
                                        <h2 className="text-lg font-bold uppercase mt-2 bg-slate-100 inline-block px-4 rounded border border-slate-300">
                                            {reportType === 'boletin_anual' ? 'Boletín Informativo' : (reportType === 'boleta_monthly' ? `Evaluación de Avance ${selectedInterPeriod}° Periodo` : 'Boleta de Calificaciones')}
                                        </h2>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-300 rounded p-4 mb-6 text-sm grid grid-cols-12 gap-y-2 print:bg-transparent print:border-slate-800">
                                    <div className="col-span-8"><span className="font-bold">ALUMNO:</span> <span className="uppercase text-base ml-2">{student.name}</span></div>
                                    <div className="col-span-4 text-right"><span className="font-bold">GRADO:</span> {student.grade}</div>
                                    <div className="col-span-4"><span className="font-bold">GRUPO:</span> {student.group}</div>
                                    <div className="col-span-4 text-center"><span className="font-bold">TALLER:</span> <span className="uppercase ml-1">{student.technology || '_________________'}</span></div>
                                    <div className="col-span-4 text-right"><span className="font-bold">CICLO:</span> {schoolCycle}</div>
                                </div>

                                <table className="w-full border-collapse border-2 border-slate-800 text-sm">
                                    <thead className="bg-slate-800 text-white print:bg-slate-200 print:text-black">
                                        <tr>
                                            <th className="border border-slate-600 p-2 text-left w-1/3">Asignatura</th>
                                            {reportType === 'boleta_monthly' && (
                                                <>
                                                    <th className="border border-slate-600 p-2 text-center w-32">Estatus</th>
                                                    <th className="border border-slate-600 p-2 text-center w-full">Observaciones</th>
                                                </>
                                            )}
                                            {reportType === 'boleta_trimester' && (
                                                <>
                                                    <th className="border border-slate-600 p-2 text-center w-24">Trimestre 1</th>
                                                    <th className="border border-slate-600 p-2 text-center w-24">Trimestre 2</th>
                                                    <th className="border border-slate-600 p-2 text-center w-24">Trimestre 3</th>
                                                    <th className="border border-slate-600 p-2 text-center w-20 bg-slate-700 print:bg-slate-300">Promedio</th>
                                                </>
                                            )}
                                            {reportType === 'boletin_anual' && (
                                                <>
                                                    <th className="border border-slate-600 p-1 text-center w-16 text-[10px]">1° Avance</th>
                                                    <th className="border border-slate-600 p-1 text-center w-10 bg-slate-700 print:bg-slate-300 font-bold">T1</th>
                                                    <th className="border border-slate-600 p-1 text-center w-16 text-[10px]">2° Avance</th>
                                                    <th className="border border-slate-600 p-1 text-center w-10 bg-slate-700 print:bg-slate-300 font-bold">T2</th>
                                                    <th className="border border-slate-600 p-1 text-center w-16 text-[10px]">3° Avance</th>
                                                    <th className="border border-slate-600 p-1 text-center w-10 bg-slate-700 print:bg-slate-300 font-bold">T3</th>
                                                    <th className="border border-slate-600 p-1 text-center w-12 bg-black text-white font-bold print:bg-black print:text-white">FINAL</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjectList.map((subject) => {
                                            const grades = student.grades[subject] as GradeScores;
                                            const displaySubject = subject === 'Tecnología' ? 'Tecnología' : subject;

                                            return (
                                                <tr key={subject} className="border-b border-slate-300">
                                                    <td className="border-r border-slate-300 p-2 font-semibold text-slate-700">{displaySubject}</td>
                                                    
                                                    {reportType === 'boleta_monthly' && (
                                                        <>
                                                            <td className={`p-2 text-center font-bold text-sm border-r border-slate-300 ${grades?.[`inter_${selectedInterPeriod}`] === 'RED' ? 'bg-red-50 text-red-700 print:text-black print:font-extrabold' : ''}`}>
                                                                {getStatusText(grades?.[`inter_${selectedInterPeriod}`])}
                                                            </td>
                                                            <td className="p-2 border-r border-slate-300"></td>
                                                        </>
                                                    )}
                                                    
                                                    {reportType === 'boleta_trimester' && (
                                                        <>
                                                            <td className="border-r border-slate-300 p-2 text-center">{grades?.trim_1}</td>
                                                            <td className="border-r border-slate-300 p-2 text-center">{grades?.trim_2}</td>
                                                            <td className="border-r border-slate-300 p-2 text-center">{grades?.trim_3}</td>
                                                            <td className="p-2 text-center font-bold bg-slate-50 print:bg-slate-100">
                                                                {grades ? calculateFinalAverage(grades.trim_1, grades.trim_2, grades.trim_3) : '-'}
                                                            </td>
                                                        </>
                                                    )}

                                                    {reportType === 'boletin_anual' && (
                                                        <>
                                                            <td className="border-r border-slate-300 p-1 text-center text-[10px]">{getStatusText(grades?.inter_1)}</td>
                                                            <td className="border-r border-slate-300 p-1 text-center font-bold bg-slate-50 print:bg-slate-100">{grades?.trim_1}</td>
                                                            <td className="border-r border-slate-300 p-1 text-center text-[10px]">{getStatusText(grades?.inter_2)}</td>
                                                            <td className="border-r border-slate-300 p-1 text-center font-bold bg-slate-50 print:bg-slate-100">{grades?.trim_2}</td>
                                                            <td className="border-r border-slate-300 p-1 text-center text-[10px]">{getStatusText(grades?.inter_3)}</td>
                                                            <td className="border-r border-slate-300 p-1 text-center font-bold bg-slate-50 print:bg-slate-100">{grades?.trim_3}</td>
                                                            <td className="p-1 text-center font-bold bg-slate-100 print:bg-slate-200 border-l-2 border-slate-800">
                                                                 {grades ? calculateFinalAverage(grades.trim_1, grades.trim_2, grades.trim_3) : '-'}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                        <tr className="border-t-2 border-slate-800 bg-slate-50 print:bg-transparent">
                                            <td className="p-3 font-bold text-right" colSpan={reportType === 'boleta_monthly' ? 2 : (reportType === 'boletin_anual' ? 6 : (reportType === 'boleta_trimester' ? 4 : 1))}>PROMEDIO GENERAL:</td>
                                            <td className="p-3 font-extrabold text-center text-lg border-l-2 border-slate-800">{calculateGeneralAverage(student.id)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-12 flex justify-between text-center px-8">
                                <div className="w-64"><div className="border-t border-black pt-2"><p className="font-bold text-sm">DIRECTOR</p><p className="text-xs uppercase mt-1">{data.director}</p></div></div>
                                <div className="w-64"><div className="border-t border-black pt-2"><p className="font-bold text-sm">PADRE O TUTOR</p><p className="text-xs mt-1">FIRMA DE ENTERADO</p></div></div>
                            </div>
                        </div>
                    );
                 })()}
            </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;