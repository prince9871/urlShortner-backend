function isValidString(string) {
  if (typeof string !== "string" || string.length === 0) {
    return false;
  }
  return true;
}

module.exports = { isValidString };
