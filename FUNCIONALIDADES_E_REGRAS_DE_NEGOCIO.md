# FleetPro - Documentação de Funcionalidades e Regras de Negócio

## 1. VISÃO GERAL DO SISTEMA

O **FleetPro** é um sistema de gestão de frota que permite o controle completo de veículos, motoristas, abastecimentos, equipamentos de refrigeração, fornecedores e usuários. O sistema é multiempresa (matriz/filiais) e possui controle de permissões por perfil de usuário.

---

## 2. MÓDULO DE AUTENTICAÇÃO E USUÁRIOS

### 2.1 Autenticação

**Funcionalidade:** Sistema de login com credenciais (email e senha)

**Regras de Negócio:**
- Login com email e senha
- Persistência de sessão via localStorage
- Logout limpa dados da sessão
- Usuários mock para demonstração:
  - Admin: admin@fleetpro.com / admin123
  - Gestor: gestor@fleetpro.com / gestor123

### 2.2 Gestão de Usuários

**Funcionalidade:** Cadastro e gerenciamento de usuários do sistema

**Dados do Usuário:**
- Nome completo (3-100 caracteres)
- Email (único no sistema, máx 255 caracteres)
- Perfil/Função: admin, manager, operator
- Empresa de vínculo empregatício (obrigatório)
- Empresas com acesso para operações (múltiplas)
- Opção "Acesso a todas as empresas"
- Senha provisória no cadastro (mín 6, máx 50 caracteres)
- Status: ativo/inativo
- Permissões customizadas por módulo

**Regras de Negócio:**
- Email deve ser único
- Usuários padrão (IDs 1 e 2) não podem ser excluídos
- Senha obrigatória apenas no cadastro, não na edição
- Administradores não podem ter permissões personalizadas configuradas
- Quando "Acesso a todas as empresas" está ativo, lista de empresas específicas é ignorada

**Perfis de Acesso:**

**Administrador (admin):**
- view_dashboard
- manage_vehicles
- manage_refuelings
- manage_refrigeration
- manage_suppliers
- manage_companies
- manage_users
- view_settings

**Gestor (manager):**
- view_dashboard
- manage_vehicles
- manage_refuelings
- manage_refrigeration
- manage_suppliers

**Operador (operator):**
- view_dashboard
- manage_refuelings

**Validações:**
- Nome: mínimo 3 caracteres, máximo 100 caracteres
- Email: formato válido, máximo 255 caracteres, único no sistema
- Senha: mínimo 6 caracteres, máximo 50 caracteres
- Empresa de vínculo: obrigatória
- Ao menos uma empresa com acesso deve ser selecionada (ou "todas as empresas")

**Operações:**
- Criar usuário com senha provisória
- Editar informações do usuário
- Redefinir senha (sem alterar dados do usuário)
- Ativar/Inativar usuário
- Excluir usuário (exceto usuários padrão)
- Visualizar detalhes completos

### 2.3 Permissões Customizadas

**Funcionalidade:** Sistema granular de permissões por módulo

**Módulos com Permissões:**
- Dashboard: view
- Veículos: view, edit, delete
- Motoristas: view, edit, delete
- Abastecimentos: view, edit, delete
- Refrigeração: view, edit, delete
- Fornecedores: view, edit, delete

**Regras de Negócio:**
- Ao habilitar 'edit' ou 'delete', 'view' é habilitado automaticamente
- Ao desabilitar 'view', 'edit' e 'delete' são desabilitados automaticamente
- Administradores têm acesso total e não podem ter permissões customizadas
- Dashboard possui apenas permissão de visualização

---

## 3. MÓDULO DE EMPRESAS (MATRIZ/FILIAIS)

### 3.1 Gestão de Empresas

**Funcionalidade:** Cadastro de matriz e filiais da organização

**Dados da Empresa:**
- Nome (razão social)
- CNPJ (formato 00.000.000/0000-00)
- Tipo: matriz ou filial
- Cidade
- Estado
- Matriz vinculada (se filial)
- Status: ativa/inativa

