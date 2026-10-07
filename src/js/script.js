document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // Navbar dinâmica + botão topo
    // ==============================

    const navbar = document.getElementById("mainNav");
    const backTop = document.getElementById("backTop");
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    window.addEventListener("scroll", () => {

        if (navbar && backTop) {

            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
                backTop.classList.add("show");
            } else {
                navbar.classList.remove("scrolled");
                backTop.classList.remove("show");
            }

        }

    });


    if (backTop) {

        backTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }



    // ==========================================
    // BANCO DE PALAVRAS
    // ==========================================

    const bancoPalavras = {

        mandioca: {
            palavra: "Mandioca",
            classe: "Substantivo feminino",
            regiao: "Todo o Brasil",
            significado:
                "Raiz muito utilizada na alimentação brasileira. Dependendo da região, também é chamada de aipim ou macaxeira.",
            origem:
                "Origem indígena (Tupi). A palavra está relacionada ao mito de Mani, bastante conhecido entre povos indígenas.",
            exemplo:
                "Hoje vamos fazer um bolo de mandioca para o café da tarde."
        },

        aipim: {
            palavra: "Aipim",
            classe: "Substantivo masculino",
            regiao: "Sudeste e parte do Centro-Oeste",
            significado:
                "Nome regional utilizado para se referir à mandioca em diversas regiões do Brasil.",
            origem:
                "Origem indígena, utilizada principalmente em comunidades do Sudeste.",
            exemplo:
                "O aipim cozido acompanha muito bem carne e peixe."
        },

        macaxeira: {
            palavra: "Macaxeira",
            classe: "Substantivo feminino",
            regiao: "Norte e Nordeste",
            significado:
                "Outra forma regional de nomear a mandioca.",
            origem:
                "Origem indígena, amplamente difundida no Norte e Nordeste brasileiro.",
            exemplo:
                "Macaxeira frita é um prato muito popular no Nordeste."
        },

        guri: {
            palavra: "Guri",
            classe: "Substantivo",
            regiao: "Sul do Brasil",
            significado:
                "Forma regional utilizada para menino ou criança.",
            origem:
                "Muito comum na variedade linguística gaúcha.",
            exemplo:
                "Aquele guri joga futebol muito bem."
        },

        oxente: {
            palavra: "Oxente",
            classe: "Interjeição",
            regiao: "Nordeste",
            significado:
                "Expressão de surpresa, espanto ou admiração.",
            origem:
                "Muito presente na oralidade nordestina.",
            exemplo:
                "Oxente! Você chegou tão cedo?"
        },

        egua: {
            palavra: "Égua",
            classe: "Interjeição",
            regiao: "Norte",
            significado:
                "Expressa surpresa, espanto ou indignação.",
            origem:
                "Expressão popular muito usada na região amazônica.",
            exemplo:
                "Égua! Que calor hoje!"
        },

        pai_d_egua: {
            palavra: "Pai d’égua",
            classe: "Adjetivo",
            regiao: "Norte",
            significado:
                "Algo muito bom ou excelente.",
            origem:
                "Expressão popular da região amazônica.",
            exemplo:
                "Essa festa está pai d’égua!"
        },

        gaiato: {
            palavra: "Gaiato",
            classe: "Adjetivo/Substantivo",
            regiao: "Norte",
            significado:
                "Pessoa brincalhona ou engraçada.",
            origem:
                "Vocabulário popular regional.",
            exemplo:
                "Esse menino é muito gaiato."
        },

        capar_o_gato: {
            palavra: "Capar o gato",
            classe: "Expressão verbal",
            regiao: "Norte",
            significado:
                "Ir embora.",
            origem:
                "Expressão popular regional.",
            exemplo:
                "Já está tarde, vou capar o gato."
        },

        mundica: {
            palavra: "Mundiça",
            classe: "Substantivo",
            regiao: "Norte",
            significado:
                "Pessoa mal-educada ou sem bons modos.",
            origem:
                "Vocabulário popular regional.",
            exemplo:
                "Não seja mundiça, jogue o lixo no lugar certo."
        },

        arretado: {
            palavra: "Arretado",
            classe: "Adjetivo",
            regiao: "Nordeste",
            significado:
                "Algo muito bom, incrível ou alguém muito habilidoso.",
            origem:
                "Vocabulário popular nordestino.",
            exemplo:
                "Esse filme é arretado!"
        },

        mangar: {
            palavra: "Mangar",
            classe: "Verbo",
            regiao: "Nordeste",
            significado:
                "Zombar ou brincar com alguém.",
            origem:
                "Vocabulário popular nordestino.",
            exemplo:
                "Para de mangar do seu irmão."
        },

        aperreado: {
            palavra: "Aperreado",
            classe: "Adjetivo",
            regiao: "Nordeste",
            significado:
                "Preocupado, nervoso ou angustiado.",
            origem:
                "Deriva do verbo 'aperrear'.",
            exemplo:
                "Estou aperreado com essa prova."
        },

        mainha: {
            palavra: "Mainha",
            classe: "Substantivo",
            regiao: "Nordeste",
            significado:
                "Forma carinhosa de chamar a mãe.",
            origem:
                "Forma afetiva muito usada na região.",
            exemplo:
                "Vou perguntar para mainha."
        },

        trem: {
            palavra: "Trem",
            classe: "Substantivo",
            regiao: "Centro-Oeste",
            significado:
                "Coisa, objeto ou situação.",
            origem:
                "Uso popular do interior do Brasil.",
            exemplo:
                "Que trem estranho é esse?"
        },

        bao: {
            palavra: "Bão",
            classe: "Adjetivo",
            regiao: "Centro-Oeste",
            significado:
                "Forma informal de 'bom'.",
            origem:
                "Pronúncia popular do interior.",
            exemplo:
                "Esse café está bão demais!"
        },

        arrochar: {
            palavra: "Arrochar",
            classe: "Verbo",
            regiao: "Centro-Oeste",
            significado:
                "Fazer algo com intensidade ou acelerar.",
            origem:
                "Vocabulário popular regional.",
            exemplo:
                "Vamos arrochar o trabalho hoje."
        },

        pequi: {
            palavra: "Pequi",
            classe: "Substantivo",
            regiao: "Centro-Oeste",
            significado:
                "Fruto típico do Cerrado, muito utilizado na culinária.",
            origem:
                "Palavra de origem indígena.",
            exemplo:
                "Gosto de arroz com pequi."
        },

        pocar: {
            palavra: "Pocar",
            classe: "Verbo",
            regiao: "Centro-Oeste",
            significado:
                "Estourar ou explodir; também pode ser usado para indicar algo que aconteceu de repente.",
            origem:
                "Uso popular regional.",
            exemplo:
                "O pneu pocou na estrada."
        },

        mano: {
            palavra: "Mano",
            classe: "Substantivo",
            regiao: "Sudeste",
            significado:
                "Forma informal de chamar um amigo ou conhecido.",
            origem:
                "Abreviação popular de 'irmão'.",
            exemplo:
                "E aí, mano, tudo bem?"
        },

        role: {
            palavra: "Rolê",
            classe: "Substantivo",
            regiao: "Sudeste",
            significado:
                "Passeio ou saída para se divertir.",
            origem:
                "Gíria urbana, muito popular em São Paulo.",
            exemplo:
                "Vamos dar um rolê no shopping?"
        },

        treta: {
            palavra: "Treta",
            classe: "Substantivo",
            regiao: "Sudeste",
            significado:
                "Briga, confusão ou problema.",
            origem:
                "Gíria urbana brasileira.",
            exemplo:
                "Deu uma treta na escola."
        },

        mina: {
            palavra: "Mina",
            classe: "Substantivo",
            regiao: "Sudeste",
            significado:
                "Garota ou mulher, em linguagem informal.",
            origem:
                "Gíria urbana, bastante associada a São Paulo.",
            exemplo:
                "Aquela mina é minha amiga."
        },

        quebrada: {
            palavra: "Quebrada",
            classe: "Substantivo",
            regiao: "Sudeste",
            significado:
                "Bairro ou comunidade onde uma pessoa mora.",
            origem:
                "Gíria urbana popularizada principalmente em São Paulo.",
            exemplo:
                "Vou voltar para a quebrada."
        },

        bah: {
            palavra: "Bah",
            classe: "Interjeição",
            regiao: "Sul",
            significado:
                "Expressa surpresa, espanto ou admiração.",
            origem:
                "Muito associada ao falar gaúcho.",
            exemplo:
                "Bah, que frio hoje!"
        },

        tche: {
            palavra: "Tchê",
            classe: "Interjeição/Vocativo",
            regiao: "Sul",
            significado:
                "Forma informal de chamar alguém.",
            origem:
                "Associada à cultura e ao falar gaúcho.",
            exemplo:
                "Tchê, vamos embora!"
        },

        guria: {
            palavra: "Guria",
            classe: "Substantivo",
            regiao: "Sul",
            significado:
                "Menina ou garota.",
            origem:
                "Forma feminina de 'guri'.",
            exemplo:
                "Aquela guria é minha colega."
        },

        tri: {
            palavra: "Tri",
            classe: "Advérbio",
            regiao: "Sul",
            significado:
                "Muito ou bastante; usado para intensificar uma característica.",
            origem:
                "Gíria regional, especialmente associada ao Rio Grande do Sul.",
            exemplo:
                "Esse lugar é tri legal!"
        }

    };



    // ==================================
    // PESQUISA DE PALAVRAS
    // ==================================

    const formPesquisa = document.getElementById("heroSearchForm");
    const inputPesquisa = document.getElementById("heroSearch");
    const resultado = document.getElementById("searchResults");


    function pesquisarPalavra(termo) {

        termo = termo
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const palavra = bancoPalavras[termo];

        if (!resultado) {
            return;
        }

        // salva o histórico de pesquisas
        if (termo) {
            try {
                const buscas = JSON.parse(localStorage.getItem("vivalingua_searches") || "[]");
                buscas.unshift({ termo, data: new Date().toISOString() });
                localStorage.setItem("vivalingua_searches", JSON.stringify(buscas.slice(0, 30)));
            } catch (e) {}
        }

        resultado.classList.remove("d-none");


        if (!palavra) {

            resultado.innerHTML = `
                <div class="alert alert-warning shadow-sm">

                    <h5>
                        Palavra não encontrada.
                    </h5>

                    <p>
                        Ainda estamos ampliando nosso banco de palavras.
                    </p>

                    <p class="mb-0">

                        Tente pesquisar por:

                        <strong>mandioca</strong>,
                        <strong>aipim</strong>,
                        <strong>macaxeira</strong>,
                        <strong>guri</strong>,
                        <strong>oxente</strong> ou
                        <strong>Égua</strong>.

                    </p>

                </div>
            `;

            return;
        }


        resultado.innerHTML = `

            <div class="card shadow-lg border-0">

                <div class="card-body p-4">

                    <div class="d-flex justify-content-between align-items-center flex-wrap">

                        <div>

                            <small class="text-uppercase text-success fw-bold">
                                ${palavra.classe}
                            </small>

                            <h2 class="mt-1 text-success">
                                ${palavra.palavra}
                            </h2>

                        </div>


                        <button
                            class="btn btn-success rounded-circle"
                            onclick="falar('${palavra.palavra}')"
                            type="button"
                            aria-label="Ouvir pronúncia"
                        >

                            <i class="bi bi-volume-up-fill"></i>

                        </button>

                    </div>


                    <hr>


                    <p>
                        <strong>📍 Região:</strong>
                        ${palavra.regiao}
                    </p>


                    <p>
                        <strong>📖 Significado:</strong>
                        ${palavra.significado}
                    </p>


                    <p>
                        <strong>🌿 Origem:</strong>
                        ${palavra.origem}
                    </p>


                    <p>
                        <strong>💬 Exemplo:</strong>
                        ${palavra.exemplo}
                    </p>


                </div>

            </div>

        `;


        resultado.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }



    if (formPesquisa) {

        formPesquisa.addEventListener("submit", (event) => {

            event.preventDefault();

            if (inputPesquisa) {

                pesquisarPalavra(
                    inputPesquisa.value.trim()
                );

            }

        });

    }



    // Botões de sugestões

    document.querySelectorAll(".tag-btn").forEach(botao => {

        botao.addEventListener("click", () => {

            if (inputPesquisa) {

                inputPesquisa.value = botao.dataset.search;

                pesquisarPalavra(
                    botao.dataset.search
                );

            }

        });

    });



    // ==================================
    // PALAVRA INDÍGENA DO DIA
    // ==================================

    /*
       Aqui está a principal alteração.

       Cada palavra agora possui:
       - palavra
       - pronuncia
       - origem
       - uso

       Assim, quando uma palavra for escolhida,
       todas as informações da seção serão atualizadas.
    */

    const palavrasIndigenas = [

        {
            palavra: "Mandioca",
            pronuncia: "man-di-o-ca",
            origem: "Tupi",
            uso: "Raiz muito utilizada na alimentação brasileira."
        },

        {
            palavra: "Abacaxi",
            pronuncia: "a-ba-ca-xi",
            origem: "Tupi",
            uso: "Fruta tropical originária da América do Sul."
        },

        {
            palavra: "Capivara",
            pronuncia: "ca-pi-va-ra",
            origem: "Tupi",
            uso: "Maior roedor do mundo."
        },

        {
            palavra: "Pipoca",
            pronuncia: "pi-po-ca",
            origem: "Tupi",
            uso: "Milho estourado muito popular no Brasil."
        },

        {
            palavra: "Igarapé",
            pronuncia: "i-ga-ra-pé",
            origem: "Tupi",
            uso: "Pequeno curso de água da Amazônia."
        },

        {
            palavra: "Caju",
            pronuncia: "ca-ju",
            origem: "Tupi",
            uso: "Fruto típico do Nordeste brasileiro."
        }

    ];



    /*
       Seleciona a palavra usando o dia do ano.

       Dessa forma a palavra muda conforme o dia,
       em vez de ficar sempre igual.
    */

    const agora = new Date();

    const inicioDoAno = new Date(
        agora.getFullYear(),
        0,
        1
    );

    const diaDoAno = Math.floor(
        (agora - inicioDoAno) / 86400000
    );


    const palavraDia =
        palavrasIndigenas[
            diaDoAno % palavrasIndigenas.length
        ];



    // Elementos do HTML

    const tituloDia =
        document.getElementById("dailyWord");

    const pronunciaDia =
        document.getElementById("dailyPronunciation");

    const origemDia =
        document.getElementById("dailyOrigin");

    const usoDia =
        document.getElementById("dailyUse");

    const botaoSomDia =
        document.getElementById("dailySoundButton");

    const palavraPequena =
        document.getElementById("dailyWordSmall");

    const origemPequena =
        document.getElementById("dailyOriginSmall");



    // Atualiza a palavra

    if (tituloDia) {

        tituloDia.textContent =
            palavraDia.palavra;

    }



    // Atualiza a pronúncia

    if (pronunciaDia) {

        pronunciaDia.textContent =
            palavraDia.pronuncia;

    }



    // Atualiza a origem

    if (origemDia) {

        origemDia.textContent =
            palavraDia.origem;

    }



    // Atualiza a explicação

    if (usoDia) {

        usoDia.textContent =
            palavraDia.uso;

    }



    // Atualiza as informações menores

    if (palavraPequena) {

        palavraPequena.textContent =
            palavraDia.palavra;

    }


    if (origemPequena) {

        origemPequena.textContent =
            palavraDia.origem;

    }



    // Atualiza o botão de áudio

    if (botaoSomDia) {

        botaoSomDia.dataset.word =
            palavraDia.palavra;

        botaoSomDia.setAttribute(
            "aria-label",
            `Ouvir pronúncia aproximada de ${palavraDia.palavra}`
        );

    }



    // ==================================
    // MAPA DE VARIAÇÕES LINGUÍSTICAS
    // ==================================

    const regioes = {

        norte: {

            titulo: "Região Norte",

            descricao:
                "Na Região Norte é muito comum ouvir expressões como 'égua', 'pai d’égua' e 'gaiato'.",

            palavras: [
                "Égua!",
                "Pai d’égua",
                "Gaiato",
                "Capar o gato",
                "Mundiça"
            ]

        },


        nordeste: {

            titulo: "Região Nordeste",

            descricao:
                "O Nordeste possui inúmeras expressões populares como 'oxente', 'arretado' e 'aperreado'.",

            palavras: [
                "Oxente",
                "Arretado",
                "Mangar",
                "Aperreado",
                "Mainha"
            ]

        },


        "centro-oeste": {

            titulo: "Centro-Oeste",

            descricao:
                "O Centro-Oeste possui expressões populares como 'bão', 'arrochar' e 'pocar'.",

            palavras: [
                "Bão",
                "Arrochar",
                "Pocar",
                "Pequi",
                "Trem"
            ]

        },


        sudeste: {

            titulo: "Região Sudeste",

            descricao:
                "No Sudeste são comuns gírias urbanas como 'mano', 'rolê', 'treta' e 'mina'.",

            palavras: [
                "Mano",
                "Rolê",
                "Treta",
                "Mina",
                "Quebrada"
            ]

        },


        sul: {

            titulo: "Região Sul",

            descricao:
                "O Sul possui palavras e expressões características como 'guri', 'bah', 'tchê' e 'tri'.",

            palavras: [
                "Guri",
                "Bah",
                "Tchê",
                "Guria",
                "Tri"
            ]

        }

    };



    const tituloRegiao =
        document.getElementById("regionTitle");

    const descricaoRegiao =
        document.getElementById("regionDescription");

    const listaVariacoes =
        document.getElementById("variantList");

    const pill =
        document.getElementById("regionPill");



    document.querySelectorAll(".map-region").forEach(botao => {

        botao.addEventListener("click", () => {

            document
                .querySelectorAll(".map-region")
                .forEach(btn => {

                    btn.classList.remove("active");

                });


            botao.classList.add("active");


            const dados =
                regioes[botao.dataset.region];


            if (!dados) {
                return;
            }


            if (tituloRegiao) {

                tituloRegiao.textContent =
                    dados.titulo;

            }


            if (descricaoRegiao) {

                descricaoRegiao.textContent =
                    dados.descricao;

            }


            if (pill) {

                pill.textContent =
                    dados.titulo;

            }


            if (listaVariacoes) {

                listaVariacoes.innerHTML = "";


                dados.palavras.forEach(item => {

                    listaVariacoes.innerHTML += `

                        <div class="variant-item">

                            <span class="variant-word">
                                ${item}
                            </span>

                            <span class="variant-place">
                                ${dados.titulo}
                            </span>

                        </div>

                    `;

                });

            }

        });

    });



    // Região inicial

    document
        .querySelector(".map-region.nordeste")
        ?.click();



    // ==================================
    // GLOSSÁRIO SONORO
    // ==================================

    window.falar = function(texto) {

        if (!("speechSynthesis" in window)) {

            alert(
                "Seu navegador não suporta síntese de voz."
            );

            return;
        }


        speechSynthesis.cancel();


        const fala =
            new SpeechSynthesisUtterance(texto);


        fala.lang = "pt-BR";

        fala.rate = 0.9;

        fala.pitch = 1;


        speechSynthesis.speak(fala);

    };



    document
        .querySelectorAll(".sound-button")
        .forEach(botao => {

            botao.addEventListener("click", () => {

                const palavra =
                    botao.dataset.word;

                if (palavra) {

                    falar(palavra);

                }

            });

        });

    // ==================================
    // TOAST BOOTSTRAP
    // ==================================

    const toastElemento =
        document.getElementById(
            "siteToast"
        );

    const toastMensagem =
        document.getElementById(
            "toastMessage"
        );


    function mostrarToast(texto) {

        if (!toastElemento || !toastMensagem) {
            return;
        }


        toastMensagem.textContent =
            texto;


        if (typeof bootstrap !== "undefined") {

            const toast =
                bootstrap.Toast.getOrCreateInstance(
                    toastElemento,
                    {
                        delay: 2500
                    }
                );


            toast.show();

        }

    }


    // ==================================
    // HISTÓRICO DE CONTRIBUIÇÕES
    // ==================================

    const formContribuicoes = document.getElementById("contributionForm");

    const feedbackContribuicao = document.getElementById("contributionFeedback");

    if (formContribuicoes) {

        formContribuicoes.addEventListener("submit", (event) => {

            event.preventDefault();

            if (!formContribuicoes.checkValidity()) {

                formContribuicoes.classList.add("was-validated");

                return;

            }

            const palavra = document.getElementById("contribWord").value.trim();

            const regiao = document.getElementById("contribRegion").value;

            const significado = document.getElementById("contribMeaning").value.trim();

            const contexto = document.getElementById("contribContext").value.trim();

            try {

                const contribs = JSON.parse(localStorage.getItem("vivalingua_contributions") || "[]");

                contribs.unshift({ palavra, regiao, significado, contexto, data: new Date().toISOString() });

                localStorage.setItem("vivalingua_contributions", JSON.stringify(contribs.slice(0, 50)));

            } catch (e) {}

            if (feedbackContribuicao) {

                feedbackContribuicao.classList.remove("d-none");

                feedbackContribuicao.innerHTML = `Obrigado! A expressão <strong>${palavra}</strong>, enviada da região <strong>${regiao}</strong>, foi registrada.`;

            }

            formContribuicoes.reset();

            formContribuicoes.classList.remove("was-validated");

            mostrarToast("Contribuição enviada com sucesso!");

        });

    }

});

