'use strict';

var React = require('react');
var Radium = require('radium');
var Style = Radium.Style;

var PropTypes = require('prop-types');

var Utils = require('../../utils');

var _require = require('../styles'),
    contentStyles = _require.contentStyles;

var Section = require('./section');

var Content = function Content(_ref) {
  var utils = _ref.utils,
      docs = _ref.docs;

  return React.createElement(
    'div',
    { className: 'content' },
    React.createElement(Style, { rules: contentStyles }),
    docs.map(function (section, i) {
      return React.createElement(Section, {
        key: i,
        name: section.name,
        namespace: section.namespace,
        section: section,
        description: section.description,
        utils: utils });
    })
  );
};

Content.propTypes = {
  utils: PropTypes.instanceOf(Utils).isRequired,
  docs: PropTypes.array.isRequired
};

module.exports = Radium(Content);