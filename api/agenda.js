const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const url = 'https://jogueiros.com/teams/0011051d-da39-4677-8f6b-62c448028ecd';
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const jogos = [];

    $('.games-next .game').each((_, el) => {
      const dataJogo = $(el).find('.date').text().trim();
      const partida = $(el).find('.match').text().trim();
      const extra = $(el).find('.extra-info').text().trim(); // "19:30 - Arena Ferronatto"
      const [horario, local] = extra.split(' - ');
      jogos.push({ data: dataJogo, partida, horario, local });
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(jogos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao capturar a agenda.' });
  }
};
