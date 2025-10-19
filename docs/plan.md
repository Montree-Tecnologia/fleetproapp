# Product Requirements Document (PRD)
# Sistema de Gestão de Frotas - FleetPro
# Status: Protótipo Frontend Concluído

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Resumo Executivo

Sistema web para gestão completa de frotas de transportadoras, com foco especial em empresas de transporte refrigerado. A solução oferece controle multi-tenant (matriz/filiais), gestão de veículos, controle de abastecimentos, aparelhos de refrigeração e análise de indicadores operacionais e financeiros.

### 1.2 Objetivo do Produto

Centralizar e otimizar a gestão operacional de frotas de transportadoras, proporcionando visibilidade completa dos custos, manutenções e performance dos veículos, permitindo tomada de decisões baseadas em dados e redução de custos operacionais.

### 1.3 Problema a Resolver

Transportadoras enfrentam desafios na gestão eficiente de suas frotas, incluindo controle descentralizado de informações, dificuldade no rastreamento de custos, falta de visibilidade sobre manutenções preventivas e ausência de indicadores para tomada de decisão estratégica.

### 1.4 Proposta de Valor

- Redução de 15-25% nos custos operacionais através de melhor controle de abastecimentos
- Aumento de 20% na disponibilidade da frota através de manutenção preventiva
- Centralização de informações com acesso em tempo real
- Tomada de decisão baseada em dados e KPIs

---

## 2. STAKEHOLDERS

### 2.1 Usuários Primários

- **Administradores:** Controle total do sistema
- **Gestores de Frota:** Controle operacional diário
- **Operadores:** Lançamento de dados e controles básicos

### 2.2 Personas

#### Persona 1: João Silva - Gerente de Frota

**Idade:** 30-40 anos
**Responsabilidades:** Controlar 50+ veículos, garantir disponibilidade, reduzir custos
**Dores:** Planilhas descentralizadas, falta de alertas automáticos
**Necessidades:** Dashboard em tempo real, alertas de manutenção

#### Persona 2: Maria Santos - Diretora Operacional

**Idade:** 40-50 anos
**Responsabilidades:** Estratégia operacional, análise de ROI, expansão da frota
**Dores:** Relatórios manuais demorados, falta de visibilidade consolidada
**Necessidades:** KPIs executivos, análise comparativa entre filiais

---

## 3. REQUISITOS FUNCIONAIS

### 3.1 Módulo de Gestão Empresarial ✅ (Implementado)

#### RF001 - Cadastro Multi-tenant ✅
- Sistema permite cadastro de empresa matriz com CNPJ único
- Cada matriz pode ter N filiais vinculadas
- Validação de CNPJ/CPF com algoritmo oficial
- **Status:** Implementado com dados mock

#### RF002 - Hierarquia Organizacional ✅
- Vinculação automática filial-matriz
- Isolamento de dados entre empresas diferentes
- Compartilhamento controlado de dados entre matriz-filiais
- **Status:** Implementado com estrutura de dados

#### RF003 - Controle de Acesso ✅
- Sistema de autenticação com diferentes níveis
- Três perfis de usuário: Admin, Gestor, Operador
- Controle granular de permissões por módulo
- **Status:** Implementado com mock authentication

### 3.2 Módulo de Gestão de Frotas ✅ (Implementado)

#### RF004 - Cadastro de Veículos ✅
- Campos obrigatórios: Placa, Chassi, RENAVAM, Ano/Modelo
- Campos opcionais: Cor, Tipo de carroceria, Capacidade de carga
- Upload de fotos do veículo
- Vinculação com motorista responsável
- Composição de veículos (cavalo + carretas)
- **Status:** Totalmente implementado

#### RF005 - Controle de Documentação Veicular ✅
- Registro de CRLV com data de vencimento
- Upload de documentos (CRLV, Nota Fiscal de Compra)
- **Status:** Implementado

#### RF006 - Status e Ciclo de Vida ✅
- Estados: Ativo, Em Manutenção, Inativo, Vendido
- Histórico completo de mudanças de status
- Registro de compra (data, valor, fornecedor)
- Registro de venda (data, valor, comprador, documentos)
- **Status:** Totalmente implementado com modal de venda

### 3.3 Módulo de Refrigeração ✅ (Implementado)

