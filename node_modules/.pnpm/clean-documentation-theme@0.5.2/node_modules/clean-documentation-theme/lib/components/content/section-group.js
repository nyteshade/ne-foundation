'use strict';

var React = require('react');
var Radium = require('radium');
var PropTypes = require('prop-types');

var Utils = require('../../utils');
var SectionMember = require('./section-member');

var SectionGroup = function SectionGroup(_ref) {
  var name = _ref.name,
      utils = _ref.utils,
      members = _ref.members,
      parent = _ref.parent;

  var style = {
    textTransform: 'uppercase'
  };

  var displayParent = void 0;
  if (name === 'static') {
    displayParent = parent;
  } else if (name === 'instance') {
    displayParent = parent + '.prototype';
  }

  return React.createElement(
    'div',
    null,
    React.createElement(
      'h2',
      { style: style },
      name
    ),
    members.map(function (m, i) {
      return React.createElement(SectionMember, {
        key: i,
        name: m.name,
        namespace: m.namespace,
        description: m.description,
        parent: displayParent,
        member: m,
        utils: utils });
    })
  );
};

SectionGroup.propTypes = {
  name: PropTypes.string.isRequired,
  members: PropTypes.array.isRequired,
  parent: PropTypes.string.isRequired,
  utils: PropTypes.instanceOf(Utils).isRequired
};

module.exports = Radium(SectionGroup);