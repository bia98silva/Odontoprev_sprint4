import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  LogBox,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { UserService } from '../firebase.firestore';
import { doc, collection, addDoc, getDocs, query, where, deleteDoc, updateDoc, getFirestore } from 'firebase/firestore';

const MOCK_DENTISTAS = [
  {
    id: 1,
    nome: 'Dra. Ana Souza',
    cro: 'CRO-SP 12345',
    especialidade: 'Ortodontia',
    telefone: '(11) 98765-4321',
  },
  {
    id: 2,
    nome: 'Dr. Carlos Pereira',
    cro: 'CRO-SP 54321',
    especialidade: 'Endodontia',
    telefone: '(11) 91234-5678',
  },
  {
    id: 3,
    nome: 'Dra. Maria Oliveira',
    cro: 'CRO-SP 67890',
    especialidade: 'Periodontia',
    telefone: '(11) 99876-5432',
  },
];

interface Consulta {
  id: string;
  dataConsulta: string;
  id_Paciente: string;
  id_Dentista: number;
  status: string;
  nomePaciente?: string;
  nomeDentista?: string;
}

interface Dentista {
  id: number;
  nome: string;
  cro: string;
  especialidade: string;
  telefone: string;
}

const AgendamentosScreen = () => {
  const { user } = useAuth();
  const [nomePaciente, setNomePaciente] = useState<string | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [dentistas] = useState<Dentista[]>(MOCK_DENTISTAS);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDentistaId, setSelectedDentistaId] = useState<number | null>(null);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [consultaParaEditar, setConsultaParaEditar] = useState<Consulta | null>(null);
  const navigation = useNavigation();
  const db = getFirestore();

  // Ignorar avisos amarelos no console durante o desenvolvimento
  useEffect(() => {
    LogBox.ignoreLogs(['Warning: ...']); // Ignora avisos específicos
    LogBox.ignoreAllLogs(); // Ignora todos os avisos - use apenas para desenvolvimento
  }, []);

  // Buscar consultas do Firebase quando o componente carregar
  useEffect(() => {
    fetchConsultas();
    fetchUserData();
  }, [user]);

  const fetchConsultas = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const consultasRef = collection(db, 'consultas');
      const q = query(consultasRef, where('id_Paciente', '==', user.id));
      const querySnapshot = await getDocs(q);
      
      const consultasList: Consulta[] = [];
      const marcacoes: any = {};
      
      querySnapshot.forEach((doc) => {
        const consulta = { id: doc.id, ...doc.data() } as Consulta;
        consultasList.push(consulta);
        
        // Marcar as datas no calendário
        const dataConsulta = consulta.dataConsulta.split('T')[0];
        marcacoes[dataConsulta] = {
          selected: true,
          marked: true,
          dotColor: 'blue',
        };
      });
      
      setConsultas(consultasList);
      setMarkedDates(marcacoes);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas consultas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (user?.id) {
      try {
        const dados = await UserService.getUserData(user.id);
        if (dados?.nome) {
          setNomePaciente(dados.nome);
        }
      } catch (err) {
        console.error('Erro ao buscar nome do paciente:', err);
      }
    }
  };

  // Teste simples para remover consulta apenas da interface
  const removerConsulta = (id) => {
    console.log(`Tentando remover consulta ${id}`);
    
    // Usar callback para garantir o valor mais recente
    setConsultas(prevConsultas => {
      console.log('Consultas antes:', prevConsultas.map(c => c.id));
      const novasConsultas = prevConsultas.filter(c => c.id !== id);
      console.log('Consultas depois:', novasConsultas.map(c => c.id));
      return novasConsultas;
    });
  };

  // Função para iniciar a edição de uma consulta
  const iniciarEdicao = (consulta: Consulta) => {
    setConsultaParaEditar(consulta);
    setSelectedDate(consulta.dataConsulta.split('T')[0]);
    setSelectedDentistaId(consulta.id_Dentista);
    setEditModalVisible(true);
  };

  // Função para salvar as edições da consulta
  const salvarEdicao = async () => {
    if (!selectedDate || !selectedDentistaId || !consultaParaEditar) {
      Alert.alert('Atenção', 'Por favor, selecione uma data e um dentista');
      return;
    }

    setLoading(true);
    try {
      const dentista = dentistas.find((d) => d.id === selectedDentistaId);
      
      // Recuperar a consulta antiga para remover do calendário
      const consultaAntiga = consultas.find(c => c.id === consultaParaEditar.id);
      const dataConsultaAntiga = consultaAntiga?.dataConsulta.split('T')[0];
      
      // Atualizar documento no Firestore
      const consultaRef = doc(db, 'consultas', consultaParaEditar.id);
      const consultaAtualizada = {
        dataConsulta: `${selectedDate}T14:00:00`,
        id_Dentista: selectedDentistaId,
        nomeDentista: dentista ? dentista.nome : `Dentista ID: ${selectedDentistaId}`,
        dataAtualizacao: new Date().toISOString(),
      };
      
      await updateDoc(consultaRef, consultaAtualizada);
      
      // Atualizar o estado local
      const consultasAtualizadas = consultas.map(c => {
        if (c.id === consultaParaEditar.id) {
          return { 
            ...c, 
            dataConsulta: `${selectedDate}T14:00:00`,
            id_Dentista: selectedDentistaId,
            nomeDentista: dentista ? dentista.nome : `Dentista ID: ${selectedDentistaId}`
          };
        }
        return c;
      });
      
      setConsultas(consultasAtualizadas);
      
      // Atualizar o calendário
      const novasMarcacoes = { ...markedDates };
      
      // Remover a marcação antiga se necessário
      if (dataConsultaAntiga && dataConsultaAntiga !== selectedDate) {
        // Verificar se não há outras consultas na mesma data antes de remover a marcação
        const outrasConsultasNaMesmaData = consultas.some(
          c => c.id !== consultaParaEditar.id && c.dataConsulta.split('T')[0] === dataConsultaAntiga
        );
        
        if (!outrasConsultasNaMesmaData) {
          delete novasMarcacoes[dataConsultaAntiga];
        }
      }
      
      // Adicionar nova marcação
      novasMarcacoes[selectedDate] = {
        selected: true,
        marked: true,
        dotColor: 'blue',
      };
      
      setMarkedDates(novasMarcacoes);
      setEditModalVisible(false);
      setConsultaParaEditar(null);
      
      Alert.alert('Sucesso', 'Consulta atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  const agendarConsulta = async () => {
    if (!selectedDate || !selectedDentistaId) {
      Alert.alert('Atenção', 'Por favor, selecione uma data e um dentista');
      return;
    }
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }
    setLoading(true);
    try {
      const dentista = dentistas.find((d) => d.id === selectedDentistaId);
      
      // Criar novo documento no Firestore
      const consultasRef = collection(db, 'consultas');
      const novaConsultaData = {
        dataConsulta: `${selectedDate}T14:00:00`,
        id_Paciente: user.id,
        id_Dentista: selectedDentistaId,
        status: 'Agendada',
        nomePaciente: nomePaciente || 'Paciente',
        nomeDentista: dentista ? dentista.nome : `Dentista ID: ${selectedDentistaId}`,
        dataCriacao: new Date().toISOString(),
      };
      
      const docRef = await addDoc(consultasRef, novaConsultaData);
      
      // Adicionar ao estado local com o ID gerado pelo Firestore
      const novaConsulta: Consulta = {
        id: docRef.id,
        ...novaConsultaData,
      };
      
      setConsultas([...consultas, novaConsulta]);
      // Atualizar o calendário
      const novasMarcacoes = { ...markedDates };
      novasMarcacoes[selectedDate] = {
        selected: true,
        marked: true,
        dotColor: 'blue',
      };
      setMarkedDates(novasMarcacoes);
      setModalVisible(false);
      Alert.alert('Sucesso', 'Consulta agendada com sucesso');
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      Alert.alert('Erro', 'Não foi possível agendar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Funcionalidades')}>
            <Ionicons name="arrow-back" size={24} color="#0066CC" />
          </TouchableOpacity>
          <Text style={styles.title}>  Meus Agendamentos</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color="#0066CC" />
          <Text style={styles.addButtonText}>Nova Consulta</Text>
        </TouchableOpacity>
      </View>
      {consultas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você não possui consultas agendadas</Text>
        </View>
      ) : (
        <FlatList
          data={consultas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Consulta com {item.nomeDentista}</Text>
                <Text
                  style={[
                    styles.statusTag,
                    { backgroundColor: item.status === 'Agendada' ? '#4CAF50' : '#FFC107' },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={18} color="#555" />
                  <Text style={styles.infoText}>
                    {new Date(item.dataConsulta).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={18} color="#555" />
                  <Text style={styles.infoText}>
                    {new Date(item.dataConsulta).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={18} color="#555" />
                  <Text style={styles.infoText}>Paciente: {item.nomePaciente}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => removerConsulta(item.id)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => iniciarEdicao(item)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      
      {/* Botão de Voltar na parte inferior */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Funcionalidades')}
        >
          <Ionicons name="arrow-back" size={20} color="#0066CC" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para agendamento */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agendar Nova Consulta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Selecione uma Data:</Text>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                ...markedDates,
                [selectedDate]: { selected: true, selectedColor: '#0066CC' },
              }}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                todayTextColor: '#0066CC',
                selectedDayBackgroundColor: '#0066CC',
                arrowColor: '#0066CC',
              }}
            />
            <Text style={styles.label}>Selecione um Dentista:</Text>
            <FlatList
              data={dentistas}
              keyExtractor={(item) => item.id.toString()}
              style={styles.dentistasList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dentistaItem,
                    selectedDentistaId === item.id && styles.selectedDentistaItem,
                  ]}
                  onPress={() => setSelectedDentistaId(item.id)}
                >
                  <Text style={styles.dentistaNome}>{item.nome}</Text>
                  <Text style={styles.dentistaInfo}>
                    {item.especialidade} - {item.cro}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={agendarConsulta}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para edição de consulta */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Consulta</Text>
              <TouchableOpacity onPress={() => {
                setEditModalVisible(false);
                setConsultaParaEditar(null);
              }}>
                <Ionicons name="close-circle" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Alterar Data:</Text>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                ...markedDates,
                [selectedDate]: { selected: true, selectedColor: '#0066CC' },
              }}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                todayTextColor: '#0066CC',
                selectedDayBackgroundColor: '#0066CC',
                arrowColor: '#0066CC',
              }}
            />
            <Text style={styles.label}>Alterar Dentista:</Text>
            <FlatList
              data={dentistas}
              keyExtractor={(item) => item.id.toString()}
              style={styles.dentistasList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dentistaItem,
                    selectedDentistaId === item.id && styles.selectedDentistaItem,
                  ]}
                  onPress={() => setSelectedDentistaId(item.id)}
                >
                  <Text style={styles.dentistaNome}>{item.nome}</Text>
                  <Text style={styles.dentistaInfo}>
                    {item.especialidade} - {item.cro}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false);
                  setConsultaParaEditar(null);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={salvarEdicao}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40, 
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    color: '#0066CC',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  cardBody: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  detailsButton: {
    backgroundColor: '#0066CC',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  dentistasList: {
    maxHeight: 150,
    paddingHorizontal: 16,
  },
  dentistaItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 4,
  },
  selectedDentistaItem: {
    borderColor: '#0066CC',
    backgroundColor: '#e6f2ff',
  },
  dentistaNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dentistaInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#0066CC',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 16,
  },
});

export default AgendamentosScreen;