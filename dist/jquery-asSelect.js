/**
* jQuery asSelect v0.2.0
* https://github.com/amazingSurge/jquery-asSelect
*
* Copyright (c) amazingSurge
* Released under the LGPL-3.0 license
*/
(function(global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('jquery'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.jQuery);
    global.jqueryAsSelectEs = mod.exports;
  }
})(this,

  function(_jquery) {
    'use strict';

    var _jquery2 = _interopRequireDefault(_jquery);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ?

      function(obj) {
        return typeof obj;
      }
      :

      function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;

          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);

        if (staticProps)
          defineProperties(Constructor, staticProps);

        return Constructor;
      };
    }();

    /*eslint no-empty-function: "off"*/

    var DEFAULTS = {
      namespace: 'asSelect',
      skin: null,
      trigger: 'click', // 'hover' or 'click'
      offset: [0, 0], // set panel offset to trigger element
      json: null, // if is a object,it will build from the object
      preload: false, // preload some data set in load option
      load: null, // preload data set here
      maxHeight: 350, // set panel maxHeight, lists' height is bigger than maxHeight, scroll bar will show
      select: undefined, // set initial selest value

      render: {
        label: function label(selected) {
          if (selected) {

            return selected.text;
          }

          return 'Choose one';
        },
        option: function option(item) {
          return item.text;
        },
        group: function group(item) {
          return item.label;
        }
      },

      onChange: function onChange() {}
    };

    var NAMESPACE$1 = 'asSelect';
    var instances = [];
    /**
     * Plugin constructor
     **/

    var asSelect = function() {
      function asSelect(element, options) {
        _classCallCheck(this, asSelect);

        this.element = element;
        this.$select = (0, _jquery2.default)(element);

        // options
        var metas = [];
        _jquery2.default.each(this.$select.data(),

          function(k, v) {
            var re = new RegExp("^asSelect", "i");

            if (re.test(k)) {
              metas[k.toLowerCase().replace(re, '')] = v;
            }
          }
        );

        this.options = _jquery2.default.extend(true, {}, DEFAULTS, options, metas);
        this.namespace = this.options.namespace;

        this.classes = {
          wrapper: this.namespace + '-wrapper',
          old: this.namespace + '-old',
          dropdown: this.namespace + '-dropdown',
          trigger: this.namespace + '-trigger',
          label: this.namespace + '-label',
          handler: this.namespace + '-handler',
          item: this.namespace + '-item',
          group: this.namespace + '-group',
          mask: this.namespace + '-mask',

          skin: this.namespace + '_' + this.options.skin,
          open: this.namespace + '_open',
          disabled: this.namespace + '_disabled',
          selected: this.namespace + '_selected',
          focus: this.namespace + '_focus',
          loading: this.namespace + '_loading',
          error: this.namespace + '_error'
        };

        // flag
        this.opened = false;
        this.eventBinded = false;
        this.inFocus = true;
        // this.loading = false;
        this.currentIndex = this.options.select;
        this.isScroll = false;
        this.last = 0;
        this.disabled = false;
        this.initialized = false;

        this._trigger('init');
        this.init();
      }

      _createClass(asSelect, [{
        key: 'init',
        value: function init() {
          this.$wrapper = this.$select.wrap('<div class="' + this.classes.wrapper + '"><div class="' + this.classes.old + '" ></div></div>').parent().parent();
          this.$trigger = (0, _jquery2.default)('<div class="' + this.classes.trigger + '"><div class="' + this.classes.handler + '"></div></div>');
          this.$label = (0, _jquery2.default)('<div class="' + this.classes.label + '">' + this.options.render.label() + '</div>').prependTo(this.$trigger);
          this.$dropdown = (0, _jquery2.default)('<div class="' + this.classes.dropdown + '"><ul></ul></div>');
          this.$ul = this.$dropdown.children('ul');
          this.$options = this.$select.find('option');

          if (this.options.skin) {
            this.$wrapper.addClass(this.classes.skin);
          }

          if (this.$select.prop('disabled')) {
            this.disable();
          }

          this.unChooseText = this.$label.text();
          this.$dropdown.css('maxHeight', this.options.maxHeight);

          // parse data from select label
          this.data = this.parse(this.$select.children());

          // render html from data
          this.update(true);

          // add to page
          this.$wrapper.append(this.$trigger).append(this.$dropdown);

          // attach event
          this.attachInitEvent();

          // set initial value
          // this.select(this.currentIndex);

          if (this.options.preload) {
            this.onLoad();
          }

          // hold every instance
          instances.push(this);
          this.initialized = true;
          this._trigger('ready');
        }
      }, {
        key: '_trigger',
        value: function _trigger(eventType) {
          var _ref;

          for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
          }

          var data = (_ref = [this]).concat.apply(_ref, params);

          // event
          this.$select.trigger(NAMESPACE$1 + '::' + eventType, data);

          // callback
          eventType = eventType.replace(/\b\w+\b/g,

            function(word) {
              return word.substring(0, 1).toUpperCase() + word.substring(1);
            }
          );
          var onFunction = 'on' + eventType;

          if (typeof this.options[onFunction] === 'function') {
            var _options$onFunction;

            (_options$onFunction = this.options[onFunction]).apply.apply(_options$onFunction, [this].concat(params));
          }
        }
      }, {
        key: 'onLoad',
        value: function onLoad() {
          var _this = this;

          var fn = this.options.load;

          if (!fn) {

            return;
          }
          this.load(

            function(callback) {
              fn.apply(_this, [callback]);
            }
          );
        }
      }, {
        key: 'load',
        value: function load(fn) {
          var that = this;
          that.$wrapper.addClass(that.classes.loading);

          that.loading++;
          fn.apply(that, [

            function(results) {
              that.loading = Math.max(that.loading - 1, 0);

              if (results && results.length) {
                that.addData(results);
              }

              if (!that.loading) {
                that.$wrapper.removeClass('loading');
              }

              that._trigger('load', results);
            }
          ]);
        }
      }, {
        key: 'render',
        value: function render(data) {
          var html = '';
          var that = this;
          var buildOption = function buildOption(item) {
            return '<li class="' + that.classes.item + '">' + that.options.render.option.call(that, item) + '</li>';
          };

          _jquery2.default.each(data,

            function(i, item) {
              if (item.group) {
                html += '<li class="' + that.classes.group + '">';

                html += '<div class="' + that.namespace + '-group-label">' + that.options.render.group.call(that, item) + '</div>';
                html += '<ul>';

                if (_jquery2.default.isArray(item.options)) {
                  _jquery2.default.each(item.options,

                    function(j, option) {
                      html += buildOption(option);
                    }
                  );
                }

                html += '</ul>';
                html += '</li>';
              } else {
                html += buildOption(item);
              }
            }
          );

          that.$ul.html(html);
        }
      }, {
        key: 'freshOptions',
        value: function freshOptions(data) {
          var that = this;
          var html = '';

          var buildOption = function buildOption(item) {
            return '<option value="' + item.value + '">' + item.text + '</option>';
          };

          if (_jquery2.default.isArray(data)) {
            _jquery2.default.each(data,

              function(i, item) {
                if (item.group) {
                  html += '<optgroup label="' + item.label + '">';

                  if (_jquery2.default.isArray(item.options)) {
                    _jquery2.default.each(item.options,

                      function(j, option) {
                        html += buildOption(option);
                      }
                    );
                  }

                  html += '</optgroup>';
                } else {
                  html += buildOption(item);
                }
              }
            );
          }

          that.$select.html(html);
        }
      }, {
        key: 'parse',
        value: function parse($selects) {
          var that = this;
          var data = [];

          var optionToData = function optionToData() {
            return _jquery2.default.extend({}, (0, _jquery2.default)(this).data(), {
              'value': this.value,
              'text': this.text,
              'slug': that.replaceDiacritics(this.text)
            });
          };

          $selects.each(

            function() {
              var _this2 = this;

              if (this.tagName.toLowerCase() === 'optgroup') {
                (function() {
                  var group = _jquery2.default.extend({}, (0, _jquery2.default)(_this2).data(), {
                    'group': true,
                    'label': _this2.label,
                    'options': []
                  });

                  (0, _jquery2.default)(_this2).children().each(

                    function() {
                      group.options.push(optionToData.call(this));
                    }
                  );
                  data.push(group);
                })();
              } else {
                data.push(optionToData.call(this));
              }
            }
          );

          this.$options.each(

            function(key, option) {
              if ((0, _jquery2.default)(option).prop('selected')) {
                that.currentIndex = key;
              }
            }
          );

          return data;
        }
      }, {
        key: 'update',
        value: function update(noFreshOptions) {
          this.render(this.data);

          if (noFreshOptions !== true) {
            this.freshOptions(this.data);
          }

          this.$items = this.$dropdown.find('.' + this.classes.item);
          this.$options = this.$select.find('option');
          this.total = this.$items.length;
          this.last = 0;

          if (this.initialized) {
            this.currentIndex = 0;
          }

          this.$wrapper.removeClass(this.classes.error);

          if (this.$dropdown.height() > this.$ul.outerHeight()) {
            this.isScroll = true;
          } else {
            this.isScroll = false;
          }

          if (this.currentIndex >= 0) {
            this._set(this.currentIndex);
          } else {
            this.$label.text(this.unChooseText);
          }
        }
      }, {
        key: 'select',
        value: function select(index) {
          if (typeof index === 'number' && index >= 0) {

            if (this.isScroll) {
              this.scrollToVisibility(index);
            }
            this._set(index);
          }
        }
      }, {
        key: '_set',
        value: function _set(index) {
          var item = this.$items[index];
          var $item = (0, _jquery2.default)(item);
          this.last = this.currentIndex;
          this.currentIndex = index;
          this.$label.text($item.text());

          if (this.$options.length) {
            (0, _jquery2.default)(this.$options[index]).prop('selected', true);
          }
          this.$items.removeClass(this.classes.selected);
          $item.addClass(this.classes.selected);

          if (this.last !== this.currentIndex) {
            // pass source data object
            this._trigger('change', [this.getCurrentData(index).value]);
          }
        }
      }, {
        key: 'getCurrentData',
        value: function getCurrentData(index) {
          var count = 0;
          var result = null;
          _jquery2.default.each(this.data,

            function(i, item) {
              if (item.group) {

                if (_jquery2.default.isArray(item.options)) {
                  _jquery2.default.each(item.options,

                    function(j, option) {
                      count++;

                      if (index + 1 === count) {
                        result = option;
                      }
                    }
                  );
                }
              } else {
                count++;

                if (index + 1 === count) {
                  result = item;
                }
              }
            }
          );

          return result;
        }
      }, {
        key: 'getCurrentIndex',
        value: function getCurrentIndex(data) {
          var count = 0;
          var index = 0;
          _jquery2.default.each(this.data,

            function(i, item) {
              if (item.group) {

                if (_jquery2.default.isArray(item.options)) {
                  _jquery2.default.each(item.options,

                    function(j, option) {
                      if (option.value === data) {
                        index = count;
                      }
                      count++;
                    }
                  );
                }
              } else {

                if (item.value === data) {
                  index = count;
                }
                count++;
              }
            }
          );

          return index;
        }
      }, {
        key: 'get',
        value: function get() {
          return this.getCurrentData(this.currentIndex).value;
        }
      }, {
        key: 'replaceDiacritics',
        value: function replaceDiacritics(s) {
          // /[\340-\346]/g, // a
          // /[\350-\353]/g, // e
          // /[\354-\357]/g, // i
          // /[\362-\370]/g, // o
          // /[\371-\374]/g, // u
          // /[\361]/g, // n
          // /[\347]/g, // c
          // /[\377]/g // y

          var d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' ');
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {

            for (var _iterator = d[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var k = _step.value;

              if (Object.hasOwnProperty.call(d, k)) {
                s = s.toLowerCase().replace(new RegExp('[' + d[k] + ']', 'g'), 'aeiouncy'.charAt(k));
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {

              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          return s;
        }
      }, {
        key: 'position',
        value: function position() {
          var height = this.$trigger.outerHeight(true);
          var offset = this.$trigger.offset();
          var contentHeight = this.$dropdown.outerHeight(true);
          var top = void 0;

          if (contentHeight + offset.top > (0, _jquery2.default)(window).height() + (0, _jquery2.default)(window).scrollTop()) {
            top = -contentHeight - parseInt(this.options.offset[0], 10);
          } else {
            top = height + parseInt(this.options.offset[0], 10);
          }

          this.$dropdown.css({
            top: top
          });
        }
      }, {
        key: 'attachInitEvent',
        value: function attachInitEvent() {
          var that = this;

          if (this.options.trigger === 'hover') {
            this.$trigger.on('mouseenter.asSelect',

              function() {
                that.open();
              }
            );
            this.$wrapper.on('mouseleave.asSelect',

              function() {
                that.close();

                return false;
              }
            );
          } else {
            this.$trigger.on('click.asSelect',

              function() {
                if (that.opened) {
                  that.close();
                } else {
                  that.open();
                }
              }
            );
          }

          this.$select.on('focus.asSelect',

            function() {
              that.$wrapper.addClass(that.classes.focus);
              that.inFocus = true;
            }
          ).on('blur',

            function() {
              that.$wrapper.removeClass(that.classes.focus);
              that.inFocus = false;
            }
          );

          this.$dropdown.on('click.asSelect', '.' + this.classes.item,

            function() {
              var index = that.$items.index((0, _jquery2.default)(this));
              that.select(index);
              that.close();
            }
          );
        }
      }, {
        key: 'dettachInitEvents',
        value: function dettachInitEvents() {
          this.$trigger.off('.asSelect');
          this.$wrap.off('.asSelect');
          this.$select.off('.asSelect');
          this.$dropdown.off('.asSelect');
        }
      }, {
        key: 'keyboardEvent',
        value: function keyboardEvent() {
          var that = this;
          (0, _jquery2.default)(document).on('keydown.asSelect',

            function(e) {
              var key = e.which || e.keycode;

              if (/^(9|13|27)$/.test(key)) {
                // close shortcut
                that.close();

                return false;
              }

              if (key < 37 || key > 40) {
                // search

                if (that.isScroll) {
                  that.search(key);
                }
              } else if (/^(38|40)$/.test(key)) {
                // key navigate
                var direction = key === 38 ? 'up' : 'down';
                that.navigate(direction);

                return false;
              }
            }
          );
        }
      }, {
        key: 'search',
        value: function search(key) {
          var searchString = '';
          var currentIndex = void 0;
          clearTimeout(this.timeout);
          searchString = new RegExp('^' + (searchString += String.fromCharCode(key)), 'i');
          this.timeout = setTimeout(

            function() {
              searchString = '';
            }
            , 16);

          _jquery2.default.each(this.$items,

            function(index, value) {
              /*eslint consistent-return: "off"*/
              var string = _jquery2.default.trim((0, _jquery2.default)(value).text());

              if (searchString.test(string)) {
                currentIndex = index;

                return false;
              }
            }
          );

          if (currentIndex >= 0) {
            this.select(currentIndex);
          }
        }
      }, {
        key: 'scrollToVisibility',
        value: function scrollToVisibility(index) {
          var item = this.$items[index];
          var scrollTop = void 0;
          var itemHeight = (0, _jquery2.default)(item).outerHeight();
          var oriScrollTop = this.$dropdown.scrollTop();
          var bottom = oriScrollTop + this.$dropdown.height();
          var distance = (0, _jquery2.default)(item).position().top;

          if (distance < oriScrollTop) {
            scrollTop = distance;
          } else if (distance > bottom - itemHeight) {
            scrollTop = distance + itemHeight - this.$dropdown.height();
          } else {

            return;
          }
          this.$dropdown.scrollTop(scrollTop);
        }
      }, {
        key: 'navigate',
        value: function navigate(direction) {
          var total = this.total;
          var index = this.currentIndex < 0 ? 0 : this.currentIndex;

          if (direction === 'up') {
            index = index <= 0 ? total - 1 : index - 1;
          } else {
            index = index >= total - 1 ? 0 : index + 1;
          }
          this.select(index);
        }
      }, {
        key: '_generateMask',
        value: function _generateMask() {
          var that = this;

          if (this.options.trigger === 'hover') {

            return;
          }
          this.$mask = (0, _jquery2.default)('<div class="' + this.classes.mask + '"></div>').appendTo(this.$wrapper);
          this.$mask.on('click.asSelect',

            function() {
              that.close();

              return false;
            }
          );
        }
      }, {
        key: '_clearMask',
        value: function _clearMask() {
          if (this.options.trigger === 'hover') {

            return;
          }
          this.$mask.off('click.asSelect');
          this.$mask.remove();
          this.$mask = null;
        }
      }, {
        key: 'open',
        value: function open() {
          if (this.opened || this.disabled) {

            return;
          }

          this.$select.focus();
          this.closeAll();
          this.$wrapper.addClass(this.classes.open);
          this._generateMask();
          this.keyboardEvent();
          this.position();

          this._trigger('open');
          this.opened = true;
        }
      }, {
        key: 'close',
        value: function close() {
          this.$wrapper.removeClass(this.classes.open);
          this._clearMask();
          (0, _jquery2.default)(document).off('keydown.select');
          this._trigger('close');
          this.opened = false;
        }
      }, {
        key: 'closeAll',
        value: function closeAll() {
          _jquery2.default.each(instances,

            function(key, instance) {
              if (instance.opened) {
                instance.close();
              }
            }
          );
        }
      }, {
        key: 'addData',
        value: function addData(data) {
          var that = this;

          if (_jquery2.default.isArray(data)) {
            _jquery2.default.each(data,

              function(i, item) {
                if (!item.group) {
                  data[i].slug = that.replaceDiacritics(item.text);
                }
              }
            );
            this.data = this.data.concat(data);
            this.update();
          }
        }
      }, {
        key: 'removeData',
        value: function removeData(data) {
          return data;
        }
      }, {
        key: 'enable',
        value: function enable() {
          this.disabled = false;
          this.$trigger.removeClass(this.classes.disabled);
          this._trigger('enable');

          return this;
        }
      }, {
        key: 'disable',
        value: function disable() {
          this.disabled = true;
          this.$trigger.addClass(this.classes.disabled);
          this._trigger('disable');

          return this;
        }
      }, {
        key: 'destroy',
        value: function destroy() {
          this.dettachInitEvents();
          (0, _jquery2.default)(document).off('.asSelect');

          this.$dropdown.remove();
          this.$trigger.remove();
          this.$select.unwrap().unwrap();
          this._trigger('destroy');
        }
      }], [{
        key: 'setDefaults',
        value: function setDefaults(options) {
          _jquery2.default.extend(DEFAULTS, _jquery2.default.isPlainObject(options) && options);
        }
      }]);

      return asSelect;
    }();

    var info = {
      version: '0.2.0'
    };

    var NAMESPACE = 'asSelect';
    var OtherAsScrollbar = _jquery2.default.fn.asSelect;

    var jQueryasSelect = function jQueryasSelect(options) {
      var _this3 = this;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (typeof options === 'string') {
        var _ret2 = function() {
          var method = options;

          if (/^_/.test(method)) {

            return {
              v: false
            };
          } else if (/^(get)/.test(method)) {
            var instance = _this3.first().data(NAMESPACE);

            if (instance && typeof instance[method] === 'function') {

              return {
                v: instance[method].apply(instance, args)
              };
            }
          } else {

            return {
              v: _this3.each(

                function() {
                  var instance = _jquery2.default.data(this, NAMESPACE);

                  if (instance && typeof instance[method] === 'function') {
                    instance[method].apply(instance, args);
                  }
                }
              )
            };
          }
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object")

          return _ret2.v;
      }

      return this.each(

        function() {
          if (!(0, _jquery2.default)(this).data(NAMESPACE)) {
            (0, _jquery2.default)(this).data(NAMESPACE, new asSelect(this, options));
          }
        }
      );
    };

    _jquery2.default.fn.asSelect = jQueryasSelect;

    _jquery2.default.asSelect = _jquery2.default.extend({
      setDefaults: asSelect.setDefaults,
      noConflict: function noConflict() {
        _jquery2.default.fn.asSelect = OtherAsScrollbar;

        return jQueryasSelect;
      }
    }, info);
  }
);