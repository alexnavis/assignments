'use strict';
const chai = require('chai');
const expect = chai.expect;
const Promisie = require('promisie');
const MOCKS = require('../mocks');
const path = require('path');
const CREATE_EVALUATOR = require(path.join(__dirname, '../../lib')).create;

chai.use(require('chai-spies'));

describe('simple outputs module', function () {
  describe('basic assumptions', function () {
    it('should have a create method that is a function', () => {
      expect(CREATE_EVALUATOR).to.be.a('function');
    });
    it('should accept a segment as an arguments and generate an evaluator', () => {
      let evaluator = CREATE_EVALUATOR(MOCKS.DEFAULT);
      expect(evaluator).to.be.a('function');
    });
  });
  describe('evaluation of general case', function () {
    let evaluation;
    let variableMap = {};
    let variables = MOCKS.DEFAULT.variables;
    before(done => {
      evaluation = CREATE_EVALUATOR(MOCKS.DEFAULT, false, '1');
      variables.forEach(variable => variableMap[ variable.variable_name ] = variable.assignment_operation);
      done();
    });
    it('should return a result object when invoked', async function () {
      let result = await evaluation({ age: 21, });
      expect(result).to.be.an('object');
      expect(result.assignments).to.be.an('object');
      expect(result.type).to.equal('assignments');
      expect(variableMap[ variables[ 0 ].variable_name ]).to.include(result.assignments[ variables[ 0 ].variable_name ]);
      expect(result.segment).to.equal(MOCKS.DEFAULT.name);
    });
    it('should return a result object when invoked without params', async function () {
      let result = await evaluation();
      expect(result).to.be.an('object');
      expect(result.assignments).to.be.an('object');
      expect(variableMap[ variables[ 0 ].variable_name ]).to.include(result.assignments[ variables[ 0 ].variable_name ]);
      expect(result.type).to.equal('assignments');
      expect(result.segment).to.equal(MOCKS.DEFAULT.name);
    });
    it('should override variables on state if they are included in the assignments module', async function () {
      let result = await evaluation({ generic_fail_text: 'should be overwritten', generic_success_message: 'should also be overwritten', });
      expect(result).to.be.an('object');
      expect(result.assignments).to.be.an('object');
      expect(result.assignments['generic_fail_text']).to.not.equal('should be overwritten');
      expect(result.assignments['generic_success_message']).to.not.equal('should also be overwritten');
      expect(result.type).to.equal('assignments');
      expect(result.segment).to.equal(MOCKS.DEFAULT.name);
    });
  });
  describe('error cases', function () {
    let evaluation;
    let variableMap = {};
    let variables = MOCKS.ERROR.variables;
    before(done => {
      evaluation = CREATE_EVALUATOR(MOCKS.ERROR, false, '1');
      variables.forEach(variable => variableMap[ variable.variable_name ] = variable.assignment_operation);
      done();
    });
    // it('should return a result object when invoked', async function () {
    //   let result = await evaluation({ age: 21, });
    //   console.log({ result });
    //   expect(result).to.be.an('object');
    //   expect(result.assignments).to.be.an('object');
    //   expect(result.type).to.equal('assignments');
    //   expect(variableMap[ variables[ 0 ].variable_name ]).to.include(result.assignments[ variables[ 0 ].variable_name ]);
    //   expect(result.segment).to.equal(MOCKS.ERROR.name);
    // });
  });
});