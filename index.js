const _ = require('lodash');

module.exports = Chain;

const defaults = { dispatcherName: 'run' };

function Chain(names, object, opts) {
  const config = _.defaults(opts, defaults);

  if (object === undefined)
    object = { };
    
   const handlers = { };
   names.reduce(register, object);

   if (object.mw)
     throw new Error('object has already mw function. use dispatcherName option to change'); 

   object[config.dispatcherName] = run;
   return object;

  function register(obj, method) {
    const snake_case = _.snakeCase(method);
    const camelCase = _.camelCase(method);

    if (obj.camelCase)
        console.warn(`overriding ${camelCase} function`);

    if (obj.snake_case)
        console.warn(`overriding ${snake_case} function`);

    obj[camelCase] = obj[snake_case] = mwWrapper;
    mwWrapper[config.dispatcherName] = run.bind(null, snake_case);

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