**Regras de Negócio:**
- CNPJ deve ser único
- Filiais devem estar vinculadas a uma matriz
- Matriz não pode ser excluída se possuir filiais vinculadas
- Ao criar uma filial, é obrigatório selecionar a matriz

**Validações:**
- Nome: obrigatório, máximo 255 caracteres
- CNPJ: formato válido, único
- Cidade e Estado: obrigatórios
- Se tipo = filial, matriz é obrigatória

**Operações:**
- Criar empresa (matriz ou filial)
- Editar informações da empresa
- Ativar/Inativar empresa
- Excluir empresa (com validação de vínculos)
- Visualizar detalhes e filiais vinculadas

---

## 4. MÓDULO DE VEÍCULOS

### 4.1 Gestão de Veículos

**Funcionalidade:** Cadastro e controle completo da frota

**Tipos de Veículos:**

**Veículos de Tração (possuem motor):**
- Truck
- Cavalo Mecânico
- Toco
- VUC
- 3/4
- Bitruck

**Veículos de Reboque (sem motor):**
- Baú
- Carreta
- Graneleiro
- Container
- Caçamba
- Baú Frigorífico
- Sider
- Prancha
- Tanque
- Cegonheiro
- Rodotrem

**Dados do Veículo:**
- Placa (única)
- Modelo
- Chassi (único)
- Tipo de veículo
- Ano de fabricação (1900-ano atual+1)
- Número de eixos (1-20)
- Marca
- Cor
- Capacidade de carga (kg)
- Data de aquisição
- Empresa proprietária
- Fornecedor (concessionária)
- Km inicial na compra
- Km atual (atualizado via abastecimentos)
- Preço de compra
- Status: ativo, manutenção, defeito, inativo, vendido
- Motorista vinculado (opcional)
- Composição (reboques acoplados) - apenas para veículos de tração
- Tipo de combustível
- Foto do veículo (opcional)

**Regras de Negócio - Veículos de Tração:**
- Podem ter motorista vinculado
- Podem ter composição (reboques acoplados)
- Possuem controle de consumo (km/litro)
- Ao abastecer, o km atual é atualizado automaticamente
- Consumo médio calculado com base nos abastecimentos

**Regras de Negócio - Veículos de Reboque:**
- NÃO podem ter motorista vinculado
- NÃO podem ter composição
- NÃO possuem controle de consumo
- NÃO abastecem (não possuem motor próprio)
- Podem ser vinculados a veículos de tração como composição

**Regras de Negócio - Status:**
- **Ativo**: Veículo operacional
- **Manutenção**: Veículo em manutenção preventiva ou corretiva
- **Defeito**: Veículo com problema técnico
- **Inativo**: Veículo parado temporariamente
- **Vendido**: Veículo vendido (não pode mais ser editado)

**Regras de Status e Composição:**
- Ao mudar veículo de TRAÇÃO para inativo/manutenção/defeito:
  - Status das composições acopladas muda automaticamente para o mesmo status
  - Notificação é exibida ao usuário
- Ao mudar veículo de REBOQUE para inativo/manutenção/defeito:
  - Veículo é automaticamente desvinculado de todas as composições
  - Notificação é exibida ao usuário
- Reboques só podem ser adicionados à composição se status = ativo
- Veículos de tração inativos não podem adicionar reboques

**Regras de Vínculo com Motorista:**
- Apenas veículos de TRAÇÃO podem ter motorista
- Apenas um motorista por veículo
- Motorista deve estar ativo para ser vinculado
- Ao desvincular, o vínculo é removido

**Regras de Composição:**
- Apenas veículos de TRAÇÃO podem ter composição
- Apenas veículos de REBOQUE podem ser adicionados à composição
- Reboque deve estar ativo para ser adicionado
- Reboque não pode estar vinculado a outro veículo
- Ao adicionar reboque, eixos da composição são atualizados
- Ao remover reboque, eixos da composição são atualizados

