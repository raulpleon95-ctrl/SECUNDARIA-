

import React, { useState, useMemo } from 'react';
import { Printer, Calendar, FileText, PenTool, Plus, ArrowLeft, ClipboardList, Eye, Save, Trash2, User } from 'lucide-react';
import { SchoolData, VisitLog, Minuta, Citation, User as UserType } from '../types';

// Updated Logo Placeholder and Constants
const LOGO_URL = "https://cdn1.sharemyimage.com/smi/2025/10/05/27tv.png"; 
const CCT = "09DES4027P";

interface SubdireccionViewProps {
  data: SchoolData;
  onUpdateData: (newData: SchoolData) => void;
  currentUser: UserType;
  currentCycle: string;
}

type SubTab = 'citatorios' | 'bitacora' | 'minuta';
type Mode = 'list' | 'create';

const SubdireccionView: React.FC<SubdireccionViewProps> = ({ data, onUpdateData, currentUser, currentCycle }) => {
  const [activeTab, setActiveTab] = useState<SubTab>('citatorios');
  
  // Global Config for Subdireccion Formats
  const [schoolCycle, setSchoolCycle] = useState(currentCycle);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'subdirector';

  // Teachers List for Dropdown
  const teachers = useMemo(() => 
    data.users.filter(u => u.role === 'teacher').sort((a, b) => a.name.localeCompare(b.name)),
  [data.users]);

  // --- CITATORIOS STATE ---
  const [citationMode, setCitationMode] = useState<Mode>('list');
  const [citStudentName, setCitStudentName] = useState('');
  const [citStudentGroup, setCitStudentGroup] = useState('');
  const [citationDate, setCitationDate] = useState('');
  const [citationTime, setCitationTime] = useState('');
  const [citationReason, setCitationReason] = useState('');
  const [citationTeacherId, setCitationTeacherId] = useState(''); // New state for selected teacher

  // --- BITACORA STATE ---
  const [bitacoraMode, setBitacoraMode] = useState<Mode>('list');
  const [bitStudentName, setBitStudentName] = useState('');
  const [bitStudentGroup, setBitStudentGroup] = useState('');
  // Form Fields for Bitacora
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitStartTime, setVisitStartTime] = useState('');
  const [visitEndTime, setVisitEndTime] = useState('');
  const [parentName, setParentName] = useState('');
  const [visitSubject, setVisitSubject] = useState('');
  const [narrative, setNarrative] = useState('');
  const [agreementsParent, setAgreementsParent] = useState('');
  const [agreementsStudent, setAgreementsStudent] = useState('');
  const [teacherIntervention, setTeacherIntervention] = useState('');
  const [faultType, setFaultType] = useState('');
  const [formativeActions, setFormativeActions] = useState('');

  // --- MINUTA STATE ---
  const [minutaMode, setMinutaMode] = useState<Mode>('list');
  const [minStudentName, setMinStudentName] = useState('');
  const [minStudentGroup, setMinStudentGroup] = useState('');
  // Form Fields for Minuta
  const [minutaDate, setMinutaDate] = useState(new Date().toISOString().split('T')[0]);
  const [minutaTime, setMinutaTime] = useState('');
  const [minutaParentName, setMinutaParentName] = useState('');
  const [minutaSubject, setMinutaSubject] = useState(''); // Queja
  const [minutaDescription, setMinutaDescription] = useState(''); // Hechos
  const [minutaActions, setMinutaActions] = useState(''); // Respuesta previa
  const [minutaAgreements, setMinutaAgreements] = useState(''); // Acuerdos
  const [minutaAttendedBy, setMinutaAttendedBy] = useState(''); // Quien atiende

  const handlePrint = () => {
    window.print();
  };

  // --- LOGIC: CITATORIOS ---
  const handleSaveCitation = () => {
      if (!canEdit) return; // Teachers cannot save
      if (!citStudentName || !citationDate) return;

      const teacher = teachers.find(t => t.id === citationTeacherId);

      const newCit: Citation = {
          id: Date.now().toString(),
          studentName: citStudentName,
          group: citStudentGroup,
          date: citationDate,
          time: citationTime,
          reason: citationReason,
          createdAt: new Date().toISOString(),
          teacherId: citationTeacherId || undefined,
          teacherName: teacher ? teacher.name : undefined
      };

      // Si data.citations es undefined (versiones viejas), lo manejamos
      const currentCitations = data.citations || [];

      onUpdateData({
          ...data,
          citations: [newCit, ...currentCitations]
      });

      // Reset
      setCitationMode('list');
      setCitStudentName('');
      setCitStudentGroup('');
      setCitationReason('');
      setCitationTime('');
      setCitationTeacherId('');
  };

  const loadCitation = (cit: Citation) => {
      setCitStudentName(cit.studentName);
      setCitStudentGroup(cit.group);
      setCitationDate(cit.date);
      setCitationTime(cit.time);
      setCitationReason(cit.reason);
      setCitationTeacherId(cit.teacherId || '');
      setCitationMode('create');
  };

  const handleDeleteCitation = (id: string) => {
      if (!canEdit) return;
      if(confirm('¿Eliminar citatorio?')) {
          onUpdateData({
              ...data,
              citations: data.citations.filter(c => c.id !== id)
          });
      }
  }


  // --- LOGIC: BITACORA ---
  const handleSaveVisit = () => {
    if (!bitStudentName) return;

    const newVisit: VisitLog = {
      id: Date.now().toString(),
      studentId: null, // Manual entry
      studentName: bitStudentName,
      grade: '', 
      group: bitStudentGroup,
      parentName,
      date: visitDate,
      startTime: visitStartTime,
      endTime: visitEndTime,
      subject: visitSubject,
      narrative,
      agreementsParent,
      agreementsStudent,
      teacherIntervention,
      faultType,
      formativeActions
    };

    onUpdateData({
      ...data,
      visitLogs: [newVisit, ...data.visitLogs]
    });

    setBitacoraMode('list');
    setBitStudentName('');
    setBitStudentGroup('');
    setParentName('');
    setVisitSubject('');
    setNarrative('');
    setAgreementsParent('');
    setAgreementsStudent('');
    setTeacherIntervention('');
    setFaultType('');
    setFormativeActions('');
    setVisitStartTime('');
    setVisitEndTime('');
  };

  const loadVisit = (log: VisitLog) => {
      setBitStudentName(log.studentName);
      setBitStudentGroup(log.group);
      setVisitDate(log.date);
      setVisitStartTime(log.startTime);
      setVisitEndTime(log.endTime);
      setParentName(log.parentName);
      setVisitSubject(log.subject);
      setNarrative(log.narrative);
      setAgreementsParent(log.agreementsParent);
      setAgreementsStudent(log.agreementsStudent);
      setTeacherIntervention(log.teacherIntervention);
      setFaultType(log.faultType);
      setFormativeActions(log.formativeActions);
      setBitacoraMode('create');
  }

  const handleDeleteVisit = (id: string) => {
      if(confirm('¿Eliminar registro de bitácora?')) {
          onUpdateData({
              ...data,
              visitLogs: data.visitLogs.filter(v => v.id !== id)
          });
      }
  }

  // --- LOGIC: MINUTA ---
  const handleSaveMinuta = () => {
    if (!minStudentName) return;

    const newMinuta: Minuta = {
      id: Date.now().toString(),
      studentId: null, // Manual Entry
      studentName: minStudentName,
      grade: '',
      group: minStudentGroup,
      parentName: minutaParentName,
      date: minutaDate,
      startTime: minutaTime,
      subject: minutaSubject,
      description: minutaDescription,
      previousActions: minutaActions,
      agreements: minutaAgreements,
      attendedBy: minutaAttendedBy
    };

    onUpdateData({
        ...data,
        minutas: [newMinuta, ...data.minutas]
    });

    setMinutaMode('list');
    setMinStudentName('');
    setMinStudentGroup('');
    setMinutaParentName('');
    setMinutaSubject('');
    setMinutaDescription('');
    setMinutaActions('');
    setMinutaAgreements('');
    setMinutaTime('');
    setMinutaAttendedBy('');
  };

  const loadMinuta = (min: Minuta) => {
      setMinStudentName(min.studentName);
      setMinStudentGroup(min.group);
      setMinutaDate(min.date);
      setMinutaTime(min.startTime);
      setMinutaParentName(min.parentName);
      setMinutaSubject(min.subject);
      setMinutaDescription(min.description);
      setMinutaActions(min.previousActions);
      setMinutaAgreements(min.agreements);
      setMinutaAttendedBy(min.attendedBy || '');
      setMinutaMode('create');
  }

  const handleDeleteMinuta = (id: string) => {
      if(confirm('¿Eliminar minuta?')) {
          onUpdateData({
              ...data,
              minutas: data.minutas.filter(m => m.id !== id)
          });
      }
  }

  // Filter citations for teachers (view only their own)
  const displayedCitations = useMemo(() => {
    if (currentUser.role === 'teacher') {
        return (data.citations || []).filter(c => c.teacherId === currentUser.id);
    }
    return data.citations || [];
  }, [data.citations, currentUser]);

  return (
    <div className="flex flex-col h-full">
      <style>{`
          @media print {
            @page {
              size: letter portrait;
              margin: 5mm;
            }
          }
      `}</style>
      {/* Header / Tabs - Hidden on Print */}
      <div className="p-6 md:p-8 space-y-6 print:hidden bg-slate-50 border-b border-slate-200">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Subdirección Escolar</h2>
                <p className="text-slate-500">Gestión administrativa y relación con padres de familia.</p>
            </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-200">
             <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('citatorios')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'citatorios' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Citatorios
                </button>
                {/* Teachers cannot see Bitacora or Minuta tabs usually, hiding for cleaner interface */}
                {canEdit && (
                    <>
                        <button
                            onClick={() => setActiveTab('bitacora')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'bitacora' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Bitácora
                        </button>
                        <button
                            onClick={() => setActiveTab('minuta')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'minuta' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Minutas
                        </button>
                    </>
                )}
            </div>
            
            <div className="ml-auto flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Ciclo Escolar:</label>
                <input 
                    type="text" 
                    value={schoolCycle}
                    onChange={(e) => setSchoolCycle(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 w-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-6 md:p-8 bg-slate-100 overflow-auto print:p-0 print:bg-white print:overflow-visible">
        
        {/* --- CITATORIOS TAB --- */}
        {activeTab === 'citatorios' && (
            <>
                {/* LIST MODE */}
                {citationMode === 'list' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-700">Historial de Citatorios</h3>
                            {canEdit && (
                                <button 
                                    onClick={() => {
                                        setCitStudentName('');
                                        setCitStudentGroup('');
                                        setCitationDate('');
                                        setCitationTime('');
                                        setCitationReason('');
                                        setCitationTeacherId('');
                                        setCitationMode('create');
                                    }}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow transition-colors"
                                >
                                    <Plus size={20} /> Nuevo Citatorio
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Fecha Cita</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Alumno</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Grupo</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Docente</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayedCitations.length > 0 ? displayedCitations.map(cit => (
                                        <tr key={cit.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {cit.date ? new Date(cit.date).toLocaleDateString() : 'N/A'} {cit.time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 uppercase">
                                                {cit.studentName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {cit.group}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {cit.teacherName || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => loadCitation(cit)} className="text-blue-600 hover:text-blue-800 mx-2" title="Ver / Reimprimir">
                                                    <Eye size={18} />
                                                </button>
                                                {canEdit && (
                                                    <button onClick={() => handleDeleteCitation(cit.id)} className="text-red-400 hover:text-red-600 mx-2" title="Eliminar">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <PenTool size={48} className="mx-auto mb-2 opacity-20"/>
                                                <p>No hay citatorios registrados.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CREATE MODE (Form + Preview) */}
                {citationMode === 'create' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                        {/* Form Panel (Left) - Hidden on Print */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 print:hidden h-fit">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center"><PenTool size={20} className="mr-2"/> Datos del Citatorio</h3>
                                <button onClick={() => setCitationMode('list')} className="text-slate-400 hover:text-slate-600">
                                    <ArrowLeft size={20} />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Alumno</label>
                                    <input 
                                        type="text" 
                                        disabled={!canEdit}
                                        placeholder="Nombre completo..." 
                                        value={citStudentName}
                                        onChange={(e) => setCitStudentName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Grado y Grupo</label>
                                    <input 
                                        type="text" 
                                        disabled={!canEdit}
                                        placeholder="Ej. 1° A" 
                                        value={citStudentGroup}
                                        onChange={(e) => setCitStudentGroup(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Profesor que Solicita</label>
                                    <select 
                                        value={citationTeacherId}
                                        disabled={!canEdit}
                                        onChange={(e) => setCitationTeacherId(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50"
                                    >
                                        <option value="">-- Seleccionar Docente --</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Cita</label>
                                        <input 
                                            type="date" 
                                            disabled={!canEdit}
                                            value={citationDate}
                                            onChange={(e) => setCitationDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                                        <input 
                                            type="time" 
                                            disabled={!canEdit}
                                            value={citationTime}
                                            onChange={(e) => setCitationTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Asunto / Motivo</label>
                                    <textarea 
                                        rows={4}
                                        disabled={!canEdit}
                                        value={citationReason}
                                        onChange={(e) => setCitationReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50"
                                        placeholder="Describa el motivo del citatorio..."
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    {canEdit && (
                                        <button 
                                            onClick={handleSaveCitation}
                                            disabled={!citStudentName}
                                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            <Save size={20} /> Guardar
                                        </button>
                                    )}
                                    <button 
                                        onClick={handlePrint}
                                        className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg flex justify-center items-center gap-2"
                                    >
                                        <Printer size={20} /> Imprimir
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Panel (Right) - Printable */}
                        <div className="lg:col-span-2 print:w-full print:col-span-3">
                            <div className="bg-white shadow-2xl mx-auto max-w-[215mm] min-h-[279mm] p-[20mm] print:shadow-none print:w-full print:max-w-none relative">
                                
                                {/* Logo */}
                                <img src={LOGO_URL} alt="Escudo" className="absolute top-8 right-12 w-20 h-24 object-contain opacity-90" />

                                {/* Official Header */}
                                <div className="text-center mb-12 px-12">
                                    <h1 className="text-base font-bold uppercase">ESCUELA SECUNDARIA DIURNA No. 27</h1>
                                    <h1 className="text-base font-bold uppercase whitespace-nowrap">"ALFREDO E. URUCHURTU"</h1>
                                    <p className="text-sm text-slate-600">Clave de Centro de Trabajo: {CCT}</p>
                                    <p className="text-sm text-slate-600">Ciclo Escolar {schoolCycle}</p>
                                    <h2 className="text-2xl font-bold mt-8 underline decoration-2 underline-offset-4 uppercase">CITATORIO</h2>
                                </div>

                                {/* Date */}
                                <div className="text-right mb-12">
                                    <p className="text-sm">Ciudad de México, a {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>

                                {/* Content */}
                                <div className="space-y-6 text-justify leading-relaxed text-lg">
                                    <p>
                                        <strong>C. Padre de Familia o Tutor</strong> <br />
                                        del alumno(a): <span className="uppercase border-b border-black px-2 font-bold">{citStudentName || '__________________________________'}</span> <br />
                                        del Grado y Grupo: <strong>{citStudentGroup || '_______'}</strong>
                                    </p>

                                    <p className="indent-8">
                                        Por medio de la presente, se le solicita de la manera más atenta presentarse en las instalaciones de este plantel educativo el día <strong>{citationDate ? new Date(citationDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '_________________'}</strong> a las <strong>{citationTime || '_____'}</strong> horas.
                                    </p>

                                    <p className="indent-8">
                                        El motivo de su presencia es para tratar asuntos relacionados con la educación y conducta de su hijo(a), específicamente:
                                    </p>

                                    <div className="bg-slate-50 p-4 border border-slate-200 rounded min-h-[100px] italic print:bg-transparent print:border-0 print:p-0 print:italic">
                                        {citationReason || '(Especifique el motivo en el panel izquierdo)'}
                                    </div>

                                    {citationTeacherId && (
                                        <p className="mt-2">
                                            Solicita: <span className="font-bold uppercase">{teachers.find(t => t.id === citationTeacherId)?.name}</span>
                                        </p>
                                    )}

                                    <p>
                                        Agradecemos de antemano su puntual asistencia y compromiso con la formación de su hijo(a).
                                    </p>
                                </div>

                                {/* Signatures */}
                                <div className="absolute bottom-[40mm] left-0 right-0 px-[20mm]">
                                    <div className="flex justify-between text-center">
                                        <div className="w-64">
                                            <div className="border-t border-black pt-2 mt-12">
                                                <p className="font-bold text-sm uppercase">{data.subdirector}</p>
                                                <p className="text-xs">Subdirector(a) de Gestión</p>
                                            </div>
                                        </div>
                                        <div className="w-64">
                                            <div className="border-t border-black pt-2 mt-12">
                                                <p className="font-bold text-sm">Padre de Familia o Tutor</p>
                                                <p className="text-xs">Recibí Citatorio</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* --- BITACORA TAB --- */}
        {activeTab === 'bitacora' && canEdit && (
            <>
                {/* LIST MODE */}
                {bitacoraMode === 'list' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-700">Historial de Bitácora Escolar</h3>
                            <button 
                                onClick={() => {
                                    setBitStudentName('');
                                    setBitStudentGroup('');
                                    setParentName('');
                                    setVisitSubject('');
                                    setNarrative('');
                                    setAgreementsParent('');
                                    setAgreementsStudent('');
                                    setTeacherIntervention('');
                                    setFaultType('');
                                    setFormativeActions('');
                                    setVisitStartTime('');
                                    setVisitEndTime('');
                                    setBitacoraMode('create');
                                }}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow transition-colors"
                            >
                                <Plus size={20} /> Nuevo Reporte
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Alumno</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Atendió (Tutor)</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Asunto</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.visitLogs.length > 0 ? data.visitLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(log.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-800">{log.studentName}</div>
                                                <div className="text-xs text-slate-400">{log.group}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {log.parentName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">
                                                {log.subject}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => loadVisit(log)} className="text-blue-600 hover:text-blue-800 mx-2" title="Ver / Reimprimir">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteVisit(log.id)} className="text-red-400 hover:text-red-600 mx-2" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <FileText size={48} className="mx-auto mb-2 opacity-20"/>
                                                <p>No hay registros en la bitácora.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CREATE MODE (Form + Preview) */}
                {bitacoraMode === 'create' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                        {/* INPUT PANEL (Left) */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 print:hidden h-fit max-h-[calc(100vh-100px)] overflow-y-auto">
                             <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-lg text-slate-800">Llenado de Bitácora</h3>
                                <button onClick={() => setBitacoraMode('list')} className="text-slate-400 hover:text-slate-600">
                                    <ArrowLeft size={20} />
                                </button>
                             </div>

                             <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">1. Alumno</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nombre completo..." 
                                        value={bitStudentName}
                                        onChange={(e) => setBitStudentName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grado y Grupo</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej. 3° C" 
                                        value={bitStudentGroup}
                                        onChange={(e) => setBitStudentGroup(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                                        <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inicio</label>
                                        <input type="time" value={visitStartTime} onChange={e => setVisitStartTime(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Término</label>
                                        <input type="time" value={visitEndTime} onChange={e => setVisitEndTime(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Padre/Tutor</label>
                                    <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asunto</label>
                                    <input type="text" value={visitSubject} onChange={e => setVisitSubject(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Narrativa de los hechos</label>
                                    <textarea rows={3} value={narrative} onChange={e => setNarrative(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Compromisos del Padre/Tutor</label>
                                    <textarea rows={2} value={agreementsParent} onChange={e => setAgreementsParent(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Compromisos del Alumno(a)</label>
                                    <textarea rows={2} value={agreementsStudent} onChange={e => setAgreementsStudent(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Intervención Docente</label>
                                    <textarea rows={2} value={teacherIntervention} onChange={e => setTeacherIntervention(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Falta (Marco Convivencia)</label>
                                    <input type="text" value={faultType} onChange={e => setFaultType(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Acciones Formativas</label>
                                    <textarea rows={2} value={formativeActions} onChange={e => setFormativeActions(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button 
                                        onClick={handleSaveVisit}
                                        disabled={!bitStudentName}
                                        className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        <Save size={16}/> Guardar
                                    </button>
                                    <button 
                                        onClick={handlePrint}
                                        className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 flex items-center justify-center gap-2"
                                    >
                                        <Printer size={16} /> Imprimir
                                    </button>
                                </div>
                             </div>
                        </div>

                        {/* PREVIEW / PDF PANEL (Right) */}
                        <div className="lg:col-span-2 print:w-full print:col-span-3">
                             <div className="bg-white shadow-2xl mx-auto max-w-[215mm] min-h-[279mm] print:shadow-none print:w-full print:max-w-none relative p-[10mm] text-black">
                                
                                {/* Logo */}
                                <img src={LOGO_URL} alt="Escudo" className="absolute top-4 right-6 w-16 h-20 object-contain opacity-90" />

                                {/* Header */}
                                <div className="text-center font-bold uppercase leading-snug mb-4">
                                    <p>ESCUELA SECUNDARIA DIURNA No. 27</p>
                                    <p className="whitespace-nowrap">ALFREDO E URUCHURTU TV.</p>
                                    <p>C.C.T.: {CCT}</p>
                                    <p>Turno: VESPERTINO</p>
                                    <p className="mt-2 text-lg">BITÁCORA ESCOLAR</p>
                                </div>

                                {/* Fields Structure using Tables to match exact look */}
                                <div className="border border-black text-sm">
                                    {/* Row 1 */}
                                    <div className="flex border-b border-black">
                                        <div className="flex-1 border-r border-black">
                                            <div className="bg-slate-200 px-2 py-1 font-bold border-b border-black print:bg-slate-200 print:print-color-adjust-exact">Nombre del alumno (a)</div>
                                            <div className="px-2 py-1 h-8 uppercase">{bitStudentName}</div>
                                        </div>
                                        <div className="w-1/3">
                                            <div className="bg-slate-200 px-2 py-1 font-bold border-b border-black print:bg-slate-200 print:print-color-adjust-exact">Grado y grupo</div>
                                            <div className="px-2 py-1 h-8 text-center">{bitStudentGroup}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Row 2 */}
                                    <div className="flex border-b border-black">
                                        <div className="flex-1 border-r border-black">
                                            <div className="bg-slate-200 px-2 py-1 font-bold border-b border-black print:bg-slate-200 print:print-color-adjust-exact">Fecha</div>
                                            <div className="px-2 py-1 h-8">{visitDate ? new Date(visitDate).toLocaleDateString() : ''}</div>
                                        </div>
                                        <div className="flex-1 border-r border-black">
                                            <div className="bg-slate-200 px-2 py-1 font-bold border-b border-black print:bg-slate-200 print:print-color-adjust-exact">Hora de inicio</div>
                                            <div className="px-2 py-1 h-8 text-center">{visitStartTime}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-slate-200 px-2 py-1 font-bold border-b border-black print:bg-slate-200 print:print-color-adjust-exact">Hora de término</div>
                                            <div className="px-2 py-1 h-8 text-center">{visitEndTime}</div>
                                        </div>
                                    </div>

                                    {/* Row 3 */}
                                    <div className="border-b border-black">
                                        <div className="bg-slate-200 px-2 py-1 font-bold border-b border-black print:bg-slate-200 print:print-color-adjust-exact">Nombre del padre, madre de familia o tutor</div>
                                        <div className="px-2 py-1 h-8 uppercase">{parentName}</div>
                                    </div>

                                    {/* Sections */}
                                    {[
                                        { title: 'Asunto', content: visitSubject, h: 'h-8' },
                                        { title: 'Narrativa de los hechos (circunstancias de modo, tiempo y lugar)', content: narrative, h: 'h-32' },
                                        { title: 'Compromisos del padre, madre de familia o tutor', content: agreementsParent, h: 'h-16' },
                                        { title: 'Compromisos de la alumna o el alumno', content: agreementsStudent, h: 'h-16' },
                                        { title: 'Intervención del docente (acciones a implementar para apoyar al educando)', content: teacherIntervention, h: 'h-16' },
                                        { title: 'Falta conforme el Marco para la Convivencia Escolar', content: faultType, h: 'h-8' },
                                        { title: 'Acciones formativas conforme el Marco para la Convivencia Escolar', content: formativeActions, h: 'h-16' },
                                    ].map((section, idx) => (
                                        <div key={idx} className="border-b border-black last:border-0">
                                            <div className="bg-slate-200 px-2 py-1 font-bold border-b border-black text-xs print:bg-slate-200 print:print-color-adjust-exact">{section.title}</div>
                                            <div className={`px-2 py-1 ${section.h} whitespace-pre-wrap`}>{section.content}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Manifestacion */}
                                <div className="mt-4 border border-black text-sm">
                                    <div className="bg-slate-200 px-2 py-1 font-bold border-b border-black text-xs print:bg-slate-200 print:print-color-adjust-exact">Manifestación de conformidad</div>
                                    <div className="p-4 text-justify leading-loose">
                                        Yo <span className="border-b border-black px-2 min-w-[200px] inline-block text-center uppercase">{parentName}</span> madre, padre, tutor (a) del (la) alumno (a) <span className="border-b border-black px-2 min-w-[200px] inline-block text-center uppercase">{bitStudentName}</span> del grupo <span className="border-b border-black px-2 min-w-[50px] inline-block text-center">{bitStudentGroup}</span> estoy conforme con la atención brindada por parte de la autoridad escolar <span className="border-b border-black px-2 min-w-[200px] inline-block"></span>, (función o cargo) <span className="border-b border-black px-2 min-w-[100px] inline-block"></span> en atención a los hechos presentados, toda vez que se me ha informado sobre las acciones realizadas para su oportuna atención.
                                    </div>
                                </div>

                                {/* Signatures */}
                                <div className="mt-4 border border-black flex text-center text-sm">
                                    <div className="flex-1 border-r border-black p-12 relative">
                                        <div className="absolute bottom-2 left-0 right-0 px-2">
                                            <div className="border-t border-black pt-1">
                                                Nombre y firma del padre, madre de familia o tutor
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 border-r border-black p-12 relative">
                                        <div className="absolute bottom-2 left-0 right-0 px-2">
                                            <div className="border-t border-black pt-1">
                                                Nombre y firma del docente
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-12 relative">
                                        <div className="absolute bottom-2 left-0 right-0 px-2">
                                            <div className="border-t border-black pt-1">
                                                <p className="font-bold mb-0.5 text-xs">Vo. Bo. DIRECCIÓN</p>
                                                <p className="uppercase text-[10px]">{data.director}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="mt-8 text-[9px] text-justify leading-tight text-slate-600">
                                    Se informa que en el presente documento <strong>no se realizarán transferencias de Datos Personales</strong>, salvo aquellas que sea necesario de conformidad con <strong>los supuestos contemplados en los artículos 22 y 70 de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados</strong> para atender requerimientos, solicitudes, recursos o cumplimientos de información de una autoridad competente, judicial, administrativa, civil, penal, fiscal o de cualquier otra rama del derecho que estén debidamente fundadas y motivadas para lo cual, no se requiere consentimiento del titular.
                                </div>

                             </div>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* --- MINUTA TAB (Same as before) --- */}
        {activeTab === 'minuta' && canEdit && (
            <>
                 {/* LIST MODE */}
                {minutaMode === 'list' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-700">Historial de Minutas de Atención</h3>
                            <button 
                                onClick={() => {
                                    setMinStudentName('');
                                    setMinStudentGroup('');
                                    setMinutaParentName('');
                                    setMinutaSubject('');
                                    setMinutaDescription('');
                                    setMinutaActions('');
                                    setMinutaAgreements('');
                                    setMinutaTime('');
                                    setMinutaAttendedBy('');
                                    setMinutaMode('create');
                                }}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow transition-colors"
                            >
                                <Plus size={20} /> Nueva Minuta
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Alumno</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Atendió</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Asunto/Queja</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.minutas.length > 0 ? data.minutas.map(min => (
                                        <tr key={min.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(min.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-800">{min.studentName}</div>
                                                <div className="text-xs text-slate-400">{min.group}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {min.attendedBy || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">
                                                {min.subject}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => loadMinuta(min)} className="text-blue-600 hover:text-blue-800 mx-2" title="Ver / Reimprimir">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteMinuta(min.id)} className="text-red-400 hover:text-red-600 mx-2" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <ClipboardList size={48} className="mx-auto mb-2 opacity-20"/>
                                                <p>No hay minutas registradas.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CREATE MODE */}
                {minutaMode === 'create' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                        {/* INPUT PANEL (Left) */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 print:hidden h-fit max-h-[calc(100vh-100px)] overflow-y-auto">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-lg text-slate-800">Datos de la Minuta</h3>
                                <button onClick={() => setMinutaMode('list')} className="text-slate-400 hover:text-slate-600">
                                    <ArrowLeft size={20} />
                                </button>
                            </div>
                            {/* ... Minuta Inputs ... (Same as before) */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">1. Alumno</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nombre completo..." 
                                        value={minStudentName}
                                        onChange={(e) => setMinStudentName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grado y Grupo</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej. 2° B" 
                                        value={minStudentGroup}
                                        onChange={(e) => setMinStudentGroup(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                                        <input type="date" value={minutaDate} onChange={e => setMinutaDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
                                        <input type="time" value={minutaTime} onChange={e => setMinutaTime(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Padre/Tutor</label>
                                    <input type="text" value={minutaParentName} onChange={e => setMinutaParentName(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Nombre de quien atiende</label>
                                    <input 
                                        type="text" 
                                        value={minutaAttendedBy} 
                                        onChange={e => setMinutaAttendedBy(e.target.value)} 
                                        className="w-full p-2 border rounded-lg text-sm bg-white" 
                                        placeholder="Ej. Prof. Juan Pérez o Subdirector..."
                                    />
                                    <p className="text-[10px] text-blue-600 mt-1">Este nombre aparecerá en la firma del documento.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo de la Queja / Atención</label>
                                    <input type="text" value={minutaSubject} onChange={e => setMinutaSubject(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hechos / Descripción de la Situación</label>
                                    <textarea rows={4} value={minutaDescription} onChange={e => setMinutaDescription(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Respuesta Previa / Acciones Inmediatas</label>
                                    <textarea rows={4} value={minutaActions} onChange={e => setMinutaActions(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Acuerdos y Compromisos</label>
                                    <textarea rows={3} value={minutaAgreements} onChange={e => setMinutaAgreements(e.target.value)} className="w-full p-2 border rounded-lg text-sm resize-none" />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button 
                                        onClick={handleSaveMinuta}
                                        disabled={!minStudentName}
                                        className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        <Save size={16} /> Guardar
                                    </button>
                                    <button 
                                        onClick={handlePrint}
                                        className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 flex items-center justify-center gap-2"
                                    >
                                        <Printer size={16} /> Imprimir
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PDF PREVIEW (Right) */}
                        <div className="lg:col-span-2 print:w-full print:col-span-3">
                            <div className="bg-white shadow-2xl mx-auto max-w-[215mm] min-h-[279mm] print:shadow-none print:w-full print:max-w-none relative p-[15mm] text-black flex flex-col justify-between">
                                
                                {/* Logo */}
                                <img src={LOGO_URL} alt="Escudo" className="absolute top-6 right-8 w-16 h-20 object-contain opacity-90" />

                                <div>
                                    {/* Header */}
                                    <div className="text-center font-bold uppercase leading-tight mb-4 text-sm">
                                        <p>ESCUELA SECUNDARIA DIURNA No. 27</p>
                                        <p className="whitespace-nowrap">ALFREDO E URUCHURTU TV.</p>
                                        <p>C.C.T.: {CCT}</p>
                                        <p>Turno: VESPERTINO</p>
                                        <h2 className="text-lg font-bold mt-3 border-b-2 border-black inline-block pb-0.5">MINUTA DE ATENCIÓN A PADRES DE FAMILIA</h2>
                                    </div>

                                    <div className="flex justify-between mb-3 text-xs font-medium">
                                        <p>FECHA: <span className="border-b border-black px-2">{minutaDate ? new Date(minutaDate).toLocaleDateString() : '___________'}</span></p>
                                        <p>HORA: <span className="border-b border-black px-2">{minutaTime || '____:____'}</span></p>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="border border-black text-xs mb-3">
                                        <div className="flex border-b border-black">
                                            <div className="w-3/4 border-r border-black p-1 flex">
                                                <span className="font-bold mr-2">ALUMNO(A):</span>
                                                <span className="uppercase flex-1">{minStudentName}</span>
                                            </div>
                                            <div className="w-1/4 p-1 flex">
                                                <span className="font-bold mr-2">GRUPO:</span>
                                                <span>{minStudentGroup}</span>
                                            </div>
                                        </div>
                                        <div className="flex border-b border-black"> {/* New Row Layout */}
                                            <div className="flex-1 border-r border-black p-1 flex">
                                                <span className="font-bold mr-2">PADRE/TUTOR:</span>
                                                <span className="uppercase flex-1">{minutaParentName}</span>
                                            </div>
                                            <div className="flex-1 p-1 flex">
                                                <span className="font-bold mr-2">ATENDIÓ:</span>
                                                <span className="uppercase flex-1">{minutaAttendedBy}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sections - Compacted */}
                                    <div className="space-y-3 text-xs">
                                        
                                        {/* Asunto */}
                                        <div>
                                            <div className="bg-slate-200 border border-black p-1 font-bold text-center text-[10px] print:bg-slate-200 print:print-color-adjust-exact">
                                                MOTIVO DE LA ATENCIÓN / QUEJA
                                            </div>
                                            <div className="border-l border-r border-b border-black p-1 min-h-[30px]">
                                                {minutaSubject}
                                            </div>
                                        </div>

                                        {/* Hechos */}
                                        <div>
                                            <div className="bg-slate-200 border border-black p-1 font-bold text-center text-[10px] print:bg-slate-200 print:print-color-adjust-exact">
                                                DESCRIPCIÓN DE LA SITUACIÓN PLANTEADA (HECHOS)
                                            </div>
                                            <div className="border-l border-r border-b border-black p-1 min-h-[80px] whitespace-pre-wrap text-justify leading-tight">
                                                {minutaDescription}
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div>
                                            <div className="bg-slate-200 border border-black p-1 font-bold text-center text-[10px] print:bg-slate-200 print:print-color-adjust-exact">
                                                RESPUESTA O ACCIONES REALIZADAS
                                            </div>
                                            <div className="border-l border-r border-b border-black p-1 min-h-[60px] whitespace-pre-wrap text-justify leading-tight">
                                                {minutaActions}
                                            </div>
                                        </div>

                                        {/* Acuerdos */}
                                        <div>
                                            <div className="bg-slate-200 border border-black p-1 font-bold text-center text-[10px] print:bg-slate-200 print:print-color-adjust-exact">
                                                ACUERDOS Y COMPROMISOS
                                            </div>
                                            <div className="border-l border-r border-b border-black p-1 min-h-[60px] whitespace-pre-wrap text-justify leading-tight">
                                                {minutaAgreements}
                                            </div>
                                        </div>

                                        {/* Manifestacion de Conformidad - Ultra Compact */}
                                        <div className="border border-black text-[10px]">
                                            <div className="bg-slate-200 px-2 py-0.5 font-bold border-b border-black text-[9px] print:bg-slate-200 print:print-color-adjust-exact">MANIFESTACIÓN DE CONFORMIDAD</div>
                                            <div className="p-2 text-justify leading-snug">
                                                Yo <span className="border-b border-black px-2 min-w-[150px] inline-block text-center uppercase font-bold">{minutaParentName}</span> padre, madre o tutor del (la) alumno (a) <span className="border-b border-black px-2 min-w-[150px] inline-block text-center uppercase font-bold">{minStudentName}</span> del grupo <span className="border-b border-black px-2 min-w-[30px] inline-block text-center font-bold">{minStudentGroup}</span> estoy conforme con la atención brindada por parte de la autoridad escolar <span className="border-b border-black px-2 min-w-[100px] inline-block"></span>, (función o cargo) <span className="border-b border-black px-2 min-w-[80px] inline-block"></span> en atención a los hechos presentados, toda vez que se me ha informado sobre las acciones realizadas para su oportuna atención.
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div>
                                    {/* Signatures - 3 Column Layout */}
                                    <div className="mt-4 flex justify-between text-center text-[10px] items-end">
                                        <div className="w-1/3 px-2">
                                            <div className="border-t border-black pt-1">
                                                <p className="font-bold mb-0.5">PADRE, MADRE O TUTOR</p>
                                                <p className="uppercase">{minutaParentName || '(Nombre y Firma)'}</p>
                                            </div>
                                        </div>
                                        <div className="w-1/3 px-2">
                                            <div className="border-t border-black pt-1">
                                                <p className="font-bold mb-0.5">PERSONAL QUE ATENDIÓ</p>
                                                <p className="uppercase">{minutaAttendedBy}</p>
                                            </div>
                                        </div>
                                        <div className="w-1/3 px-2">
                                            <div className="border-t border-black pt-1">
                                                <p className="font-bold mb-0.5">Vo. Bo.</p>
                                                <p className="font-bold">LA DIRECCIÓN DEL PLANTEL</p>
                                                <p className="uppercase">{data.director}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="mt-2 text-[8px] text-justify leading-tight text-slate-600">
                                        Se informa que en el presente documento <strong>no se realizarán transferencias de Datos Personales</strong>, salvo aquellas que sea necesario de conformidad con <strong>los supuestos contemplados en los artículos 22 y 70 de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados</strong> para atender requerimientos, solicitudes, recursos o cumplimientos de información de una autoridad competente, judicial, administrativa, civil, penal, fiscal o de cualquier otra rama del derecho que estén debidamente fundadas y motivadas para lo cual, no se requiere consentimiento del titular.
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </>
        )}

      </div>
    </div>
  );
};

export default SubdireccionView;