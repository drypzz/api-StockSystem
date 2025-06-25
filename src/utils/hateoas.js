const BASE_API = "/api/v1";

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