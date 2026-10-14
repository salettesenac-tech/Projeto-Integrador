-- ==========================================================
-- VivaLingua - Carga inicial (seed)
-- Gerado a partir de src/js/script.js e src/paginas/editar-perfil.html
-- Execute depois de 01-schema.sql:  psql -d vivalingua -f 02-seed.sql
-- ==========================================================

BEGIN;

-- ----------------------------------------------------------
-- Regioes brasileiras (titulo/descricao vindos do "mapa de
-- variacoes linguisticas" do script.js)
-- ----------------------------------------------------------
INSERT INTO regiao (slug, nome, titulo, descricao, ordem) VALUES
  ($txt$norte$txt$, $txt$Norte$txt$, $txt$Região Norte$txt$, $txt$Na Região Norte é muito comum ouvir expressões como 'égua', 'pai d’égua' e 'gaiato'.$txt$, 1),
  ($txt$nordeste$txt$, $txt$Nordeste$txt$, $txt$Região Nordeste$txt$, $txt$O Nordeste possui inúmeras expressões populares como 'oxente', 'arretado' e 'aperreado'.$txt$, 2),
  ($txt$centro-oeste$txt$, $txt$Centro-Oeste$txt$, $txt$Centro-Oeste$txt$, $txt$O Centro-Oeste possui expressões populares como 'bão', 'arrochar' e 'pocar'.$txt$, 3),
  ($txt$sudeste$txt$, $txt$Sudeste$txt$, $txt$Região Sudeste$txt$, $txt$No Sudeste são comuns gírias urbanas como 'mano', 'rolê', 'treta' e 'mina'.$txt$, 4),
  ($txt$sul$txt$, $txt$Sul$txt$, $txt$Região Sul$txt$, $txt$O Sul possui palavras e expressões características como 'guri', 'bah', 'tchê' e 'tri'.$txt$, 5)
ON CONFLICT (slug) DO NOTHING;


-- ----------------------------------------------------------
-- Preferencias de cultura (opcoes do perfil)
-- ----------------------------------------------------------
INSERT INTO cultura (slug, nome) VALUES
  ($txt$hip_hop_e_musica_urbana$txt$, $txt$Hip-hop e música urbana$txt$),
  ($txt$sertanejo_e_cultura_do_interior$txt$, $txt$Sertanejo e cultura do interior$txt$),
  ($txt$nordestinidade_e_cordel$txt$, $txt$Nordestinidade e cordel$txt$),
  ($txt$cultura_gaucha$txt$, $txt$Cultura gaúcha$txt$),
  ($txt$indios_e_povos_originarios$txt$, $txt$Índios e povos originários$txt$),
  ($txt$mpb_e_musica_brasileira$txt$, $txt$MPB e música brasileira$txt$)
ON CONFLICT (slug) DO NOTHING;


-- ----------------------------------------------------------
-- Banco de palavras (28 verbetes de script.js)
-- termo_normalizado e gerado pelo banco (fn_normalizar_termo)
-- ----------------------------------------------------------
INSERT INTO palavra (termo, classe_gramatical, significado, origem, exemplo) VALUES
  ($txt$Mandioca$txt$, $txt$Substantivo feminino$txt$, $txt$Raiz muito utilizada na alimentação brasileira. Dependendo da região, também é chamada de aipim ou macaxeira.$txt$, $txt$Origem indígena (Tupi). A palavra está relacionada ao mito de Mani, bastante conhecido entre povos indígenas.$txt$, $txt$Hoje vamos fazer um bolo de mandioca para o café da tarde.$txt$),
  ($txt$Aipim$txt$, $txt$Substantivo masculino$txt$, $txt$Nome regional utilizado para se referir à mandioca em diversas regiões do Brasil.$txt$, $txt$Origem indígena, utilizada principalmente em comunidades do Sudeste.$txt$, $txt$O aipim cozido acompanha muito bem carne e peixe.$txt$),
  ($txt$Macaxeira$txt$, $txt$Substantivo feminino$txt$, $txt$Outra forma regional de nomear a mandioca.$txt$, $txt$Origem indígena, amplamente difundida no Norte e Nordeste brasileiro.$txt$, $txt$Macaxeira frita é um prato muito popular no Nordeste.$txt$),
  ($txt$Guri$txt$, $txt$Substantivo$txt$, $txt$Forma regional utilizada para menino ou criança.$txt$, $txt$Muito comum na variedade linguística gaúcha.$txt$, $txt$Aquele guri joga futebol muito bem.$txt$),
  ($txt$Oxente$txt$, $txt$Interjeição$txt$, $txt$Expressão de surpresa, espanto ou admiração.$txt$, $txt$Muito presente na oralidade nordestina.$txt$, $txt$Oxente! Você chegou tão cedo?$txt$),
  ($txt$Égua$txt$, $txt$Interjeição$txt$, $txt$Expressa surpresa, espanto ou indignação.$txt$, $txt$Expressão popular muito usada na região amazônica.$txt$, $txt$Égua! Que calor hoje!$txt$),
  ($txt$Pai d’égua$txt$, $txt$Adjetivo$txt$, $txt$Algo muito bom ou excelente.$txt$, $txt$Expressão popular da região amazônica.$txt$, $txt$Essa festa está pai d’égua!$txt$),
  ($txt$Gaiato$txt$, $txt$Adjetivo/Substantivo$txt$, $txt$Pessoa brincalhona ou engraçada.$txt$, $txt$Vocabulário popular regional.$txt$, $txt$Esse menino é muito gaiato.$txt$),
  ($txt$Capar o gato$txt$, $txt$Expressão verbal$txt$, $txt$Ir embora.$txt$, $txt$Expressão popular regional.$txt$, $txt$Já está tarde, vou capar o gato.$txt$),
  ($txt$Mundiça$txt$, $txt$Substantivo$txt$, $txt$Pessoa mal-educada ou sem bons modos.$txt$, $txt$Vocabulário popular regional.$txt$, $txt$Não seja mundiça, jogue o lixo no lugar certo.$txt$),
  ($txt$Arretado$txt$, $txt$Adjetivo$txt$, $txt$Algo muito bom, incrível ou alguém muito habilidoso.$txt$, $txt$Vocabulário popular nordestino.$txt$, $txt$Esse filme é arretado!$txt$),
  ($txt$Mangar$txt$, $txt$Verbo$txt$, $txt$Zombar ou brincar com alguém.$txt$, $txt$Vocabulário popular nordestino.$txt$, $txt$Para de mangar do seu irmão.$txt$),
  ($txt$Aperreado$txt$, $txt$Adjetivo$txt$, $txt$Preocupado, nervoso ou angustiado.$txt$, $txt$Deriva do verbo 'aperrear'.$txt$, $txt$Estou aperreado com essa prova.$txt$),
  ($txt$Mainha$txt$, $txt$Substantivo$txt$, $txt$Forma carinhosa de chamar a mãe.$txt$, $txt$Forma afetiva muito usada na região.$txt$, $txt$Vou perguntar para mainha.$txt$),
  ($txt$Trem$txt$, $txt$Substantivo$txt$, $txt$Coisa, objeto ou situação.$txt$, $txt$Uso popular do interior do Brasil.$txt$, $txt$Que trem estranho é esse?$txt$),
  ($txt$Bão$txt$, $txt$Adjetivo$txt$, $txt$Forma informal de 'bom'.$txt$, $txt$Pronúncia popular do interior.$txt$, $txt$Esse café está bão demais!$txt$),
  ($txt$Arrochar$txt$, $txt$Verbo$txt$, $txt$Fazer algo com intensidade ou acelerar.$txt$, $txt$Vocabulário popular regional.$txt$, $txt$Vamos arrochar o trabalho hoje.$txt$),
  ($txt$Pequi$txt$, $txt$Substantivo$txt$, $txt$Fruto típico do Cerrado, muito utilizado na culinária.$txt$, $txt$Palavra de origem indígena.$txt$, $txt$Gosto de arroz com pequi.$txt$),
  ($txt$Pocar$txt$, $txt$Verbo$txt$, $txt$Estourar ou explodir; também pode ser usado para indicar algo que aconteceu de repente.$txt$, $txt$Uso popular regional.$txt$, $txt$O pneu pocou na estrada.$txt$),
  ($txt$Mano$txt$, $txt$Substantivo$txt$, $txt$Forma informal de chamar um amigo ou conhecido.$txt$, $txt$Abreviação popular de 'irmão'.$txt$, $txt$E aí, mano, tudo bem?$txt$),
  ($txt$Rolê$txt$, $txt$Substantivo$txt$, $txt$Passeio ou saída para se divertir.$txt$, $txt$Gíria urbana, muito popular em São Paulo.$txt$, $txt$Vamos dar um rolê no shopping?$txt$),
  ($txt$Treta$txt$, $txt$Substantivo$txt$, $txt$Briga, confusão ou problema.$txt$, $txt$Gíria urbana brasileira.$txt$, $txt$Deu uma treta na escola.$txt$),
  ($txt$Mina$txt$, $txt$Substantivo$txt$, $txt$Garota ou mulher, em linguagem informal.$txt$, $txt$Gíria urbana, bastante associada a São Paulo.$txt$, $txt$Aquela mina é minha amiga.$txt$),
  ($txt$Quebrada$txt$, $txt$Substantivo$txt$, $txt$Bairro ou comunidade onde uma pessoa mora.$txt$, $txt$Gíria urbana popularizada principalmente em São Paulo.$txt$, $txt$Vou voltar para a quebrada.$txt$),
  ($txt$Bah$txt$, $txt$Interjeição$txt$, $txt$Expressa surpresa, espanto ou admiração.$txt$, $txt$Muito associada ao falar gaúcho.$txt$, $txt$Bah, que frio hoje!$txt$),
  ($txt$Tchê$txt$, $txt$Interjeição/Vocativo$txt$, $txt$Forma informal de chamar alguém.$txt$, $txt$Associada à cultura e ao falar gaúcho.$txt$, $txt$Tchê, vamos embora!$txt$),
  ($txt$Guria$txt$, $txt$Substantivo$txt$, $txt$Menina ou garota.$txt$, $txt$Forma feminina de 'guri'.$txt$, $txt$Aquela guria é minha colega.$txt$),
  ($txt$Tri$txt$, $txt$Advérbio$txt$, $txt$Muito ou bastante; usado para intensificar uma característica.$txt$, $txt$Gíria regional, especialmente associada ao Rio Grande do Sul.$txt$, $txt$Esse lugar é tri legal!$txt$)
ON CONFLICT (termo_normalizado) DO NOTHING;


-- ----------------------------------------------------------
-- Em quais regioes cada palavra e usada
-- ----------------------------------------------------------
INSERT INTO palavra_regiao (palavra_id, regiao_id) VALUES
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mandioca$txt$), (SELECT id FROM regiao WHERE slug = $txt$norte$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mandioca$txt$), (SELECT id FROM regiao WHERE slug = $txt$nordeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mandioca$txt$), (SELECT id FROM regiao WHERE slug = $txt$centro-oeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mandioca$txt$), (SELECT id FROM regiao WHERE slug = $txt$sudeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mandioca$txt$), (SELECT id FROM regiao WHERE slug = $txt$sul$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$aipim$txt$), (SELECT id FROM regiao WHERE slug = $txt$sudeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$aipim$txt$), (SELECT id FROM regiao WHERE slug = $txt$centro-oeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$macaxeira$txt$), (SELECT id FROM regiao WHERE slug = $txt$norte$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$macaxeira$txt$), (SELECT id FROM regiao WHERE slug = $txt$nordeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$guri$txt$), (SELECT id FROM regiao WHERE slug = $txt$sul$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$oxente$txt$), (SELECT id FROM regiao WHERE slug = $txt$nordeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$egua$txt$), (SELECT id FROM regiao WHERE slug = $txt$norte$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$pai_d_egua$txt$), (SELECT id FROM regiao WHERE slug = $txt$norte$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$gaiato$txt$), (SELECT id FROM regiao WHERE slug = $txt$norte$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$capar_o_gato$txt$), (SELECT id FROM regiao WHERE slug = $txt$norte$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mundica$txt$), (SELECT id FROM regiao WHERE slug = $txt$norte$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$arretado$txt$), (SELECT id FROM regiao WHERE slug = $txt$nordeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mangar$txt$), (SELECT id FROM regiao WHERE slug = $txt$nordeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$aperreado$txt$), (SELECT id FROM regiao WHERE slug = $txt$nordeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mainha$txt$), (SELECT id FROM regiao WHERE slug = $txt$nordeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$trem$txt$), (SELECT id FROM regiao WHERE slug = $txt$centro-oeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$bao$txt$), (SELECT id FROM regiao WHERE slug = $txt$centro-oeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$arrochar$txt$), (SELECT id FROM regiao WHERE slug = $txt$centro-oeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$pequi$txt$), (SELECT id FROM regiao WHERE slug = $txt$centro-oeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$pocar$txt$), (SELECT id FROM regiao WHERE slug = $txt$centro-oeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mano$txt$), (SELECT id FROM regiao WHERE slug = $txt$sudeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$role$txt$), (SELECT id FROM regiao WHERE slug = $txt$sudeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$treta$txt$), (SELECT id FROM regiao WHERE slug = $txt$sudeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$mina$txt$), (SELECT id FROM regiao WHERE slug = $txt$sudeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$quebrada$txt$), (SELECT id FROM regiao WHERE slug = $txt$sudeste$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$bah$txt$), (SELECT id FROM regiao WHERE slug = $txt$sul$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$tche$txt$), (SELECT id FROM regiao WHERE slug = $txt$sul$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$guria$txt$), (SELECT id FROM regiao WHERE slug = $txt$sul$txt$)),
  ((SELECT id FROM palavra WHERE termo_normalizado = $txt$tri$txt$), (SELECT id FROM regiao WHERE slug = $txt$sul$txt$))
ON CONFLICT DO NOTHING;

COMMIT;

-- Conferencia rapida:
--   SELECT termo, fn_regioes_label(id) AS regioes FROM palavra ORDER BY termo;