**Validações:**
- Placa: formato válido (ABC1234 ou ABC1D23), única
- Chassi: mínimo 17 caracteres, único
- Ano: entre 1900 e ano atual + 1
- Eixos: entre 1 e 20
- Km inicial: maior ou igual a 0
- Preço de compra: maior que 0

**Operações:**
- Criar veículo
- Editar veículo (exceto vendidos)
- Excluir veículo
- Alterar status (com validações)
- Vincular/desvincular motorista
- Adicionar/remover reboques da composição
- Vender veículo (com dados do comprador e valor)
- Reverter venda (apenas admin)
- Visualizar detalhes completos
- Exportar relatório Excel

### 4.2 Venda de Veículos

**Funcionalidade:** Registro de venda de veículos

**Dados da Venda:**
- Nome do comprador
- CPF/CNPJ do comprador
- Data da venda
- Km no momento da venda
- Preço de venda
- Venda de equipamento de refrigeração vinculado (se houver)

**Regras de Negócio:**
- Ao vender veículo:
  - Status muda para "vendido"
  - Motorista é desvinculado automaticamente
  - Composições são desvinculadas automaticamente
  - Se houver equipamento de refrigeração vinculado, usuário pode escolher:
    - Vender junto (equipamento também fica como "vendido")
    - Apenas desvincular (equipamento fica disponível)
- Apenas admin pode reverter venda
- Ao reverter venda:
  - Status volta para "ativo"
  - Venda de equipamento de refrigeração NÃO é revertida automaticamente

---

## 5. MÓDULO DE MOTORISTAS

### 5.1 Gestão de Motoristas

**Funcionalidade:** Cadastro de motoristas da frota

**Dados do Motorista:**
- Nome completo (3-100 caracteres)
- CPF (formato 000.000.000-00, único)
- Data de nascimento (idade entre 18 e 80 anos)
- Categoria da CNH: A, B, C, D, E, AB, AC, AD, AE
- Validade da CNH (deve estar válida)
- Matriz/Filiais vinculadas (ao menos uma)
- Documento CNH (foto ou PDF - opcional)
- Status: ativo/inativo

**Regras de Negócio:**
- CPF deve ser único
- Motorista deve ter entre 18 e 80 anos
- CNH deve estar válida (data futura)
- CNH com vencimento em até 60 dias exibe alerta
- CNH vencida exibe status de alerta crítico
- Motorista deve estar vinculado a pelo menos uma empresa
- Apenas motoristas ativos podem ser vinculados a veículos

**Validações:**
- Nome: mínimo 3 caracteres, máximo 100 caracteres
- CPF: formato válido, único
- Data de nascimento: idade entre 18 e 80 anos
- Validade CNH: data futura
- Filiais: ao menos uma selecionada

**Operações:**
- Criar motorista
- Editar motorista
- Ativar/Inativar motorista
- Excluir motorista
- Visualizar detalhes completos
- Upload de documento CNH
- Remover documento CNH

**Cálculos Automáticos:**
- Idade do motorista
- Dias até vencimento da CNH
- Status da CNH (válida / vence em breve / vencida)

---

## 6. MÓDULO DE ABASTECIMENTOS

### 6.1 Gestão de Abastecimentos

**Funcionalidade:** Registro de abastecimentos de veículos e equipamentos de refrigeração

**Tipos de Abastecimento:**
1. Abastecimento de Veículo (apenas veículos de TRAÇÃO)
2. Abastecimento de Equipamento de Refrigeração

**Dados do Abastecimento de Veículo:**
- Veículo (apenas veículos de tração)
- Data e hora
- Motorista responsável
- Fornecedor (posto)
- Quilometragem
- Litros abastecidos
- Preço por litro
- Valor total
- Tipo de combustível
- Observações (opcional)
- Comprovante de pagamento (foto - opcional)
- Nota fiscal (foto - opcional)

