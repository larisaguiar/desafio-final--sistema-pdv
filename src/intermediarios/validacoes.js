const knex = require("../conexao");
const {
  validarFormatoEmail,
  validarFormatoCpf,
} = require("../utils/validarEstadoEmailCpf");

const validarCamposObrigatoriosUsuario = (req, res, next) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios." });
  }

  next();
};

const validarCamposObrigatoriosProduto = (req, res, next) => {
  const { descricao, quantidade_estoque, valor, categoria_id } = req.body;

  if (!descricao || !quantidade_estoque || !valor || !categoria_id) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios." });
  }

  if (quantidade_estoque <= 0 || valor <= 0) {
    return res.status(400).json({
      mensagem:
        "Quantidade em estoque ou valor não podem ser negativos e precisam ser maiores que zero.",
    });
  }

  next();
};

const validarCamposObrigatoriosCliente = (req, res, next) => {
  const { nome, email, cpf, cep, rua, numero, bairro, cidade, estado } =
    req.body;

  if (
    !nome ||
    !email ||
    !cpf ||
    !cep ||
    !rua ||
    !numero ||
    !bairro ||
    !cidade ||
    !estado
  ) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios." });
  }

  next();
};

const validarEmailUsuario = async (req, res, next) => {
  const { email } = req.body;
  const usuarioId = req.usuario ? req.usuario.id : null;

  try {
    let query = knex("usuarios").where("email", email);

    if (usuarioId) {
      query = query.whereNot("id", usuarioId);
    }

    const emailExistente = await query.first();

    if (emailExistente) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const validarIdProduto = async (req, res, next) => {
  const produto_id = req.params.id;

  if (isNaN(produto_id)) {
    return res.status(400).json({ mensagem: "ID de produto inválido." });
  }

  try {
    const produtoExistente = await knex("produtos")
      .where("id", produto_id)
      .first();

    if (!produtoExistente) {
      return res.status(404).json({ mensagem: "Produto não encontrado." });
    }

    req.produto = produtoExistente;

    next();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const validarIdCategoria = async (req, res, next) => {
  let categoria_ids = req.body.categoria_id || req.query.categoria_id;

  if (!categoria_ids) {
    return next();
  }

  if (!Array.isArray(categoria_ids)) {
    categoria_ids = [categoria_ids];
  }

  if (categoria_ids.some((id) => isNaN(id))) {
    return res.status(400).json({ mensagem: "ID de categoria inválido." });
  }

  try {
    for (const id of categoria_ids) {
      const categoriaExistente = await knex("categorias").where({ id }).first();
      if (!categoriaExistente) {
        return res.status(404).json({ mensagem: "Categoria não encontrada." });
      }
    }

    req.categoria_ids = categoria_ids;
    next();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const validarIdCliente = async (req, res, next) => {
  const clienteId =
    req.params.id || req.body.cliente_id || req.query.cliente_id;

  if (clienteId && isNaN(parseInt(clienteId))) {
    return res.status(400).json({ mensagem: "ID inválido." });
  }

  if (clienteId) {
    try {
      const cliente = await knex("clientes").where({ id: clienteId }).first();
      if (!cliente) {
        return res.status(404).json({ mensagem: "Cliente não encontrado." });
      }
      req.cliente = cliente;
    } catch (error) {
      return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
  }

  next();
};

const validarEmailCpfCliente = async (req, res, next) => {
  let { email, cpf } = req.body;
  const id = req.params.id;

  let cpfInvalido = validarFormatoCpf(cpf);
  if (cpfInvalido) {
    return res.status(400).json({ mensagem: cpfInvalido });
  }

  emailInvalido = validarFormatoEmail(email);
  if (emailInvalido) {
    return res.status(400).json({ mensagem: emailInvalido });
  }

  try {
    let clienteExistente;
    if (id) {
      clienteExistente = await knex("clientes")
        .where("id", "!=", id)
        .andWhere({ email })
        .first();
      if (clienteExistente) {
        return res.status(400).json({ mensagem: "E-mail já cadastrado." });
      }

      clienteExistente = await knex("clientes")
        .where("id", "!=", id)
        .andWhere({ cpf })
        .first();
      if (clienteExistente) {
        return res.status(400).json({ mensagem: "CPF já cadastrado." });
      }
    } else {
      clienteExistente = await knex("clientes")
        .where({ email })
        .orWhere({ cpf })
        .first();
      if (clienteExistente) {
        if (clienteExistente.email === email) {
          return res.status(400).json({ mensagem: "E-mail já cadastrado." });
        }
        if (clienteExistente.cpf === cpf) {
          return res.status(400).json({ mensagem: "CPF já cadastrado." });
        }
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = {
  validarCamposObrigatoriosUsuario,
  validarEmailUsuario,
  validarCamposObrigatoriosProduto,
  validarIdProduto,
  validarIdCategoria,
  validarCamposObrigatoriosCliente,
  validarEmailCpfCliente,
  validarIdCliente,
};
