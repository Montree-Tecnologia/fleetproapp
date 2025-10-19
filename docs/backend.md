# Plano de Implementação - Backend Real com PostgreSQL
# FleetPro - Sistema de Gestão de Frotas

## 📋 Resumo Executivo

Este documento detalha o plano para migrar o FleetPro de dados simulados (mock) para um backend real com PostgreSQL, mantendo toda a funcionalidade existente e preparando para produção.

---

## 🎯 Objetivos

1. **Substituir dados mock por banco PostgreSQL real**
2. **Implementar autenticação segura com JWT**
3. **Criar APIs RESTful completas para todas as entidades**
4. **Manter compatibilidade total com frontend existente**
5. **Preparar aplicação para deploy em produção**

---

## 🏗️ Arquitetura Atual vs Proposta

### Estado Atual
```
Frontend (React) → useMockData hook → localStorage
                 → Mock authentication → sessionStorage
```

### Arquitetura Proposta
```
Frontend (React) → TanStack Query → API REST → Express
                 → JWT Auth       → Middleware → PostgreSQL (Neon)
                 → Interceptors   → Drizzle ORM → Cloud Storage
```

---

## 📦 Dependências Necessárias

### Já Instaladas ✅
- `express` - Servidor web
- `drizzle-orm` - ORM type-safe
- `drizzle-zod` - Validação de schemas
- `tsx` - Runtime TypeScript
- `zod` - Validação de dados

