'use strict';

var React = require('react');
var PropTypes = require('prop-types');

var Utils = require('../../utils');

var Type = function Type(_ref) {
  var name = _ref.name,
      val = _ref.val,
      defaultVal = _ref.defaultVal,
      utils = _ref.utils;

  var sig = name + ': ' + utils.formatType(val);
  if (defaultVal) {
    sig += ' (=' + defaultVal + ')';
  }

  return React.createElement('code', { dangerouslySetInnerHTML: { __html: sig } });
};

Type.propTypes = {
  name: PropTypes.string,
  val: PropTypes.any,
  defaultVal: PropTypes.string,
  utils: PropTypes.instanceOf(Utils).isRequired
};

module.exports = Type;