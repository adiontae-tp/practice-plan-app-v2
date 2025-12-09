// Mock for Node.js tty module to prevent "tty.isatty is not a function" errors in Metro
module.exports = {
  isatty: () => false,
  ReadStream: function () {},
  WriteStream: function () {},
};


















