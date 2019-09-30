export function parseQuery(query = location.search) {
    const parsed = {};
    query = query.startsWith("?") ? query.slice(1) : query;
    const parts = query.split("&");
    for (const part of parts) {
        const [key, ...rest] = part.split("=");
        const value = rest.join("=");
        parsed[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return parsed;
}
//# sourceMappingURL=parse-query.js.map