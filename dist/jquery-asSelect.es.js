/**
* jQuery asSelect v0.2.1
* https://github.com/amazingSurge/jquery-asSelect
*
* Copyright (c) amazingSurge
* Released under the LGPL-3.0 license
*/
import $ from 'jquery';

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
    label(selected) {
      if (selected) {
        return selected.text;
      }
      return 'Choose one';
    },
    option(item) {
      return item.text;
    },
    group(item) {
      return item.label;
    }
  },

  onChange: function() {}
};

const NAMESPACE$1 = 'asSelect';
let instances = [];
/**
 * Plugin constructor
 **/
class asSelect {
  constructor(element, options = {}) {
    this.element = element;
    this.$select = $(element);

    // options
    const metas = [];
    $.each(this.$select.data(), (k, v) => {
      const re = new RegExp("^asSelect", "i");
      if (re.test(k)) {
        metas[k.toLowerCase().replace(re, '')] = v;
      }
    });

    this.options = $.extend(true, {}, DEFAULTS, options, metas);
    this.namespace = this.options.namespace;

    this.classes = {
      wrapper: `${this.namespace}-wrapper`,
      old: `${this.namespace}-old`,
      dropdown: `${this.namespace}-dropdown`,
      trigger: `${this.namespace}-trigger`,
      label: `${this.namespace}-label`,
      handler: `${this.namespace}-handler`,
      item: `${this.namespace}-item`,
      group: `${this.namespace}-group`,
      mask: `${this.namespace}-mask`,

      skin: `${this.namespace}_${this.options.skin}`,
      open: `${this.namespace}_open`,
      disabled: `${this.namespace}_disabled`,
      selected: `${this.namespace}_selected`,
      focus: `${this.namespace}_focus`,
      loading: `${this.namespace}_loading`,
      error: `${this.namespace}_error`
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

  init() {
    this.$wrapper = this.$select.wrap(`<div class="${this.classes.wrapper}"><div class="${this.classes.old}" ></div></div>`).parent().parent();
    this.$trigger = $(`<div class="${this.classes.trigger}"><div class="${this.classes.handler}"></div></div>`);
    this.$label = $(`<div class="${this.classes.label}">${this.options.render.label()}</div>`).prependTo(this.$trigger);
    this.$dropdown = $(`<div class="${this.classes.dropdown}"><ul></ul></div>`);
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

  _trigger(eventType, ...params) {
    let data = [this].concat(...params);

    // event
    this.$select.trigger(`${NAMESPACE$1}::${eventType}`, data);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, (word) => {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    let onFunction = `on${eventType}`;

    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, ...params);
    }
  }

  onLoad() {
    const fn = this.options.load;
    if (!fn) {
      return;
    }
    this.load(callback => {
      fn.apply(this, [callback]);
    });
  }

  load(fn) {
    const that = this;
    that.$wrapper.addClass(that.classes.loading);

    that.loading++;
    fn.apply(that, [
      results => {
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

  render(data) {
    let html = '';
    const that = this;
    const buildOption = item => `<li class="${that.classes.item}">${that.options.render.option.call(that, item)}</li>`;

    $.each(data, (i, item) => {
      if (item.group) {
        html += `<li class="${that.classes.group}">`;

        html += `<div class="${that.namespace}-group-label">${that.options.render.group.call(that, item)}</div>`;
        html += '<ul>';

        if ($.isArray(item.options)) {
          $.each(item.options, (j, option) => {
            html += buildOption(option);
          });
        }

        html += '</ul>';
        html += '</li>';
      } else {
        html += buildOption(item);
      }
    });

    that.$ul.html(html);
  }

  freshOptions(data) {
    const that = this;
    let html = '';

    const buildOption = item => `<option value="${item.value}">${item.text}</option>`;

    if ($.isArray(data)) {
      $.each(data, (i, item) => {
        if (item.group) {
          html += `<optgroup label="${item.label}">`;

          if ($.isArray(item.options)) {
            $.each(item.options, (j, option) => {
              html += buildOption(option);
            });
          }

          html += '</optgroup>';
        } else {
          html += buildOption(item);
        }
      });
    }

    that.$select.html(html);
  }

  parse($selects) {
    const that = this;
    const data = [];

    const optionToData = function() {
      return $.extend({}, $(this).data(), {
        'value': this.value,
        'text': this.text,
        'slug': that.replaceDiacritics(this.text)
      });
    };

    $selects.each(function() {
      if (this.tagName.toLowerCase() === 'optgroup') {
        const group = $.extend({}, $(this).data(), {
          'group': true,
          'label': this.label,
          'options': []
        });

        $(this).children().each(function() {
          group.options.push(optionToData.call(this));
        });
        data.push(group);
      } else {
        data.push(optionToData.call(this));
      }
    });

    this.$options.each((key, option) => {
      if ($(option).prop('selected')) {
        that.currentIndex = key;
      }
    });
    return data;
  }

  update(noFreshOptions) {
    this.render(this.data);
    if (noFreshOptions !== true) {
      this.freshOptions(this.data);
    }

    this.$items = this.$dropdown.find(`.${this.classes.item}`);
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

  select(index) {
    if (typeof index === 'number' && index >= 0) {
      if (this.isScroll) {
        this.scrollToVisibility(index);
      }
      this._set(index);
    }
  }

  _set(index) {
    const item = this.$items[index];
    const $item = $(item);
    this.last = this.currentIndex;
    this.currentIndex = index;
    this.$label.text($item.text());

    if (this.$options.length) {
      $(this.$options[index]).prop('selected', true);
    }
    this.$items.removeClass(this.classes.selected);
    $item.addClass(this.classes.selected);

    if (this.last !== this.currentIndex) {
      // pass source data object
      this._trigger('change', [this.getCurrentData(index).value]);
    }
  }

  getCurrentData(index) {
    let count = 0;
    let result = null;
    $.each(this.data, (i, item) => {
      if (item.group) {
        if ($.isArray(item.options)) {
          $.each(item.options, (j, option) => {
            count++;
            if (index + 1 === count) {
              result = option;
            }
          });
        }
      } else {
        count++;
        if (index + 1 === count) {
          result = item;
        }
      }
    });

    return result;
  }

  getCurrentIndex(data) {
    let count = 0;
    let index = 0;
    $.each(this.data, (i, item) => {
      if (item.group) {
        if ($.isArray(item.options)) {
          $.each(item.options, (j, option) => {
            if (option.value === data) {
              index = count;
            }
            count++;
          });
        }
      } else {
        if (item.value === data) {
          index = count;
        }
        count++;
      }
    });

    return index;
  }

  get() {
    return this.getCurrentData(this.currentIndex).value;
  }

  replaceDiacritics(s) {
    // /[\340-\346]/g, // a
    // /[\350-\353]/g, // e
    // /[\354-\357]/g, // i
    // /[\362-\370]/g, // o
    // /[\371-\374]/g, // u
    // /[\361]/g, // n
    // /[\347]/g, // c
    // /[\377]/g // y

    const d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' ');
    for (let k of d) {
      if(Object.hasOwnProperty.call(d, k)) {
        s = s.toLowerCase().replace(new RegExp(`[${d[k]}]`, 'g'), 'aeiouncy'.charAt(k));
      }
    }
    return s;
  }

  position() {
    const height = this.$trigger.outerHeight(true);
    const offset = this.$trigger.offset();
    const contentHeight = this.$dropdown.outerHeight(true);
    let top;

    if (contentHeight + offset.top > $(window).height() + $(window).scrollTop()) {
      top = -contentHeight - parseInt(this.options.offset[0], 10);
    } else {
      top = height + parseInt(this.options.offset[0], 10);
    }

    this.$dropdown.css({
      top,
    });
  }

  attachInitEvent() {
    const that = this;
    if (this.options.trigger === 'hover') {
      this.$trigger.on('mouseenter.asSelect', () => {
        that.open();
      });
      this.$wrapper.on('mouseleave.asSelect', () => {
        that.close();
        return false;
      });
    } else {
      this.$trigger.on('click.asSelect', () => {
        if (that.opened) {
          that.close();
        } else {
          that.open();
        }
      });
    }

    this.$select.on('focus.asSelect', () => {
      that.$wrapper.addClass(that.classes.focus);
      that.inFocus = true;
    }).on('blur', () => {
      that.$wrapper.removeClass(that.classes.focus);
      that.inFocus = false;
    });

    this.$dropdown.on('click.asSelect', `.${this.classes.item}`, function() {
      const index = that.$items.index($(this));
      that.select(index);
      that.close();
    });
  }

  dettachInitEvents() {
    this.$trigger.off('.asSelect');
    this.$wrap.off('.asSelect');
    this.$select.off('.asSelect');
    this.$dropdown.off('.asSelect');
  }

  keyboardEvent() {
    const that = this;
    $(document).on('keydown.asSelect', e => {
      const key = e.which || e.keycode;

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
        const direction = key === 38 ? 'up' : 'down';
        that.navigate(direction);
        return false;
      }

    });
  }

  search(key) {
    let searchString = '';
    let currentIndex;
    clearTimeout(this.timeout);
    searchString = new RegExp(`^${searchString += String.fromCharCode(key)}`, 'i');
    this.timeout = setTimeout(() => {
      searchString = '';
    }, 16);

    $.each(this.$items, (index, value) => {
      /*eslint consistent-return: "off"*/
      const string = $.trim($(value).text());
      if (searchString.test(string)) {
        currentIndex = index;
        return false;
      }
    });
    if (currentIndex >= 0) {
      this.select(currentIndex);
    }
  }

  scrollToVisibility(index) {
    const item = this.$items[index];
    let scrollTop;
    const itemHeight = $(item).outerHeight();
    const oriScrollTop = this.$dropdown.scrollTop();
    const bottom = oriScrollTop + this.$dropdown.height();
    const distance = $(item).position().top;

    if (distance < oriScrollTop) {
      scrollTop = distance;
    } else if (distance > bottom - itemHeight) {
      scrollTop = distance + itemHeight - this.$dropdown.height();
    } else {
      return;
    }
    this.$dropdown.scrollTop(scrollTop);
  }

  navigate(direction) {
    const total = this.total;
    let index = this.currentIndex < 0 ? 0 : this.currentIndex;
    if (direction === 'up') {
      index = index <= 0 ? total - 1 : index - 1;
    } else {
      index = index >= total - 1 ? 0 : index + 1;

    }
    this.select(index);
  }

  _generateMask() {
    const that = this;
    if (this.options.trigger === 'hover') {
      return;
    }
    this.$mask = $(`<div class="${this.classes.mask}"></div>`).appendTo(this.$wrapper);
    this.$mask.on('click.asSelect', () => {
      that.close();
      return false;
    });
  }

  _clearMask() {
    if (this.options.trigger === 'hover') {
      return;
    }
    this.$mask.off('click.asSelect');
    this.$mask.remove();
    this.$mask = null;
  }

  open() {
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

  close() {
    this.$wrapper.removeClass(this.classes.open);
    this._clearMask();
    $(document).off('keydown.select');
    this._trigger('close');
    this.opened = false;
  }

  closeAll() {
    $.each(instances, (key, instance) => {
      if (instance.opened) {
        instance.close();
      }
    });
  }

  addData(data) {
    const that = this;
    if ($.isArray(data)) {
      $.each(data, (i, item) => {
        if (!item.group) {
          data[i].slug = that.replaceDiacritics(item.text);
        }
      });
      this.data = this.data.concat(data);
      this.update();
    }
  }

  removeData(data) {
    return data;
  }

  enable() {
    this.disabled = false;
    this.$trigger.removeClass(this.classes.disabled);
    this._trigger('enable');
    return this;
  }

  disable() {
    this.disabled = true;
    this.$trigger.addClass(this.classes.disabled);
    this._trigger('disable');
    return this;
  }

  destroy() {
    this.dettachInitEvents();
    $(document).off('.asSelect');

    this.$dropdown.remove();
    this.$trigger.remove();
    this.$select.unwrap().unwrap();
    this._trigger('destroy');
  }

  static setDefaults(options) {
    $.extend(true, DEFAULTS, $.isPlainObject(options) && options);
  }
}

var info = {
  version:'0.2.1'
};

const NAMESPACE = 'asSelect';
const OtherAsScrollbar = $.fn.asSelect;

const jQueryasSelect = function(options, ...args) {
  if (typeof options === 'string') {
    const method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      const instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        const instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new asSelect(this, options));
    }
  });
};

$.fn.asSelect = jQueryasSelect;

$.asSelect = $.extend({
  setDefaults: asSelect.setDefaults,
  noConflict: function() {
    $.fn.asSelect = OtherAsScrollbar;
    return jQueryasSelect;
  }
}, info);
