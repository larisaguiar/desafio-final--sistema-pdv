const knex = require("../conexao");
const jwt = require("jsonwebtoken");

const validarLogin = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      mensagem:
        "Para acessar este recurso um token de autenticação válido deve ser enviado.",
    });
  }

  try {
    const token = authorization.replace("Bearer ", "").trim();

    const { id } = jwt.verify(token, process.env.PASSWORD_JWT);

    const usuarioEncontrado = await knex("usuarios").where({ id }).first();

    if (!usuarioEncontrado) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const { senha, ...usuario } = usuarioEncontrado;

    req.usuario = usuario;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ mensagem: "Token inválido." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ mensagem: "Token expirado." });
    }
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { validarLogin };
