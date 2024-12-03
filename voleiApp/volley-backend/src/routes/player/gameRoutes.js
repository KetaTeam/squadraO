const express = require('express');
const router = express.Router();
const db = require('../../db'); // Conexão com o banco de dados

/**
 * Rota para equilibrar times
 * @route POST /jogos/equilibrar-times
 */
router.post('/equilibrar-times', async (req, res) => {
  const { organizador_id, jogo_id } = req.body;

  // Verificação dos parâmetros obrigatórios
  if (!organizador_id || !jogo_id) {
    return res.status(400).json({ message: 'Organizador e jogo são obrigatórios.' });
  }

  try {
    // Consulta jogadores relacionados ao organizador e ao jogo
    const jogadores = await db.query(
      `SELECT u.nome, a.passe, a.ataque, a.levantamento
       FROM avaliacoes a
       JOIN usuario u ON a.usuario_id = u.id_usuario
       JOIN participacao_jogos pj ON pj.id_usuario = a.usuario_id
       WHERE a.organizador_id = $1 AND pj.id_jogo = $2`,
      [organizador_id, jogo_id]
    );

    if (jogadores.rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum jogador encontrado para este jogo.' });
    }

    // Processa a lógica de equilíbrio de times
    const players = jogadores.rows.map((player) => ({
      nome: player.nome,
      total: player.passe + player.ataque + player.levantamento,
    }));

    // Ordena os jogadores por habilidade total
    players.sort((a, b) => b.total - a.total);

    const team1 = [];
    const team2 = [];
    let team1Score = 0;
    let team2Score = 0;

    // Distribui os jogadores entre os times
    for (const player of players) {
      if (team1Score <= team2Score) {
        team1.push(player.nome);
        team1Score += player.total;
      } else {
        team2.push(player.nome);
        team2Score += player.total;
      }
    }

    // Retorna os times equilibrados
    return res.json({
      team1: { jogadores: team1, totalScore: team1Score },
      team2: { jogadores: team2, totalScore: team2Score },
    });
  } catch (error) {
    console.error('Erro ao equilibrar times:', error);
    return res.status(500).json({ message: 'Erro ao equilibrar times.', error });
  }
});

module.exports = router;
