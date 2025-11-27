import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { SchoolData } from './types';

let db: Firestore | null = null;

// Intentar inicializar si hay config guardada
const savedConfig = localStorage.getItem('school_firebase_config');
if (savedConfig) {
    try {
        const firebaseConfig = JSON.parse(savedConfig);
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } catch (e) {
        console.error("Error inicializando Firebase:", e);
    }
}

export const configureFirebase = (config: any) => {
    try {
        localStorage.setItem('school_firebase_config', JSON.stringify(config));
        const app = initializeApp(config);
        db = getFirestore(app);
        return true;
    } catch (e) {
        console.error("Configuración inválida", e);
        return false;
    }
};

export const getDb = () => db;

export const disconnectFirebase = () => {
    localStorage.removeItem('school_firebase_config');
    db = null;
    window.location.reload();
};

export const saveToFirebase = async (data: SchoolData) => {
    if (!db) return;
    try {
        // Guardamos todo en una colección 'schools', documento 'default'
        // En un sistema multi-escuela usaríamos un ID único
        await setDoc(doc(db, "schools", "default"), { ...data, lastUpdated: new Date().toISOString() });
    } catch (e) {
        console.error("Error guardando en Firebase:", e);
        throw e;
    }
};

// Suscripción en tiempo real
export const subscribeToData = (callback: (data: SchoolData) => void) => {
    if (!db) return () => {};
    
    const unsub = onSnapshot(doc(db, "schools", "default"), (doc) => {
        if (doc.exists()) {
            callback(doc.data() as SchoolData);
        }
    });
    return unsub;
};
