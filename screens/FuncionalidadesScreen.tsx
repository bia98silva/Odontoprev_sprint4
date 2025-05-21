import React from 'react';
import { View, TouchableOpacity, ToastAndroid, StyleSheet, Text, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/FirebaseAuthContext';

type RootStackParamList = {
  Login: undefined;
  Agendamentos: undefined;
  BuscarClinicas: undefined;
  Alertas: undefined;
  PerfilPaciente: undefined;
};

type FuncionalidadesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const FuncionalidadesScreen = () => {
  const navigation = useNavigation<FuncionalidadesScreenNavigationProp>();
  const { signOut } = useAuth();

  const handleNavigate = (screen: keyof RootStackParamList) => {
    try {
      navigation.navigate(screen as never);
    } catch (error: any) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Erro ao abrir tela: ' + error.message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Erro', 'Erro ao abrir tela: ' + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      
  
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OdontoPrev</Text>
      </View>
      
      <View style={styles.menuGrid}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigate('Agendamentos')}
        >
          <Ionicons name="calendar" size={48} color="#0066CC" />
          <Text style={styles.menuText}>Agendamentos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigate('Alertas')}
        >
          <Ionicons name="notifications" size={48} color="#FF9500" />
          <Text style={styles.menuText}>Alertas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigate('PerfilPaciente')}
        >
          <Ionicons name="person" size={48} color="#4CD964" />
          <Text style={styles.menuText}>Meu Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigate('BuscarClinicas')}
        >
          <Ionicons name="search" size={48} color="#5856D6" />
          <Text style={styles.menuText}>Buscar Clínicas</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFF" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  menuItem: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FuncionalidadesScreen;