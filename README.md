# Monitoria

## Overview

Sistema de monitoramento e análise de performance de SDRs (Sales Development Representatives). A plataforma utiliza inteligência artificial para analisar ligações de vendas, fornecer feedback detalhado e gerar insights acionáveis para melhoria contínua.

### Principais funcionalidades:
- Análise automatizada de ligações com IA
- Dashboard com métricas e rankings
- Análise de objeções e sentimentos
- Coaching personalizado baseado em dados
- Relatórios e tendências

### Stack tecnológico:
- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **IA**: OpenAI API para análise de áudio e transcrição
- **Visualizações**: Chart.js, Recharts, Plotly.js

## Como Executar

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### 1. Instalar dependências

```bash
cd src
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp env.example.txt .env
```

Edite o arquivo `.env` com suas configurações:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
DATABASE_URL="your_db_url"
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"
```

### 3. Configurar banco de dados

Execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

Opcionalmente, execute o seed para dados iniciais:

```bash
npm run prisma:seed
```

### 4. Executar o projeto

**Desenvolvimento:**
```bash
npm run dev
```
Acesse `http://localhost:3000`

**Produção:**
```bash
npm run build
npm run start
```

**Outros comandos:**
```bash
npm run lint    # Executar linter
```

## Estrutura do Projeto

```
monitoria/
├── src/                          # Código-fonte principal
│   ├── app/                      # Next.js App Router
│   │   ├── (app)/                # Rotas autenticadas
│   │   │   ├── best-practices/   # Melhores práticas
│   │   │   ├── coaching/         # Coaching e treinamento
│   │   │   ├── criteria-analysis/# Análise de critérios
│   │   │   ├── manual/           # Manual do sistema
│   │   │   ├── monitoring/       # Monitoramento de ligações
│   │   │   ├── objections/       # Análise de objeções
│   │   │   ├── organizations/    # Gestão de organizações
│   │   │   ├── profile/          # Perfil do usuário
│   │   │   ├── reports/          # Relatórios
│   │   │   ├── sdr-analysis/     # Análise de SDRs
│   │   │   ├── simulator/        # Simulador
│   │   │   ├── training/         # Treinamento
│   │   │   └── trends/           # Tendências
│   │   ├── api/                  # API Routes
│   │   │   ├── audio/            # Endpoints de áudio
│   │   │   ├── auth/             # Autenticação
│   │   │   ├── calls/            # Gestão de ligações
│   │   │   ├── coaching-data/    # Dados de coaching
│   │   │   ├── dashboard-data/   # Dados do dashboard
│   │   │   ├── organizations/    # API de organizações
│   │   │   └── ...               # Outros endpoints
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── select-organization/  # Seleção de organização
│   │   └── layout.tsx            # Layout raiz
│   ├── components/               # Componentes React
│   │   ├── ui/                   # Componentes UI (shadcn/ui)
│   │   ├── audio-player.tsx      # Player de áudio
│   │   ├── call-monitoring.tsx   # Monitoramento de ligações
│   │   ├── dashboard-nav.tsx     # Navegação do dashboard
│   │   └── ...                   # Outros componentes
│   ├── lib/                      # Bibliotecas e utilitários
│   │   ├── auth.ts               # Configuração de autenticação
│   │   ├── db.ts                 # Cliente Prisma
│   │   ├── types.ts              # Tipos TypeScript
│   │   └── utils.ts              # Funções utilitárias
│   ├── prisma/                   # Schema e migrações Prisma
│   │   ├── schema.prisma         # Schema do banco
│   │   └── migrations/          # Migrações do banco
│   ├── scripts/                  # Scripts utilitários
│   │   ├── analyze-calls.ts     # Análise de ligações
│   │   ├── seed.ts              # Seed do banco
│   │   └── ...                   # Outros scripts
│   ├── hooks/                    # React Hooks customizados
│   ├── data/                     # Dados estáticos
│   ├── middleware.ts             # Middleware Next.js
│   ├── package.json              # Dependências
│   └── next.config.js            # Configuração Next.js
├── contexto/                     # Documentação do projeto
│   ├── DOCUMENTACAO.md          # Documentação completa
│   └── DOCUMENTACAO.pdf         # PDF da documentação
└── README.md                     # Este arquivo
```

### Diretórios principais:

- **`src/app/`**: Rotas e páginas do Next.js (App Router)
- **`src/app/api/`**: Endpoints da API REST
- **`src/components/`**: Componentes React reutilizáveis
- **`src/lib/`**: Utilitários, configurações e helpers
- **`src/prisma/`**: Schema e migrações do banco de dados
- **`src/scripts/`**: Scripts de automação e processamento