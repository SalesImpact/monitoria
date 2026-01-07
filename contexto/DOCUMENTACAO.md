
# 📊 Documentação - Sistema de Monitoramento e Análise de SDRs

## 📋 Sumário

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
3. [Metodologia de Análise](#metodologia-de-análise)
4. [Critérios de Avaliação](#critérios-de-avaliação)
5. [Funcionalidades Principais](#funcionalidades-principais)
6. [Como Usar o Sistema](#como-usar-o-sistema)
7. [Interpretação dos Dados](#interpretação-dos-dados)

---

## 🎯 Visão Geral do Sistema

O **Sistema de Monitoramento de SDRs** é uma plataforma completa para análise e melhoria de performance em vendas, especificamente focada em Sales Development Representatives (SDRs). O sistema utiliza inteligência artificial para analisar ligações de vendas e fornecer feedback detalhado sobre a performance individual e de equipe.

### Objetivos Principais:
- **Monitorar** a qualidade das ligações de vendas em tempo real
- **Avaliar** SDRs baseado em critérios objetivos e estruturados
- **Identificar** pontos fortes e oportunidades de melhoria
- **Treinar** equipes com base em dados concretos
- **Otimizar** processos de vendas através de insights acionáveis

---

## 🏗️ Arquitetura e Tecnologias

### Stack Tecnológico:
- **Frontend**: Next.js 14 com TypeScript
- **UI Framework**: React + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Análise de Áudio**: Processamento com IA para transcrição e análise
- **Visualizações**: Recharts, Plotly.js

### Estrutura de Dados:
```
SDR
├── Informações Básicas (nome, email)
└── Ligações
    ├── Metadados (data, cliente, duração)
    ├── Transcrição
    ├── Pontuações por Critério
    └── Feedback Qualitativo
```

---

## 🔍 Metodologia de Análise

### Processo de Análise de Ligações:

1. **Captura de Áudio**
   - Ligações são gravadas e armazenadas
   - Metadados são registrados (data, cliente, SDR)

2. **Transcrição**
   - Conversão de áudio para texto
   - Identificação de interlocutores (SDR vs. Cliente)

3. **Análise Estruturada**
   - Avaliação baseada em 16 critérios específicos
   - Pontuação de 0 a 5 para cada critério
   - Geração de feedback qualitativo

4. **Agregação de Resultados**
   - Cálculo de médias individuais e de equipe
   - Identificação de padrões e tendências
   - Comparação entre SDRs

---

## ⚖️ Critérios de Avaliação

O sistema avalia as ligações em **4 grandes categorias** com **16 critérios específicos**:

### 1️⃣ ABERTURA (Opening)

#### 1.1 Saudação e Apresentação
- **O que avaliamos**: Cordialidade, clareza na identificação pessoal
- **Pontuação máxima (5)**: Saudação calorosa + apresentação clara do nome
- **Pontuação baixa (0-2)**: Falta de apresentação ou tom inadequado
- **Por que importa**: Primeira impressão determina o tom da conversa

#### 1.2 Apresentação da Empresa
- **O que avaliamos**: Clareza sobre qual empresa representa
- **Pontuação máxima (5)**: Menciona empresa de forma clara e contextualizada
- **Pontuação baixa (0-2)**: Não menciona ou menciona confusamente
- **Por que importa**: Estabelece credibilidade e contexto

#### 1.3 Confirmação do Nome
- **O que avaliamos**: Confirmação educada do nome do interlocutor
- **Pontuação máxima (5)**: Confirma o nome de forma natural
- **Pontuação baixa (0-2)**: Não confirma ou faz de forma inadequada
- **Por que importa**: Personalização e atenção ao cliente

#### 1.4 Tom de Voz
- **O que avaliamos**: Energia, clareza, confiança na fala
- **Pontuação máxima (5)**: Tom profissional, energético e confiante
- **Pontuação baixa (0-2)**: Monótono, inseguro ou agressivo
- **Por que importa**: Transmite profissionalismo e engajamento

#### 1.5 Rapport
- **O que avaliamos**: Capacidade de criar conexão com o cliente
- **Pontuação máxima (5)**: Cria empatia, usa humor adequado, escuta ativamente
- **Pontuação baixa (0-2)**: Conversa puramente transacional
- **Por que importa**: Facilita abertura e colaboração do cliente

---

### 2️⃣ VALIDAÇÃO DO OBJETIVO

#### 2.1 Perguntas de Validação
- **O que avaliamos**: Uso de perguntas para confirmar interesse/qualificação
- **Pontuação máxima (5)**: Faz múltiplas perguntas qualificadoras
- **Pontuação baixa (0-2)**: Não faz perguntas de validação
- **Por que importa**: Evita perda de tempo com leads não qualificados

#### 2.2 Escuta Ativa
- **O que avaliamos**: Demonstra estar ouvindo e processando informações
- **Pontuação máxima (5)**: Parafraseia, faz perguntas de follow-up
- **Pontuação baixa (0-2)**: Interrompe, não responde adequadamente
- **Por que importa**: Cliente se sente valorizado e compreendido

#### 2.3 Pitch da Solução
- **O que avaliamos**: Clareza e relevância da apresentação da solução
- **Pontuação máxima (5)**: Pitch customizado, focado em benefícios
- **Pontuação baixa (0-2)**: Genérico, focado em features
- **Por que importa**: Conecta solução às necessidades do cliente

#### 2.4 História do Cliente
- **O que avaliamos**: Uso de cases ou exemplos de sucesso
- **Pontuação máxima (5)**: Conta história relevante e impactante
- **Pontuação baixa (0-2)**: Não usa social proof
- **Por que importa**: Aumenta credibilidade e confiança

---

### 3️⃣ SPIN SELLING

Metodologia baseada em perguntas estratégicas:

#### 3.1 Perguntas de Situação (Situation)
- **O que avaliamos**: Perguntas sobre contexto atual do cliente
- **Exemplos**: "Como é seu processo atual?", "Quantas pessoas na equipe?"
- **Pontuação máxima (5)**: Múltiplas perguntas contextuais
- **Por que importa**: Entende o cenário do cliente

#### 3.2 Perguntas de Problema (Problem)
- **O que avaliamos**: Identificação de dores e desafios
- **Exemplos**: "Quais dificuldades vocês enfrentam?", "O que não funciona bem?"
- **Pontuação máxima (5)**: Explora problemas em profundidade
- **Por que importa**: Revela necessidades reais

#### 3.3 Perguntas de Implicação (Implication)
- **O que avaliamos**: Explora consequências dos problemas
- **Exemplos**: "Quanto isso custa?", "Como isso afeta sua equipe?"
- **Pontuação máxima (5)**: Amplia percepção do problema
- **Por que importa**: Aumenta urgência da solução

#### 3.4 Perguntas de Necessidade-Solução (Need-Payoff)
- **O que avaliamos**: Perguntas sobre valor da solução
- **Exemplos**: "Seria útil se...?", "Quão importante é resolver isso?"
- **Pontuação máxima (5)**: Cliente mesmo verbaliza valor
- **Por que importa**: Cliente vende para si mesmo

---

### 4️⃣ PRÓXIMOS PASSOS

#### 4.1 Confirmou Entendimento
- **O que avaliamos**: Resumo e confirmação do que foi discutido
- **Pontuação máxima (5)**: Resume pontos-chave e confirma alinhamento
- **Pontuação baixa (0-2)**: Não confirma entendimento
- **Por que importa**: Evita mal-entendidos

#### 4.2 Vendeu Próximo Passo
- **O que avaliamos**: Clareza sobre o que virá a seguir
- **Pontuação máxima (5)**: Propõe próximo passo com valor claro
- **Pontuação baixa (0-2)**: Não propõe continuidade
- **Por que importa**: Mantém momentum da venda

#### 4.3 Agendou/Concluiu
- **O que avaliamos**: Fechou compromisso concreto
- **Pontuação máxima (5)**: Agendamento confirmado com data/hora
- **Pontuação baixa (0-2)**: Sem compromisso definido
- **Por que importa**: Move oportunidade pelo funil

---

## 🎨 Funcionalidades Principais

### 📊 Dashboard Geral
- **KPIs em tempo real**: Total de ligações, média de pontuação, taxa de agendamento
- **Gráfico de performance**: Evolução temporal da equipe
- **Rankings**: Top 5 e Bottom 5 SDRs
- **Nuvem de palavras**: Termos mais utilizados nas ligações

### 🎧 Monitoramento de Ligações
- **Lista completa** de todas as ligações gravadas
- **Filtros avançados**: Por SDR, data, pontuação, resultado
- **Player de áudio** integrado
- **Detalhamento completo** de cada ligação com transcrição e scores
- **Modal interativo** para análise profunda

### 👤 Análise Individual de SDR
- **Perfil completo** com estatísticas individuais
- **Histórico de ligações** com tendências
- **Pontuação por critério** (radar chart)
- **Comparação** com média da equipe
- **Identificação** de pontos fortes e fracos

### 📈 Análise por Critérios
- **Ranking de critérios**: Do melhor ao pior desempenho
- **Distribuição de pontuações**: Quantas ligações em cada faixa
- **Detalhamento clicável**: Veja quais ligações tiveram determinada pontuação
- **Insights automáticos**: Melhor critério e maior oportunidade

### 📉 Análise de Tendências
- **Evolução temporal**: Como a equipe melhorou ao longo do tempo
- **Métricas comparativas**: Semana sobre semana, mês sobre mês
- **Previsões**: Baseadas em tendências históricas
- **Sazonalidade**: Identificação de padrões temporais

---

## 🚀 Como Usar o Sistema

### Para Gestores:

1. **Dashboard Inicial**
   - Acesse para visão geral da equipe
   - Identifique rapidamente SDRs que precisam de atenção
   - Monitore evolução dos KPIs

2. **Monitoramento**
   - Use filtros para focar em ligações específicas
   - Ouça ligações de destaque (positivo ou negativo)
   - Compartilhe exemplos nas reuniões de coaching

3. **Análise Individual**
   - Prepare sessões 1:1 com dados concretos
   - Identifique padrões específicos de cada SDR
   - Defina metas personalizadas

4. **Análise por Critérios**
   - Identifique gaps de treinamento da equipe
   - Priorize tópicos para workshops
   - Acompanhe evolução após treinamentos

### Para SDRs:

1. **Acompanhe sua Performance**
   - Veja seu ranking e pontuação média
   - Compare-se com a média da equipe

2. **Aprenda com Exemplos**
   - Ouça suas melhores ligações
   - Revise ligações com pontuação baixa
   - Identifique padrões de sucesso

3. **Foco em Melhoria**
   - Veja seus critérios mais fracos
   - Trabalhe em pontos específicos
   - Acompanhe sua evolução ao longo do tempo

---

## 📖 Interpretação dos Dados

### Escalas de Pontuação:

| Faixa | Classificação | Significado | Ação Recomendada |
|-------|---------------|-------------|------------------|
| 4.5 - 5.0 | 🟢 Excelente | Performance excepcional | Replicar boas práticas |
| 3.5 - 4.4 | 🔵 Bom | Performance sólida | Manter consistência |
| 2.5 - 3.4 | 🟡 Médio | Precisa melhorar | Focar em treinamento |
| 0.0 - 2.4 | 🔴 Abaixo | Performance crítica | Intervenção urgente |

### Médias Esperadas:

- **SDR Iniciante** (0-3 meses): 2.5 - 3.0
- **SDR Intermediário** (3-12 meses): 3.0 - 3.8
- **SDR Sênior** (12+ meses): 3.8 - 4.5
- **SDR Top Performer**: 4.5+

### Red Flags (Alertas):

⚠️ **Pontuação < 2.0 em qualquer critério**: Necessita atenção imediata
⚠️ **Média geral < 2.5**: SDR pode estar precisando de mais suporte
⚠️ **Tendência de queda consistente**: Investigar causas (burnout, desmotivação)
⚠️ **Critérios SPIN < 2.0**: Foco em treinamento de discovery

### Green Flags (Pontos Positivos):

✅ **Pontuação > 4.5 em Rapport**: Talento natural para vendas
✅ **SPIN consistentemente > 4.0**: Excelente em discovery
✅ **Próximos Passos > 4.5**: Alta taxa de conversão esperada
✅ **Tendência de crescimento**: SDR está evoluindo

---

## 🎓 Dicas de Coaching Baseadas em Dados

### Se SDR tem pontuação baixa em ABERTURA:
- **Treinamento**: Role-play focado em primeiros 30 segundos
- **Recurso**: Scripts de abertura testados
- **Prática**: Gravação e feedback de aberturas

### Se SDR tem pontuação baixa em SPIN:
- **Treinamento**: Workshop sobre perguntas estratégicas
- **Recurso**: Lista de perguntas por tipo (S-P-I-N)
- **Prática**: Simular descobertas com diferentes personas

### Se SDR tem pontuação baixa em PRÓXIMOS PASSOS:
- **Treinamento**: Técnicas de fechamento e call-to-action
- **Recurso**: Frases de transição e agendamento
- **Prática**: Simular objeções comuns

---

## 📞 Suporte e Contato

Para dúvidas sobre o sistema ou metodologia:
- **Documentação técnica**: Ver README.md
- **Suporte técnico**: [contato do suporte]
- **Sugestões de melhorias**: [canal de feedback]

---

## 📚 Referências

- **SPIN Selling**: Neil Rackham (1988)
- **Challenger Sale**: Matthew Dixon & Brent Adamson (2011)
- **Never Split the Difference**: Chris Voss (2016)
- **Sales Impact Brandbook**: Guia interno de vendas

---

**Versão**: 1.0
**Última atualização**: Outubro 2025
**Desenvolvido por**: Sales Impact Team

