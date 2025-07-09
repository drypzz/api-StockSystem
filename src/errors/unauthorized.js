/**
 * @class Unauthorized
 * @summary Classe de erro para falhas de autenticação (HTTP 401).
 * @description Usada para qualquer falha relacionada à autenticação: senha
 * incorreta, token JWT ausente, inválido ou expirado. Indica que o cliente
 * não tem as credenciais corretas para acessar o recurso.
*/
class Unauthorized extends Error {
    constructor(message = "Não autorizado"){
        super(message)
        this.statusCode = 401
    };
};

module.exports = Unauthorized;