import React, { useState, useEffect } from "react";
import { 
  View, Text, Alert, StyleSheet, TouchableOpacity, 
  ScrollView, ActivityIndicator 
} from "react-native";
import { Checkbox } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import { useAuth } from "../contexts/FirebaseAuthContext";
import { UserService, AtividadeService } from "../firebase.firestore";

type PerfilPacienteScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Paciente {
  id: string;
  nome: string;
  pontos: number;
  ultimaConsulta?: string;
  telefone?: string;
}

interface AtividadesState {
  escovouCafe: boolean;
  escovouAlmoco: boolean;
  escovouJantar: boolean;
  marcouAvaliacao: boolean;
  realizouLimpeza: boolean;
}

const PerfilPacienteScreen = () => {
  const navigation = useNavigation<PerfilPacienteScreenNavigationProp>();
  const { user } = useAuth();

  const [paciente, setPaciente] = useState<Paciente>({
    id: '',
    nome: '',
    pontos: 0,
    telefone: ''
  });

  const [atividades, setAtividades] = useState<AtividadesState>({
    escovouCafe: false,
    escovouAlmoco: false,
    escovouJantar: false,
    marcouAvaliacao: false,
    realizouLimpeza: false,
  });

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const userData = await UserService.getUserData(user.id);
        if (userData) {
          setPaciente({
            id: user.id,
            nome: userData.nome || user.username,
            pontos: userData.pontos || 0,
            ultimaConsulta: userData.ultimaConsulta,
            telefone: userData.telefone,
          });
        }

        const atividadesDia = await AtividadeService.getAtividadeDoDia(user.id);
        if (atividadesDia) {
          setAtividades({
            escovouCafe: atividadesDia.escovouCafe || false,
            escovouAlmoco: atividadesDia.escovouAlmoco || false,
            escovouJantar: atividadesDia.escovouJantar || false,
            marcouAvaliacao: atividadesDia.marcouAvaliacao || false,
            realizouLimpeza: atividadesDia.realizouLimpeza || false,
          });
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        Alert.alert("Erro", "Não foi possível carregar seus dados.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [user]);

  const handleCheck = async (campo: keyof AtividadesState) => {
    if (!user || atividades[campo]) return;

    try {
      setSalvando(true);

      const pontosAtividade = campo === "realizouLimpeza" ? 3 :
                              campo === "marcouAvaliacao" ? 2 : 1;

      await AtividadeService.saveAtividade(user.id, { [campo]: true });

      const novosPontos = paciente.pontos + pontosAtividade;

      await UserService.updateUserData(user.id, { pontos: novosPontos });

      setPaciente(prev => ({ ...prev, pontos: novosPontos }));
      setAtividades(prev => ({ ...prev, [campo]: true }));

    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      Alert.alert("Erro", "Não foi possível salvar a atividade.");
    } finally {
      setSalvando(false);
    }
  };

  const formatarData = (data?: string) => {
    if (!data) return "Não informada";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Olá, {paciente.nome}!</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Pontos: <Text style={styles.value}>{paciente.pontos}</Text></Text>
          <Text style={styles.label}>Última consulta: <Text style={styles.value}>{formatarData(paciente.ultimaConsulta)}</Text></Text>
          <Text style={styles.label}>Telefone: <Text style={styles.value}>{paciente.telefone || "Não informado"}</Text></Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Atividades do Dia</Text>
          <Text style={styles.instructions}>Ganhe pontos marcando as atividades concluídas:</Text>

          {Object.entries(atividades).map(([chave, valor]) => (
            <Checkbox.Item
              key={chave}
              label={
                chave === "escovouCafe" ? "Escovou após o café" :
                chave === "escovouAlmoco" ? "Escovou após o almoço" :
                chave === "escovouJantar" ? "Escovou após o jantar" :
                chave === "marcouAvaliacao" ? "Marcou uma avaliação" :
                "Realizou limpeza dental"
              }
              status={valor ? "checked" : "unchecked"}
              onPress={() => handleCheck(chave as keyof AtividadesState)}
              disabled={valor || salvando}
              labelStyle={styles.checkboxLabel}
            />
          ))}

          {Object.values(atividades).every(val => val) && (
            <Text style={styles.instructions}>Parabéns! Você completou todas as atividades do dia!</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#003366",
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#003366",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  backArrow: {
    color: "#FFF",
    fontSize: 28,
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  value: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 10,
  },
  instructions: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#333",
  },
});

export default PerfilPacienteScreen;
