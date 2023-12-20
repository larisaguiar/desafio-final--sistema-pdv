const express = require("express");
const multer = require("./intermediarios/multer");
const { login } = require("./controladores/login");
const { cadastrarCategoria, listarCategorias } = require("./controladores/categorias");
const { cadastrarUsuario, atualizarUsuario, detalharUsuario } = require("./controladores/usuarios");
const { cadastrarProduto, editarDadosProduto, detalharProduto, deletarProduto, listarProdutos } = require("./controladores/produtos");
const { cadastrarCliente, listarClientes, detalharCliente, editarDadosCliente } = require("./controladores/clientes");
const { criptografarSenha } = require("./intermediarios/criptografarSenha");
const { validarLogin } = require("./intermediarios/autenticacao");
const {
  validarCamposObrigatoriosUsuario,
  validarEmailUsuario,
  validarCamposObrigatoriosProduto,
  validarIdProduto,
  validarCamposObrigatoriosCliente,
  validarIdCategoria,
  validarIdCliente,
  validarEmailCpfCliente,
} = require("./intermediarios/validacoes");
const { cadastrarPedido, listarPedidos } = require("./controladores/pedidos");

const rotas = express();

rotas.get("/categoria", listarCategorias);
rotas.post("/categoria", cadastrarCategoria);

rotas.post("/usuario", validarCamposObrigatoriosUsuario, criptografarSenha, validarEmailUsuario, cadastrarUsuario);
rotas.post("/login", login);

rotas.use(validarLogin);

rotas.get("/usuario", detalharUsuario);
rotas.put("/usuario", validarCamposObrigatoriosUsuario, criptografarSenha, validarEmailUsuario, atualizarUsuario);

rotas.post("/produto", multer.single("produto_imagem"), validarCamposObrigatoriosProduto, validarIdCategoria, cadastrarProduto );
rotas.put("/produto/:id", multer.single("produto_imagem"), validarCamposObrigatoriosProduto, validarIdProduto, validarIdCategoria, editarDadosProduto);
rotas.get("/produto", validarIdCategoria, listarProdutos);
rotas.get("/produto/:id", validarIdProduto, detalharProduto);
rotas.delete("/produto/:id",validarIdProduto, deletarProduto);

rotas.post("/cliente", validarCamposObrigatoriosCliente, validarEmailCpfCliente, cadastrarCliente);
rotas.put("/cliente/:id", validarCamposObrigatoriosCliente, validarIdCliente, validarEmailCpfCliente, editarDadosCliente);
rotas.get("/cliente", listarClientes);
rotas.get("/cliente/:id", validarIdCliente, detalharCliente);

rotas.post("/pedido", validarIdCliente, cadastrarPedido);
rotas.get("/pedido", validarIdCliente, listarPedidos);

module.exports = rotas;
