function pathJoin(...args) {
  return [...args].join('/');
}

module.exports = {
  pathJoin,
};
