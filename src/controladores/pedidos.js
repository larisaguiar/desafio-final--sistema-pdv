const knex = require("../conexao");
const enviarEmail = require("../servicos/enviarEmail");
const { formatarData } = require("../utils/formatarData");
const paginacao = require("../utils/paginacao");
const construirUrlImagem = require("../utils/baseUrl");

const cadastrarPedido = async (req, res) => {
  const { observacao, pedido_produtos } = req.body;
  const cliente = req.cliente;

  if (!pedido_produtos || pedido_produtos.length === 0) {
    return res.status(400).json({ mensagem: "Dados incompletos no pedido." });
  }

  if (!cliente) {
    return res
      .status(400)
      .json({ mensagem: "Campo 'cliente_id' é obrigatório." });
  }

  try {
    let valorTotalPedido = 0;
    const dataPedido = formatarData();
    let detalhesPedido = [];

    for (const item of pedido_produtos) {
      if (!item.produto_id || item.quantidade_produto === undefined) {
        return res
          .status(400)
          .json({ mensagem: "Dados de produto incompletos no pedido." });
      }

      if (item.quantidade_produto <= 0) {
        return res
          .status(400)
          .json({ mensagem: "Quantidade do produto deve ser maior que zero." });
      }

      const produto = await knex("produtos")
        .where({ id: item.produto_id })
        .first();
      if (!produto) {
        return res.status(404).json({
          mensagem: `Produto com ID ${item.produto_id} não encontrado.`,
        });
      }

      if (produto.quantidade_estoque < item.quantidade_produto) {
        return res.status(400).json({
          mensagem: `Quantidade insuficiente em estoque para o produto ID ${item.produto_id}. Quantidade disponível: ${produto.quantidade_estoque}.`,
        });
      }

      const valorItem = produto.valor * item.quantidade_produto;
      valorTotalPedido += valorItem;

      detalhesPedido.push({
        item: produto.descricao,
        quantidade: item.quantidade_produto,
        valorUnitario: (produto.valor / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        subtotal: (valorItem / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        imagem: construirUrlImagem(produto.produto_imagem),
      });
    }

    const pedidoInserido = await knex("pedidos")
      .insert({
        cliente_id: cliente.id,
        observacao,
        valor_total: valorTotalPedido,
      })
      .returning("*");

    const pedidoId = pedidoInserido[0].id;

    for (const item of pedido_produtos) {
      const produto = await knex("produtos")
        .where({ id: item.produto_id })
        .first();

      if (!produto) {
        return res.status(404).json({
          mensagem: `Produto com ID ${item.produto_id} não encontrado.`,
        });
      }

      await knex("pedido_produtos").insert({
        pedido_id: pedidoId,
        produto_id: item.produto_id,
        quantidade_produto: item.quantidade_produto,
        valor_produto: produto.valor * item.quantidade_produto,
      });

      await knex("produtos")
        .where({ id: item.produto_id })
        .decrement("quantidade_estoque", item.quantidade_produto);
    }

    const dadosPedido = {
      numero: pedidoInserido[0].id,
      data: dataPedido,
      cliente: {
        nome: cliente.nome,
        email: cliente.email,
        endereco: `${cliente.rua}, ${cliente.numero} - ${cliente.bairro} - ${cliente.cidade} - ${cliente.estado} - ${cliente.cep}`,
      },
      itens: detalhesPedido,
      total: (valorTotalPedido / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    };

    await enviarEmail(cliente.email, "Pedido Realizado!", dadosPedido);

    return res.status(201).json({
      mensagem:
        "Pedido cadastrado com sucesso. Em breve você receberá um e-mail com informações do seu pedido.",
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const listarPedidos = async (req, res) => {
  const clienteId = req.cliente ? req.cliente.id : null;
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = parseInt(req.query.limite) || 10;
  const offset = (pagina - 1) * limite;

  try {
    const queryBuilder = knex("pedidos").limit(limite).offset(offset);

    if (clienteId) {
      queryBuilder.where({ cliente_id: clienteId });
    }

    const pedidos = await queryBuilder;

    for (const pedido of pedidos) {
      const pedidoProdutos = await knex("pedido_produtos").where({
        pedido_id: pedido.id,
      });

      pedido.pedido_produtos = pedidoProdutos;
    }

    const totalQuery = knex("pedidos").count("* as total");
    if (clienteId) {
      totalQuery.where({ cliente_id: clienteId });
    }

    const total = await totalQuery.first();
    const dadosPaginacao = paginacao(pagina, limite, total.total);

    return res.status(200).json({
      paginacao: dadosPaginacao,
      pedidos: pedidos,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = {
  cadastrarPedido,
  listarPedidos,
};
