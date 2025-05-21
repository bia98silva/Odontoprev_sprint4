import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

interface Clinica {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  telefone: string;
  avaliacao: number;
  convenios: string[];
  especialidades: string[];
}

// Dados mockados para caso não haja conexão com Firebase
const MOCK_CLINICAS = [
  {
    id: '1',
    nome: 'Clínica Odontológica Sorriso Perfeito',
    endereco: 'Av. Paulista, 1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    telefone: '(11) 3456-7890',
    avaliacao: 4.8,
    convenios: ['Amil', 'Bradesco Saúde', 'SulAmérica'],
    especialidades: ['Ortodontia', 'Implantodontia', 'Clínica Geral'],
  },
  {
    id: '2',
    nome: 'Centro Odontológico Saúde Bucal',
    endereco: 'Rua Augusta, 1500',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    telefone: '(11) 3333-4444',
    avaliacao: 4.5,
    convenios: ['Unimed', 'Porto Seguro', 'Bradesco Saúde'],
    especialidades: ['Endodontia', 'Odontopediatria', 'Clínica Geral'],
  },
  {
    id: '3',
    nome: 'Odonto Excellence',
    endereco: 'Av. Brigadeiro Faria Lima, 2500',
    bairro: 'Itaim Bibi',
    cidade: 'São Paulo',
    telefone: '(11) 9876-5432',
    avaliacao: 4.9,
    convenios: ['Amil', 'Unimed', 'SulAmérica', 'Allianz'],
    especialidades: ['Implantodontia', 'Ortodontia', 'Estética Dental'],
  },
  {
    id: '4',
    nome: 'Clínica Dental Família',
    endereco: 'Rua Vergueiro, 1200',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    telefone: '(11) 2222-3333',
    avaliacao: 4.3,
    convenios: ['Bradesco Saúde', 'Porto Seguro'],
    especialidades: ['Clínica Geral', 'Odontopediatria', 'Periodontia'],
  },
  {
    id: '5',
    nome: 'Instituto Odontológico Avançado',
    endereco: 'Av. Rebouças, 3200',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    telefone: '(11) 4567-8901',
    avaliacao: 4.7,
    convenios: ['Amil', 'SulAmérica', 'Allianz'],
    especialidades: ['Implantodontia', 'Ortodontia', 'Cirurgia Bucal'],
  },
];

const BuscarClinicasScreen = () => {
  const { user } = useAuth();
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [filteredClinicas, setFilteredClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [usarMock, setUsarMock] = useState(false);

  const navigation = useNavigation();
  const db = getFirestore();

  useEffect(() => {
    fetchClinicas();
  }, []);

  // Carregar clínicas do Firebase ou usar dados mockados
  const fetchClinicas = async () => {
    setLoading(true);
    try {
      // Tenta buscar do Firebase
      const clinicasRef = collection(db, 'clinicas');
      const q = query(clinicasRef, orderBy('avaliacao', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const clinicasList: Clinica[] = [];
        querySnapshot.forEach((doc) => {
          clinicasList.push({ id: doc.id, ...doc.data() } as Clinica);
        });
        setClinicas(clinicasList);
        setFilteredClinicas(clinicasList);
        setUsarMock(false);
      } else {
        // Se não encontrar documentos, usa os dados mockados
        setClinicas(MOCK_CLINICAS);
        setFilteredClinicas(MOCK_CLINICAS);
        setUsarMock(true);
        console.log('Usando dados mockados - nenhuma clínica encontrada no Firestore');
      }
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      // Em caso de erro, usa os dados mockados
      setClinicas(MOCK_CLINICAS);
      setFilteredClinicas(MOCK_CLINICAS);
      setUsarMock(true);
      console.log('Usando dados mockados - erro na conexão com Firestore');
    } finally {
      setLoading(false);
    }
  };

  // Realizar busca baseada no texto
  useEffect(() => {
    if (searchText) {
      const filtered = clinicas.filter((clinica) => {
        return clinica.nome.toLowerCase().includes(searchText.toLowerCase()) ||
               clinica.bairro.toLowerCase().includes(searchText.toLowerCase()) ||
               clinica.cidade.toLowerCase().includes(searchText.toLowerCase());
      });
      
      setFilteredClinicas(filtered);
    } else {
      setFilteredClinicas(clinicas);
    }
  }, [searchText, clinicas]);

  const renderEstrelas = (avaliacao: number) => {
    const estrelas = [];
    const totalEstrelas = 5;
    
    for (let i = 1; i <= totalEstrelas; i++) {
      if (i <= avaliacao) {
        estrelas.push(
          <Ionicons key={i} name="star" size={16} color="#FFD700" />
        );
      } else if (i - 0.5 <= avaliacao) {
        estrelas.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" />
        );
      } else {
        estrelas.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFD700" />
        );
      }
    }
    
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {estrelas}
        <Text style={styles.avaliacaoText}>{avaliacao.toFixed(1)}</Text>
      </View>
    );
  };

  const agendarConsulta = (clinica: Clinica) => {
    Alert.alert(
      'Agendar Consulta',
      `Deseja agendar uma consulta na clínica ${clinica.nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Ir para Agendamento',
          onPress: () => {
            navigation.navigate('Agendamentos');
          },
        },
      ]
    );
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
          <Text style={styles.title}>  Buscar Clínicas</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, bairro ou cidade..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {filteredClinicas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma clínica encontrada</Text>
          <Text style={styles.emptySubtext}>Tente diferentes termos de busca</Text>
        </View>
      ) : (
        <FlatList
          data={filteredClinicas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.clinicaCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.clinicaNome}>{item.nome}</Text>
                {renderEstrelas(item.avaliacao)}
              </View>
              
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#555" />
                  <Text style={styles.infoText}>{item.endereco}, {item.bairro}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color="#555" />
                  <Text style={styles.infoText}>{item.telefone}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="medical-outline" size={16} color="#555" />
                  <Text style={styles.infoText}>
                    {item.especialidades.slice(0, 3).join(', ')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.button, styles.detailsButton]}
                  onPress={() => {
                    Alert.alert('Detalhes', 'Mostrando detalhes da clínica');
                  }}
                >
                  <Text style={styles.buttonText}>Ver Detalhes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => agendarConsulta(item)}
                >
                  <Text style={styles.buttonText}>Agendar Consulta</Text>
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
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  clinicaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clinicaNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  avaliacaoText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
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
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
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

export default BuscarClinicasScreen;