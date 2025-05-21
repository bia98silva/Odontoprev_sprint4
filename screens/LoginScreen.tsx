import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useAuth } from '../contexts/FirebaseAuthContext';

// Tipagem para navegação
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const validarFormulario = (): boolean => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, informe um email válido.');
      return false;
    }

    return true;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      console.log('Tentando login com email:', email);
      
      await signIn({ email, password: senha });
      
      // Navega para a tela principal após login bem-sucedido
      navigation.reset({
        index: 0,
        routes: [{ name: 'Funcionalidades' }]
      });
    } catch (error) {
      console.error('Erro no login:', error);
      // As mensagens de erro já são exibidas no contexto de autenticação
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo2.png')} style={styles.logo} />
      </View>

      <Text style={styles.title}>Login</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 10,
    alignSelf: 'center',
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
  formContainer: {
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

export default LoginScreen;