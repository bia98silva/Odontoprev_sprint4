import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase.config';
import { Alert } from 'react-native';

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn(credentials: { email: string; password: string }): Promise<void>;
  signOut(): Promise<void>;
  signUp(userData: { username: string; email: string; password: string }): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'User' // Defina o papel padrão como 'User'
        };

        setUser(userData);
        
        // Armazene os dados do usuário localmente
        await AsyncStorage.setItem('@OdontoprevApp:user', JSON.stringify(userData));
      } else {
        setUser(null);
        await AsyncStorage.removeItem('@OdontoprevApp:user');
      }
      
      setLoading(false);
    });

    // Limpa a inscrição no desmonte
    return () => unsubscribe();
  }, []);

  async function signIn({ email, password }: { email: string; password: string }) {
    try {
      console.log('AuthContext: Tentando login com:', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'User'
        };

        setUser(userData);
        await AsyncStorage.setItem('@OdontoprevApp:user', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('AuthContext: Erro no login:', error);
      
      let errorMessage = 'Falha ao fazer login. Verifique suas credenciais.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desativada.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
          break;
      }
      
      Alert.alert('Erro', errorMessage);
      throw error;
    }
  }

  async function signUp({ username, email, password }: { username: string; email: string; password: string }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Atualiza o perfil do usuário para adicionar o nome de usuário
      await updateProfile(firebaseUser, {
        displayName: username
      });
      
      // Atualiza o usuário após a criação bem-sucedida
      const userData = {
        id: firebaseUser.uid,
        username: username,
        email: firebaseUser.email || '',
        role: 'User'
      };
      
      setUser(userData);
      await AsyncStorage.setItem('@OdontoprevApp:user', JSON.stringify(userData));

    } catch (error: any) {
      console.error('AuthContext: Erro no cadastro:', error);
      
      let errorMessage = 'Falha ao criar conta.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este e-mail já está em uso.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'A senha é muito fraca.';
          break;
      }
      
      Alert.alert('Erro', errorMessage);
      throw error;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem('@OdontoprevApp:user');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}