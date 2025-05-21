import React, { useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";

type AlertasScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Dados de exemplo para substituir as chamadas de API
const MOCK_ALERTAS = [
  {
    id: 1,
    titulo: "Lembrete de Consulta",
    descricao: "Você tem uma consulta agendada para amanhã às 14:00 com a Dra. Ana Souza.",
    data: new Date(2025, 4, 24, 10, 0).toISOString(),
    lido: false
  },
  {
    id: 2,
    titulo: "Promoção de Limpeza",
    descricao: "Aproveite nossa promoção de limpeza dental com 20% de desconto até o final do mês!",
    data: new Date(2025, 4, 20, 8, 30).toISOString(),
    lido: true
  },
  {
    id: 3,
    titulo: "Resultado de Exame",
    descricao: "Seus exames de radiografia estão prontos. Você pode acessá-los pelo portal do paciente.",
    data: new Date(2025, 4, 18, 16, 45).toISOString(),
    lido: false
  }
];

interface Alerta {
  id: number;
  titulo: string;
  descricao?: string;
  data: string;
  lido: boolean;
}

const AlertasScreen = () => {
  const [alertas, setAlertas] = useState<Alerta[]>(MOCK_ALERTAS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation<AlertasScreenNavigationProp>();

  const carregarAlertas = () => {
    // Simular carregamento
    setLoading(true);
    
    setTimeout(() => {
      setAlertas(MOCK_ALERTAS);
      setLoading(false);
      setRefreshing(false);
    }, 700);
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarAlertas();
  };

  const marcarComoLido = (id: number) => {
    // Atualizar o estado local sem chamada de API
    setAlertas(alertas.map(alerta => 
      alerta.id === id ? { ...alerta, lido: true } : alerta
    ));
  };

  const marcarTodosComoLidos = () => {
    // Atualizar o estado local sem chamada de API
    setAlertas(alertas.map(alerta => ({ ...alerta, lido: true })));
    Alert.alert("Sucesso", "Todos os alertas foram marcados como lidos.");
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Carregando alertas...</Text>
      </View>
    );
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' às ' + 
           data.getHours().toString().padStart(2, '0') + ':' + 
           data.getMinutes().toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Alertas</Text>

        {alertas.length > 0 && (
          <TouchableOpacity
            style={styles.marcarTodosButton}
            onPress={marcarTodosComoLidos}
          >
            <Text style={styles.marcarTodosButtonText}>Marcar todos como lidos</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={alertas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.alertItem,
                !item.lido && styles.alertItemNaoLido
              ]}
              onPress={() => marcarComoLido(item.id)}
            >
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitulo}>{item.titulo}</Text>
                <Text style={styles.alertData}>
                  {formatarData(item.data)}
                </Text>
              </View>
              
              {item.descricao && (
                <Text style={styles.alertDescricao}>{item.descricao}</Text>
              )}
              
              {!item.lido && (
                <View style={styles.naoLidoIndicator} />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Você não possui alertas no momento.
            </Text>
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366", 
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 10,
  },
  innerContainer: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    width: '100%',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    marginTop: 20,
  },
  marcarTodosButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignSelf: 'flex-end',
  },
  marcarTodosButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  alertItem: {
    backgroundColor: "#FFF",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    width: '100%',
    elevation: 3,
    position: 'relative',
  },
  alertItemNaoLido: {
    backgroundColor: "#e6f7ff",
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  alertTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  alertData: {
    fontSize: 12,
    color: "#666",
  },
  alertDescricao: {
    fontSize: 14,
    color: "#333",
  },
  naoLidoIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  emptyText: {
    color: "#FFF",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  flatListContainer: {
    flexGrow: 1, 
    width: '100%',
    paddingBottom: 20, 
  },
});

export default AlertasScreen;