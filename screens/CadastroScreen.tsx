import React, { useState } from 'react';
import { 
  View, TextInput, Text, TouchableOpacity, ActivityIndicator, Alert, 
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { UserService } from '../firebase.firestore';
import { getAuth } from 'firebase/auth'; 


type CadastroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cadastro'>;

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
    setFormData(prev => ({ ...prev, [field]: value }));
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


      await signUp({
        username: formData.username,
        email: formData.email,
        password: formData.senha
      });

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser?.uid) {
        await UserService.saveUserData(currentUser.uid, {
          nome: formData.nome,
          username: formData.username,
          email: formData.email,
          cpf: formData.cpf,
          telefone: formData.telefone,
          createdAt: new Date(),
          pontos: 0
        });

        setCadastroSucesso(true);
        setMensagemSucesso('Cadastro realizado com sucesso! Você já pode fazer login com suas credenciais.');

        setFormData({
          nome: '',
          username: '',
          email: '',
          senha: '',
          confirmarSenha: '',
          telefone: '',
          cpf: '',
        });
      } else {
        Alert.alert('Erro', 'Não foi possível obter os dados do usuário após o cadastro.');
      }

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo2.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>Cadastro</Text>

        {cadastroSucesso ? (
          <View style={styles.mensagemSucessoContainer}>
            <Text style={styles.mensagemSucessoTexto}>{mensagemSucesso}</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Ir para Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            {/* Campos do formulário */}
            {/* [nome, username, email, cpf, telefone, senha, confirmarSenha] */}
            {[
              { key: 'nome', label: 'Nome', placeholder: 'Digite seu nome completo' },
              { key: 'username', label: 'Nome de Usuário', placeholder: 'Digite seu nome de usuário' },
              { key: 'email', label: 'Email', placeholder: 'Digite seu email' },
              { key: 'cpf', label: 'CPF', placeholder: 'Digite seu CPF' },
              { key: 'telefone', label: 'Telefone', placeholder: '(00) 00000-0000' },
              { key: 'senha', label: 'Senha', placeholder: 'Digite sua senha', secureTextEntry: true },
              { key: 'confirmarSenha', label: 'Confirmar Senha', placeholder: 'Confirme sua senha', secureTextEntry: true },
            ].map(({ key, label, placeholder, secureTextEntry }) => (
              <React.Fragment key={key}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor="#999"
                  value={(formData as any)[key]}
                  onChangeText={(text) => handleChange(key as keyof FormData, text)}
                  secureTextEntry={secureTextEntry}
                  keyboardType={key === 'cpf' || key === 'telefone' ? 'numeric' : 'default'}
                  autoCapitalize={key === 'email' || key === 'username' ? 'none' : 'sentences'}
                />
              </React.Fragment>
            ))}

            <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
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
  },
  input: {
    backgroundColor: '#FFF',
    color: '#000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#003366',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#FFF',
    textDecorationLine: 'underline',
  },
});

export default CadastroScreen;
