'use strict';

var inputElKey = Symbol('inputEl');
var ownerKey = Symbol('owner');
var multipleKey = Symbol('multiple');
var acceptKey = Symbol('accept');
var filesKey = Symbol('files');

function FileButton() {
  var fileButton = document.createElement('button');

  fileButton[inputElKey] = (function () {
    var inputEl = document.createElement('input');

    inputEl.type = 'file';
    inputEl.addEventListener('change', handleInputChange);
    inputEl[ownerKey] = fileButton;
    return inputEl;
  })();

  fileButton[multipleKey] = false;
  fileButton[acceptKey] = '';
  fileButton[filesKey] = fileButton[inputElKey].files;
  Object.defineProperties(fileButton, customProps);

  fileButton.addEventListener('click', handleClick, true);
  fileButton.addEventListener('dragover', handleDragOver, true);
  fileButton.addEventListener('drop', handleDrop, true);

  fileButton.textContent = 'Choose file';

  return fileButton;
}

var customProps = {

  multiple: {
    get() {
      return this[multipleKey];
    },
    set(value) {
      this[multipleKey] = Boolean(value);
    },
  },

  accept: {
    get() {
      return this[acceptKey];
    },
    set(value) {
      this[acceptKey] = String(value);
    },
  },

  files: {
    get() {
      return this[filesKey];
    },
  },

};

function handleClick(e) {
  var inputEl = this[inputElKey];

  inputEl.multiple = this.multiple;
  inputEl.accept = this.accept;
  inputEl.value = '';
  inputEl.click();
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();

  // We should use .dropEffect to provide feedback on whether the file matches
  // .multiple and .accept, but the browser won't let us test that yet.
  e.dataTransfer.dropEffect = hasFiles(e.dataTransfer) ? 'copy' : 'none';
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  var files = e.dataTransfer.files;
  var accept = this.accept;

  if (
    hasFiles(e.dataTransfer) &&
    (this.multiple || files.length === 1) &&
    [].every.call(files, function (file) {
      return acceptMatches(accept, file);
    })
  ) {
    updateFiles(this, files);
  }
}

function handleInputChange(e) {
  updateFiles(this[ownerKey], this.files);
}

function hasFiles(dataTransfer) {
  // Cannot use dataTransfer.files, that is not populated until the drop event
  return Array.prototype.indexOf.call(dataTransfer.types, 'Files') !== -1;
}

function acceptMatches(accept, file) {
  if (accept === '') return true;

  var parts = accept.split(',');
  var i, part;

  for (i = 0; i < parts.length; i++) {
    part = parts[i].trim();

    if (part === 'audio/*' || part === 'video/*' || part === 'image/*') {
      // MIME type wildcard match
      if (file.type.slice(0, 6) === part.slice(0, 6)) return true;
    } else if (part.charAt(0) === '.') {
      // File extension match
      if (file.name.match(/\.[^.]*$/)[0] === part) return true;
    } else {
      // MIME type match
      if (file.type === part) return true;
    }
  }
  return false;
}

function updateFiles(el, files) {
  el[filesKey] = files;
  el.dispatchEvent(new CustomEvent('change'));
}

module.exports = FileButton;