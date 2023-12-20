const paginacao = (pagina, limite, total) => {
    return {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite)
    };
};

module.exports = paginacao;