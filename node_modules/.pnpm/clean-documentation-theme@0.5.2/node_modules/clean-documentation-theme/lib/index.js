'use strict';

var path = require('path');
var File = require('vinyl');
var vfs = require('vinyl-fs');
var concat = require('concat-stream');
var render = require('react-dom/server').renderToStaticMarkup;
var React = require('react');

var Html = React.createFactory(require('./components/html.js'));
var App = React.createFactory(require('./components/app.js'));

function pageTemplate(props) {
  var content = render(new App(props));
  var markup = new Html({
    name: props.options.name,
    content: content
  });

  var html = render(markup);

  return '<!doctype html>\n' + html;
}

module.exports = function (comments, options) {
  return new Promise(function (resolve) {
    options.project = options['project-homepage'];

    // push assets into the pipeline as well.
    vfs.src([path.join(__dirname, '/assets/**')], { base: __dirname }).pipe(concat(function (files) {
      resolve(files.concat(new File({
        path: 'index.html',
        contents: Buffer.from(pageTemplate({
          docs: comments,
          options: options
        }), 'utf8')
      })));
    }));
  });
};