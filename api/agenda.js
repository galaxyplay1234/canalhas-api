const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const url = "https://jogueiros.com/teams/0011051d-da39-4677-8f6b-62c448028ecd";

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const ultimos = [];
    const proximos = [];

    $('a[href^="/games/"]').each((_, el) => {
      const bloco = $(el);

      // Placar
      const gols = bloco.find("span.text-bold.text-lg");
      const golsA = $(gols.get(0))?.text().trim();
      const golsB = $(gols.get(1))?.text().trim();

      // Escudos
      const imgs = bloco.find('img[alt="team_shield"]');
      const escudoA = $(imgs.get(0))?.attr("src") || "";
      const escudoB = $(imgs.get(1))?.attr("src") || "";

      let timeA = "", timeB = "", dataHora = "", local = "";

      if (golsA && golsB) {
        // Últimos jogos
        timeA = bloco.find("p.text-right.text-xs").text().trim();
        timeB = bloco.find("p.text-left.text-xs").text().trim();
        dataHora = bloco.find("span.text-xs.font-bold").text().trim();

        bloco.find("p.text-xs.text-neutral-white").each((_, p) => {
          const texto = $(p).text().trim();
          if (!texto.includes("•")) local = texto;
        });

      } else {
        // Próximos jogos

        // Nomes dos times (vem logo após o escudo)
        const blocosTime = bloco.find("div.flex.items-center.gap-2.px-3");
        timeA = $(blocosTime.get(0)).find("p").text().trim();
        timeB = $(blocosTime.get(1)).find("p").text().trim();

        // Data e local
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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ ultimos, proximos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao capturar jogos." });
  }
};