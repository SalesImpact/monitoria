# Transição AbacusAI para nosso App
Transição do prototipo do AbacusAI para uma aplicação completa com todas as funcionalidades e páginas.

## Features
- Autenticação via token JWT
- Usuários
- Multi-tenancy
- Puxar calls do banco de dados do pitch intelligence (outro app) via API ou diretamente do banco de dados
- Analisar calls de acordo com os critérios e salvar em nosso banco de dados

## Roles
- Admin (alta)
- Manager (média)
- SDR (baixa)

## Páginas
- Login
  - Escolher empresa (se user for admin)
- Dashboard
- Monitoria de Ligações (listagem de ligações)
- Análise por SDR (por SDR, por critério, por objeções)
- Coaching com IA (recomendações para melhorias os SDRs de acordo com as ligações)
- Roleplay (link para o app de roleplay)
- Melhores Práticas (seção educacional com scripts, vídeos e avaliações/provas)
- Tendências
- Guia/Manual do sistema (metodologia, critérios, funcionalidades, como usar)

## Fases de desenvolvimento
- Fase 1: Autenticação, Usuários, Multi-tenancy
  - Páginas: Login e "Escolher empresa" (se user for admin)
- Fase 2: Páginas estáticas
  - Páginas: Roleplay (link para o app de Roleplay) e Guia/Manual do sistema (já feito!)
- Fase 3: Puxar calls do banco de dados do pitch intelligence (outro app) via API ou diretamente do banco de dados 
  - Páginas: Monitoria de Ligações (listagem de ligações) 
- Fase 4: Analisar calls de acordo com os critérios e salvar em nosso banco de dados
- Fase 5: Página das análises das ligações
  - Páginas: Análise por SDR (por SDR, por critério, por objeções)
- Fase 6: Coaching com IA (recomendações para melhorias os SDRs de acordo com as ligações) - salvar no banco de dados?