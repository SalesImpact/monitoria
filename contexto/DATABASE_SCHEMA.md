# Schema do Banco de Dados

Este documento descreve a estrutura dos schemas do banco de dados PostgreSQL utilizado no projeto.

## Models

### Organization

Representa uma organização no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único da organização |
| `name` | String | Nome da organização |
| `slug` | String | Identificador único em formato slug (URL-friendly) |
| `users` | User[] | Relacionamento com usuários da organização |
| `createdAt` | DateTime | Data de criação do registro |
| `updatedAt` | DateTime | Data da última atualização do registro |

**Constraints:**
- `slug` é único
- Tabela mapeada como `organizations`

**Relacionamentos:**
- Um para muitos com `User` (uma organização pode ter múltiplos usuários)

---

### User

Representa um usuário do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único do usuário |
| `name` | String? | Nome do usuário (opcional) |
| `email` | String | Email do usuário |
| `password` | String? | Hash da senha (opcional, para autenticação) |
| `emailVerified` | DateTime? | Data de verificação do email (opcional) |
| `image` | String? | URL da imagem de perfil (opcional) |
| `role` | String? | Papel do usuário no sistema (padrão: "sdr") |
| `organizationId` | String | ID da organização à qual o usuário pertence |
| `meetimeId` | String? | ID externo do Meetime (opcional) |
| `lastLogin` | DateTime? | Data do último login (opcional) |
| `organization` | Organization | Relacionamento com a organização |
| `createdAt` | DateTime | Data de criação do registro |
| `updatedAt` | DateTime | Data da última atualização do registro |

**Constraints:**
- Combinação `email` + `organizationId` é única (um email pode existir em múltiplas organizações, mas não duas vezes na mesma organização)
- Tabela mapeada como `users`

**Relacionamentos:**
- Muitos para um com `Organization` (múltiplos usuários pertencem a uma organização)

---

### MonitoriaCallScore

Representa os scores detalhados de análise de uma ligação (call), contendo avaliações de 16 critérios específicos organizados em 4 categorias.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único do score |
| `callId` | String | ID da ligação relacionada (chave estrangeira) |
| `saudacaoApresentacao` | Float | Score de saudação e apresentação (0-5) |
| `apresentacaoEmpresa` | Float | Score de apresentação da empresa (0-5) |
| `solicitacaoConfirmacaoNome` | Float | Score de confirmação do nome (0-5) |
| `tomVoz` | Float | Score do tom de voz (0-5) |
| `rapport` | Float | Score de rapport estabelecido (0-5) |
| `perguntasValidacao` | Float | Score de perguntas de validação (0-5) |
| `escutaAtiva` | Float | Score de escuta ativa (0-5) |
| `pitchSolucao` | Float | Score do pitch da solução (0-5) |
| `historiaCliente` | Float | Score de uso de histórias de cliente (0-5) |
| `perguntasSituacao` | Float | Score de perguntas de situação - SPIN (0-5) |
| `perguntasProblema` | Float | Score de perguntas de problema - SPIN (0-5) |
| `perguntasImplicacao` | Float | Score de perguntas de implicação - SPIN (0-5) |
| `perguntasNecessidadeSolucao` | Float | Score de perguntas de necessidade-solução - SPIN (0-5) |
| `confirmouEntendimento` | Float | Score de confirmação de entendimento (0-5) |
| `vendeuProximoPasso` | Float | Score de venda do próximo passo (0-5) |
| `agendouConcluiu` | Float | Score de agendamento/conclusão (0-5) |
| `nivelEngajamentoCliente` | Float? | Nível de engajamento do cliente (opcional) |
| `confiancaSdr` | Float? | Nível de confiança do SDR (opcional) |
| `averageScore` | Float | Média calculada de todos os critérios (0-5) |
| `weightedScore` | Float | Score ponderado calculado (0-5) |
| `aiFeedback` | String? | Feedback qualitativo gerado pela IA (opcional) |
| `createdAt` | DateTime | Data de criação do registro |
| `updatedAt` | DateTime | Data da última atualização do registro |

**Constraints:**
- `callId` é único (uma ligação pode ter apenas um score)
- Todos os scores de critérios devem estar entre 0 e 5
- Tabela mapeada como `monitoria_call_scores`

**Categorias de Critérios:**

1. **ABERTURA (5 critérios):**
   - Saudação e Apresentação
   - Apresentação da Empresa
   - Solicitação/Confirmação do Nome
   - Tom de Voz
   - Rapport

2. **VALIDAÇÃO DO OBJETIVO (4 critérios):**
   - Perguntas de Validação
   - Escuta Ativa
   - Pitch da Solução
   - História do Cliente

3. **SPIN SELLING (4 critérios):**
   - Perguntas de Situação
   - Perguntas de Problema
   - Perguntas de Implicação
   - Perguntas de Necessidade-Solução

4. **PRÓXIMOS PASSOS (3 critérios):**
   - Confirmou Entendimento
   - Vendeu Próximo Passo
   - Agendou/Concluiu

**Relacionamentos:**
- Muitos para um com `Call` (uma ligação pode ter um score detalhado)

---

## Diagrama de Relacionamentos

```
Organization (1) ────────< (N) User
Call (1) ────────< (1) MonitoriaCallScore
```

Uma organização pode ter múltiplos usuários, mas cada usuário pertence a apenas uma organização.
Uma ligação pode ter um score detalhado, estabelecendo relação 1:1.

---

## Tecnologias

- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **ID Generation**: CUID (Collision-resistant Unique Identifier)

