function makeMessage(object, message){
    const keys = Object.keys(object)

    if (keys.length === 0){
        return message
    };

    const fields = Object.values(object)
    const fieldsMessage = fields.map((e, index) => !e ? `"${keys[index]}"` : null).filter(e => e !== null).join(", ")

    return `Faltam os seguintes valores obrigátorios: ${fieldsMessage}`;
};


class MissingValues extends Error {
    constructor(object, message = "Faltam valores obrigátorios"){
        super(makeMessage(object, message))
        this.statusCode = 400
    };
};

module.exports = MissingValues;