#### RF007 - Cadastro de Aparelhos ✅
- Dados técnicos: Marca, Modelo, Número de série, Capacidade
- Tipo de refrigeração: Freezer, Resfriado, Climatizado
- Faixa de temperatura operacional (-30°C a 30°C)
- **Status:** Totalmente implementado

#### RF008 - Vinculação Veículo-Aparelho ✅
- Associação 1:1 entre veículo e aparelho
- Controle de instalação/desinstalação
- **Status:** Implementado

#### RF009 - Venda de Equipamentos ✅
- Registro de venda de equipamentos de refrigeração
- Upload de documentos de venda
- Cálculo automático de tempo de uso
- **Status:** Implementado com modal específico

### 3.4 Módulo de Abastecimentos ✅ (Implementado)

#### RF010 - Lançamento de Abastecimento ✅
- Dados obrigatórios: Data/Hora, Veículo/Equipamento, Posto, Hodômetro/Horímetro
- Combustível: Tipo (Diesel, Arla, Gasolina, Etanol), Quantidade (L), Valor/L, Valor Total
- Upload de cupom fiscal/nota
- Suporte para abastecimento de veículos e equipamentos de refrigeração
- **Status:** Totalmente implementado

#### RF011 - Validações e Controles ✅
- Cálculo automático de valor total
- Registro por tipo de entidade (veículo ou refrigeração)
- **Status:** Implementado

### 3.5 Módulo de Fornecedores ✅ (Implementado)

#### RF012 - Cadastro de Fornecedores ✅
- Dados: CNPJ/CPF, Razão Social, Nome Fantasia
- Endereço completo com CEP
- Tipo: Posto de Combustível, Oficina, Concessionária, Loja de Peças, etc.
- **Status:** Totalmente implementado

#### RF013 - Relacionamento com Filiais ✅
- Vinculação fornecedor-filial (N:N)
- Histórico de transações
- **Status:** Implementado

### 3.6 Módulo de Motoristas ✅ (Implementado)

#### RF014 - Cadastro de Motoristas ✅
- Dados pessoais: Nome, CPF, Data de Nascimento
- CNH: Categoria, Validade, Upload do documento
- Status: Ativo/Inativo
- **Status:** Totalmente implementado

#### RF015 - Vinculação com Veículos ✅
- Associação motorista-veículo
- Múltiplas filiais por motorista
- **Status:** Implementado

### 3.7 Módulo de Usuários ✅ (Implementado)

#### RF016 - Gestão de Usuários ✅
- Cadastro de usuários do sistema
- Perfis: Administrador, Gestor, Operador
- Controle de permissões por módulo
- **Status:** Totalmente implementado

#### RF017 - Permissões Customizadas ✅
- Definição granular de acesso por módulo
- Permissões de leitura e escrita
- **Status:** Implementado

---

## 4. DASHBOARDS E INDICADORES ✅

### 4.1 Dashboard Operacional ✅

**Widgets Implementados:**
- ✅ Total de veículos ativos
- ✅ Taxa de disponibilidade (%)
- ✅ Consumo médio da frota (Km/L)
- ✅ Custo total com combustível (mês atual)
- ✅ Top 5 melhores/piores veículos por consumo
- ✅ Indicadores com tendências (setas up/down)

### 4.2 Dashboard de Refrigeração ✅

**Widgets Implementados:**
- ✅ Total de equipamentos ativos
- ✅ Taxa de disponibilidade (%)
- ✅ Consumo médio (L/h)
- ✅ Custo total com combustível
- ✅ Top 5 melhores/piores equipamentos por consumo

### 4.3 Analytics e Relatórios ✅

**Funcionalidades Implementadas:**
- ✅ Filtros por período
- ✅ Gráficos de evolução de gastos (últimos 7 dias)
- ✅ Comparativo de consumo
- ✅ Exportação de dados para Excel (.xlsx)

---

## 5. FUNCIONALIDADES TÉCNICAS IMPLEMENTADAS

### 5.1 Interface do Usuário ✅

- **Design System:** Interface profissional com Tailwind CSS
- **Componentes:** Biblioteca Shadcn/ui (Radix UI)
- **Responsividade:** Layout adaptativo mobile/desktop
- **Tema:** Suporte a modo claro/escuro
- **Animações:** Transições suaves e feedback visual

