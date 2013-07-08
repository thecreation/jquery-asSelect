/*
 * jquery-select
 * https://github.com/amazingSurge/jquery-select
 *
 * Copyright (c) 2013 joeylin
 * Licensed under the MIT license.
 */

(function($) {

    var Select = $.select = function(element, options) {
        var $opts,
            meta = {};

        this.element = element;
        this.$element = $(element).css({
            display: 'none'
        }) || $('<div></div>');
        this.$options = this.$element.find('option');
        this.$optgroups = this.$element.find('optgroup');
        this.status = {};

        meta.status = {};

        if (this.$optgroups.length !== 0) {
            $.each(this.$optgroups, function(i, v) {
                var label = $(v).attr('label');
                meta.status[label] = {};
                $.each($(v).find('option'), function(i, v) {
                    meta.status[label][$(v).attr('value')] = {};
                    meta.status[label][$(v).attr('value')].text = $(v).text();
                    if ($(v).prop('selected')) {
                        meta.value = $(v).attr('value');
                    }
                });
            });
        }

        // it's different from this.$options
        $opts = this.$element.find('> option');

        if ($opts.length !== 0) {
            $.each($opts, function(i, v) {
                meta.status[$(v).attr('value')] = {};
                meta.status[$(v).attr('value')].text = $(v).text();
                if ($(v).prop('selected')) {
                    meta.value = $(v).attr('value');
                }
            });
        }

        // $.extend use true argument 
        this.options = $.extend(true, {}, Select.defaults, options, meta);
        this.namespace = this.options.namespace;
        this.value = this.options.value;
        this.status = this.options.status;

        // flag
        this.opened = false;

        this.init();
    };

    Select.prototype = {
        constructor: Select,
        init: function() {
            var self = this,
                tpl = '<div class="' + this.namespace + ' ' + this.options.skin + '"><div class="' + this.namespace + '-bar"><span></span></div><ul class="' + this.namespace + '-content"></ul></div>';

            this.$select = $(tpl);
            this.$bar = this.$select.find('.' + this.namespace + '-bar');
            this.$content = this.$select.find('.' + this.namespace + '-content').css({
                display: 'none'
            });

            $.each(this.status, function(key, value) {

                if (value.text) {
                    var $li = $('<li><a></a></li>').data('value', key).find('a').text(value.text).end();
                    if (self.value === key) {
                        $li.addClass(self.namespace + '-active');
                    }
                    $('<i></i>').addClass(value.icon).appendTo($li);
                    self.$content.append($li);
                } else {
                    var $group = $('<li class="' + self.namespace + '-group"></li>').text(key);
                    self.$content.append($group);
                    $.each(value, function(k, v) {

                        var $li = $('<li class="group-item"><a></a></li>').data('value', k).find('a').text(v.text).end();
                        if (self.value === key) {
                            $li.addClass(self.namespace + '-active');
                        }
                        self.$content.append($li);
                    });
                }
            });

            this.$element.after(this.$select);
            this.$li = this.$content.find('li');


            if (this.options.trigger === 'click') {
                this.$bar.on('click.select', function() {
                    self.position.call(self);

                    if (self.opened === true) {
                        self.hide.call(self);
                    } else {
                        self.show.call(self);
                    }

                    return false;
                });
            } else {
                this.$bar.on('mouseenter.select', function() {
                    self.position.call(self);
                    self.show.call(self);
                    return false;
                });

                // when mouse leave from $bar or $content both can trigger mouseleave event
                // this event acquired by their parent element $select 
                this.$select.on('mouseleave.select', function() {
                    self.hide.call(self);
                    return false;
                });
            }

            this.$content.delegate('li', 'click', function() {
                var value = $(this).data('value');

                if (value === undefined) {
                    return false;
                }

                self.set.call(self, value);
                return false;
            });

            this.set(this.value);
        },
        position: function() {
            var height = this.$bar.outerHeight(true),
                offset = this.$bar.offset(),
                contentHeight = this.$content.height(),
                top;

            if (contentHeight + offset.top > $(window).height() + $(window).scrollTop()) {
                top = -contentHeight - parseInt(this.options.offset[0], 10);
            } else {
                top = height + parseInt(this.options.offset[0], 10);
            }

            this.$content.css({
                position: 'absolute',
                top: top,
                left: 0
            });
        },

        /*
            Public Method
         */
        
        show: function() {
            this.$content.css({
                display: 'block'
            });
            this.$bar.addClass(this.namespace + '-active');
            $(document).on('click.select', $.proxy(this.hide, this));
            this.opened = true;
            return this;
        },
        hide: function() {
            this.$content.css({
                display: 'none'
            });
            this.$bar.removeClass(this.namespace + '-active');
            $(document).off('click.select');
            this.opened = false;
            return this;
        },
        set: function(value) {
            var self = this;

            this.$li.removeClass(this.namespace + '-item-active');
            this.value = value;

            $.each(this.$options, function(i, v) {
                if ($(v).attr('value') === value) {
                    $(v).prop('selected', true);
                }
            });

            $.each(this.$li, function(i, v) {

                if ($(v).data('value') === value) {
                    $(v).addClass(self.namespace + '-item-active');
                    self.$bar.find('span').text($(v).find('a').text());

                    if ($.isFunction(self.options.onChange)) {
                        self.options.onChange(self);
                    }
                    self.$select.trigger('change', self);
                }
            });

            this.hide();
        },
        get: function() {
            var self = this,
                value;

            $.each(this.$options, function(i, v) {
                if ($(v).attr('value') === self.value) {
                    value = $(v).text();
                }
            });

            return value;
        },
        enable: function() {
            this.enabled = true;
            this.$bar.addClass(this.namespace + 'enabled');
            return this;
        },
        disable: function() {
            this.enabled = false;
            this.$bar.removeClass(this.namespace + 'enabled');
            return this;
        },
        destroy: function() {
            this.$bar.off('.select');
        }
    };

    Select.defaults = {
        namespace: 'select',
        skin: 'simple',
        trigger: 'click', // 'hover' or 'click'
        value: 'a',
        offset: [0, 0],
        // status: {
        //     a: 'beijing',
        //     b: 'fujian',
        //     c: 'zhejiang'
        // },
        onChange: function() {}
    };

    $.fn.select = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'select');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            var opts = options || {};
            opts.$group = this;
            return this.each(function() {
                if (!$.data(this, 'select')) {
                    $.data(this, 'select', new Select(this, opts));
                }
            });
        }
    };

}(jQuery));