**Dados do Abastecimento de Refrigeração:**
- Equipamento de refrigeração
- Filtro por veículo (opcional - mostra equipamentos do veículo e seus reboques)
- Data e hora
- Motorista responsável (do veículo vinculado)
- Fornecedor (posto)
- Horímetro (horas de uso)
- Litros abastecidos
- Preço por litro
- Valor total
- Tipo de combustível (Diesel ou Gasolina)
- Observações (opcional)
- Comprovante de pagamento (foto - opcional)
- Nota fiscal (foto - opcional)

**Regras de Negócio - Veículos:**
- Apenas veículos de TRAÇÃO podem abastecer
- Veículos de REBOQUE NÃO abastecem (não possuem motor)
- Ao registrar abastecimento, km atual do veículo é atualizado automaticamente
- Km do abastecimento deve ser maior ou igual ao km atual do veículo
- Consumo médio calculado automaticamente (km percorridos / litros consumidos)
- Se veículo não tiver motorista vinculado, motorista do abastecimento pode ser vinculado automaticamente

**Regras de Negócio - Refrigeração:**
- Equipamento pode estar vinculado a qualquer veículo (tração ou reboque)
- Filtro por veículo mostra:
  - Equipamentos acoplados diretamente ao veículo selecionado
  - Equipamentos acoplados aos reboques da composição do veículo
- Ao selecionar veículo de tração com composição, todos equipamentos da composição são exibidos
- Horímetro deve ser maior ou igual ao horímetro do último abastecimento
- Motorista do abastecimento:
  - Se equipamento em veículo de tração: motorista do veículo
  - Se equipamento em reboque: motorista do veículo de tração que possui o reboque na composição
- Consumo calculado em litros por hora (l/h)

**Validações:**
- Data: não pode ser futura
- Km/Horímetro: maior ou igual ao último registro
- Litros: maior que 0
- Preço por litro: maior que 0
- Valor total: calculado automaticamente (litros × preço por litro)
- Fornecedor: obrigatório
- Tipo de combustível: obrigatório

**Operações:**
- Criar abastecimento (veículo ou refrigeração)
- Editar abastecimento
- Excluir abastecimento (apenas admin)
- Visualizar detalhes completos
- Adicionar novo fornecedor rapidamente
- Vincular motorista ao veículo durante abastecimento
- Upload de comprovantes e notas fiscais
- Filtros avançados por data, veículo, motorista, fornecedor
- Exportar relatório Excel (separado por tipo)

**Filtros Disponíveis:**
- Data inicial e final
- Veículo específico (em abastecimentos de veículos)
- Equipamento específico (em abastecimentos de refrigeração)
- Filtro por veículo (em abastecimentos de refrigeração):
  - Mostra equipamentos do veículo selecionado
  - Mostra equipamentos dos reboques da composição
  - Permite filtrar por veículos que possuem equipamentos de refrigeração
- Motorista
- Fornecedor

**Cálculos Automáticos:**
- Valor total = litros × preço por litro
- Consumo médio de veículos (km/l)
- Consumo médio de refrigeração (l/h)
- Top 5 veículos/equipamentos mais econômicos
- Top 5 veículos/equipamentos menos econômicos

---

## 7. MÓDULO DE REFRIGERAÇÃO

### 7.1 Gestão de Equipamentos de Refrigeração

**Funcionalidade:** Controle de aparelhos de refrigeração da frota

**Tipos de Equipamento:**
- Freezer (congelamento)
- Resfriado (refrigeração)
- Climatizado (climatização)

**Dados do Equipamento:**
- Marca
- Modelo
- Número de série (único)
- Tipo (freezer, cooled, climatized)
- Temperatura mínima
- Temperatura máxima
- Tipo de combustível (Diesel ou Gasolina)
- Empresa proprietária
- Fornecedor
- Data de aquisição
- Horímetro inicial (horas de uso na compra)
- Horímetro atual (atualizado via abastecimentos)
- Preço de compra
- Status: ativo, manutenção, defeito, inativo, vendido
- Veículo vinculado (opcional - pode ser veículo de tração ou reboque)