### A Instalar 📦
```bash
# Autenticação e Segurança
- jsonwebtoken         # Tokens JWT
- bcryptjs            # Hash de senhas
- cors                # CORS handling
- helmet              # Security headers
- express-rate-limit  # Rate limiting

# Database
- postgres            # Cliente PostgreSQL
- @neondatabase/serverless  # Neon DB client

# Utilities
- dotenv              # Variáveis de ambiente
- multer              # Upload de arquivos
- sharp               # Processamento de imagens

# Development
- drizzle-kit         # Migrações e CLI
- @types/jsonwebtoken # TypeScript types
- @types/bcryptjs     # TypeScript types
- @types/multer       # TypeScript types
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. companies (Multi-tenant base)
```sql
- id: serial primary key
- name: varchar(255) not null
- cnpj: varchar(14) unique not null
- type: enum('matriz', 'filial') not null
- parent_company_id: integer references companies(id)
- logo_url: text
- address: text
- city: varchar(100)
- state: varchar(2)
- postal_code: varchar(8)
- phone: varchar(20)
- email: varchar(255)
- active: boolean default true
- created_at: timestamp default now()
- updated_at: timestamp
```

#### 2. users (Sistema de autenticação)
```sql
- id: serial primary key
- username: varchar(50) unique not null
- password_hash: varchar(255) not null
- name: varchar(255) not null
- email: varchar(255) unique
- role: enum('admin', 'gestor', 'operador') not null
- company_id: integer references companies(id) not null
- primary_company_id: integer references companies(id) not null
- accessible_companies: integer[] -- array de IDs de empresas
- permissions: jsonb -- permissões customizadas
- active: boolean default true
- last_login: timestamp
- created_at: timestamp default now()
- updated_at: timestamp
```

#### 3. vehicles (Gestão de veículos)
```sql
- id: serial primary key
- plate: varchar(10) unique not null
- chassis: varchar(20) unique not null
- renavam: varchar(15) unique not null
- brand: varchar(50) not null
- model: varchar(100) not null
- manufacturing_year: integer not null
- model_year: integer not null
- color: varchar(30)
- vehicle_type: varchar(50) not null
- status: enum('active','defective','maintenance','inactive','sold') not null
- fuel_type: varchar(30) not null
- axles: integer
- weight: decimal(10,2)
- current_km: integer not null
- purchase_km: integer not null
- purchase_date: date not null
- purchase_value: decimal(12,2) not null
- supplier_id: integer references suppliers(id)
- owner_company_id: integer references companies(id) not null
- assigned_companies: integer[] -- empresas com acesso
- driver_id: integer references drivers(id)
- has_composition: boolean default false
- composition_data: jsonb -- dados das carretas
- images: jsonb -- array de URLs
- documents: jsonb -- CRLV, nota fiscal, etc
- sale_info: jsonb -- informações de venda se vendido
- created_at: timestamp default now()
- updated_at: timestamp
```

#### 4. drivers (Motoristas)
```sql
- id: serial primary key
- name: varchar(255) not null
- cpf: varchar(11) unique not null
- birth_date: date not null
- cnh_number: varchar(15) unique not null
- cnh_category: varchar(5) not null
- cnh_validity: date not null
- cnh_document_url: text
- phone: varchar(20)
- email: varchar(255)
- address: text
- active: boolean default true
- company_id: integer references companies(id) not null
- accessible_companies: integer[]
- created_at: timestamp default now()
- updated_at: timestamp
```

#### 5. refrigeration_units (Equipamentos de refrigeração)
```sql
- id: serial primary key
- vehicle_id: integer references vehicles(id)
- company_id: integer references companies(id) not null
- brand: varchar(50) not null
- model: varchar(100) not null
- serial_number: varchar(50) unique not null
- type: enum('freezer','cooled','climatized') not null
- min_temp: decimal(5,2) not null
- max_temp: decimal(5,2) not null
- install_date: date not null
- purchase_date: date
- purchase_value: decimal(12,2)
- supplier_id: integer references suppliers(id)
- purchase_invoice_url: text
- status: enum('active','defective','maintenance','inactive','sold') not null
- initial_usage_hours: integer
- current_usage_hours: integer
- fuel_type: varchar(30)
- sale_info: jsonb
- created_at: timestamp default now()
- updated_at: timestamp
```

#### 6. suppliers (Fornecedores)
```sql
- id: serial primary key
- name: varchar(255) not null
- fantasy_name: varchar(255)
- cnpj: varchar(14)
- cpf: varchar(11)
- type: varchar(50) not null
- brand: varchar(50)
- address: text
- city: varchar(100) not null
- state: varchar(2) not null
- postal_code: varchar(8)
- phone: varchar(20)
- email: varchar(255)
- contact_person: varchar(255)
- company_id: integer references companies(id) not null
- accessible_companies: integer[]
- active: boolean default true
- created_at: timestamp default now()
- updated_at: timestamp
```

#### 7. refuelings (Abastecimentos)
```sql
- id: serial primary key
- type: enum('vehicle','refrigeration') not null
- vehicle_id: integer references vehicles(id)
- refrigeration_unit_id: integer references refrigeration_units(id)
- date: timestamp not null
- km: integer -- para veículos
- usage_hours: integer -- para refrigeração
- fuel_type: varchar(30) not null
- liters: decimal(10,2) not null
- price_per_liter: decimal(6,3) not null
- total_value: decimal(12,2) not null
- supplier_id: integer references suppliers(id) not null
- driver_id: integer references drivers(id) not null
- city: varchar(100)
- state: varchar(2)
- payment_receipt_url: text
- fiscal_note_url: text
- company_id: integer references companies(id) not null
- created_at: timestamp default now()
- updated_at: timestamp
```

### Índices Importantes
```sql
-- Performance
CREATE INDEX idx_vehicles_company ON vehicles(owner_company_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_refuelings_date ON refuelings(date DESC);
CREATE INDEX idx_refuelings_vehicle ON refuelings(vehicle_id);
CREATE INDEX idx_users_company ON users(company_id);

-- Busca
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_drivers_cpf ON drivers(cpf);
CREATE INDEX idx_suppliers_cnpj ON suppliers(cnpj);
```

---

## 🔐 Autenticação e Autorização

### JWT Strategy
```typescript
// Token Payload
interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  companyId: number;
  accessibleCompanies: number[];
  permissions: string[];
}

