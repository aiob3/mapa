create database if not exists mapa_semantic;

create table if not exists mapa_semantic.semantic_chunks_v1
(
  canonical_id_v2 String,
  entity_kind LowCardinality(String),
  chunk_id UUID default generateUUIDv4(),
  chunk_text String,
  embedding Array(Float32),
  embedding_model LowCardinality(String),
  source_ref String,
  owner_user_id String,
  metadata_json String default '{}',
  created_at DateTime64(3, 'UTC') default now64(3),
  updated_at DateTime64(3, 'UTC') default now64(3)
)
engine = MergeTree
partition by toYYYYMM(created_at)
order by (entity_kind, canonical_id_v2, created_at, chunk_id)
settings index_granularity = 8192;

create table if not exists mapa_semantic.semantic_signals_v1
(
  canonical_id_v2 String,
  entity_kind LowCardinality(String),
  causal_hypotheses Array(String),
  counterintuitive_signals Array(String),
  relational_conflicts Array(String),
  inflection_points Array(String),
  tacit_basis Array(String),
  executive_summary String,
  tactical_action String,
  tactical_owner String,
  tactical_timing String,
  tactical_expected_outcome String,
  owner_user_id String,
  source_ref String,
  source_ts DateTime64(3, 'UTC'),
  ingested_at DateTime64(3, 'UTC') default now64(3)
)
engine = ReplacingMergeTree(ingested_at)
partition by toYYYYMM(source_ts)
order by (entity_kind, canonical_id_v2, source_ts)
settings index_granularity = 8192;

create view if not exists mapa_semantic.semantic_signals_summary_v1
as
select
  entity_kind,
  count() as events,
  sum(length(causal_hypotheses)) as causality_signals,
  sum(length(counterintuitive_signals)) as counterintuitive_signals,
  sum(length(relational_conflicts)) as relational_conflicts,
  sum(length(inflection_points)) as inflection_points,
  sum(length(tacit_basis)) as tacit_basis_signals
from mapa_semantic.semantic_signals_v1
group by entity_kind;

