exports.config = {
  tests: './workers/*.js',
  timeout: 10000,
  output: './output',
  helpers: {
    FileSystem: {},
    Workers: {
      require: './workers_helper',
    },
  },
  include: {},
  bootstrap: async () => {
    return new Promise(done => {
      process.stdout.write('bootstrap b1+');
      setTimeout(() => {
        process.stdout.write('b2');
        done();
      }, 100);
    });
  },
  mocha: {},
  name: 'sandbox',
};
