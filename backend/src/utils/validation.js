/**
 * Validates email format using Regex
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

/**
 * Validates password strength (min 6 chars)
 * @param {string} password
 * @returns {boolean}
 */
const isValidPassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Checks if a string is not empty
 * @param {string} str
 * @returns {boolean}
 */
const isRequired = (str) => {
    return str && str.trim().length > 0;
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isRequired
};
