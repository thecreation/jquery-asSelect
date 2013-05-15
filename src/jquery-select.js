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
        this.$element = $(element).css({display: 'none'});
        this.$options = this.$element.find('option');
        this.$optgroups = this.$element.find('optgroup');
        this.state = {};

        meta.state = {};

        if (this.$optgroups.length !== 0) {
            $.each(this.$optgroups, function(i, v) {
                var label = $(v).attr('label');
                meta.state[label] = {};
                $.each($(v).find('option'), function(i, v) {
                    meta.state[label][$(v).attr('value')] = $(v).text();
                    if ($(v).prop('selected')) {
                        meta.value = $(v).attr('value');
                    }
                });
            });
        }

        $opts = this.$element.find('> option');

        if ($opts.length !== 0) {

            $.each($opts, function(i, v) {
                meta.state[$(v).attr('value')] = $(v).text();
                if ($(v).prop('selected')) {
                    meta.value = $(v).attr('value');
                }
            });
        }

        // $.extend use true argument 
        this.options = $.extend(true, {}, Select.defaults, options, meta);
        this.namespace = this.options.namespace;
        this.value = this.options.value;
        this.state = this.options.state;

        console.log(this.state)

        // flag
        this.opened = false;

        this.init();
    };

    Select.prototype = {
        constructor: Select,
        init: function() {
            var self = this,
                tpl = '<div class="' + this.namespace + ' ' + this.options.skin + '"><div class="' + this.namespace +'-bar"><span></span></div><ul class="' + this.namespace +'-content"></ul></div>';

            this.$select = $(tpl);
            this.$bar = this.$select.find('.select-bar');
            this.$content = this.$select.find('.select-content').css({display: 'none'});

            $.each(this.state, function(key, value) {

                if (typeof value === 'object') {
                    var $group = $('<li class="' + self.namespace + '-group"></li>').text(key);
                    self.$content.append($group);
                    $.each(value, function(k, v) {
                        var $li = $('<li class="group-item"></li>').data('value', k).text(v);
                        if (self.value === key) {
                            $li.addClass(self.namespace + '-active');
                        }
                        self.$content.append($li);
                    });
                } else {
                    var $li = $('<li></li>').data('value', key).text(value);
                    if (self.value === key) {
                        $li.addClass(self.namespace + '-active');
                    }
                    self.$content.append($li);
                }
            });

            this.$element.after(this.$select);


            this.$li = this.$content.find('li');
            

            if (this.options.trigger === 'click') {
                this.$bar.on('click', function() {
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

        show: function() {
            this.$content.css({
                display: 'block'
            });
            $(document).on('click.select',$.proxy(this.hide,this));
            this.opened = true;
        },

        hide: function() {
            this.$content.css({
                display: 'none'
            });
            $(document).off('click.select');
            this.opened = false;
        },

        set: function(value) {
            var self = this;

            this.$li.removeClass(this.namespace + '-active');
            this.value = value;

            $.each(this.$options, function(i, v) {
                if ($(v).attr('value') === value) {
                    $(v).prop('selected', true);
                }
            });

            $.each(this.$li, function(i, v) {
                if ($(v).data('value') === value) {
                    $(v).addClass(self.namespace + '-active');
                    self.$bar.find('span').text($(v).text());

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

        position: function() {
            var height = this.$bar.outerHeight(true),
                offset = this.$bar.offset(),
                contentHeight = this.$content.height(),
                top,bottom;

            if (contentHeight + offset.top > $(window).height() + $(window).scrollTop()) {
                top = -contentHeight;
            } else {
                top = height;
            }

            this.$content.css({
                position: 'absolute',
                top: top,
                left: 0
            });
        }
    };

    Select.defaults = {
        namespace: 'select',
        skin: 'simple',
        trigger: 'click', // 'hover' or 'click'
        value: 'a',
        state: {
            a: 'beijing',
            b: 'fujian',
            c: 'zhejiang'
        },
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
