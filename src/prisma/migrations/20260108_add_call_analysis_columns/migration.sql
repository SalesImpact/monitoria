-- Adicionar novas colunas de análise em monitoria_call_scores

-- Resultado da ligação (Agendado, Não Agendado, Qualificação Sucesso)
ALTER TABLE monitoria_call_scores 
ADD COLUMN resultado VARCHAR(50) NULL;

-- Sentimentos
ALTER TABLE monitoria_call_scores 
ADD COLUMN sentimento_geral VARCHAR(20) NULL;

ALTER TABLE monitoria_call_scores 
ADD COLUMN sentimento_cliente VARCHAR(20) NULL;

ALTER TABLE monitoria_call_scores 
ADD COLUMN sentimento_sdr VARCHAR(20) NULL;

-- Objeções detectadas
ALTER TABLE monitoria_call_scores 
ADD COLUMN objeções JSONB NULL;

ALTER TABLE monitoria_call_scores 
ADD COLUMN objeções_superadas JSONB NULL;

-- Palavras-chave categorizadas
ALTER TABLE monitoria_call_scores 
ADD COLUMN palavras_chave_positivas JSONB NULL;

ALTER TABLE monitoria_call_scores 
ADD COLUMN palavras_chave_negativas JSONB NULL;

ALTER TABLE monitoria_call_scores 
ADD COLUMN palavras_chave_neutras JSONB NULL;
