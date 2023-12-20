const aws = require("aws-sdk");

const endpoint = new aws.Endpoint(process.env.ENDPOINT_BACKBLAZE);

const s3 = new aws.S3({
  endpoint,
  credentials: {
    accessKeyId: process.env.KEY_ID,
    secretAccessKey: process.env.APP_KEY,
  },
});

const uploadImagem = async (path, Buffer, mimeType) => {
  const imagem = await s3
    .upload({
      Bucket: process.env.KEY_NAME,
      Key: path,
      Body: Buffer,
      ContentType: mimeType,
    })
    .promise();

  return {
    path: imagem.Key,
    url: `https://${process.env.KEY_NAME}.${process.env.ENDPOINT_BACKBLAZE}/${imagem.Key}`,
  };
};

const excluirImagem = async (path) => {
  await s3
    .deleteObject({
      Bucket: process.env.KEY_NAME,
      Key: path,
    })
    .promise();
};

module.exports = {
  uploadImagem,
  excluirImagem,
};
