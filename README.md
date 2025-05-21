# 🦷 OdontoPrev - Aplicativo de Gerenciamento Odontológico

## 📱 Sobre o projeto

OdontoPrev é um aplicativo móvel desenvolvido para facilitar o gerenciamento de consultas odontológicas, melhorar a comunicação entre pacientes e clínicas, e incentivar bons hábitos de higiene bucal através de um sistema de gamificação.

> 📸 **[Adicionar imagem ilustrativa do app aqui]**

---

## ✨ Funcionalidades

- 🔐 **Autenticação de usuários**: Sistema completo de login e cadastro  
- 📅 **Agendamento de consultas**: Agende consultas com diferentes profissionais  
- 🔔 **Alertas e notificações**: Receba lembretes de consultas e informações importantes  
- 🏥 **Busca de clínicas**: Encontre clínicas credenciadas próximas a você  
- 👤 **Perfil do paciente**: Acompanhe seus dados, pontos e histórico de consultas  
- 🎮 **Sistema de gamificação**: Acumule pontos realizando atividades de cuidados bucais  

---

## 🛠️ Tecnologias utilizadas

- **React Native**: Framework para desenvolvimento de aplicações móveis  
- **Expo**: Plataforma para facilitar o desenvolvimento React Native  
- **TypeScript**: Superset tipado de JavaScript  
- **React Navigation**: Navegação entre telas  
- **Firebase**: Autenticação, banco de dados em tempo real e armazenamento  
- **React Native Paper**: Componentes de UI para React Native  
- **Ionicons**: Biblioteca de ícones  

---

## 🔥 Firebase como Backend

Este projeto utiliza o **Firebase** como backend, oferecendo uma solução completa para:

### 🔐 Authentication
- Gerenciamento de usuários, login e cadastro

### 🗃️ Firestore
Banco de dados NoSQL para armazenar dados de:
- Usuários (perfil, pontos)  
- Consultas agendadas  
- Clínicas cadastradas  
- Atividades diárias dos pacientes  

### 📂 Estrutura do Firestore

- `users`: Dados de perfil dos usuários  
- `consultas`: Registros de consultas agendadas  
- `clinicas`: Informações sobre clínicas disponíveis  
- `atividades`: Registro das atividades diárias dos pacientes  

---

## 🔄 Fluxo de Navegação

- O usuário inicia no **`LoginScreen`**
- Após autenticação, é direcionado para **`FuncionalidadesScreen`**
- A partir do menu principal, pode navegar para:

  - 🗓️ **`AgendamentosScreen`**: Para ver e criar consultas  
  - 🏥 **`BuscarClinicasScreen`**: Para buscar clínicas credenciadas  
  - 🔔 **`AlertasScreen`**: Para verificar notificações  
  - 👤 **`PerfilPacienteScreen`**: Para visualizar e atualizar seu perfil
 
---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) (v14+)  
- `npm`  
- [Expo CLI](https://docs.expo.dev/get-started/installation/)  
- Conta no [Firebase](https://firebase.google.com/)  
- Dispositivo móvel ou emulador para testes  

---
## 🚀 Configuração e execução

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/odontoprev-app.git
cd odontoprev-app

---
## 📱 Estrutura do projeto
odontoprev-app/
├── assets/               # Imagens e recursos estáticos
├── components/           # Componentes reutilizáveis
├── contexts/             # Contextos React (Auth, etc.)
├── screens/              # Telas do aplicativo
│   ├── LoginScreen.tsx         # Tela de login
│   ├── CadastroScreen.tsx      # Tela de cadastro
│   ├── FuncionalidadesScreen.tsx # Menu principal
│   ├── AgendamentosScreen.tsx  # Agendamento de consultas
│   ├── BuscarClinicasScreen.tsx # Busca de clínicas
│   ├── AlertasScreen.tsx       # Notificações e alertas
│   └── PerfilPacienteScreen.tsx # Perfil do usuário
├── firebase.config.ts    # Configuração do Firebase
├── firebase.firestore.ts # Serviços do Firestore
├── App.tsx               # Componente principal e navegação
├── app.json              # Configuração do Expo
└── package.json          # Dependências do projeto

---

### Grupo:
Nome: Beatriz Silva RM552600
Vitor Onofre Ramos RM553241
Pedro Henrique soares araujo - RM553801
 
---

Desenvolvido com ❤️ para facilitar o cuidado com a saúde bucal.
