// utils/hateoas.js
const BASE_API = "/api/v1";

/**
 * Gera links HATEOAS para qualquer recurso RESTful
 * @param {string} resource - Ex: "user", "order", "product"
 * @param {number|string} [id] - ID do recurso (opcional)
 * @param {string[]} [methods] - Métodos HTTP esperados no _resource_ (opcional)
 */
function generateLinks(resource, id = null, methods = ["GET", "POST", "PUT", "DELETE"]) {
    const base = `${BASE_API}/${resource}`;
    const links = {};

    if (!id) {
        if (methods.includes("GET")) links.list = { href: base, method: "GET" };
        if (methods.includes("POST")) links.create = { href: base, method: "POST" };
    } else {
        if (methods.includes("GET")) links.self = { href: `${base}/${id}`, method: "GET" };
        if (methods.includes("PUT")) links.update = { href: `${base}/${id}`, method: "PUT" };
        if (methods.includes("DELETE")) links.delete = { href: `${base}/${id}`, method: "DELETE" };
    }

    return links;
}

module.exports = { generateLinks };
