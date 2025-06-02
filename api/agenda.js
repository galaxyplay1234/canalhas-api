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

      const times = bloco.find("p.text-sm.text-neutral-white");
      const timeA = $(times.get(0))?.text().trim();
      const timeB = $(times.get(1))?.text().trim();

      const imgs = bloco.find('img[alt="team_shield"]');
      const escudoA = $(imgs.get(0))?.attr("src") || "";
      const escudoB = $(imgs.get(1))?.attr("src") || "";

      const textos = bloco.find("p.text-xs.text-neutral-white");
      const dataHora = $(textos.get(0))?.text().trim();
      const local = $(textos.get(1))?.text().trim();

      const placar = bloco.find("span.text-bold.text-lg");
      const golsA = $(placar.get(0))?.text().trim();
      const golsB = $(placar.get(1))?.text().trim();

      const jogo = {
        dataHora,
        local,
        timeA,
        escudoA: escudoA.startsWith("/") ? "https://jogueiros.com" + escudoA : escudoA,
        timeB,
        escudoB: escudoB.startsWith("/") ? "https://jogueiros.com" + escudoB : escudoB
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