**Regras de Negócio:**
- Número de série deve ser único
- Equipamento pode estar vinculado a apenas um veículo (tração ou reboque)
- Equipamentos podem ser vinculados a:
  - Veículos de tração (cavalo mecânico, truck, etc.) - montado no próprio veículo
  - Veículos de reboque (baú frigorífico, carreta, etc.) - montado no reboque
- Ao listar equipamentos por veículo de tração:
  - Mostra equipamentos vinculados diretamente ao veículo
  - Mostra equipamentos vinculados aos reboques da composição
- Equipamentos vendidos não podem ser editados
- Equipamentos inativos não podem ser vinculados a veículos
- Ao vincular a veículo, se status não for válido (ativo/defeito), muda para ativo automaticamente

**Regras de Status:**
- **Ativo**: Equipamento operacional
- **Defeito**: Equipamento com problema técnico (pode estar vinculado a veículo)
- **Manutenção**: Equipamento em manutenção (NÃO pode estar vinculado a veículo)
- **Inativo**: Equipamento parado (NÃO pode estar vinculado a veículo)
- **Vendido**: Equipamento vendido (não pode mais ser editado)

**Regras de Vinculação:**
- Equipamentos vinculados a veículo só podem ter status "ativo" ou "defeito"
- Ao tentar mudar para manutenção/inativo enquanto vinculado, operação é bloqueada
- Ao desvincular, equipamento pode ter qualquer status

**Validações:**
- Número de série: obrigatório, único
- Temperatura mínima: menor que temperatura máxima
- Temperatura máxima: maior que temperatura mínima
- Horímetro inicial: maior ou igual a 0
- Preço de compra: maior que 0
- Tipo de combustível: Diesel ou Gasolina

**Operações:**
- Criar equipamento
- Editar equipamento (exceto vendidos)
- Excluir equipamento
- Alterar status (com validações de vínculo)
- Vincular/desvincular veículo
- Vender equipamento (com dados do comprador)
- Reverter venda (apenas admin)
- Visualizar detalhes completos
- Exportar relatório Excel

**Cálculos Automáticos:**
- Horímetro atual (baseado em abastecimentos)
- Consumo médio (l/h)

### 7.2 Venda de Equipamentos

**Funcionalidade:** Registro de venda de equipamentos de refrigeração

**Dados da Venda:**
- Nome do comprador
- CPF/CNPJ do comprador
- Data da venda
- Horímetro no momento da venda
- Preço de venda

**Regras de Negócio:**
- Ao vender equipamento:
  - Status muda para "vendido"
  - Veículo é desvinculado automaticamente
- Apenas admin pode reverter venda
- Ao reverter venda:
  - Status volta para "ativo"
  - Veículo NÃO é vinculado automaticamente

---

## 8. MÓDULO DE FORNECEDORES

### 8.1 Gestão de Fornecedores

**Funcionalidade:** Cadastro de fornecedores e prestadores de serviço

**Tipos de Fornecedor:**
- Posto de Combustível (gas_station)
- Oficina (workshop)
- Concessionária (dealer)
- Loja de Peças e Componentes (parts_store)
- Loja de Pneus (tire_store)
- Equipamentos de Refrigeração (refrigeration_equipment)
- Outros (other)

**Dados do Fornecedor:**

**Pessoa Jurídica:**
- Nome fantasia (opcional)
- Razão social
- CNPJ (único)
- Tipo de fornecedor
- Bandeira (para postos - opcional)
- Cidade
- Estado
- Matriz/Filiais vinculadas (ao menos uma)
- Status: ativo/inativo

**Pessoa Física:**
- Nome completo
- CPF (único)
- Tipo de fornecedor
- Cidade
- Estado
- Matriz/Filiais vinculadas (ao menos uma)
- Status: ativo/inativo

**Regras de Negócio:**
- CNPJ ou CPF deve ser único
- Fornecedor deve estar vinculado a pelo menos uma empresa
- Postos de combustível podem ter campo "Bandeira" (Shell, Petrobras, Ipiranga, etc.)
- Apenas fornecedores ativos aparecem em seleções de abastecimento
- Fornecedor pode ser criado rapidamente durante cadastro de abastecimento

