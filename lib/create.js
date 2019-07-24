'use strict';
const vm = require('vm');
const numeric = require('numeric');
const string2json = require('string-to-json');

var buildContext = function (variables) {
  let _global = {
    assignments: {},
    error: '',
  };
  let context = variables.reduce((result, current) => {
    result._global.assignments[current.variable_name] = null;
    return result;
  }, { _global, });
  return context;
};

var buildScript = function (variables) {
  let allVars = variables.map(variable => variable.variable_name).filter((x, i, a) => a.indexOf(x) == i).join(',') || 'test';
  let script = variables.reduce((result, current) => {
    let fn = new Function(current.assignment_operation);
    result += '\t';
    result += `${current.variable_name} = (${fn.toString()})();\r\n`;
    result += `_global.assignments['${current.variable_name}'] = (${fn.toString()})();\r\n`;
    return result;
  }, `"use strict";\r\ntry{\r\nlet ${allVars};\r\n`);
  script += '} catch(e){ \r\n\t _global.error = e.message \r\n}';
  return script;
};

var prepareAssignment = function (state, sandbox, script) {
  sandbox.numeric = numeric;
  sandbox._global = Object.assign({}, sandbox._global, state);
  sandbox = Object.assign({}, sandbox, state);
  let assignment = new vm.Script(script);
  vm.createContext(sandbox);
  return { sandbox, assignment, };
};

var generateAssignment = function (configuration, module_name) {
  let context = buildContext(configuration.variables);
  let script = buildScript(configuration.variables);
  return function assign(state) {
    let _state = Object.assign({}, state);
    let _context = Object.assign({}, context);
    let { sandbox, assignment, } = prepareAssignment(_state, _context, script, module_name);
    assignment.runInContext(sandbox);
    if (sandbox._global.error) state.error = {
      code: '',
      message: sandbox._global.error,
    };
    return {
      'type': 'assignments',
      'name': module_name,
      segment: configuration.name,
      'assignments': string2json.convert(sandbox._global.assignments),
      'error': sandbox._global.error,
    };
  };
};

module.exports = generateAssignment;