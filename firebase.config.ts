import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Interface para a configuração do Firebase
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Sua configuração do Firebase - substitua pelos seus próprios dados do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDcfpC8CMz76Yw7zdCrLqPlNymfLi84Pgk",
  authDomain: "odontoprevapp-e2090.firebaseapp.com",
  projectId: "odontoprevapp-e2090",
  storageBucket: "odontoprevapp-e2090.firebasestorage.app",
  messagingSenderId: "192019619978",
  appId: "1:192019619978:web:1e2624531e3fd884c30d73",
  measurementId: "G-Z85TECEVSX"
};
// Inicializa o Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Inicializa o Firebase Authentication e obtém uma referência para o serviço
const auth: Auth = getAuth(app);

// Inicializa o Firestore e obtém uma referência para o serviço
const db: Firestore = getFirestore(app);

export { app, auth, db };