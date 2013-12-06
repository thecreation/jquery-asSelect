/*
 * jquery-select
 * https://github.com/amazingSurge/jquery-select
 *
 * Copyright (c) 2013 amazingSurge
 * Licensed under the MIT license.
 */

(function($) {

    var Select = $.select = function(element, options) {
        this.element = element;
        this.$select = $(element);
        this.options = $.extend(true, {}, Select.defaults, options);
        this.namespace = this.options.namespace;
        
        this.disabled = this.options.disabled;
        if(this.$select.prop('disabled')){
            this.disabled = true;
        }
        this.selected = null;

        this.classes = {
            wrapper: this.namespace + '-wrapper',
            old: this.namespace + '-old',
            dropdown: this.namespace + '-dropdown',
            trigger: this.namespace + '-trigger',
            label: this.namespace + '-label',
            handler: this.namespace + '-handler',
            skin: this.namespace + '_' + this.options.skin,
            open: this.namespace + '_open',
            disabled: this.namespace + '_disabled',
            selected: this.namespace + '_selected',
            focus: this.namespace + '_focus',
            loading: this.namespace + '_loading',
            item: this.namespace +'-item',
            group: this.namespace +'-group'
        };

        // flag
        this.opened = false;
        this.eventBinded = false;
        this.inFocus = true;
        this.loading = 0;
        this.current = null;

        this.init();
    };

    Select.prototype = {
        constructor: Select,
        init: function() {
            var self = this;

            this.$wrapper = this.$select.wrap('<div class="'+this.classes.wrapper+'"><div class="'+this.classes.old+'" ></div></div>').parent().parent();

            this.$trigger = $('<div class="' + this.classes.trigger + '"><div class="'+ this.classes.handler +'"></div></div>');
            this.$label = $('<div class="'+this.classes.label +'">'+this.options.render.label()+'</div>').prependTo(this.$trigger);
            this.$dropdown = $('<div class="' + this.classes.dropdown + '"><ul></ul></div>');
            this.$ul = this.$dropdown.children('ul');

            this.$wrapper.append(this.$trigger).append(this.$dropdown);

            if (this.options.skin) {
                this.$wrapper.addClass(this.classes.skin);
            }

            if (this.options.disabled) {
                this.$trigger.addClass(this.classes.disabled);
            }

            self.data = this.selectToData();
            self.refreshOptions();
            self.attachEvents();
            self.select(self.$select.val());
            self.$select.trigger('select::ready', self);

            if (self.options.preload) {
                self.onLoad();
            }
        },

        selectToData: function(){
            var self = this;
            var data = [];

            var optionToData = function() {
                return $.extend({},$(this).data(),{
                    'value': this.value,
                    'text':  this.text,
                    'slug': self.replaceDiacritics(this.text)
                });
            };

            this.$select.children().each(function(){
                if( this.tagName.toLowerCase() === 'optgroup' ) {
                    var group = $.extend({},$(this).data(),{
                        'group': true,
                        'label': this.label,
                        'options': []
                    });

                    $(this).children().each(function(){
                        group.options.push(optionToData.call(this));
                    });
                    data.push(group);
                } else {
                   data.push(optionToData.call(this));
                }
            });
            return data;
        },
        addToData: function(data){
            var self = this;
            if($.isArray(data)){
                $.each(data, function(i, item){
                    if(!item.group){
                        data[i].slug = self.replaceDiacritics(item.text);
                    }
                });
                this.data = this.data.concat(data);
            }
        },
        addToSelect: function(data){
            var self = this;
            var html = '';
            var buildOption = function(item){
                if(item.value === self.selected){
                    return '<option value="'+item.value+'" selected="selected">'+ item.text + '</option>';
                } else {
                    return '<option value="'+item.value+'">' + item.text + '</option>';
                }
            };
            if($.isArray(data)){
                $.each(data, function(i, item){
                    if(item.group){
                        html += '<optgroup label="'+item.label+'">';
                            if($.isArray(item.options)){
                                $.each(item.options, function(j, option){
                                    html += buildOption(option);
                                });
                            }
                        html += '</optgroup>';
                    } else {
                        html += buildOption(item);
                    }
                });
            }
            self.$select.append(html);
        },
        refreshOptions: function(){
            var html = '';
            var self = this;
            var buildOption = function(item){
                if(item.value === self.selected){
                    return '<li class="'+self.classes.item+' '+self.classes.selected+'">'+ self.options.render.option.call(self, item) + '</li>';
                } else {
                    return '<li class="'+self.classes.item+'">' + self.options.render.option.call(self, item) + '</li>';
                }
            };
            $.each(self.data, function(i, item){
                if(item.group){
                    html += '<li class="' + self.classes.group + '">';

                    html += '<div class="'+ self.namespace+'-group-label">' + self.options.render.group.call(self, item)+'</div>';
                    html += '<ul>';
                    if($.isArray(item.options)){
                        $.each(item.options, function(j, option){
                            html += buildOption(option);
                        });
                    }
                    html += '</ul>';
                    html += '</li>';
                } else {
                    html += buildOption(item);
                }
            });

            self.$ul.html(html);
        },
        replaceDiacritics: function(s){
            // /[\340-\346]/g, // a
            // /[\350-\353]/g, // e
            // /[\354-\357]/g, // i
            // /[\362-\370]/g, // o
            // /[\371-\374]/g, // u
            // /[\361]/g, // n
            // /[\347]/g, // c
            // /[\377]/g // y
            var k, d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' ');

            for (k in d)
                s = s.toLowerCase().replace(RegExp('[' + d[k] + ']', 'g'), 'aeiouncy'.charAt(k));

            return s;
        },
        onLoad: function(){
            var self = this;
            var fn = self.options.load;
            if (!fn) return;
            self.load(function(callback) {
                fn.apply(self, [callback]);
            });
        },
        load: function(fn){
            var self = this;
            self.$wrapper.addClass(self.classes.loading);

            self.loading++;
            fn.apply(self, [function(results){
                self.loading = Math.max(self.loading - 1, 0);
                if(results && results.length){
                    self.addToData(results);
                    self.addToSelect(results);
                    self.refreshOptions();
                }
                if (!self.loading) {
                    self.$wrapper.removeClass('loading');
                }

                self.$select.trigger('select::load', self, results);
            }]);
        },
        attachEvents: function() {
            var self = this;

            if (self.options.trigger === 'click') {
                self.$trigger.on('click.select', function() {
                    self.position.call(self);

                    if (self.opened === true) {
                        self.close();
                    } else {
                        self.open();
                    }

                    return false;
                });
            } else {
                self.$trigger.on('mouseenter.select', function() {
                    self.position();
                    self.open();
                    return false;
                });

                // when mouse leave from $trigger or $dropdown both can trigger mouseleave event
                // this event acquired by their parent element $select 
                self.$wrapper.on('mouseleave.select', function() {
                    self.close();
                    return false;
                });
            }

            self.$select.on({
                'focus': function(){
                    self.$wrapper.addClass(self.classes.focus);
                    self.inFocus = true;
                },
                'blur': function(){
                    self.$wrapper.removeClass(self.classes.focus);
                    self.inFocus = false;
                }
            });

            self.$dropdown.on('click.select', '.'+self.classes.item, function(){
                var value =self.getValue(this);
                self.select(value);
                self.close();
                return false;
            });
            self.$dropdown.on('click.select', '.'+self.classes.group, function(){
                return false;
            });

            // this.$dropdown.on('li', 'mouseenter.select', function() {
            //     self.$select.trigger('select::option::mouseenter', self);
            //     return false;
            // }).on('li', 'mouseleave.select', function() {
            //     self.$select.trigger('select::option::mouseleave', self);
            //     return false;
            // });
            this.eventBinded = true;
        },
        // param is an obj or index number
        // change flat data to hierarchy type
        getValue: function (index) {
            var value,
                $currentItem;

            if (typeof index ==='number') {
                $currentItem = this.$dropdown.find('.'+this.classes.item)[index];
                index = $currentItem.index();
            } else {
                $currentItem = $(index);
                index = $(index).index();
            }

            if($currentItem.parent().parent().is('.'+this.classes.group)){
                var parent_index = $currentItem.parent().parent().index();
                value = this.data[parent_index]['options'][index].value;
            } else {
                value = this.data[index].value;
            }

            return value;
        },
        dettachEvents: function() {
            this.$dropdown.off('.select');
            this.$trigger.off('.select');
            this.$wrapper.off('.select');
            this.eventBinded = false;
        },
        position: function() {
            var height = this.$trigger.outerHeight(true),
                offset = this.$trigger.offset(),
                contentHeight = this.$dropdown.outerHeight(true),
                top;

            if (contentHeight + offset.top > $(window).height() + $(window).scrollTop()) {
                top = -contentHeight - parseInt(this.options.offset[0], 10);
            } else {
                top = height + parseInt(this.options.offset[0], 10);
            }

            this.$dropdown.css({
                top: top,
            });
        },
        select: function(value) {
            var self = this;
            var selectedItem = null;

            if(self.selected === value){
                return;
            }

            $.each(this.data, function(i, item){
                if(item.group){
                    if($.isArray(item.options)){
                        $.each(item.options, function(j, option){
                            if(option.value === value){
                                self.selectedIndex = [i, j];
                                selectedItem = option;
                            }
                        });
                    }
                } else {
                    if(item.value === value){
                        self.selectedIndex = i;
                        selectedItem = item;
                    }
                }
            });

            self.$ul.find('li').removeClass(this.classes.selected);

            if(selectedItem){ // if found
                self.$label.html(self.options.render.label(selectedItem));
                self.getLi(self.selectedIndex).addClass(this.classes.selected);

                // trigger change event
                if ($.isFunction(self.options.onChange)) {
                    self.options.onChange.call(self, selectedItem);
                }
                self.$select.trigger('select::change', [this, selectedItem]);

                self.selected = value;
                self.$select.val(value);
            } else {
                self.selected = null;
            }
        },
        getLi: function(index){
            if($.isArray(index)){
                return this.$ul.children('li').eq(index[0]).find('li').eq(index[1]);
            }else{
                return this.$ul.children('li').eq(index);
            }
        },
        getCurrentIndex: function() {
            var index,
                $selected = this.$dropdown.find('.'+this.classes.selected);
            if ($selected.length) {

            }
            return index;
        },
        // Detect if currently selected option is visible and scroll the options box to show it 
        scrollToVisibility: function(index) {
            var $item = this.$dropdown.find('.'+this.classes.item)[index],
                distance = $item.position().top;
            if (distance < 0){
                distance = 0;
            } else if (distance > this.$dropdown.find('>ul').outerHeight() - this.$dropdown.height()) {
                distance = this.$dropdown.find('>ul').outerHeight() - this.$dropdown.height();
            }
            this.$dropdown.scrollTop(distance);
        },
        keyboard: function() {
            var self = this;
            $(document).on('keypress', function(e) {
                var key = e.which || e.keycode;
                if (/^(9|13|27)$/.test(key)) {

                }
                clearTimeout(search);
                // If it's not a directional key
                if (key < 37 || key > 40) {
                    self.search.call(self,key);
                } else if (/^(39|40)$/.test(key)) {
                    if (key === 39) {

                    }
                }
            });
        },
        search: function(key) {
            var searchString,currentIndex,timeout = null;
            clearTimeout(timeout);
            searchString = RegExp('^' + (searchString += String.fromCharCode(key)), 'i');
            timeout = setTimeout(function() {
                searchString = '';
            }, 16);
            
            $.each(this.$dropdown.find('.'+this.classes.item), function(index,value) {
                var string = $.trim($(value).text());
                if (searchString.test(string)) {
                    currentIndex = index;
                    return false;
                }
            });
            this.scrollToVisibility(currentIndex);
        },
        navigate: function(direction) {
            var index,total = this.$dropdown.find('.'+this.classes.item);
            if ($.isArray(this.selectedIndex)) {
                index = this.selectedIndex[0] + this.selectedIndex[1] + 1;
            } else {
                index = this.selectedIndex;
            }

            if (direction === 'up') {
                index = index > total ? total: index;
            } else {
                index = index < 0 ? 0 : index;
            } 
        },

        /*
            Public Method
         */
        open: function() {
            var self = this;

            self.$select.focus();
            self.$wrapper.addClass(self.classes.open);

            $(document).on('click.select', $.proxy(self.close, self));

            self.opened = true;
            self.$select.trigger('select::open', self);
            return self;
        },
        close: function() {
            var self = this;
            self.$wrapper.removeClass(self.classes.open);

            $(document).off('click.select');

            self.opened = false;
            self.$select.trigger('select::close', self);
            return self;
        },
        val: function(value) {
            if (value) {
                this.select(value);
                return this;
            } else {
                return this.$select.val();
            }
        },
        enable: function() {
            this.disabled = false;
            this.$trigger.removeClass(this.classes.disabled);
            return this;
        },
        disable: function() {
            this.disabled = true;
            this.$trigger.addClass(this.classes.disabled);
            return this;
        },
        destroy: function() {
            this.$dropdown.remove();
            this.$trigger.remove();
            this.$select.unwrap().unwrap().off('.select');

            $(document).off('.select');
            return this;
        }
    };

    Select.defaults = {
        namespace: 'select',
        skin: null,
        trigger: 'click', // 'hover' or 'click'
        offset: [0, 0],
        json: null,
        preload: false,
        load: null,
        render: {
            label: function(selected){
                if(selected){
                    return selected.text;
                }else{
                    return 'Choose one';
                }
            },
            option: function(item){
                return item.text;
            },
            group: function(item){
                return item.label;
            }
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
            return this.each(function() {
                if (!$.data(this, 'select')) {
                    $.data(this, 'select', new Select(this, options));
                }
            });
        }
    };
}(jQuery));