/**
 * @class NotFound
 * @summary Classe de erro para recursos não encontrados (HTTP 404).
 * @description Lançada quando uma consulta a um recurso específico (ex: buscar
 * um usuário pelo ID) não retorna nenhum resultado, indicando que o
 * recurso não existe.
*/
class NotFound extends Error {
    constructor(message = "Recurso não encontrado"){
        super(message)
        this.statusCode = 404;
    };
};

module.exports = NotFound;