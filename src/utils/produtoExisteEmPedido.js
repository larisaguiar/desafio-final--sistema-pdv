const knex = require("../conexao");

const produtoExisteEmPedido = async (produto_id) => {
  const resultado = await knex("pedido_produtos")
    .where({ produto_id: produto_id })
    .first();
  return resultado ? true : false;
};

module.exports = produtoExisteEmPedido;