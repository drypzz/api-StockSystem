/**
 * @class Conflict
 * @summary Classe de erro para representar um conflito de recursos (HTTP 409).
 * @description Utilizada quando uma operação não pode ser concluída porque entraria
 * em conflito com o estado atual do recurso. O caso de uso mais comum é a tentativa
 * de criar um registro que já existe (ex: e-mail duplicado).
*/
class Conflict extends Error {
    constructor(message = "Registro já existe"){
        super(message)
        this.statusCode = 409
    };
};

module.exports = Conflict;