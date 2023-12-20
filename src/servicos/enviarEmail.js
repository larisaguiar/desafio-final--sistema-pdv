const nodemailer = require("nodemailer");
const compiladorHtml = require("../utils/compiladorHtml");

const enviarEmail = async (email, assunto, pedido) => {
  try {
    const htmlString = await compiladorHtml(
      "./src/templates/emailPedido.html",
      {
        cliente: pedido.cliente,
        pedido,
      }
    );

    const transportador = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let informacoes = await transportador.sendMail({
      from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: assunto,
      html: htmlString,
    });

    console.log("Email enviado: %s", informacoes.messageId);
  } catch (error) {
    console.error("Falha ao enviar email:", error.message);
    throw new Error(
      "Erro ao enviar email. Por favor, tente novamente mais tarde."
    );
  }
};

module.exports = enviarEmail;
