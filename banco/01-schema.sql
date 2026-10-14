-- ============================================================================
-- VivaLingua - Modelagem do banco de dados (PostgreSQL 13+)
-- ----------------------------------------------------------------------------
-- Projeto Integrador - plataforma de diversidade linguistica brasileira
--
-- Este script cria o esquema completo. Execute na ordem:
--   createdb vivalingua
--   psql -d vivalingua -f 01-schema.sql
--   psql -d vivalingua -f 02-seed.sql
--
-- Requisitos: PostgreSQL 13 ou superior (gen_random_uuid nativo).
-- Nenhuma extensao e necessaria.
-- ============================================================================

BEGIN;


-- ============================================================================
-- 0. FUNCOES UTILITARIAS
-- ============================================================================

-- Normaliza um termo do mesmo modo que o front-end (src/js/script.js):
-- minusculas, sem acentos e com qualquer separador virando "_".
--   "Pai d'egua" -> "pai_d_egua"    "Role" -> "role"
-- Marcada IMMUTABLE para poder ser usada em colunas geradas e indices.
CREATE OR REPLACE FUNCTION fn_normalizar_termo(p_texto text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $fn$
    SELECT btrim(
               regexp_replace(
                   lower(
                       translate(
                           coalesce(p_texto, ''),
                           'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ',
                           'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
                       )
                   ),
                   '[^a-z0-9]+', '_', 'g'
               ),
               '_'
           );
$fn$;

COMMENT ON FUNCTION fn_normalizar_termo(text) IS
    'Chave de busca de uma palavra: minusculas, sem acentos e separadores como "_". Espelha a normalizacao feita no front-end.';


-- Mantem atualizado_em sempre preenchido em UPDATEs.
CREATE OR REPLACE FUNCTION fn_set_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
    NEW.atualizado_em := now();
    RETURN NEW;
END;
$fn$;


-- ============================================================================
-- 1. TIPOS (ENUM)
-- ============================================================================

DO $$
BEGIN
    CREATE TYPE contribuicao_status AS ENUM ('pendente', 'aprovada', 'rejeitada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE recuperacao_canal AS ENUM ('email', 'sms');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- 2. REGIOES
-- ============================================================================

CREATE TABLE IF NOT EXISTS regiao (
    id        smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug      text     NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
    nome      text     NOT NULL UNIQUE,   -- "Norte"        (select de contribuicao)
    titulo    text     NOT NULL,          -- "Regiao Norte" (titulo do mapa)
    descricao text,                       -- texto do mapa de variacoes
    ordem     smallint NOT NULL DEFAULT 0
);

COMMENT ON TABLE regiao IS 'As cinco regioes brasileiras usadas no mapa de variacoes linguisticas.';


-- ============================================================================
-- 3. USUARIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS usuario (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                text        NOT NULL CHECK (length(btrim(nome)) BETWEEN 2 AND 120),
    email               text        NOT NULL
                                    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    telefone            text        CHECK (telefone ~ '^[0-9]{10,13}$'),   -- somente digitos, com DDD
    senha_hash          text        NOT NULL,                              -- bcrypt/argon2
    regiao_id           smallint    REFERENCES regiao(id) ON DELETE SET NULL,
    avatar_url          text,                                              -- caminho/URL da imagem
    email_verificado_em timestamptz,
    ultimo_login_em     timestamptz,
    ativo               boolean     NOT NULL DEFAULT true,                 -- exclusao logica
    senha_alterada_em   timestamptz,
    criado_em           timestamptz NOT NULL DEFAULT now(),
    atualizado_em       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  usuario IS 'Contas da plataforma.';
COMMENT ON COLUMN usuario.telefone IS 'Apenas digitos (10 a 13), ja normalizado. Usado tambem como login.';
COMMENT ON COLUMN usuario.senha_hash IS 'Hash da senha (bcrypt/argon2). Nunca armazenar a senha em texto puro.';
COMMENT ON COLUMN usuario.ativo IS 'Exclusao logica: contas inativas nao podem autenticar.';

-- E-mail e telefone unicos, ignorando maiusculas/minusculas.
CREATE UNIQUE INDEX IF NOT EXISTS usuario_email_unico    ON usuario (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS usuario_telefone_unico ON usuario (telefone) WHERE telefone IS NOT NULL;

CREATE INDEX IF NOT EXISTS usuario_regiao_idx ON usuario (regiao_id);

DROP TRIGGER IF EXISTS trg_usuario_atualizado_em ON usuario;
CREATE TRIGGER trg_usuario_atualizado_em
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();


-- ============================================================================
-- 4. PREFERENCIA DE CULTURA (N:N)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cultura (
    id   smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug text     NOT NULL UNIQUE,
    nome text     NOT NULL UNIQUE
);

COMMENT ON TABLE cultura IS 'Temas culturais que o usuario escolhe acompanhar (notificacoes).';


CREATE TABLE IF NOT EXISTS usuario_cultura (
    usuario_id uuid     NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    cultura_id smallint NOT NULL REFERENCES cultura(id) ON DELETE CASCADE,
    criado_em  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (usuario_id, cultura_id)
);

COMMENT ON TABLE usuario_cultura IS 'Preferencias culturais por usuario.';


-- ============================================================================
-- 5. BANCO DE PALAVRAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS palavra (
    id                integer     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    termo             text        NOT NULL CHECK (length(btrim(termo)) BETWEEN 2 AND 80),
    termo_normalizado text        GENERATED ALWAYS AS (fn_normalizar_termo(termo)) STORED,
    classe_gramatical text,       -- "Substantivo feminino", "Interjeicao"...
    significado       text        NOT NULL CHECK (length(btrim(significado)) > 0),
    origem            text,
    exemplo           text,
    audio_url         text,       -- opcional: hoje a pronuncia usa SpeechSynthesis no navegador
    ativo             boolean     NOT NULL DEFAULT true,
    criado_em         timestamptz NOT NULL DEFAULT now(),
    atualizado_em     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  palavra IS 'Banco de palavras/expressoes (o "bancoPalavras" do script.js).';
COMMENT ON COLUMN palavra.termo_normalizado IS 'Chave de busca gerada automaticamente; corresponde a chave usada no front-end.';

CREATE UNIQUE INDEX IF NOT EXISTS palavra_termo_normalizado_unico ON palavra (termo_normalizado);
CREATE INDEX IF NOT EXISTS palavra_ativo_idx ON palavra (ativo) WHERE ativo;

DROP TRIGGER IF EXISTS trg_palavra_atualizado_em ON palavra;
CREATE TRIGGER trg_palavra_atualizado_em
    BEFORE UPDATE ON palavra
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();


-- Uma palavra pode ocorrer em varias regioes (ex.: "mandioca" em todas).
CREATE TABLE IF NOT EXISTS palavra_regiao (
    palavra_id integer  NOT NULL REFERENCES palavra(id) ON DELETE CASCADE,
    regiao_id  smallint NOT NULL REFERENCES regiao(id) ON DELETE CASCADE,
    PRIMARY KEY (palavra_id, regiao_id)
);

COMMENT ON TABLE palavra_regiao IS 'Em quais regioes a palavra e usada. Todas as 5 = "Todo o Brasil".';


-- ============================================================================
-- 6. HISTORICO DE PESQUISAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pesquisa (
    id                bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id        uuid        REFERENCES usuario(id) ON DELETE CASCADE,  -- NULL = busca anonima
    termo             text        NOT NULL CHECK (length(btrim(termo)) > 0),
    termo_normalizado text        GENERATED ALWAYS AS (fn_normalizar_termo(termo)) STORED,
    palavra_id        integer     REFERENCES palavra(id) ON DELETE SET NULL, -- NULL = nao encontrada
    encontrada        boolean     GENERATED ALWAYS AS (palavra_id IS NOT NULL) STORED,
    criado_em         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  pesquisa IS 'Historico de palavras pesquisadas (aba "Palavras pesquisadas").';
COMMENT ON COLUMN pesquisa.termo IS 'Texto como o usuario digitou. O front-end antigo guardava apenas a forma normalizada.';

CREATE INDEX IF NOT EXISTS pesquisa_usuario_data_idx ON pesquisa (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS pesquisa_termo_idx        ON pesquisa (termo_normalizado);


-- ============================================================================
-- 7. CONTRIBUICOES DE PALAVRAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS contribuicao (
    id                bigint              GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id        uuid                REFERENCES usuario(id) ON DELETE SET NULL, -- NULL = envio anonimo
    termo             text                NOT NULL CHECK (length(btrim(termo)) BETWEEN 2 AND 80),
    termo_normalizado text                GENERATED ALWAYS AS (fn_normalizar_termo(termo)) STORED,
    regiao_id         smallint            REFERENCES regiao(id) ON DELETE SET NULL,
    significado       text                NOT NULL CHECK (length(btrim(significado)) > 0),
    contexto          text,
    status            contribuicao_status NOT NULL DEFAULT 'pendente',
    palavra_id        integer             REFERENCES palavra(id) ON DELETE SET NULL,
    moderado_em       timestamptz,
    moderado_por      uuid                REFERENCES usuario(id) ON DELETE SET NULL,
    motivo_rejeicao   text,
    criado_em         timestamptz         NOT NULL DEFAULT now(),
    atualizado_em     timestamptz         NOT NULL DEFAULT now(),

    -- Uma contribuicao so aponta para uma palavra do banco quando foi aprovada.
    CONSTRAINT contribuicao_palavra_somente_aprovada
        CHECK (palavra_id IS NULL OR status = 'aprovada')
);

COMMENT ON TABLE  contribuicao IS 'Sugestoes de palavras enviadas pelos usuarios (aba "Contribuicoes de palavras").';
COMMENT ON COLUMN contribuicao.palavra_id IS 'Preenchido quando a contribuicao e aprovada e vira verbete em palavra.';

CREATE INDEX IF NOT EXISTS contribuicao_usuario_data_idx ON contribuicao (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS contribuicao_status_idx       ON contribuicao (status, criado_em DESC);
CREATE INDEX IF NOT EXISTS contribuicao_termo_idx        ON contribuicao (termo_normalizado);

DROP TRIGGER IF EXISTS trg_contribuicao_atualizado_em ON contribuicao;
CREATE TRIGGER trg_contribuicao_atualizado_em
    BEFORE UPDATE ON contribuicao
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();


-- ============================================================================
-- 8. RECUPERACAO DE SENHA (codigo de 4 a 6 digitos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recuperacao_senha (
    id          uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  uuid             NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    canal       recuperacao_canal NOT NULL,
    destino     text             NOT NULL,   -- e-mail ou telefone mascarado usado no envio
    codigo_hash text             NOT NULL,   -- hash do codigo; nunca em texto puro
    tentativas  smallint         NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
    expira_em   timestamptz      NOT NULL,
    usado_em    timestamptz,
    ip          inet,
    user_agent  text,
    criado_em   timestamptz      NOT NULL DEFAULT now(),
    CONSTRAINT recuperacao_expira_depois_de_criar CHECK (expira_em > criado_em)
);

COMMENT ON TABLE  recuperacao_senha IS 'Codigos de redefinicao de senha (fluxo esqueci-senha -> codigo -> nova senha).';
COMMENT ON COLUMN recuperacao_senha.tentativas IS 'Tentativas de validacao; bloqueie apos N tentativas.';

CREATE INDEX IF NOT EXISTS recuperacao_usuario_idx ON recuperacao_senha (usuario_id, criado_em DESC);

-- Apenas um codigo em aberto por usuario.
-- Ao gerar um novo codigo, invalide os anteriores:
--   UPDATE recuperacao_senha SET usado_em = now()
--    WHERE usuario_id = $1 AND usado_em IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS recuperacao_ativa_unica
    ON recuperacao_senha (usuario_id) WHERE usado_em IS NULL;


-- ============================================================================
-- 9. SESSOES
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessao (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  uuid        NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token_hash  text        NOT NULL UNIQUE,
    ip          inet,
    user_agent  text,
    criado_em   timestamptz NOT NULL DEFAULT now(),
    expira_em   timestamptz NOT NULL,
    revogado_em timestamptz,
    CONSTRAINT sessao_expira_depois_de_criar CHECK (expira_em > criado_em)
);

COMMENT ON TABLE  sessao IS 'Sessoes autenticadas. Guarde apenas o hash do token (cookie opaco). Se optar por JWT, esta tabela vira uma blacklist (revogados).';
COMMENT ON COLUMN sessao.token_hash IS 'Hash do token de sessao entregue ao cliente.';

CREATE INDEX IF NOT EXISTS sessao_usuario_idx ON sessao (usuario_id, expira_em DESC);
CREATE INDEX IF NOT EXISTS sessao_ativas_idx  ON sessao (usuario_id) WHERE revogado_em IS NULL;


-- ============================================================================
-- 10. FUNCOES DE APOIO
-- ============================================================================

-- Rotulo das regioes de uma palavra, igual ao exibido no front-end:
--   todas as 5 regioes -> "Todo o Brasil"
--   duas regioes       -> "Norte e Nordeste"
CREATE OR REPLACE FUNCTION fn_regioes_label(p_palavra_id integer)
RETURNS text
LANGUAGE sql
STABLE
AS $fn$
    SELECT CASE
               WHEN count(*) = 0 THEN NULL
               WHEN count(*) = (SELECT count(*) FROM regiao) THEN 'Todo o Brasil'
               ELSE string_agg(r.nome, ' e ' ORDER BY r.ordem)
           END
    FROM palavra_regiao pr
    JOIN regiao r ON r.id = pr.regiao_id
    WHERE pr.palavra_id = p_palavra_id;
$fn$;

COMMENT ON FUNCTION fn_regioes_label(integer) IS
    'Converte as regioes de uma palavra no rotulo exibido no site (ex.: "Todo o Brasil").';


-- ============================================================================
-- 11. VIEWS PARA AS TELAS
-- ============================================================================

-- Aba "Palavras pesquisadas" em src/paginas/historicos.html
CREATE OR REPLACE VIEW vw_historico_pesquisas AS
SELECT p.id,
       p.usuario_id,
       p.termo,
       p.encontrada,
       p.palavra_id,
       pa.termo            AS palavra,
       pa.classe_gramatical,
       pa.significado,
       fn_regioes_label(pa.id) AS regioes,
       p.criado_em
FROM pesquisa p
LEFT JOIN palavra pa ON pa.id = p.palavra_id;

COMMENT ON VIEW vw_historico_pesquisas IS 'Historico de buscas com o verbete encontrado, pronto para a tela de historicos.';


-- Aba "Contribuicoes de palavras"
CREATE OR REPLACE VIEW vw_historico_contribuicoes AS
SELECT c.id,
       c.usuario_id,
       c.termo,
       c.regiao_id,
       r.nome        AS regiao,
       c.significado,
       c.contexto,
       c.status,
       c.palavra_id,
       c.motivo_rejeicao,
       c.criado_em,
       c.moderado_em
FROM contribuicao c
LEFT JOIN regiao r ON r.id = c.regiao_id;

COMMENT ON VIEW vw_historico_contribuicoes IS 'Contribuicoes com o nome da regiao resolvido, pronto para a tela de historicos.';


-- Verbete completo como o site exibe no resultado da busca
CREATE OR REPLACE VIEW vw_palavra_completa AS
SELECT p.id,
       p.termo,
       p.termo_normalizado,
       p.classe_gramatical,
       p.significado,
       p.origem,
       p.exemplo,
       p.audio_url,
       fn_regioes_label(p.id) AS regioes
FROM palavra p
WHERE p.ativo;

COMMENT ON VIEW vw_palavra_completa IS 'Verbetes ativos com o rotulo de regioes, no formato usado no resultado da busca (index.html).';


-- Ranking de palavras mais pesquisadas (nao existe na versao atual, mas e barato de manter)
CREATE OR REPLACE VIEW vw_palavras_mais_pesquisadas AS
SELECT p.palavra_id,
       pa.termo,
       count(*)                       AS total,
       count(DISTINCT p.usuario_id)   AS usuarios,
       max(p.criado_em)               AS ultima_em
FROM pesquisa p
JOIN palavra pa ON pa.id = p.palavra_id
GROUP BY p.palavra_id, pa.termo
ORDER BY total DESC;

COMMENT ON VIEW vw_palavras_mais_pesquisadas IS 'Palavras mais pesquisadas, ordenadas por total de buscas.';


COMMIT;


-- ============================================================================
-- PARA RECRIAR O BANCO DO ZERO
-- ============================================================================
-- BEGIN;
--   DROP VIEW  IF EXISTS vw_palavras_mais_pesquisadas, vw_palavra_completa,
--                          vw_historico_contribuicoes, vw_historico_pesquisas;
--   DROP TABLE IF EXISTS sessao, recuperacao_senha, contribuicao, pesquisa,
--                         palavra_regiao, palavra, usuario_cultura, cultura,
--                         usuario, regiao CASCADE;
--   DROP FUNCTION IF EXISTS fn_regioes_label(integer);
--   DROP FUNCTION IF EXISTS fn_set_atualizado_em();
--   DROP FUNCTION IF EXISTS fn_normalizar_termo(text);
--   DROP TYPE   IF EXISTS recuperacao_canal, contribuicao_status;
-- COMMIT;
