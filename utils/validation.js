function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function requireFields(body, fields) {
    if (!body || typeof body !== 'object') return fields;
    const missing = [];
    for (const field of fields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            missing.push(field);
        }
    }
    return missing;
}

module.exports = { validateEmail, requireFields };
