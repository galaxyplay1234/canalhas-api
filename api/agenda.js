const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const url = "https://jogueiros.com/teams/0011051d-da39-4677-8f6b-62c448028ecd";

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const ultimos = [];
    const proximos = [];
    const artilheiros = [];

    // Jogos
    $('a[href^="/games/"]').each((_, el) => {
      const bloco = $(el);
      const gols = bloco.find("span.text-bold.text-lg");
      const golsA = $(gols.get(0))?.text().trim();
      const golsB = $(gols.get(1))?.text().trim();
      const imgs = bloco.find('img[alt="team_shield"]');
      const escudoA = $(imgs.get(0))?.attr("src") || "";
      const escudoB = $(imgs.get(1))?.attr("src") || "";

      let timeA = "", timeB = "", dataHora = "", local = "";

      if (golsA && golsB) {
        timeA = bloco.find("p.text-right.text-xs").text().trim();
        timeB = bloco.find("p.text-left.text-xs").text().trim();
        dataHora = bloco.find("span.text-xs.font-bold").text().trim();

        bloco.find("p.text-xs.text-neutral-white").each((_, p) => {
          const texto = $(p).text().trim();
          if (!texto.includes("•")) local = texto;
        });

      } else {
        const blocosTime = bloco.find("div.flex.items-center.gap-2.px-3");
        timeA = $(blocosTime.get(0)).find("p").text().trim();
        timeB = $(blocosTime.get(1)).find("p").text().trim();

        bloco.find("div.flex.flex-col.px-3 p.text-xs").each((_, p) => {
          const texto = $(p).text().trim();
          if (texto.includes("•")) dataHora = texto;
          else local = texto;
        });
      }

      const jogo = {
        dataHora,
        local,
        timeA,
        escudoA: escudoA.startsWith("/") ? "https://jogueiros.com" + escudoA : escudoA,
        timeB,
        escudoB: escudoB.startsWith("/") ? "https://jogueiros.com" + escudoB : escudoB,
      };

      if (golsA && golsB) {
        ultimos.push({ ...jogo, golsA, golsB });
      } else {
        proximos.push(jogo);
      }
    });

    // Artilheiros
    $('div.flex.w-full.cursor-pointer.items-center.justify-between').each((i, el) => {
      const jogadorEl = $(el);

      // Foto do jogador
      const foto = jogadorEl.find("img").attr("src") || "";

      // Nome e posição/camisa
      const nome = jogadorEl.find("p.truncate.text-sm").text().trim();
      const posicaoCamisa = jogadorEl.find("p.text-xs.text-neutral-low").first().text().trim();

      // Estatísticas
      const estatisticas = jogadorEl.find("div.flex.flex-col.items-center");
      const jogos = $(estatisticas.get(0)).find("p").last().text().trim();
      const assistencias = $(estatisticas.get(1)).find("p").last().text().trim();
      const gols = $(estatisticas.get(2)).find("p").last().text().trim();

      artilheiros.push({
        nome,
        posicaoCamisa,
        jogos: parseInt(jogos) || 0,
        assistencias: parseInt(assistencias) || 0,
        gols: parseInt(gols) || 0,
        foto: foto.startsWith("/") ? "https://jogueiros.com" + foto : foto,
      });
    });

    // Extrair desempenho últimos 5 jogos (bolinhas)
    const desempenho = [];
    $('.stats.flex.items-center.gap-1 > div.flex.items-center > div').each((i, el) => {
      const bolinha = $(el);
      if (bolinha.hasClass('bg-states-success')) desempenho.push('V');
      else if (bolinha.hasClass('bg-states-error')) desempenho.push('D');
      else desempenho.push('E'); // empate ou outro estado
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ ultimos, proximos, artilheiros, desempenho });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao capturar dados." });
  }
};