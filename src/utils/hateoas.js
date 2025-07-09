const BASE_API = "/api/v1";

/**
 * @function generateLinks
 * @summary Gera links HATEOAS para recursos da API de forma dinâmica.
 * @param {string} resource - O nome do recurso (ex: "products", "users").
 * @param {string|number|null} [id=null] - O ID de um item específico. Se nulo, gera links para a coleção.
 * @param {string[]} [methods=["GET", "POST", "PUT", "DELETE"]] - Métodos HTTP permitidos para o contexto.
 * @returns {object[]} Um array de objetos de link, cada um com 'rel', 'href' e 'method'.
 * @description Cria links contextuais para uma API RESTful. Se um 'id' não for fornecido,
 * gera links para listar e criar recursos. Se um 'id' for fornecido, gera links para
 * visualizar, atualizar e deletar aquele recurso específico.
*/
function generateLinks(resource, id = null, methods = ["GET", "POST", "PUT", "DELETE"]) {
    const base = `${BASE_API}/${resource}`;
    const links = [];

    if (!id) {
        if (methods.includes("GET")) links.push({ rel: "list", href: base, method: "GET" });
        if (methods.includes("POST")) links.push({ rel: "create", href: base, method: "POST" });
    } else {
        if (methods.includes("GET")) links.push({ rel: "self", href: `${base}/${id}`, method: "GET" });
        if (methods.includes("PUT")) links.push({ rel: "update", href: `${base}/${id}`, method: "PUT" });
        if (methods.includes("DELETE")) links.push({ rel: "delete", href: `${base}/${id}`, method: "DELETE" });
    }

    return links;
}

module.exports = { generateLinks };