**Validações:**
- Se PJ: CNPJ obrigatório e único
- Se PF: CPF obrigatório e único
- Nome/Razão Social: obrigatório
- Cidade e Estado: obrigatórios
- Tipo: obrigatório
- Filiais: ao menos uma selecionada

**Operações:**
- Criar fornecedor (PJ ou PF)
- Editar fornecedor
- Ativar/Inativar fornecedor
- Excluir fornecedor
- Visualizar detalhes completos
- Cadastro rápido durante abastecimento

---

## 9. MÓDULO DE DASHBOARD

### 9.1 Dashboard Operacional

**Funcionalidade:** Visão geral das operações da frota

**Abas:**
1. Dashboard de Veículos
2. Dashboard de Refrigeração

### 9.2 Dashboard de Veículos

**Estatísticas Exibidas:**
- Total de veículos na frota
- Disponibilidade da frota (% ativos)
- Consumo médio da frota (km/l)
- Custo total com combustível (mês atual)

**Gráficos e Informações:**
- Status da Frota:
  - Total por status (ativo, manutenção, defeito, inativo, vendido)
  - Barra de progresso visual com percentuais
- Top 5 Veículos por Consumo:
  - Toggle entre mais econômicos / menos econômicos
  - Lista com consumo médio em km/l
- Últimos Abastecimentos:
  - 10 abastecimentos mais recentes
  - Informações: veículo, motorista, data, litros, valor

**Cálculos:**
- Disponibilidade = (veículos ativos / total de veículos) × 100
- Consumo médio = média do consumo de todos os veículos com abastecimentos
- Custo combustível = soma dos abastecimentos do mês atual

### 9.3 Dashboard de Refrigeração

**Estatísticas Exibidas:**
- Total de equipamentos
- Equipamentos disponíveis (% ativos)
- Consumo médio (l/h)
- Custo total com combustível (mês atual)

**Gráficos e Informações:**
- Status dos Equipamentos:
  - Total por status (ativo, manutenção, defeito, inativo, vendido)
  - Barra de progresso visual com percentuais
- Top 5 Equipamentos por Consumo:
  - Toggle entre mais econômicos / menos econômicos
  - Lista com consumo médio em l/h
- Últimos Abastecimentos:
  - 10 abastecimentos mais recentes
  - Informações: equipamento, veículo vinculado, data, litros, valor

**Cálculos:**
- Disponibilidade = (equipamentos ativos / total de equipamentos) × 100
- Consumo médio = média do consumo de todos os equipamentos com abastecimentos
- Custo combustível = soma dos abastecimentos do mês atual

---

## 10. RECURSOS TRANSVERSAIS

### 10.1 Busca e Filtros

**Busca Textual:**
- Veículos: por placa, modelo, chassi ou motorista
- Motoristas: por nome, CPF ou categoria CNH
- Fornecedores: por nome fantasia, razão social, CNPJ/CPF ou cidade
- Empresas: por nome ou CNPJ
- Refrigeração: por marca, modelo ou número de série

**Filtros Avançados (Abastecimentos):**
- Período (data inicial e final)
- Veículo
- Equipamento de refrigeração
- Veículo vinculado ao equipamento
- Motorista
- Fornecedor

### 10.2 Infinite Scroll

**Funcionalidade:** Carregamento progressivo de listas

**Configuração:**
- Itens iniciais: 20
- Itens por página: 10
- Implementado em: veículos, motoristas, fornecedores, empresas, equipamentos

### 10.3 Exportação de Relatórios

**Formato:** Excel (.xlsx)

**Relatórios Disponíveis:**
- Relatório de Veículos
- Relatório de Abastecimentos de Veículos
- Relatório de Abastecimentos de Refrigeração
- Relatório de Equipamentos de Refrigeração

**Dados Exportados:**
Cada relatório exporta todos os dados relevantes da entidade, incluindo relacionamentos (motorista, empresa, fornecedor, etc.)

