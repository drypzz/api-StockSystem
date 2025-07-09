/**
 * @function makeMessage
 * @summary Gera uma mensagem de erro dinâmica listando os campos ausentes.
 * @description Analisa um objeto e identifica as chaves cujos valores são 'falsy'
 * (nulos, indefinidos, etc.), formatando uma mensagem que especifica exatamente
 * quais campos obrigatórios não foram preenchidos.
*/
function makeMessage(object, message){
    const keys = Object.keys(object)

    if (keys.length === 0){
        return message
    };

    const fields = Object.values(object)
    const fieldsMessage = fields.map((e, index) => !e ? `"${keys[index]}"` : null).filter(e => e !== null).join(", ")

    return `Faltam os seguintes valores obrigátorios: ${fieldsMessage}`;
};

/**
 * @class MissingValues
 * @summary Classe de erro para dados obrigatórios ausentes (HTTP 400).
 * @description Utilizada para sinalizar que um ou mais campos necessários para
 * uma operação não foram fornecidos na requisição. Usa a função 'makeMessage'
 * para criar uma resposta detalhada.
*/
class MissingValues extends Error {
    constructor(object, message = "Faltam valores obrigátorios"){
        super(makeMessage(object, message))
        this.statusCode = 400
    };
};

module.exports = MissingValues;