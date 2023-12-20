const knex = require("../conexao");
const paginacao = require("../utils/paginacao");
const { validarFormatoEstado } = require("../utils/validarEstadoEmailCpf");

const cadastrarCliente = async (req, res) => {
  const { nome, email, cpf, cep, rua, numero, bairro, cidade } = req.body;
  let { estado } = req.body;

  estado = estado.toUpperCase();

  let estadoInvalido = validarFormatoEstado(estado);
  if (estadoInvalido) {
    return res.status(400).json({ mensagem: estadoInvalido });
  }

  try {
    const cliente = await knex("clientes")
      .insert({ nome, email, cpf, cep, rua, numero, bairro, cidade, estado })
      .returning("*");

    if (!cliente[0]) {
      return res.status(400).json({ mensagem: "Cliente não cadastrado." });
    }

    return res.status(201).json(cliente[0]);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor. aqui" });
  }
};

const listarClientes = async (req, res) => {
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = parseInt(req.query.limite) || 10;
  const offset = (pagina - 1) * limite;

  try {
    const totalClientes = await knex("clientes").count("* as total").first();

    const clientes = await knex("clientes")
      .orderBy("id", "asc")
      .limit(limite)
      .offset(offset);

    const respostaPaginacao = paginacao(pagina, limite, totalClientes.total);
    const resposta = {
      ...respostaPaginacao,
      dados: clientes,
    };

    return res.status(200).json(resposta);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const detalharCliente = async (req, res) => {
  try {
    return res.status(200).json(req.cliente);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const editarDadosCliente = async (req, res) => {
  const { nome, email, cpf, cep, rua, numero, bairro, cidade } = req.body;
  let { estado } = req.body;
  const { id } = req.params;

  estado = estado.toUpperCase();

  let estadoInvalido = validarFormatoEstado(estado);
  if (estadoInvalido) {
    return res.status(400).json({ mensagem: estadoInvalido });
  }

  try {
    const cliente = await knex("clientes")
      .where({ id })
      .update({ nome, email, cpf, cep, rua, numero, bairro, cidade, estado })
      .returning([
        "nome",
        "email",
        "cpf",
        "cep",
        "rua",
        "numero",
        "bairro",
        "cidade",
        "estado",
      ]);

    if (!cliente[0]) {
      return res
        .status(404)
        .json({ mensagem: "Cliente não encontrado para atualização." });
    }

    return res.status(200).json({
      mensagem: "Cliente atualizado com sucesso.",
      Cliente: cliente[0],
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ mensagem: "Erro interno do servidor. aqui" });
  }
};

module.exports = {
  cadastrarCliente,
  listarClientes,
  detalharCliente,
  editarDadosCliente,
};
