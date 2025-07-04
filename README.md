# 🌊 Beba Água - Hydration Tracking App

<div align="center">
  <img src="./assets/images/icon.png" alt="Beba Água Logo" width="120" height="120" />
  
  <strong><em>Stay hydrated, stay healthy 💧</em></strong>
  
  <br/>
  
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React%20Native-0.74.5-blue.svg" alt="React Native"/></a>
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-51.0.28-black.svg" alt="Expo"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.3.3-blue.svg" alt="TypeScript"/></a>
  <a href="https://www.nativewind.dev/"><img src="https://img.shields.io/badge/NativeWind-4.0.1-06B6D4.svg" alt="NativeWind"/></a>
  <a href="https://www.sqlite.org/"><img src="https://img.shields.io/badge/SQLite-Local%20Database-green.svg" alt="SQLite"/></a>
</div>

---

## 📱 **Sobre o Projeto**

**Beba Água** é um aplicativo móvel moderno e intuitivo para acompanhamento de hidratação diária, desenvolvido com as mais recentes tecnologias do ecossistema React Native. O app combina uma interface elegante com funcionalidades robustas de análise e histórico.

### 🎯 **Características Principais**

- 📊 **Histórico Avançado** com filtros dinâmicos (semana/mês/ano)
- 🔥 **Sistema de Streak** para motivar a consistência
- 📈 **Estatísticas Detalhadas** com médias e progressão
- 🎨 **Interface 100% NativeWind** com design responsivo
- 💾 **Armazenamento Local Robusto** usando SQLite
- 🔔 **Notificações Inteligentes** para lembretes
- ⚡ **Performance Otimizada** com lazy loading
- 🌙 **Suporte a Tema Claro/Escuro**

---

## 🛠 **Stack Tecnológica**

### **Frontend**

- **React Native** 0.74.5 - Framework principal
- **Expo** 51.0.28 - Toolchain e runtime
- **TypeScript** 5.3.3 - Type safety
- **NativeWind** 4.0.1 - Styling com Tailwind CSS
- **Expo Router** - Navegação file-based

### **Backend & Storage**

- **expo-sqlite** - Banco de dados local
- **AsyncStorage** - Cache e configurações
- **Expo Notifications** - Push notifications

### **Desenvolvimento**

- **ESLint** - Linting e code quality
- **Prettier** - Code formatting
- **Metro** - Bundler otimizado

---

## 🏗 **Arquitetura do Projeto**

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes de interface
│   └── WaterStatsCard.tsx
├── context/             # Context API para state management
│   └── WaterContext.tsx
├── screens/             # Telas da aplicação
│   └── HistoryScreen.tsx
├── services/            # Serviços e APIs
│   ├── databaseService.ts    # SQLite operations
│   ├── storageService.ts     # AsyncStorage wrapper
│   └── notificationService.ts # Push notifications
├── hooks/               # Custom hooks
└── utils/               # Utilitários e helpers
    └── waterUtils.ts

app/
├── (tabs)/             # Tab navigation screens
│   ├── index.tsx       # Home screen
│   ├── history.tsx     # History screen
│   └── explore.tsx     # Settings screen
└── _layout.tsx         # Root layout
```

### 📊 **Arquitetura de Dados**

```sql
-- SQLite Schema
CREATE TABLE water_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  daily_goal INTEGER NOT NULL,
  user_weight REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 **Instalação e Configuração**

### **Pré-requisitos**

- Node.js 18+
- npm ou yarn
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)

### **1. Clone o repositório**

```bash
git clone https://github.com/username/beba-agua.git
cd beba-agua
```

### **2. Instale as dependências**

```bash
npm install
```

### **3. Configure o ambiente**

```bash
# Para desenvolvimento
npx expo start

# Para build de produção
npx expo build:android
npx expo build:ios
```

### **4. Execute no dispositivo**

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Web (para testes)
npx expo start --web
```

---

## 💻 **Funcionalidades Técnicas**

### 🗄 **Gerenciamento de Dados**

**SQLite Integration**

- Queries otimizadas com índices
- Migrations automáticas
- Backup e restore de dados
- Filtros avançados por período

```typescript
// Exemplo de query otimizada
const getDailyStats = async (filter: FilterOptions): Promise<DailyStats[]> => {
  const query = `
    SELECT 
      date,
      SUM(amount) as total_amount,
      daily_goal as goal,
      COUNT(*) as records_count,
      (SUM(amount) >= daily_goal) as completed
    FROM water_records 
    WHERE date BETWEEN ? AND ?
    GROUP BY date 
    ORDER BY date DESC
  `;
  // ...implementação
};
```

### 🔄 **State Management**

**Context API + useReducer**

- Estado global centralizado
- Actions tipadas com TypeScript
- Performance otimizada com useMemo/useCallback

```typescript
interface WaterState {
  waterIntake: number;
  dailyGoal: number;
  userSettings: UserSettings;
  loading: boolean;
  goalAchieved: boolean;
}
```

### 📱 **UI/UX Avançado**

**NativeWind Styling**

- Design system consistente
- Componentes responsivos
- Animações suaves
- Acessibilidade (a11y)

```tsx
// Exemplo de componente estilizado
<View className="bg-primary rounded-2xl p-6 mb-6 items-center shadow-lg">
  <Text className="text-lg font-semibold text-white mb-2">🔥 Sequência Atual</Text>
