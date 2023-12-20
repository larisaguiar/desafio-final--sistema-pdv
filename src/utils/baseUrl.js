const BASE_URL_IMAGENS = "https://status200.s3.us-east-005.backblazeb2.com/";

const construirUrlImagem = (caminhoImagem) => {
  if (!caminhoImagem) {
    return null;
  }
  return `${BASE_URL_IMAGENS}${caminhoImagem}`;
};

module.exports = construirUrlImagem;
