function parseFullName(name) {
  return name.replace(/\./g, '/');
}

exports.parseFullName = parseFullName;
