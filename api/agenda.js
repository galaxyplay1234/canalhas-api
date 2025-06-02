const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const url = 'https://jogueiros.com/teams/0011051d-da39-4677-8f6b-62c448028ecd';

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const jogos = [];

    $('div.flex.bg-neutral-white').each((_, el) => {
      const dataHora = $(el).find('span.text-xs.font-bold').text().trim();
      const timeA = $(el).find('p.text-right.text-xs').text().trim();
      const gols = $(el).find('div.flex.items-center.gap-1 span.text-bold.text-lg');
      const golsA = $(gols.get(0)).text().trim();
      const golsB = $(gols.get(1)).text().trim();
      const timeB = $(el).find('p.text-left.text-xs').text().trim();

      // Só considera como jogo encerrado se os placares existirem
      if (dataHora && timeA && golsA && golsB && timeB) {
        jogos.push({
          dataHora,
          timeA,
          golsA,
          golsB,
          timeB
        });
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(jogos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao capturar os últimos jogos.' });
  }
};