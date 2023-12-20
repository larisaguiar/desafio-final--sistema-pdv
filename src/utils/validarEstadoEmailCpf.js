const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const validarFormatoEstado = (estado) => {
  if (!estadosBrasileiros.includes(estado.toUpperCase())) {
    return "Formato inválido. O estado precisa ser uma sigla válida (ex: SP, RJ).";
  }

  return null;
};

const validarFormatoEmail = (email) => {
  const validarEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (!validarEmail.test(email)) {
    return "Formato de e-mail inválido.";
  }

  return null;
};

const validarFormatoCpf = (cpf) => {
  const validarCpf = /^\d{11}$/;

  if (!validarCpf.test(cpf)) {
    return "CPF inválido. Precisa conter 11 dígitos e só são aceitos números.";
  }

  return null;
};

module.exports = {
  validarFormatoEstado,
  validarFormatoEmail,
  validarFormatoCpf,
};
