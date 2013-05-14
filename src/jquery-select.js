/*
 * jquery-select
 * https://github.com/amazingSurge/jquery-select
 *
 * Copyright (c) 2013 joeylin
 * Licensed under the MIT license.
 */

(function($) {

    var Select = $.select = function(element, options) {
        var meta = {};

        this.element = element;
        this.$element = $(element);
        this.$options = this.$element.find('option');
        this.$optgroups = this.$element.find('optgroup');
        this.group = [];

        if (this.$optgroups.length !== 0) {
            $.each(this.$optgroup, function(i,v) {
                this.group.push($(v).find('option'));
            });
        }

        if (this.$options.length !== 0) {
            meta.opts = {};
            meta.value = '';

            $.each(this.$options, function(i, v) {
                meta.options[$(v).attr('value')] = $(v).text();
                if ($(v).prop('selected')) {
                    meta.value = $(v).attr('value');
                }
            });
        }

        this.options = $.extend({}, Select.defaults, options, meta);
        this.value = this.options.value;

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

            $.each(this.options.opts,function(key,value) {
                var $li = $('<li></li>').data('value',key).text(value);

                if (self.value === key) {
                    $tpl.addClass('select-active');
                }

                self.$content.append($li);

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
        }

    };

    Select.defaults = {

    };

    $.fn.select = function(options) {

    };


}(jQuery));
