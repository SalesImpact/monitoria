-- public.calls definição

CREATE TABLE public.calls (
	id int8 NOT NULL,
	"date" timestamptz NOT NULL,
	user_id int8 NULL,
	user_name varchar(255) NULL,
	important bool DEFAULT false NULL,
	started_at timestamptz NULL,
	origin_phone varchar(20) NULL,
	origin_type varchar(20) NULL,
	receiver_phone varchar(20) NOT NULL,
	receiver_type varchar(20) NULL,
	connected_duration_seconds int4 DEFAULT 0 NULL,
	price numeric(10, 3) DEFAULT 0 NULL,
	"output" varchar(50) NULL,
	status varchar(50) NOT NULL,
	call_type varchar(20) NULL,
	notes text NULL,
	call_link varchar(500) NULL,
	updated timestamptz NULL,
	dialer_parameters jsonb NULL,
	recording_url varchar(1000) NULL,
	recording_fetched_at timestamptz NULL,
	stored_audio_url varchar(1000) NULL,
	stored_audio_filename varchar(255) NULL,
	audio_stored_at timestamptz NULL,
	audio_duration_seconds int4 NULL,
	audio_file_size_bytes int8 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT calls_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_calls_date ON public.calls USING btree (date);
CREATE INDEX idx_calls_date_status ON public.calls USING btree (date, status);
CREATE INDEX idx_calls_date_user ON public.calls USING btree (date, user_id) WHERE (user_id IS NOT NULL);
CREATE INDEX idx_calls_status ON public.calls USING btree (status) WHERE (status IS NOT NULL);
CREATE INDEX idx_calls_user_id ON public.calls USING btree (user_id) WHERE (user_id IS NOT NULL);


-- public.call_analysis definição

CREATE TABLE public.call_analysis (
	id bigserial NOT NULL,
	call_id int8 NOT NULL,
	classification varchar(50) NOT NULL,
	summary text NULL,
	interest_level varchar(20) NULL,
	interest_score int4 NULL,
	sdr_talk_time_seconds int4 DEFAULT 0 NULL,
	prospect_talk_time_seconds int4 DEFAULT 0 NULL,
	talk_ratio numeric(5, 2) NULL,
	key_topics jsonb NULL,
	sentiment varchar(20) NULL,
	objections jsonb NULL,
	next_steps text NULL,
	openai_model varchar(50) NULL,
	prompt_tokens int4 NULL,
	completion_tokens int4 NULL,
	processing_time_seconds numeric(10, 2) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT call_analysis_call_id_key UNIQUE (call_id),
	CONSTRAINT call_analysis_interest_score_check CHECK (((interest_score >= 0) AND (interest_score <= 100))),
	CONSTRAINT call_analysis_pkey PRIMARY KEY (id),
	CONSTRAINT fk_call_analysis_call FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE
);
CREATE INDEX idx_analysis_interest_level_notnull ON public.call_analysis USING btree (interest_level) WHERE (interest_level IS NOT NULL);
CREATE INDEX idx_analysis_interest_score_notnull ON public.call_analysis USING btree (interest_score) WHERE (interest_score IS NOT NULL);
CREATE INDEX idx_analysis_sentiment_notnull ON public.call_analysis USING btree (sentiment) WHERE (sentiment IS NOT NULL);
CREATE INDEX idx_call_analysis_call_id ON public.call_analysis USING btree (call_id);


-- public.call_transcriptions definição

CREATE TABLE public.call_transcriptions (
	id bigserial NOT NULL,
	call_id int8 NOT NULL,
	transcription_text text NOT NULL,
	transcription_language varchar(10) NULL,
	transcription_segments jsonb NULL,
	whisper_model varchar(50) NULL,
	processing_time_seconds numeric(10, 2) NULL,
	word_count int4 NULL,
	confidence_score numeric(5, 4) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT call_transcriptions_call_id_key UNIQUE (call_id),
	CONSTRAINT call_transcriptions_pkey PRIMARY KEY (id),
	CONSTRAINT fk_call_transcriptions_call FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE
);
CREATE INDEX idx_call_transcriptions_call_id ON public.call_transcriptions USING btree (call_id);