// Token Configuration
- Access Token: 24h expiry
- Refresh Token: 30d expiry (future)
- Secret: Strong random string in .env
```

### Middleware de Autenticação
```typescript
// server/middleware/auth.ts
- Validar JWT em todas rotas /api/* (exceto login)
- Adicionar user data ao req.user
- Verificar permissões por rota
- Rate limiting por IP/user
```

---

## 📁 Estrutura de Pastas do Backend

```
server/
├── config/
│   ├── database.ts      # Configuração Drizzle + Neon
│   ├── auth.ts          # Configuração JWT
│   └── storage.ts       # Configuração upload
├── db/
│   ├── schema/          # Schemas Drizzle por módulo
│   │   ├── companies.ts
│   │   ├── users.ts
│   │   ├── vehicles.ts
│   │   ├── drivers.ts
│   │   ├── refrigeration.ts
│   │   ├── suppliers.ts
│   │   └── refuelings.ts
│   ├── migrations/      # Arquivos de migração
│   └── seed.ts         # Dados iniciais
├── middleware/
│   ├── auth.ts         # Autenticação JWT
│   ├── validation.ts   # Validação Zod
│   ├── errorHandler.ts # Tratamento de erros
│   └── multiTenant.ts  # Filtro multi-tenant
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── vehicle.service.ts
│   ├── driver.service.ts
│   ├── refrigeration.service.ts
│   ├── supplier.service.ts
│   ├── refueling.service.ts
│   └── dashboard.service.ts
├── routes/
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── vehicle.routes.ts
│   ├── driver.routes.ts
│   ├── refrigeration.routes.ts
│   ├── supplier.routes.ts
│   ├── refueling.routes.ts
│   └── dashboard.routes.ts
├── utils/
│   ├── validators.ts   # CPF, CNPJ, etc
│   ├── formatters.ts   # Formatação de dados
│   └── logger.ts       # Winston logger
└── index.ts            # Entry point
```

---

## 🔄 Plano de Migração

### Fase 1: Setup Inicial (2-3 horas)
- [ ] Configurar PostgreSQL no Replit (Neon)
- [ ] Instalar dependências necessárias
- [ ] Criar estrutura de pastas
- [ ] Configurar Drizzle com Neon
- [ ] Criar schemas completos no Drizzle
- [ ] Gerar e executar migrations iniciais

### Fase 2: Autenticação (3-4 horas)
- [ ] Implementar hash de senhas com bcrypt
- [ ] Criar serviço de autenticação JWT
- [ ] Implementar middleware de autenticação
- [ ] Criar rotas de login/logout
- [ ] Adicionar refresh token (opcional)
- [ ] Migrar seed de usuários iniciais

### Fase 3: Implementação de Services (6-8 horas)
- [ ] Criar BaseService com operações CRUD comuns
- [ ] Implementar CompanyService (multi-tenant base)
- [ ] Implementar UserService com permissões
- [ ] Implementar VehicleService com composições
- [ ] Implementar DriverService
- [ ] Implementar RefrigerationService
- [ ] Implementar SupplierService
- [ ] Implementar RefuelingService
- [ ] Implementar DashboardService (agregações)

### Fase 4: Rotas e Controllers (4-5 horas)
- [ ] Criar rotas RESTful para cada entidade
- [ ] Implementar filtros multi-tenant
- [ ] Adicionar validação com Zod
- [ ] Implementar paginação
- [ ] Adicionar busca e filtros
- [ ] Implementar upload de arquivos

### Fase 5: Migração de Dados (2-3 horas)
- [ ] Criar script de migração de mock data
- [ ] Mapear estrutura antiga para nova
- [ ] Migrar imagens/documentos base64 para URLs
- [ ] Popular banco com dados de exemplo
- [ ] Validar integridade dos dados

### Fase 6: Integração Frontend (3-4 horas)
- [ ] Atualizar configuração do TanStack Query
- [ ] Criar interceptor para JWT
- [ ] Atualizar hooks de autenticação
- [ ] Substituir useMockData por chamadas API
- [ ] Implementar tratamento de erros
- [ ] Testar todos os fluxos

### Fase 7: Otimizações (2-3 horas)
- [ ] Implementar cache com Redis (opcional)
- [ ] Adicionar compressão gzip
- [ ] Otimizar queries N+1
- [ ] Implementar logs estruturados
- [ ] Adicionar métricas de performance

### Fase 8: Preparação para Deploy (1-2 horas)
- [ ] Configurar variáveis de ambiente
- [ ] Implementar health checks
- [ ] Configurar CORS para produção
- [ ] Adicionar rate limiting
- [ ] Documentar API (Swagger opcional)
- [ ] Criar script de deploy

---

## 🔧 Configurações Necessárias

### Variáveis de Ambiente (.env)
```bash
# Database
DATABASE_URL=postgresql://...@neon.tech/fleetpro

# Auth
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

# Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# App
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Scripts NPM Atualizados
```json
{
  "scripts": {
    "dev": "tsx watch --clear-screen=false server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "tsx server/db/migrate.ts",
    "db:push": "drizzle-kit push:pg",
    "db:seed": "tsx server/db/seed.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 🚀 Implementação por Etapas

### Etapa 1: Database Setup
```typescript
// server/config/database.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Etapa 2: Autenticação
```typescript
// server/services/auth.service.ts
export class AuthService {
  async login(username: string, password: string) {
    // 1. Buscar usuário
    // 2. Validar senha com bcrypt
    // 3. Gerar JWT
    // 4. Retornar token + user data
  }

  async validateToken(token: string) {
    // 1. Verificar JWT
    // 2. Buscar usuário atualizado
    // 3. Retornar user data
  }
}
```

### Etapa 3: Multi-tenant Middleware
```typescript
// server/middleware/multiTenant.ts
export const multiTenantFilter = (req, res, next) => {
  const user = req.user;
  const companyId = req.params.companyId || user.companyId;
  
  // Verificar se usuário tem acesso à empresa
  if (!user.accessibleCompanies.includes(companyId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  req.companyId = companyId;
  next();
};
```

---

## 📊 Métricas de Sucesso

### Performance
- [ ] Tempo de resposta API < 200ms (P95)
- [ ] Queries de dashboard < 500ms
- [ ] Upload de arquivos < 2s para 5MB

### Segurança
- [ ] Todas senhas com hash bcrypt
- [ ] JWT em todas rotas protegidas
- [ ] Rate limiting ativo
- [ ] Dados isolados por tenant

### Funcionalidade
- [ ] 100% das features do mock funcionando
- [ ] Sem regressões no frontend
- [ ] Dados persistentes
- [ ] Multi-tenant funcionando

---

## 🐛 Tratamento de Erros

### Padrão de Resposta de Erro
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

// Exemplos:
// 400: Validação
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Dados inválidos",
    details: { field: "cnpj", error: "CNPJ inválido" }
  }
}

// 401: Não autenticado
{
  error: {
    code: "UNAUTHORIZED",
    message: "Token inválido ou expirado"
  }
}

// 403: Sem permissão
{
  error: {
    code: "FORBIDDEN",
    message: "Sem permissão para acessar este recurso"
  }
}
```

---

## 🔄 Compatibilidade com Frontend

### Mapeamento de Endpoints
```
Frontend (atual)         →  Backend (novo)
/api/login              →  /api/auth/login
/api/users              →  /api/users
/api/vehicles           →  /api/vehicles
/api/drivers            →  /api/drivers
/api/refuelings         →  /api/refuelings
/api/refrigeration      →  /api/refrigeration
/api/suppliers          →  /api/suppliers
/api/companies          →  /api/companies
/api/dashboard/stats    →  /api/dashboard/stats
```

### Mudanças no Frontend
1. Adicionar interceptor axios/fetch para JWT
2. Atualizar `useAuth` hook para usar localStorage
3. Remover `useMockData` e substituir por API calls
4. Adicionar loading states reais
5. Implementar retry logic

---

## 📝 Notas Importantes

### Decisões de Arquitetura
1. **Neon PostgreSQL**: Escolhido por ser gerenciado e ter free tier generoso
2. **Drizzle ORM**: Type-safe e performático
3. **JWT**: Stateless e escalável
4. **Multi-tenant**: Isolamento por company_id em todas queries
5. **Soft Delete**: Manter histórico com campo `deleted_at`

### Considerações de Segurança
1. Sempre validar company_id do usuário
2. Sanitizar inputs contra SQL injection
3. Limitar tamanho de uploads
4. Implementar CORS restritivo em produção
5. Logs de auditoria para ações críticas

### Pontos de Atenção
1. Migração de imagens base64 para cloud storage
2. Timezone handling (sempre UTC no banco)
3. Paginação para listas grandes
4. Cache de queries pesadas
5. Backup regular do banco

---

## 🎯 Cronograma Estimado

**Tempo Total Estimado: 25-35 horas**

- **Dia 1** (8h): Setup + Autenticação + Início Services
- **Dia 2** (8h): Services + Rotas + Controllers
- **Dia 3** (8h): Migração de Dados + Integração Frontend
- **Dia 4** (4-6h): Testes + Otimizações + Deploy

---

## ✅ Checklist de Conclusão

- [ ] Banco de dados criado e migrations executadas
- [ ] Autenticação JWT funcionando
- [ ] Todas APIs RESTful implementadas
- [ ] Multi-tenant validado
- [ ] Frontend integrado sem erros
- [ ] Upload de arquivos funcionando
- [ ] Dashboard com dados reais
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação pronta para deploy

---

## 📚 Referências

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Neon Database](https://neon.tech/docs)
- [JWT Best Practices](https://www.rfc-editor.org/rfc/rfc8725)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Documento criado em:** Outubro 2025  
**Última atualização:** Outubro 2025  
**Status:** Pronto para execução  
**Prioridade:** Alta