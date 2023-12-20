const knex = require("../conexao");

const cadastrarUsuario = async (req, res) => {
  const { nome, email } = req.body;
  const senhaCriptografada = req.senhaCriptografada;

  try {
    const usuario = await knex("usuarios")
      .insert({
        nome,
        email,
        senha: senhaCriptografada,
      })
      .returning("*");

    if (!usuario[0]) {
      return res.status(400).json({ mensagem: "Usuário não cadastrado." });
    }

    const { senha: senhaUsuario, ...novoUsuario } = usuario[0];

    return res.status(201).json(novoUsuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const atualizarUsuario = async (req, res) => {
  const { nome, email } = req.body;
  const senhaCriptografada = req.senhaCriptografada;

  try {
    const usuarioAtualizado = await knex("usuarios")
      .where({ id: req.usuario.id })
      .update({
        nome,
        email,
        senha: senhaCriptografada,
      });

    if (!usuarioAtualizado) {
      return res.status(400).json({ mensagem: "Usuário não atualizado." });
    }

    const dadosAtualizadosDoUsuario = await knex("usuarios")
      .where({ id: req.usuario.id })
      .first()
      .select("id", "nome", "email");

    return res.status(200).json({
      mensagem: "Usuário atualizado com sucesso.",
      Usuario: dadosAtualizadosDoUsuario,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const detalharUsuario = async (req, res) => {
  try {
    const usuarioDetalhado = req.usuario;

    if (usuarioDetalhado && usuarioDetalhado.senha) {
      delete usuarioDetalhado.senha;
    }

    return res.status(200).json(usuarioDetalhado);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { cadastrarUsuario, atualizarUsuario, detalharUsuario };
