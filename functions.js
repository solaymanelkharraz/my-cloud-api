const success = (result) => {
    return { status: 'success', result: result }
}
const error = (message) => {
    return { status: 'error', message: message }
};
module.exports = { success, error };