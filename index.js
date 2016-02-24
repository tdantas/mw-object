const _ = require('lodash');

module.exports = Chain;

function Chain(names, object) {
  if (object === undefined)
    object = { };
    
   const handlers = { };
   return names.reduce(register, object);

  function register(obj, method) {
    const snake_case = _.snakeCase(method);
    const camelCase = _.camelCase(method);

    if (obj.camelCase)
        console.warn(`overriding ${camelCase} function`);

    if (obj.snake_case)
        console.warn(`overriding ${snake_case} function`);

    obj[camelCase] = obj[snake_case] = mwWrapper;
    mwWrapper.run = run.bind(null, snake_case);

    function mwWrapper() {
      const args = _.toArray(arguments);
      const hdlrs = handlers[snake_case] || [];
      handlers[snake_case] = hdlrs.concat(args);
    }

    return obj;
  }

  function run() {
    const args = _.toArray(arguments);
    const methodName = _.snakeCase(args.shift());
    const  hdlrs = handlers[methodName] || [];

    var fns = hdlrs.slice();
    var fn = fns.shift();
    args.push(next);

    if (fn)
      return fn.apply(fn, args);

    function next() {
      const fn = fns.shift();
      if (fn)
        fn.apply(fn, args);
    }
  }
}
