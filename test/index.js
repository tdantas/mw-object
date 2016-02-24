const Chain = require('../');
const assert = require('assert');

const httpVerbs = ['get', 'post', 'put', 'delete'];

function delay(fn, times) {
  var count = 1;
  return function wrapper() {
    if (count < times) return count++;
    fn();
  }
}

describe('Middleware Object', () => {

  it('returns an object with functions associated', () => {
    const app = Chain(httpVerbs);
    httpVerbs.forEach((name) => {
      assert(app[name]);
    });
  });

  it('extends an object', () => {
    const obj = { age: 12 };
    const app = Chain(httpVerbs, obj);

    assert.equal(app.age, 12);
    httpVerbs.forEach((name) =>{
      assert(app[name]);
    });
  });

  it('contains the run method', () => {
    const app = Chain(httpVerbs);

    httpVerbs.forEach((name) =>{
      assert(app[name].run);
    });
  });

  httpVerbs.forEach( (verb) => { 

    it(`creates the function as middleware approach - ${verb}`, (done) => {
      const app = Chain([verb]);

      app[verb](validate, verify);
      const request = { host: 'localhost' };
      const response = { size: 100 };

      app[verb].run(request, response);

      function validate(req, res, next) {
        req.validatedBy = { method: verb, value: true };
        res.json = { method: verb, value: true };
        next();
      }

      function verify(req, res) {
        assert.equal(req.validatedBy.method, verb);
        assert.equal(req.validatedBy.value, true);
        assert.equal(res.json.method, verb);
        assert.equal(res.json.value, true);
        assert.equal(req.host, 'localhost');
        assert.equal(res.size, 100);
        done();
      }
    });
  });

  it('stop the chain when do not call next', (done) => {
    const app = Chain(['get']);
  
    app.get(validate, verify);
    app.get.run({});

    function validate(request, next) { setTimeout(done, 0); }
    function verify() { assert(false, 'should never be here'); }
  });

  it('do not throw for invalid function name', () => {
    const app = Chain(['get']);
  
    app.get(validate, verify);
    app.run('post',{});

    function validate(request, next) { assert(false, 'should never be here'); }
    function verify() { assert(false, 'should never be here'); }
  });

  it('throw if conflicts dispatcher function name', () => {
    Chain(['get'], { run: function() {} });
  });

  it('allows to change the dispatcher function name', (done) => {
    done = delay(done, 2);
    var obj = { run: true };
    const app = Chain(['get'], obj, { dispatcherName: 'mw' });
  
    app.get(validate, verify);
    app.mw('get', {});
    app.get.mw({});

    function validate(request, next) { next(); }
    function verify() { done(); }
    
  
  });

});
