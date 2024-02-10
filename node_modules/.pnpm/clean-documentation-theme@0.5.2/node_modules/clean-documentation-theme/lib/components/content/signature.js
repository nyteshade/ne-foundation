'use strict';

var React = require('react');
var Radium = require('radium');
var PropTypes = require('prop-types');

var Utils = require('../../utils');

var Signature = function Signature(_ref) {
  var member = _ref.member,
      utils = _ref.utils;

  var content = {
    __html: utils.signature(member)
  };

  return React.createElement(
    'pre',
    null,
    React.createElement('code', {
      dangerouslySetInnerHTML: content })
  );
};

Signature.propTypes = {
  member: PropTypes.object,
  utils: PropTypes.instanceOf(Utils).isRequired
};

module.exports = Radium(Signature);