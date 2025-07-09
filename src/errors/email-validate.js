/**
 * @class EmailValidade
 * @summary Classe de erro para formato de e-mail inválido (HTTP 400).
 * @description Lançada especificamente quando o valor de um e-mail não corresponde
 * ao formato esperado, fornecendo uma mensagem de erro clara ao cliente.
*/
class EmailValidade extends Error {
    constructor(email) {
        super(`O email "${email}" não respeita o formato obrigatório.`);
        this.statusCode = 400;
    };
};

module.exports = EmailValidade;