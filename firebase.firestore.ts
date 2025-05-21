import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { auth, db } from './firebase.config';

interface UserData {
  nome?: string;
  username?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  pontos?: number;
  ultimaConsulta?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConsultaData {
  id?: string;
  userId?: string;
  nomePaciente?: string;
  idDentista?: string;
  nomeDentista?: string;
  dataConsulta?: string;
  status?: string;
  createdAt?: Date;
}

interface AtividadeData {
  userId?: string;
  data?: string;
  escovouCafe?: boolean;
  escovouAlmoco?: boolean;
  escovouJantar?: boolean;
  marcouAvaliacao?: boolean;
  realizouLimpeza?: boolean;
  updatedAt?: Date;
}

export const UserService = {
  // Armazena informações adicionais do usuário no Firestore
  async saveUserData(userId: string, userData: UserData): Promise<boolean> {
    try {
      const userRef: DocumentReference<DocumentData> = doc(db, 'users', userId);
      await setDoc(userRef, userData, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      throw error;
    }
  },

  // Busca informações adicionais do usuário no Firestore
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const userRef: DocumentReference<DocumentData> = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserData;
      } else {
        console.log('Nenhum documento encontrado para este usuário');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  },

  // Atualiza informações do usuário no Firestore
  async updateUserData(userId: string, userData: Partial<UserData>): Promise<boolean> {
    try {
      const userRef: DocumentReference<DocumentData> = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  }
};

export const ConsultaService = {
  // Adiciona uma nova consulta no Firestore
  async addConsulta(consultaData: ConsultaData): Promise<string> {
    try {
      const consultas = collection(db, 'consultas');
      const docRef = doc(consultas);
      await setDoc(docRef, {
        id: docRef.id,
        ...consultaData,
        userId: auth.currentUser?.uid,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar consulta:', error);
      throw error;
    }
  }
};

export const AtividadeService = {
  // Salva a atividade diária do usuário no Firestore
  async saveAtividade(userId: string, atividade: Partial<AtividadeData>): Promise<boolean> {
    try {
      const hoje = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
      const atividadeRef: DocumentReference<DocumentData> = doc(db, 'atividades', `${userId}_${hoje}`);
      
      await setDoc(atividadeRef, {
        userId,
        data: hoje,
        ...atividade,
        updatedAt: new Date()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      throw error;
    }
  },

  // Busca as atividades do dia do usuário
  async getAtividadeDoDia(userId: string): Promise<AtividadeData | null> {
    try {
      const hoje = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
      const atividadeRef: DocumentReference<DocumentData> = doc(db, 'atividades', `${userId}_${hoje}`);
      const docSnap = await getDoc(atividadeRef);

      if (docSnap.exists()) {
        return docSnap.data() as AtividadeData;
      } else {
        // Se não existir documento para hoje, retorna o padrão
        return {
          escovouCafe: false,
          escovouAlmoco: false,
          escovouJantar: false,
          marcouAvaliacao: false,
          realizouLimpeza: false,
        };
      }
    } catch (error) {
      console.error('Erro ao buscar atividades do dia:', error);
      throw error;
    }
  }
};

export default db;