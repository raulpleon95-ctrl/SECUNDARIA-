import React, { useState } from 'react';
import { Cloud, Save, CheckCircle, WifiOff, Terminal, Flame } from 'lucide-react';
import { configureFirebase, getDb, disconnectFirebase } from '../firebaseClient';

const ConfigView: React.FC = () => {
  const [configJson, setConfigJson] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const isConnected = !!getDb();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Limpiar input por si el usuario pegó basura alrededor
        const cleanJson = configJson.replace(/const firebaseConfig = /g, '').replace(/;/g, '');
        const config = JSON.parse(cleanJson);
        
        if (configureFirebase(config)) {
            setStatus('success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setStatus('error');
        }
    } catch (e) {
        setStatus('error');
    }
  };

  const handleDisconnect = () => {
    if (confirm('¿Desconectar base de datos? Volverás al modo local.')) {
        disconnectFirebase();
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Conexión a Base de Datos (Firebase)</h2>
        <p className="text-slate-500">Configura la conexión a Google Firebase para sincronización en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Instrucciones */}
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center text-orange-600">
                     <Flame size={20} className="mr-2" />
                     Pasos para Configurar
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600">
                    <li>Entra a <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 underline">console.firebase.google.com</a>.</li>
                    <li>Crea un nuevo proyecto.</li>
                    <li>Ve a <strong>Firestore Database</strong> y crea una base de datos (iniciar en modo de prueba).</li>
                    <li>Ve a <strong>Configuración del Proyecto</strong> (engranaje).</li>
                    <li>En "Tus apps", selecciona el icono web (<code>&lt;/&gt;</code>) y registra la app.</li>
                    <li>Copia el objeto <code>firebaseConfig</code> que aparece.</li>
                </ol>
            </div>

            {isConnected && (
                 <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle size={40} className="text-green-600 mx-auto mb-2" />
                    <h4 className="text-xl font-bold text-green-800 mb-2">Sistema Conectado</h4>
                    <p className="text-green-700 mb-4 text-sm">Los datos se están guardando en la nube.</p>
                    <button 
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold flex items-center justify-center mx-auto"
                    >
                        <WifiOff size={16} className="mr-2"/> Desconectar
                    </button>
                </div>
            )}
        </div>

        {/* Formulario */}
        {!isConnected && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <form onSubmit={handleSave} className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Pega aquí tu configuración (JSON)
                    </label>
                    <textarea 
                        value={configJson}
                        onChange={e => setConfigJson(e.target.value)}
                        placeholder={'{ "apiKey": "...", "authDomain": "...", ... }'}
                        className="w-full h-64 p-4 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50"
                    />
                    
                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">
                            Error en el formato. Asegúrate de pegar solo el objeto JSON (entre llaves).
                        </div>
                    )}
                    
                    <button 
                        type="submit"
                        className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Cloud size={20} /> Conectar Escuela
                    </button>
                </form>
            </div>
        )}

      </div>
    </div>
  );
};

export default ConfigView;