### 10.4 Upload de Documentos

**Formatos Aceitos:**
- Imagens: jpg, jpeg, png, gif
- Documentos: PDF

**Locais de Upload:**
- CNH de motoristas (foto ou PDF)
- Foto de veículos
- Comprovantes de pagamento (abastecimentos)
- Notas fiscais (abastecimentos)

**Armazenamento:**
Base64 (demonstração - em produção usar storage real)

---

## 10.5 Notificações (Toast)

**Tipos de Notificação:**
- Sucesso: operações concluídas
- Erro: validações falhadas
- Alerta: avisos importantes
- Info: informações gerais

**Eventos Notificados:**
- Criação/edição/exclusão de registros
- Alterações de status
- Vínculos e desvínculos
- Validações de regras de negócio
- Exportações de relatórios

---

## 11. VALIDAÇÕES GERAIS DO SISTEMA

### 11.1 Validações de Dados

**Strings:**
- Trim automático (remoção de espaços)
- Limite de caracteres específico por campo
- Caracteres especiais validados conforme necessidade

**Datas:**
- Formato: ISO 8601 (YYYY-MM-DD)
- Datas futuras: validadas conforme regra de negócio
- Datas de validade: devem ser futuras

**Números:**
- Valores monetários: sempre positivos
- Quilometragem/Horímetro: sempre crescente
- Eixos: entre 1 e 20
- Ano: entre 1900 e ano atual + 1

**Documentos:**
- CPF: formato 000.000.000-00, único
- CNPJ: formato 00.000.000/0000-00, único
- Email: formato válido, único
- Placa: formato ABC1234 ou ABC1D23, único
- Chassi: mínimo 17 caracteres, único

### 11.2 Integridade Referencial

**Cascata e Proteções:**
- Empresa com filiais: não pode ser excluída
- Veículo de tração com composição: ao inativar, composições são alteradas
- Reboque em composição: ao inativar, é desvinculado
- Equipamento vinculado a veículo: validações de status
- Veículo vendido com equipamento: opções de venda ou desvinculação

**Desvinculações Automáticas:**
- Motorista ao vender veículo
- Reboques ao vender veículo de tração
- Equipamento de refrigeração ao vender (opcional)
- Reboque ao mudar status para inativo/manutenção/defeito

---

## 12. REGRAS DE INTERFACE E UX

### 12.1 Responsividade

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Ajustes Mobile:**
- Cards em coluna única
- Botões em largura total
- Informações condensadas
- Ordem otimizada de exibição

### 12.2 Feedback Visual

**Estados de Componentes:**
- Loading: skeleton screens e spinners
- Vazio: mensagens informativas
- Erro: mensagens de erro claras
- Sucesso: confirmações visuais

**Badges de Status:**
- Cores consistentes por status
- Ícones quando relevante
- Tooltips explicativos

### 12.3 Confirmações de Ações Críticas

**Ações que Requerem Confirmação:**
- Exclusão de registros
- Alteração de status ativo/inativo
- Venda de veículos/equipamentos
- Reversão de vendas

**Dialogs de Confirmação:**
- Título claro da ação
- Descrição do impacto
- Botões de confirmação e cancelamento
- Highlight no botão de risco

---

## 13. REGRAS DE CÁLCULO

### 13.1 Consumo de Veículos

**Fórmula:** `Consumo (km/l) = Km Percorrido / Litros Consumidos`

**Regras:**
- Requer no mínimo 2 abastecimentos
- Usa todos os abastecimentos do veículo
- Km percorrido = último km - primeiro km
- Litros consumidos = soma de todos os abastecimentos
- Veículos de reboque nunca têm consumo calculado

### 13.2 Consumo de Refrigeração

**Fórmula:** `Consumo (l/h) = Litros Consumidos / Horas Utilizadas`

**Regras:**
- Usa horímetro inicial da compra
- Horímetro atual = último abastecimento
- Horas utilizadas = horímetro atual - horímetro inicial
- Litros consumidos = soma de todos os abastecimentos

