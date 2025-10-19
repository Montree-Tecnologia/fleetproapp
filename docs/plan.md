# Product Requirements Document (PRD)
# Sistema de Gestão de Frotas - MVP

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

- **Gestores de Frota:** Controle operacional diário
- **Coordenadores de Filiais:** Gestão local das operações
- **Diretores/Proprietários:** Visão estratégica e análise de resultados
- **Operadores Administrativos:** Lançamento de dados e controles

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

### 3.1 Módulo de Gestão Empresarial (P0 - Crítico)

#### RF001 - Cadastro Multi-tenant
- Sistema deve permitir cadastro de empresa matriz com CNPJ único
- Cada matriz pode ter N filiais vinculadas
- Upload de logotipo personalizado (formatos: JPG, PNG, máx 2MB)
- Validação de CNPJ/CPF com algoritmo oficial

#### RF002 - Hierarquia Organizacional
- Vinculação automática filial-matriz
- Isolamento de dados entre empresas diferentes
- Compartilhamento controlado de dados entre matriz-filiais

#### RF003 - Documentação Empresarial
- Armazenamento seguro de documentos societários
- Controle de vencimento de alvarás e licenças
- Alertas automáticos 30 dias antes do vencimento

### 3.2 Módulo de Gestão de Frotas (P0 - Crítico)

#### RF004 - Cadastro de Veículos
- Campos obrigatórios: Placa, Chassi, RENAVAM, Ano/Modelo
- Campos opcionais: Cor, Tipo de carroceria, Capacidade de carga, valor de mercado
- Upload de até 10 fotos por veículo
- Vinculação com motorista responsável

#### RF005 - Controle de Documentação Veicular
- Registro de CRLV com data de vencimento
- Registro de ANTT para transporte de cargas
- CNH do proprietário/responsável
- Alertas automáticos de vencimento (60, 30, 15 dias)

#### RF006 - Status e Ciclo de Vida
- Estados: Ativo, Em Manutenção, Inativo, Vendido
- Histórico completo de mudanças de status
- Registro de compra (data, valor, fornecedor)
- Registro de venda (data, valor, comprador)

### 3.3 Módulo de Refrigeração (P1 - Importante)

#### RF007 - Cadastro de Aparelhos
- Dados técnicos: Marca, Modelo, Número de série, Capacidade
- Tipo de refrigeração: Freezer, Resfriado, Climatizado
- Faixa de temperatura operacional

#### RF008 - Vinculação Veículo-Aparelho
- Associação 1:1 entre veículo e aparelho
- Histórico de transferências entre veículos
- Controle de instalação/desinstalação

### 3.4 Módulo de Abastecimentos (P0 - Crítico)

#### RF009 - Lançamento de Abastecimento
- Dados obrigatórios: Data/Hora, Veículo, Motorista, Posto, Hodômetro
- Combustível: Tipo (Diesel, Arla, Gasolina, Etanol), Quantidade (L), Valor/L, Valor Total
- Localização: Cidade, UF, Coordenadas GPS (opcional)
- Upload de cupom fiscal/nota

#### RF010 - Validações e Controles
- Validação de hodômetro (sempre crescente)
- Cálculo automático de autonomia (Km/L)
- Detecção de anomalias (consumo fora do padrão)

### 3.5 Módulo de Fornecedores (P1 - Importante)

#### RF011 - Cadastro de Fornecedores
- Dados: CNPJ, Razão Social, Nome Fantasia
- Endereço completo com CEP
- Tipo: Posto de Combustível, Oficina, Concessionária

#### RF012 - Relacionamento com Filiais
- Vinculação fornecedor-filial (N:N)
- Condições comerciais por filial
- Histórico de transações

---

## 4. DASHBOARDS E INDICADORES

### 4.1 Dashboard Operacional

**Widgets Principais:**
- Status da frota (gráfico pizza: Disponível/Manutenção/Em Rota)
- Top 5 veículos por quilometragem (mês atual)
- Alertas críticos (documentos vencendo, manutenções pendentes)

**KPIs em Destaque:**
- Km/L médio da frota (com tendência)
- Custo por Km rodado
- Taxa de disponibilidade (%)
- Quilometragem total do mês

### 4.2 Dashboard Financeiro

**Análises Principais:**
- Evolução de gastos com combustível (12 meses)
- Comparativo de custos entre filiais
- ROI por veículo (ranking)
- Previsão de gastos (próximo trimestre)

**Métricas Financeiras:**
- Gasto total mensal com combustível
- Custo médio por veículo
- Variação % mês anterior

### 4.3 Dashboard de Manutenção

**Controles Preventivos:**
- Calendário de manutenções programadas
- Veículos próximos da revisão (por Km)
- Histórico de paradas por veículo
- MTBF (Mean Time Between Failures)

---

## 5. ESPECIFICAÇÕES TÉCNICAS

### 5.1 Arquitetura

**Frontend:** React.js

**Banco de Dados:** Relacional (PostgreSQL ou MySQL)

---

**Versão do Documento:** MVP 1.0  
**Data:** 2025  
**Status:** Em Desenvolvimento
