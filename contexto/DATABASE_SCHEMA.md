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

## Diagrama de Relacionamentos

```
Organization (1) ────────< (N) User
```

Uma organização pode ter múltiplos usuários, mas cada usuário pertence a apenas uma organização.

---

## Tecnologias

- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **ID Generation**: CUID (Collision-resistant Unique Identifier)