### 13.3 Custos

**Custo Total de Abastecimento:** `Litros × Preço por Litro`

**Custo Mensal:** Soma de todos os abastecimentos do mês atual

**Disponibilidade da Frota:** `(Veículos Ativos / Total de Veículos) × 100`

---

## 14. ESTRUTURA DE DADOS

### 14.1 Relacionamentos Principais

**Usuário:**
- Pertence a uma empresa (vínculo empregatício)
- Tem acesso a múltiplas empresas (operacional)
- Possui permissões customizadas

**Veículo:**
- Pertence a uma empresa
- Fornecido por um fornecedor (concessionária)
- Pode ter um motorista vinculado (apenas veículos de tração)
- Pode ter composições/reboques (apenas veículos de tração)
- Pode ter equipamento(s) de refrigeração vinculado(s):
  - Veículo de tração: equipamentos montados diretamente nele
  - Veículo de reboque: equipamentos montados no reboque
  - Veículo de tração com composição: todos equipamentos da composição
- Possui múltiplos abastecimentos (apenas veículos de tração)

**Motorista:**
- Vinculado a múltiplas empresas
- Pode estar vinculado a um veículo
- Realiza abastecimentos

**Equipamento de Refrigeração:**
- Pertence a uma empresa
- Fornecido por um fornecedor
- Pode estar vinculado a um veículo (tração ou reboque)
- Equipamentos em reboques aparecem automaticamente ao filtrar pelo veículo de tração da composição
- Possui múltiplos abastecimentos

**Abastecimento:**
- Vinculado a um veículo OU equipamento de refrigeração
- Realizado por um motorista
- Em um fornecedor (posto)

**Fornecedor:**
- Vinculado a múltiplas empresas
- Fornece veículos, equipamentos ou combustível

**Empresa:**
- Matriz pode ter múltiplas filiais
- Filial pertence a uma matriz
- Possui veículos, equipamentos, usuários, etc.

---

## 15. CONSIDERAÇÕES FINAIS

### 15.1 Dados Mock

Sistema atualmente utiliza dados mock (simulados) para demonstração. Estrutura preparada para integração com backend real.

**Exemplo de Vinculação de Equipamentos:**
- Veículo NOP-2468 (Cavalo Mecânico Volvo FH 460):
  - 1 equipamento vinculado diretamente (Thermo King TriPac Evolution - climatizado)
  - 2 equipamentos vinculados em reboques da composição:
    - Reboque QRS-3579 (Baú Frigorífico): Thermo King SLXi-400 (freezer)
    - Reboque TUV-4680 (Baú Frigorífico): Carrier Supra 1050 (freezer)
  - Total: 3 equipamentos aparecem ao filtrar por NOP-2468

**Exemplo de Vinculação de Motorista:**
- Equipamentos em reboques herdam motorista do veículo de tração
- NOP-2468 tem motorista Carlos Santos (ID '1')
- Todos os 3 equipamentos herdam este motorista para abastecimentos

### 15.2 Autenticação

Sistema usa autenticação simples com localStorage. Em produção, deve-se implementar:
- Tokens JWT
- Refresh tokens
- Autenticação via backend
- Controle de sessão seguro

### 15.3 Storage

Uploads de imagens/documentos usam base64. Em produção, deve-se implementar:
- Storage em nuvem (S3, Google Cloud Storage, etc.)
- URLs públicas ou assinadas
- Otimização de imagens
- Limites de tamanho

### 15.4 Próximos Passos

Este documento serve como base para:
- Desenvolvimento do banco de dados
- Criação de APIs (backend)
- Documentação técnica (Swagger/OpenAPI)
- Refinamento do PRD (Product Requirements Document)
- Planejamento de sprints de desenvolvimento
- Testes e validações

---

**Versão:** 1.0  
**Data:** 2025  
**Sistema:** FleetPro - Gestão de Frota  
**Ambiente:** React + TypeScript + Vite