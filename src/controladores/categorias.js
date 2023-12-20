const knex = require("../conexao");

const cadastrarCategoria = async (req, res) => {
  try {
    const categorias = await knex("categorias")
      .insert([
        { descricao: "Informática" },
        { descricao: "Celulares" },
        { descricao: "Beleza e Perfumaria" },
        { descricao: "Mercado" },
        { descricao: "Livros e Papelaria" },
        { descricao: "Brinquedos" },
        { descricao: "Moda" },
        { descricao: "Bebê" },
        { descricao: "Games" },
      ])
      .returning("*");

    return res.status(201).json(categorias);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const listarCategorias = async (req, res) => {
  try {
    const categorias = await knex("categorias").orderBy("id");
    return res.status(200).json(categorias);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = {
  listarCategorias,
  cadastrarCategoria,
};
