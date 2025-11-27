

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User as UserIcon, Save, X, Book, Briefcase, Cpu, Pencil, Clipboard, Users, Wifi, FlaskConical, HandHelping, Clock } from 'lucide-react';
import { SchoolData, User, Role, SubjectAssignment } from '../types';
import { WEEK_DAYS } from '../utils';

interface TeachersViewProps {
  data: SchoolData;
  onUpdateData: (newData: SchoolData) => void;
}

const TeachersView: React.FC<TeachersViewProps> = ({ data, onUpdateData }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('teacher');
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  
  // Work Schedule State (For Support Staff)
  const [workSchedule, setWorkSchedule] = useState<Record<string, string>>({});

  // Assignment Form State
  const [assignGrade, setAssignGrade] = useState(data.gradesStructure[0].grade);
  const [assignGroup, setAssignGroup] = useState('A'); 
  const [assignSubject, setAssignSubject] = useState(data.gradesStructure[0].subjects[0]);
  const [assignTech, setAssignTech] = useState('');

  const isStaffRole = ['administrative', 'red_escolar', 'laboratorista', 'apoyo'].includes(role);

  // Reset assignment inputs when modal opens or subject changes
  useEffect(() => {
     if (assignSubject === 'Tecnología') {
         setAssignGroup('AC'); // Valor por defecto para tecnología (Sección 1)
     } else {
         const availableGroups = data.gradesStructure.find(g => g.grade === assignGrade)?.groups || [];
         if (availableGroups.length > 0) setAssignGroup(availableGroups[0]);
     }
  }, [assignSubject, assignGrade, data.gradesStructure]);

  const handleDeleteUser = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      onUpdateData({
        ...data,
        users: data.users.filter(u => u.id !== id)
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password || '');
    setRole(user.role);
    setAssignments(user.assignments ? [...user.assignments] : []);
    
    // Initialize schedule if exists, or empty
    const initialSchedule: Record<string, string> = {};
    WEEK_DAYS.forEach(day => {
        initialSchedule[day] = user.workSchedule?.[day] || '';
    });
    setWorkSchedule(initialSchedule);

    setShowModal(true);
  };

  const handleAddAssignment = () => {
    // Si la materia es Tecnología, validamos que haya seleccionado un taller
    if (assignSubject === 'Tecnología') {
        if (!assignTech) {
            alert("Debes seleccionar un taller específico para la asignatura de Tecnología.");
            return;
        }

        // Lógica para Secciones (A+C o B+D)
        let groupsToAdd: string[] = [];
        if (assignGroup === 'AC') groupsToAdd = ['A', 'C'];
        else if (assignGroup === 'BD') groupsToAdd = ['B', 'D'];
        else groupsToAdd = [assignGroup]; // Fallback

        const newAssignments: SubjectAssignment[] = [];
        
        groupsToAdd.forEach(group => {
            const exists = assignments.some(
                a => a.grade === assignGrade && a.group === group && a.subject === assignSubject
            );
            
            if (!exists) {
                newAssignments.push({
                    grade: assignGrade,
                    group: group,
                    subject: assignSubject,
                    technology: assignTech
                });
            }
        });

        if (newAssignments.length > 0) {
            setAssignments([...assignments, ...newAssignments]);
        }

    } else {
        // Lógica normal para materias académicas
        const exists = assignments.some(
          a => a.grade === assignGrade && a.group === assignGroup && a.subject === assignSubject
        );
        
        if (!exists) {
          setAssignments([
              ...assignments, 
              { 
                  grade: assignGrade, 
                  group: assignGroup, 
                  subject: assignSubject
                  // technology undefined
              }
          ]);
        }
    }
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (day: string, value: string) => {
      setWorkSchedule(prev => ({
          ...prev,
          [day]: value
      }));
  };

  const handleCreateOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    // Logic to cleanup data based on role
    const finalAssignments = role === 'teacher' ? assignments : undefined;
    
    // Only save workSchedule for support roles
    const finalWorkSchedule = isStaffRole ? workSchedule : undefined;

    if (editingUserId) {
        // UPDATE EXISTING USER
        const updatedUsers = data.users.map(u => {
            if (u.id === editingUserId) {
                return {
                    ...u,
                    name,
                    username,
                    password,
                    role,
                    assignments: finalAssignments,
                    workSchedule: finalWorkSchedule
                };
            }
            return u;
        });

        let updatedData = { ...data, users: updatedUsers };
        if (role === 'subdirector') {
             updatedData = { ...updatedData, subdirector: name };
        }
        onUpdateData(updatedData);

    } else {
        // CREATE NEW USER
        const newUser: User = {
            id: Date.now().toString(),
            name,
            username,
            password,
            role,
            assignments: finalAssignments,
            workSchedule: finalWorkSchedule
        };

        let updatedData = { ...data, users: [...data.users, newUser] };
        if (role === 'subdirector') {
            updatedData = { ...updatedData, subdirector: name };
        }
        onUpdateData(updatedData);
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRole('teacher');
    setAssignments([]);
    setAssignTech('');
    setWorkSchedule({});
    setEditingUserId(null);
    setShowModal(false);
  };

  const getRoleIcon = (r: Role) => {
    switch (r) {
      case 'admin': return <Shield size={24} />;
      case 'subdirector': return <Briefcase size={24} />;
      case 'administrative': return <Clipboard size={24} />;
      case 'red_escolar': return <Wifi size={24} />;
      case 'laboratorista': return <FlaskConical size={24} />;
      case 'apoyo': return <HandHelping size={24} />;
      default: return <UserIcon size={24} />;
    }
  };

  const getRoleColor = (r: Role) => {
    switch (r) {
      case 'admin': return 'bg-blue-100 text-blue-600';
      case 'subdirector': return 'bg-purple-100 text-purple-600';
      case 'administrative': return 'bg-orange-100 text-orange-600';
      case 'red_escolar': return 'bg-indigo-100 text-indigo-600';
      case 'laboratorista': return 'bg-yellow-100 text-yellow-700';
      case 'apoyo': return 'bg-pink-100 text-pink-600';
      default: return 'bg-emerald-100 text-emerald-600';
    }
  };

  const getRoleLabel = (r: Role) => {
    switch (r) {
      case 'admin': return 'Administrador';
      case 'subdirector': return 'Subdirector de Gestión';
      case 'administrative': return 'Personal Administrativo';
      case 'red_escolar': return 'Red Escolar';
      case 'laboratorista': return 'Ayudante de Laboratorio';
      case 'apoyo': return 'Apoyo Educativo';
      default: return 'Docente';
    }
  };

  const availableGroups = data.gradesStructure.find(g => g.grade === assignGrade)?.groups || [];
  const availableSubjects = data.gradesStructure.find(g => g.grade === assignGrade)?.subjects || [];
  
  const isTechSubject = assignSubject === 'Tecnología';

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Personal Escolar</h2>
          <p className="text-slate-500">Administrar usuarios, docentes, apoyo y personal administrativo.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm"
        >
          <Plus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.users.map(user => (
          <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${getRoleColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{user.name}</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold">{getRoleLabel(user.role)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                    onClick={() => handleEditUser(user)}
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar usuario"
                >
                    <Pencil size={18} />
                </button>
                <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar usuario"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm text-slate-600">
              <p><span className="font-medium">Usuario:</span> {user.username}</p>
              <p><span className="font-medium">Contraseña:</span> {user.password}</p>
            </div>

            {/* TEACHER ASSIGNMENTS */}
            {user.role === 'teacher' && (
              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                    Carga Académica
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin">
                  {user.assignments && user.assignments.length > 0 ? user.assignments.map((assign, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
                      {assign.grade} {assign.group} 
                      {` - ${assign.subject}`}
                      {assign.technology && <span className="text-[10px] text-blue-500 ml-1">({assign.technology})</span>}
                    </span>
                  )) : (
                    <span className="text-xs text-slate-400 italic">Sin asignaciones</span>
                  )}
                </div>
              </div>
            )}

            {/* STAFF SCHEDULE */}
            {['administrative', 'red_escolar', 'laboratorista', 'apoyo'].includes(user.role) && (
                <div className="mt-auto pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                        <Clock size={12} className="mr-1"/> Jornada Laboral
                    </p>
                    <div className="space-y-1 text-xs text-slate-600">
                        {WEEK_DAYS.slice(0,3).map(day => (
                            user.workSchedule?.[day] ? (
                                <div key={day} className="flex justify-between">
                                    <span className="font-medium">{day.substring(0,3)}:</span>
                                    <span>{user.workSchedule[day]}</span>
                                </div>
                            ) : null
                        ))}
                        {(user.workSchedule?.['Jueves'] || user.workSchedule?.['Viernes']) && <span className="text-[10px] text-slate-400 italic">... ver detalle</span>}
                        {!user.workSchedule && <span className="italic text-slate-400">Sin horario asignado</span>}
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Create/Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                  {editingUserId ? 'Editar Usuario' : 'Crear Credenciales de Acceso'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdateUser} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <input 
                    required value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Ej. Mtro. Luis Hernández"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                  <input 
                    required value={username} onChange={e => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="usuario.acceso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <input 
                    required type="text" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contraseña"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                   <select 
                    value={role} onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none"
                   >
                     <option value="teacher">Docente</option>
                     <option value="subdirector">Subdirector de Gestión</option>
                     <option value="administrative">Personal Administrativo</option>
                     <option value="red_escolar">Red Escolar</option>
                     <option value="laboratorista">Ayudante de Laboratorio</option>
                     <option value="apoyo">Apoyo Educativo</option>
                     <option value="admin">Administrador</option>
                   </select>
                </div>
              </div>

              {/* ACADEMIC ASSIGNMENT PANEL (ONLY TEACHERS) */}
              {role === 'teacher' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <h4 className="font-bold text-slate-700 mb-3 flex items-center">
                       <Book size={16} className="mr-2"/> Asignar Materias y Grupos
                   </h4>
                   <div className="flex flex-wrap gap-3 items-end mb-4">
                      <div className="flex-1 min-w-[80px]">
                        <label className="text-xs font-bold text-slate-500">Grado</label>
                        <select value={assignGrade} onChange={e => setAssignGrade(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                          {data.gradesStructure.map(g => <option key={g.grade} value={g.grade}>{g.grade}</option>)}
                        </select>
                      </div>

                      <div className="flex-[2] min-w-[150px]">
                        <label className="text-xs font-bold text-slate-500">Asignatura</label>
                        <select value={assignSubject} onChange={e => setAssignSubject(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                            {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="flex-[1.5] min-w-[120px]">
                        <label className={`text-xs font-bold ${isTechSubject ? 'text-blue-600' : 'text-slate-500'}`}>
                            {isTechSubject ? 'Sección' : 'Grupo'}
                        </label>
                        <select 
                            value={assignGroup} 
                            onChange={e => setAssignGroup(e.target.value)} 
                            className={`w-full p-2 border rounded-lg text-sm ${isTechSubject ? 'bg-blue-50 border-blue-200 font-bold text-blue-800' : ''}`}
                        >
                          {isTechSubject ? (
                              <>
                                <option value="AC">Sección 1 (A y C)</option>
                                <option value="BD">Sección 2 (B y D)</option>
                              </>
                          ) : (
                              availableGroups.map(g => <option key={g} value={g}>{g}</option>)
                          )}
                        </select>
                      </div>
                   </div>

                   {/* Selector especial para Tecnologías */}
                   {isTechSubject && (
                       <div className="mb-4 bg-blue-100 p-2 rounded-lg border border-blue-200">
                           <label className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                               <Cpu size={12} /> Taller Específico (Requerido)
                           </label>
                           <select 
                                value={assignTech} 
                                onChange={e => setAssignTech(e.target.value)}
                                className="w-full mt-1 p-2 border border-blue-300 rounded text-sm bg-white"
                           >
                               <option value="">-- Selecciona el Taller --</option>
                               {data.technologies.map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                       </div>
                   )}

                   <button type="button" onClick={handleAddAssignment} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold">
                        Agregar Asignatura
                   </button>

                   <div className="bg-white p-3 mt-4 rounded-lg border border-slate-200 min-h-[100px]">
                     {assignments.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Agrega asignaciones a la lista</p>}
                     <ul className="space-y-2">
                        {assignments.map((assign, idx) => (
                          <li key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100 text-sm">
                             <span>
                                 <strong>{assign.grade} {assign.group}</strong> 
                                 {` - ${assign.subject}`}
                                 {assign.technology && <span className="text-xs text-blue-600 ml-1 block">Taller: {assign.technology}</span>}
                             </span>
                             <button type="button" onClick={() => removeAssignment(idx)} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                          </li>
                        ))}
                     </ul>
                   </div>
                </div>
              )}

              {/* SUPPORT STAFF SCHEDULE PANEL */}
              {isStaffRole && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                          <Clock size={16} className="mr-2"/> Jornada Laboral (Horario)
                      </h4>
                      <p className="text-xs text-orange-700 mb-4">
                          Ingresa el horario para cada día (ej. "14:00-17:30"). Este horario se reflejará en la sábana y reportes.
                      </p>
                      
                      <div className="grid grid-cols-1 gap-3">
                          {WEEK_DAYS.map(day => (
                              <div key={day} className="flex items-center">
                                  <label className="w-24 text-sm font-bold text-orange-900">{day}</label>
                                  <input 
                                    type="text" 
                                    value={workSchedule[day] || ''}
                                    onChange={(e) => handleScheduleChange(day, e.target.value)}
                                    placeholder="Ej. 14:00-18:00"
                                    className="flex-1 px-3 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg"
                >
                  {editingUserId ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersView;