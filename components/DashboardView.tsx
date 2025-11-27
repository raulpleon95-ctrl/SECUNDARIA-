

import React from 'react';
import { Users, Building2, GraduationCap, Home, Clock, Calendar, AlertCircle, Bell } from 'lucide-react';
import InfoCard from './InfoCard';
import { SchoolData, PageId, User } from '../types';

interface DashboardViewProps {
  data: SchoolData;
  onNavigate?: (page: PageId) => void; 
  currentUser: User;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data, onNavigate, currentUser }) => {

  // Filtrar citatorios relevantes para el usuario
  const recentCitations = React.useMemo(() => {
      const allCitations = data.citations || [];
      
      // Si es Admin o Subdirector, ve todos los citatorios recientes
      if (currentUser.role === 'admin' || currentUser.role === 'subdirector') {
          return allCitations.slice(0, 5); // Últimos 5
      }
      
      // Si es Profesor, ve solo los que él solicitó
      if (currentUser.role === 'teacher') {
          return allCitations.filter(c => c.teacherId === currentUser.id).slice(0, 5);
      }

      return [];
  }, [data.citations, currentUser]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bienvenido, {currentUser.name}</h2>
        <p className="text-slate-500">Resumen general de {data.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title="Alumnos Totales"
          value={data.studentsCount}
          icon={<Users className="text-purple-600" size={24} />}
          className="bg-purple-50 border-purple-100"
        />
        <InfoCard
          title="Profesores"
          value={data.teachers}
          icon={<Building2 className="text-emerald-600" size={24} />}
          className="bg-emerald-50 border-emerald-100"
        />
        <InfoCard
          title="Director"
          value={data.director}
          icon={<GraduationCap className="text-amber-600" size={24} />}
          className="bg-amber-50 border-amber-100"
        />
        <InfoCard
          title="Escuela"
          value="Secundaria 27"
          icon={<Home className="text-blue-600" size={24} />}
          className="bg-blue-50 border-blue-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Recent Activity (Generic) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-500" size={20} /> 
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center p-3 bg-slate-50 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <p className="text-sm text-slate-600 flex-1">
                  <span className="font-semibold text-slate-900">Sistema</span> actualizado correctamente.
                </p>
                <span className="text-xs text-slate-400">Hace {i + 1}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Avisos / Citatorios */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Bell className="mr-2 text-orange-500" size={20} />
                Avisos y Citatorios
            </h3>
            <div className="space-y-4">
                {recentCitations.length > 0 ? (
                    recentCitations.map(cit => (
                        <div key={cit.id} className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-orange-900 text-sm">Citatorio: {cit.studentName}</p>
                                <span className="text-[10px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded">{new Date(cit.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-orange-800 mb-1">Grupo: {cit.group}</p>
                            <p className="text-xs text-orange-700 truncate italic">"{cit.reason}"</p>
                            {currentUser.role !== 'teacher' && cit.teacherName && (
                                <p className="text-[10px] text-orange-600 mt-1 font-semibold">Solicitó: {cit.teacherName}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                        <p className="text-sm">No hay citatorios recientes.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Column 3: Calendar / Events */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Calendar className="mr-2 text-red-500" size={20} />
            Próximos Eventos
          </h3>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-xl">
              <p className="font-bold text-red-900">Entrega de Boletas</p>
              <p className="text-xs text-red-700 mt-1">Viernes, 25 de Noviembre</p>
            </div>
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-xl">
              <p className="font-bold text-blue-900">Junta de Consejo Técnico</p>
              <p className="text-xs text-blue-700 mt-1">Viernes, 30 de Noviembre</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;