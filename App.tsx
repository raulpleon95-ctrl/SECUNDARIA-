import React, { useState, useEffect } from 'react';
import { Building2, CloudOff, Cloud } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import DashboardView from './components/DashboardView';
import GradeSelectionView from './components/GradeSelectionView';
import StudentsView from './components/StudentsView';
import GradeRegistrationView from './components/GradeRegistrationView';
import LoginView from './components/LoginView';
import ReportsView from './components/ReportsView';
import TeachersView from './components/TeachersView';
import GradeControlView from './components/GradeControlView';
import SubdireccionView from './components/SubdireccionView';
import SubjectsConfigView from './components/SubjectsConfigView'; 
import SchedulesView from './components/SchedulesView'; 
import ConfigView from './components/ConfigView';
import { SchoolData, PageId, User, SubjectAssignment } from './types';
import { generateInitialData } from './utils';
import { saveToFirebase, subscribeToData, getDb } from './firebaseClient';

export default function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null); // Added Group State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentCycle, setCurrentCycle] = useState('2025-2026');
  
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Global state for school data - initialized directly in memory
  const [schoolData, setSchoolData] = useState<SchoolData>(generateInitialData());

  // --- CARGA DE DATOS ---
  useEffect(() => {
    // 1. Verificar si hay Firebase configurado
    if (getDb()) {
        setIsCloudConnected(true);
        console.log("Conectado a Firebase. Suscribiendo a cambios...");
        
        // Suscripción en tiempo real
        const unsubscribe = subscribeToData((newData) => {
            if (newData) {
                // Fusión de seguridad similar a la local
                const defaultData = generateInitialData();
                const mergedData: SchoolData = {
                    ...defaultData,
                    ...newData,
                    visitLogs: newData.visitLogs || [],
                    minutas: newData.minutas || [],
                    citations: newData.citations || [],
                    schedules: newData.schedules || [],
                    studentsData: newData.studentsData || defaultData.studentsData,
                    users: newData.users || defaultData.users,
                    periodDeadlines: newData.periodDeadlines || {},
                    sabanaLayout: newData.sabanaLayout || defaultData.sabanaLayout,
                    allowedPeriods: newData.allowedPeriods || defaultData.allowedPeriods
                };
                setSchoolData(mergedData);
                // También actualizamos el caché local por si se va internet
                localStorage.setItem('school_data_local', JSON.stringify(mergedData));
            }
        });
        return () => unsubscribe();
    } else {
        // 2. Si no hay nube, cargar de local storage
        console.log("Modo Local. Cargando de LocalStorage.");
        const savedData = localStorage.getItem('school_data_local');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                const defaultData = generateInitialData();
                const mergedData: SchoolData = {
                    ...defaultData,
                    ...parsedData,
                    visitLogs: parsedData.visitLogs || [],
                    minutas: parsedData.minutas || [],
                    citations: parsedData.citations || [],
                    schedules: parsedData.schedules || [],
                    studentsData: parsedData.studentsData || defaultData.studentsData,
                    users: parsedData.users || defaultData.users,
                    periodDeadlines: parsedData.periodDeadlines || {},
                    sabanaLayout: parsedData.sabanaLayout || defaultData.sabanaLayout,
                    allowedPeriods: parsedData.allowedPeriods || defaultData.allowedPeriods
                };
                setSchoolData(mergedData);
            } catch (e) {
                console.error("Error cargando datos locales:", e);
            }
        }
    }
  }, []);

  // --- AUTOMATIC PERIOD CLOSING LOGIC ---
  useEffect(() => {
    const checkDeadlines = () => {
      // Si no hay deadlines configurados, no hacemos nada
      if (!schoolData.periodDeadlines) return;

      // Obtener hora actual en CDMX
      const now = new Date();
      // Formateamos la fecha actual en la zona horaria CDMX para obtener "YY/MM/DD, HH:MM:SS"
      const cdmxOptions: Intl.DateTimeFormatOptions = { 
          timeZone: "America/Mexico_City", 
          year: 'numeric', month: 'numeric', day: 'numeric', 
          hour: 'numeric', minute: 'numeric', second: 'numeric', 
          hour12: false 
      };
      // Crear objeto Date basado en la string de CDMX para poder comparar matemáticamente
      const cdmxString = new Intl.DateTimeFormat('en-US', cdmxOptions).format(now);
      const cdmxDate = new Date(cdmxString);

      let hasChanges = false;
      let newAllowed = [...(schoolData.allowedPeriods || [])];

      Object.entries(schoolData.periodDeadlines).forEach(([key, deadlineStr]) => {
         // deadlineStr es formato ISO local del input (YYYY-MM-DDTHH:MM) que capturó el usuario
         if (!deadlineStr) return;
         if (!newAllowed.includes(key)) return; // Ya está cerrado

         // Creamos fecha límite asumiendo que el input del usuario ES hora local CDMX
         // Cast as string to resolve TS error
         const deadlineDate = new Date(deadlineStr as string);

         // Si la hora actual CDMX es mayor o igual a la fecha límite
         if (cdmxDate >= deadlineDate) {
             console.log(`[Auto-Close] Cerrando periodo ${key}. Hora CDMX: ${cdmxDate.toLocaleString()} >= Límite: ${deadlineDate.toLocaleString()}`);
             newAllowed = newAllowed.filter(p => p !== key);
             hasChanges = true;
         }
      });

      if (hasChanges) {
          handleUpdateData({
              ...schoolData,
              allowedPeriods: newAllowed
          });
      }
    };

    // Verificar cada 10 segundos
    const interval = setInterval(checkDeadlines, 10000);
    return () => clearInterval(interval);
  }, [schoolData.allowedPeriods, schoolData.periodDeadlines]);
  // --------------------------------------

  const handleLogin = (loggedInUser: User, cycle: string) => {
    setUser(loggedInUser);
    setCurrentCycle(cycle);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedGrade(null);
    setSelectedGroup(null);
  };

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    // Reset selection context when navigating to main sections
    if (['dashboard', 'grades', 'grade-registration', 'teachers', 'subdireccion', 'reports', 'grade-control', 'subjects-config', 'schedules', 'config'].includes(page)) {
      setSelectedGrade(null);
      setSelectedGroup(null);
    }
  };

  // Navigation Logic for "Grades" (List of Students) - Admin Only
  const handleSelectGradeForList = (grade: string, group?: string) => {
    setSelectedGrade(grade);
    // If group is provided (clicked specific button), use it. Otherwise default to 'A'
    setSelectedGroup(group || 'A');
    setCurrentPage('students-list');
  };

  // Handler to switch context inside StudentsView
  const handleChangeStudentContext = (grade: string, group: string) => {
    setSelectedGrade(grade);
    setSelectedGroup(group);
  };

  // Update global state and Save (Local + Cloud)
  const handleUpdateData = (newData: SchoolData) => {
    // 1. Optimistic update (UI first)
    setSchoolData(newData);
    // 2. Save Local
    localStorage.setItem('school_data_local', JSON.stringify(newData));
    // 3. Save Cloud (if connected)
    if (isCloudConnected) {
        saveToFirebase(newData).catch(err => console.error("Fallo al guardar en nube:", err));
    }
  };

  const handleCycleChange = (newCycle: string) => {
      setCurrentCycle(newCycle);
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} users={schoolData.users || []} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardView data={schoolData} onNavigate={handleNavigate} currentUser={user} />;
      
      // --- Student Management (Admin Only) ---
      case 'grades':
        if (user.role !== 'admin' && user.role !== 'subdirector') return <div className="p-8 text-red-500">Acceso Restringido</div>;
        return (
          <GradeSelectionView 
            data={schoolData} 
            onSelectGrade={handleSelectGradeForList} 
            title="Directorio de Alumnos"
            subtitle="Selecciona un grupo para gestionar la lista de estudiantes."
          />
        );
      case 'students-list':
        return (selectedGrade && selectedGroup) ? (
          <StudentsView 
            grade={selectedGrade} 
            group={selectedGroup}
            data={schoolData} 
            onBack={() => handleNavigate('grades')} 
            onChangeContext={handleChangeStudentContext}
            onUpdateData={handleUpdateData}
          />
        ) : null;

      // --- Grade Registration (Unified View) ---
      case 'grade-registration':
        return (
          <GradeRegistrationView 
            currentUser={user}
            data={schoolData} 
            onBack={() => handleNavigate('dashboard')}
            onUpdateData={handleUpdateData}
          />
        );
      
      // --- Reports ---
      case 'reports':
        return <ReportsView data={schoolData} currentUser={user} currentCycle={currentCycle} />;
      
      // --- Teacher Management ---
      case 'teachers':
        if (user.role !== 'admin' && user.role !== 'subdirector') return <div className="p-8 text-red-500">Acceso Restringido</div>;
        return <TeachersView data={schoolData} onUpdateData={handleUpdateData} />;
      
      // --- Schedules Management ---
      case 'schedules':
        // Allowed for teachers now, but view restriction handled inside component
        if (user.role !== 'admin' && user.role !== 'subdirector' && user.role !== 'teacher') return <div className="p-8 text-red-500">Acceso Restringido</div>;
        return <SchedulesView data={schoolData} onUpdateData={handleUpdateData} currentUser={user} currentCycle={currentCycle} />;
      
      // --- Subject Configuration ---
      case 'subjects-config':
        if (user.role !== 'admin' && user.role !== 'subdirector') return <div className="p-8 text-red-500">Acceso Restringido</div>;
        return <SubjectsConfigView data={schoolData} onUpdateData={handleUpdateData} />;

      // --- Grade Control ---
      case 'grade-control':
        if (user.role !== 'admin' && user.role !== 'subdirector') return <div className="p-8 text-red-500">Acceso Restringido</div>;
        return (
             <GradeControlView 
                data={schoolData} 
                onUpdateData={handleUpdateData} 
                currentCycle={currentCycle}
                onCycleChange={handleCycleChange}
             />
        );

      // --- Subdireccion ---
      case 'subdireccion':
        if (user.role !== 'admin' && user.role !== 'subdirector' && user.role !== 'teacher') return <div className="p-8 text-red-500">Acceso Restringido</div>;
        return <SubdireccionView data={schoolData} onUpdateData={handleUpdateData} currentUser={user} currentCycle={currentCycle} />;

      case 'config':
        if (user.role !== 'admin') return <div className="p-8 text-red-500">Acceso Restringido</div>;
        return <ConfigView />;

      // Placeholders
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-slate-400">
            <div className="bg-slate-200 p-6 rounded-full mb-4">
                <Building2 size={48} />
            </div>
            <h3 className="text-xl font-semibold text-slate-600">Módulo en Construcción</h3>
            <button onClick={() => setCurrentPage('dashboard')} className="mt-6 text-blue-600 font-medium hover:underline">
              Regresar al Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen font-sans bg-slate-50 overflow-hidden">
      <Sidebar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCollapsed={isSidebarCollapsed}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onNavigate={handleNavigate} />
        
        <main className="flex-1 overflow-y-auto scroll-smooth">
            {/* Top Header Bar for Desktop */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 sticky top-0 z-20 hidden md:flex justify-between items-center print:hidden">
                <div className="flex items-center text-sm text-slate-500">
                   {/* Removed specific School Cycle text here as requested */}
                   <span className="font-medium text-slate-800 mr-2">{schoolData.name}</span>
                   <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mr-2">Ciclo: {currentCycle}</span>
                   {isCloudConnected ? (
                       <span className="text-green-600 text-xs flex items-center font-bold" title="Datos sincronizados en tiempo real"><Cloud size={14} className="mr-1"/> En línea</span>
                   ) : (
                       <span className="text-slate-400 text-xs flex items-center" title="Guardando solo en este dispositivo"><CloudOff size={14} className="mr-1"/> Local</span>
                   )}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 uppercase">{user.role === 'admin' ? 'Administrador' : (user.role === 'subdirector' ? 'Subdirector' : 'Docente')}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin' ? 'bg-blue-600' : (user.role === 'subdirector' ? 'bg-purple-600' : 'bg-emerald-500')}`}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            <div className="animate-fade-in-up h-full">
               {renderPage()}
            </div>
        </main>
      </div>
    </div>
  );
}