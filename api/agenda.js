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

      // Times
      const times = bloco.find('p.text-sm.text-neutral-white');
      const timeA = $(times.get(0))?.text().trim() || "";
      const timeB = $(times.get(1))?.text().trim() || "";

      // Escudos
      const imgs = bloco.find('img[alt="team_shield"]');
      const escudoA = $(imgs.get(0))?.attr("src") || "";
      const escudoB = $(imgs.get(1))?.attr("src") || "";

      // Placar
      const gols = bloco.find("span.text-bold.text-lg");
      const golsA = $(gols.get(0))?.text().trim();
      const golsB = $(gols.get(1))?.text().trim();

      // Detectar local e dataHora — estrutura varia!
      let dataHora = "";
      let local = "";

      if (golsA && golsB) {
        // Jogo já aconteceu → data e local estão em p.text-xs.font-bold ou acima do placar
        const dataNode = bloco.find("span.text-xs.font-bold").first();
        dataHora = dataNode.text().trim() || "";

        // Local pode estar ausente no caso dos últimos — tentamos via fallback
        const possivelLocal = bloco.find("p.text-xs.text-neutral-white").last().text().trim();
        if (possivelLocal && !possivelLocal.includes("•")) local = possivelLocal;

      } else {
        // Próximos jogos → data e local são confiáveis via p.text-xs.text-neutral-white
        bloco.find("div.flex.flex-col.px-3 p.text-xs").each((i, e) => {
          const texto = $(e).text().trim();
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