const bcrypt = require("bcrypt");

const criptografarSenha = async (req, res, next) => {
  const { senha } = req.body;

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    req.senhaCriptografada = senhaCriptografada;

    next();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = {
  criptografarSenha,
};
