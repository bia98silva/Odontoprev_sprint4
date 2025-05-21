import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { UserService } from '../firebase.firestore';

// Tipagem para navegação
type CadastroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cadastro'>;

// Interface para o formulário
interface FormData {
  nome: string;
  username: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  cpf: string;
}

const CadastroScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    username: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: '',
  });
  const [loading, setLoading] = useState(false);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  
  const { signUp } = useAuth();
  const navigation = useNavigation<CadastroScreenNavigationProp>();

  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const validarFormulario = (): boolean => {
    if (!formData.nome || !formData.username || !formData.email || 
        !formData.senha || !formData.confirmarSenha || !formData.cpf) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erro', 'Por favor, informe um email válido.');
      return false;
    }

    // Validação básica de CPF
    const cpfLimpo = formData.cpf.replace(/[^\d]/g, '');
    if (cpfLimpo.length !== 11) {
      Alert.alert('Erro', 'Por favor, informe um CPF válido com 11 dígitos.');
      return false;
    }

    return true;
  };

  const handleCadastro = async (): Promise<void> => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      console.log('CadastroScreen: Iniciando cadastro com dados:', { 
        nome: formData.nome, 
        email: formData.email
      });

      // Registra o usuário no Firebase Authentication
      const userCredential = await signUp({
        username: formData.username,
        email: formData.email,
        password: formData.senha
      });

      // Salvando dados adicionais no Firestore
      if (userCredential && userCredential.user) {
        const userId = userCredential.user.uid;
        
        await UserService.saveUserData(userId, {
          nome: formData.nome,
          username: formData.username,
          email: formData.email,
          cpf: formData.cpf,
          telefone: formData.telefone,
          createdAt: new Date(),
          pontos: 0 // Inicializa os pontos do paciente
        });
      }

      // Em vez de usar Alert, vamos definir o estado para mostrar a mensagem na interface
      setCadastroSucesso(true);
      setMensagemSucesso('Cadastro realizado com sucesso! Você já pode fazer login com suas credenciais.');
      setLoading(false);
      
      // Limpar o formulário após o cadastro
      setFormData({
        nome: '',
        username: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        telefone: '',
        cpf: '',
      });
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      let errorMessage = 'Falha ao criar conta.';
      
      if (error.code) {
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
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo2.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>Cadastro</Text>
        
        {cadastroSucesso && (
          <View style={styles.mensagemSucessoContainer}>
            <Text style={styles.mensagemSucessoTexto}>{mensagemSucesso}</Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Ir para Login</Text>
            </TouchableOpacity>
          </View>
        )}

        {!cadastroSucesso && (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#999"
              value={formData.nome}
              onChangeText={(text) => handleChange('nome', text)}
            />

            <Text style={styles.label}>Nome de Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome de usuário"
              placeholderTextColor="#999"
              autoCapitalize="none"
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />

            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu CPF"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.cpf}
              onChangeText={(text) => handleChange('cpf', text)}
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={formData.telefone}
              onChangeText={(text) => handleChange('telefone', text)}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.senha}
              onChangeText={(text) => handleChange('senha', text)}
            />

            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.confirmarSenha}
              onChangeText={(text) => handleChange('confirmarSenha', text)}
            />

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleCadastro}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 10,
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  mensagemSucessoContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 150, 0, 0.2)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  mensagemSucessoTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#FFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#003366',
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#FFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});

export default CadastroScreen;