</View>
```

---

## 📊 **Features Implementadas**

### 🏠 **Tela Principal**

- ✅ Widget de progresso circular animado
- ✅ Botões de quick-add (200ml, 500ml, custom)
- ✅ Visualização da meta diária
- ✅ Feedback visual de conquistas

### 📈 **Histórico & Estatísticas**

- ✅ Filtros dinâmicos (semana/mês/ano)
- ✅ Cards de estatísticas em tempo real
- ✅ Lista detalhada de dias com progress bars
- ✅ Sistema de streak com gamificação
- ✅ Cálculo de médias e melhores dias

### ⚙️ **Configurações**

- ✅ Personalização de meta por peso
- ✅ Tamanhos de copo customizáveis
- ✅ Configuração de notificações
- ✅ Backup/restore de dados

---

## 🎨 **Design System**

### **Paleta de Cores**

```typescript
colors: {
  primary: "#00C2CB",     // Azul-turquesa principal
  secondary: "#4F46E5",   // Azul secundário
  background: "#F9FAFB",  // Fundo claro
  success: "#10B981",     // Verde de sucesso
  warning: "#F59E0B",     // Amarelo de aviso
  error: "#EF4444",       // Vermelho de erro
}
```

### **Tipografia**

- Font families otimizadas para mobile
- Hierarquia visual consistente
- Tamanhos responsivos

### **Componentes**

- Cards com shadows suaves
- Buttons com estados interativos
- Progress bars animadas
- Modals e overlays acessíveis

---

## 🧪 **Testes e Qualidade**

### **Code Quality**

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

### **Performance**

- Bundle size otimizado
- Lazy loading de componentes
- Memoização estratégica
- SQLite queries indexadas

---

## 📱 **Compatibilidade**

- **iOS**: 12.0+
- **Android**: API 21+ (Android 5.0)
- **Expo Go**: Suporte completo
- **Web**: PWA ready (em desenvolvimento)

---

## 🚢 **Deploy e Distribuição**

### **Build de Produção**

```bash
# Android AAB
eas build --platform android --profile production

# iOS IPA
eas build --platform ios --profile production
```

### **CI/CD** (Configurado)

- GitHub Actions para builds automatizados
- Testes automáticos em PRs
- Deploy automático para stores

---

## 📈 **Roadmap Futuro**

### **Versão 2.0**

- [ ] Sincronização em nuvem
- [ ] Integração com Health apps
- [ ] Widgets para home screen
- [ ] Modo offline avançado
- [ ] Analytics detalhados

### **Versão 2.1**

- [ ] Compartilhamento social
- [ ] Desafios entre amigos
- [ ] Integração com wearables
- [ ] Relatórios PDF

---

## 👨‍💻 **Sobre o Desenvolvedor**

Este projeto demonstra competências em:

- **📱 Desenvolvimento Mobile**: React Native, Expo, navegação complexa
- **🗄 Banco de Dados**: SQLite, queries otimizadas, migrations
- **🎨 UI/UX**: Design systems, animações, responsividade
- **⚡ Performance**: Otimizações, lazy loading, memoização
- **🔧 DevOps**: Build automation, CI/CD, distribuição
- **📝 Documentação**: Código limpo, documentação técnica

### **Diferenciais Técnicos**

- Arquitetura escalável e modular
- Código TypeScript 100% tipado
- Performance otimizada para produção
- UI/UX de qualidade profissional
- Testes e qualidade de código

---

## 📄 **Licença**

Este projeto é licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  
  <strong>💧 Desenvolvido com paixão por hidratação e código limpo 💧</strong>
  
  <a href="mailto:dev@email.com">📧 Contato</a> • <a href="https://linkedin.com/in/dev">💼 LinkedIn</a> • <a href="https://portfolio.dev">🌐 Portfolio</a>
</div>
"# Beba-gua" 
#   B e b a - g u a 
 
 "# Beba-gua" 
#   B e b a - g u a 
 
 