### 5.2 Gestão de Dados ✅

- **Mock Data:** Sistema completo com dados simulados
- **Hooks Customizados:** useMockData, useAuth, usePermissions
- **Validação:** Zod schemas para formulários
- **Formatação:** Máscaras para CPF, CNPJ, valores monetários

### 5.3 Funcionalidades Auxiliares ✅

- **Upload de Arquivos:** Suporte para imagens e documentos
- **Calendário:** Seleção de datas com date-fns
- **Paginação:** Infinite scroll para listas grandes
- **Busca e Filtros:** Sistema de busca avançada
- **Comandos Rápidos:** Command palette (Cmd+K)

### 5.4 Segurança e Controle ✅

- **Autenticação:** Sistema de login com credenciais
- **Autorização:** RBAC (Role-Based Access Control)
- **Sessão:** Controle via localStorage
- **Proteção de Rotas:** Middleware de autenticação

---

## 6. ESPECIFICAÇÕES TÉCNICAS

### 6.1 Arquitetura Atual

**Frontend:** 
- React.js 18 com TypeScript
- Vite como bundler
- Wouter para roteamento
- TanStack Query para gerenciamento de estado
- Tailwind CSS + Shadcn/ui

**Backend (Preparado para integração):**
- Express.js com TypeScript
- Interface IStorage preparada para implementação
- Schemas Drizzle ORM definidos

**Banco de Dados (Estrutura definida):**
- PostgreSQL (schemas prontos)
- Drizzle ORM configurado
- Migrations preparadas

### 6.2 Estrutura de Dados Implementada

**Entidades Principais:**
- ✅ Users (com roles e permissions)
- ✅ Companies (multi-tenant)
- ✅ Vehicles (com composições e vendas)
- ✅ Drivers
- ✅ RefrigerationUnits (com vendas)
- ✅ Suppliers
- ✅ Refuelings (veículos e refrigeração)

---

## 7. FUNCIONALIDADES PENDENTES (Backend)

### 7.1 Integração com Banco de Dados
- ⏳ Migração de mock data para PostgreSQL
- ⏳ Implementação do IStorage com Drizzle
- ⏳ Sistema de migrations automático

### 7.2 APIs e Integrações
- ⏳ API RESTful completa
- ⏳ Autenticação JWT
- ⏳ Upload de arquivos para cloud storage
- ⏳ Integração com APIs de CEP
- ⏳ Integração com sistemas de pagamento

### 7.3 Funcionalidades Avançadas
- ⏳ Relatórios em PDF
- ⏳ Sistema de notificações em tempo real
- ⏳ Backup automático
- ⏳ Auditoria e logs
- ⏳ Dashboard em tempo real com WebSocket

---

## 8. MELHORIAS IDENTIFICADAS

### 8.1 Performance
- Otimização de queries
- Cache de dados frequentes
- Lazy loading de componentes

### 8.2 UX/UI
- Tutoriais interativos
- Tooltips contextuais
- Atalhos de teclado adicionais

### 8.3 Mobile
- App PWA
- Modo offline
- Sincronização de dados

---

## 9. CONCLUSÃO

O protótipo frontend do FleetPro está **100% funcional** com todas as funcionalidades principais implementadas usando dados simulados. O sistema está pronto para:

1. **Demonstrações e Validações:** Interface completa para apresentação a stakeholders
2. **Testes de Usabilidade:** Todos os fluxos principais funcionando
3. **Integração Backend:** Estrutura preparada para conexão com APIs reais
4. **Deploy:** Configuração pronta para publicação

### Próximos Passos Recomendados:

1. **Fase 1:** Implementar backend com PostgreSQL
2. **Fase 2:** Migrar mock data para banco real
3. **Fase 3:** Implementar autenticação JWT
4. **Fase 4:** Deploy em produção
5. **Fase 5:** Adicionar funcionalidades avançadas

---

**Versão do Documento:** 2.0  
**Data:** Outubro 2025  
**Status:** Protótipo Frontend Concluído
**Observação:** Esta base de código foi desenvolvida como protótipo frontend totalmente funcional, preparado para posterior integração com backend real.