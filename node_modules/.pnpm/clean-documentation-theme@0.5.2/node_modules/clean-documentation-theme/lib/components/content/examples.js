'use strict';

var React = require('react');
var Radium = require('radium');
var PropTypes = require('prop-types');

var Example = require('./example');
var Utils = require('../../utils');

var Examples = function Examples(_ref) {
  var list = _ref.list,
      utils = _ref.utils;

  if (!list || !list.length) {
    return null;
  }

  return React.createElement(
    'div',
    null,
    list.map(function (example, i) {
      return React.createElement(Example, {
        key: i,
        name: example.caption,
        content: example.description,
        utils: utils });
    })
  );
};

Examples.propTypes = {
  list: PropTypes.array,
  utils: PropTypes.instanceOf(Utils).isRequired
};

module.exports = Radium(Examples);