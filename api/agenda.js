const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const url = "https://jogueiros.com/teams/0011051d-da39-4677-8f6b-62c448028ecd";

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const jogos = [];

    $('.games-next .game').each((_, el) => {
      const dataJogo = $(el).find('.game-date').text().trim();
      const partida = $(el).find('.match').text().trim();
      const extra = $(el).find('.extra-info').text().trim(); // exemplo: "19:30 - Arena Ferronatto"
      const [horario, local] = extra.split(' - ');
      if (dataJogo && partida && horario && local) {
        jogos.push({ data: dataJogo, partida, horario, local });
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(jogos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao capturar os dados da agenda." });
  }
};
