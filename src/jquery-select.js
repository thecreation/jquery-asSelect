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
        this.$element = $(element);
        this.$options = this.$element.find('option');
        this.$optgroups = this.$element.find('optgroup');
        this.state = {};

        meta.state = {};
        meta.value = '';

        if (this.$optgroups.length !== 0) {
            $.each(this.$optgroup, function(i,v) {
                var label = $(v).attr('label');
                meta.state[label] = {};
                $.each($(v).find('options'),function(i,v) {
                    meta.state[label][$(v).attr('value')] = $(v).text(); 
                    if ($(v).prop('selected')) {
                        meta.value = $(v).attr('value');
                    }
                });
            });
        }

        $opts = this.$element.find('> options');
        if ($opts.length !== 0) {
            $.each($opts, function(i, v) {
                meta.opts[$(v).attr('value')] = $(v).text();
                if ($(v).prop('selected')) {
                    meta.value = $(v).attr('value');
                }
            });
        }

        this.options = $.extend({}, Select.defaults, options, meta);
        this.value = this.options.value;
        this.state = this.options.state;

        // flag
        this.opened = false;

        this.init();
    };

    Select.prototype = {
        constructor: Select,
        init: function() {
            var self = this,
                tpl = '<div class="select ' + this.options.skin + '"><div class="select-bar"><span></span></div><ul class="select-content"></ul></div>';

            this.$select = $(tpl);
            this.$bar = this.$select.find('.select-bar');
            this.$content = this.$select.find('.select-content');

            $.each(this.state,function(key,value) {
                
                if (typeof value === 'object') {
                    var $group = $('<li class="select-group"></li>').text(key);
                    self.$content.append($group);
                    $.each(value, function(k, v) {
                        var $li = $('<li class="group-item"></li>').data('value',k).text(v);
                        if (self.value === key) {
                            $li.addClass('select-active');
                        }
                        self.$content.append($li);
                    });
                } else {
                    var $li = $('<li></li>').data('value',key).text(value);
                    if (self.value === key) {
                        $li.addClass('select-active');
                    }
                    self.$content.append($li);
                }
            });

            this.$li = this.$content.find('li');

            this.$bar.on('click', function() {
                if (self.opened === true) {
                    self.hide.call(self);
                } else {
                    self.show.call(self);
                }
            });

            this.$content.delegate('click', 'li', function() {
                var value = $(this).data(value);

                if (value === undefined) {
                    return
                }

                self.set.call(self, value);
            });
        },

        show: function() {
            this.$content.css({display: 'block'});
            this.opened = true;
        },

        hide: function() {
            this.$content.css({display: 'none'});
            this.opened = false;
        },

        set: function(value) {
            var self = this,
                content;
            this.$li.removeClass('select-active');

            $.each(this.$options, function(i, v) {
                if ($(v).attr('value') === value) {
                    $(v).prop('selected', true);
                }
            });

            $.each(this.$li, function(i,v) {
                if ($(v).data('value') === value) {
                    $(v).addClass('select-active');
                    this.$bar.find('span').text($(v).text());
                }
            });

            this.value = value;
            this.hide();
        },
        get: function() {
            var self = this,
                value;
                
            $.each(this.$options, function(i, v) {
                if ($(v).data('value') === self.value) {
                    value = $(v).text();
                }
            });
            return value;
        }

    };

    Select.defaults = {

    };

    $.fn.select = function(options) {

    };


}(jQuery));
