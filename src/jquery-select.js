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

        // options
		var meta_data = [];
		$.each(this.$element.data(), function(k, v) {
			var re = new RegExp("^select", "i");
			if (re.test(k)) {
				meta_data[k.toLowerCase().replace(re, '')] = v;
			}
		});

		this.options = $.extend(true, {}, Select.defaults, options, meta_data);
		this.namespace = this.options.namespace;

		this.classes = {
            wrapper: this.namespace + '-wrapper',
            old: this.namespace + '-old',
            dropdown: this.namespace + '-dropdown',
            trigger: this.namespace + '-trigger',
            label: this.namespace + '-label',
            handler: this.namespace + '-handler',
            item: this.namespace +'-item',
            group: this.namespace +'-group',

            skin: this.namespace + '_' + this.options.skin,
            open: this.namespace + '_open',
            disabled: this.namespace + '_disabled',
            selected: this.namespace + '_selected',
            focus: this.namespace + '_focus',
            loading: this.namespace + '_loading',
            error: this.namespace + '_error'
        };

        if (this.options.skin) {
 			this.$select.addClass(this.classes.skin);
        }

        // flag
        this.opened = false;
        this.eventBinded = false;
        this.inFocus = true;
        this.loading = 0;
        this.currentIndex = 0;
        this.last = 0;

        this.$select.trigger('select::init', this);
        this.init();
	};
	Select.prototype = {
		constructor: Select,
		instances: [],
		init: function(){
			var self = this;

			this.$wrapper = this.$select.wrap('<div class="'+this.classes.wrapper+'"><div class="'+this.classes.old+'" ></div></div>').parent().parent();
            this.$trigger = $('<div class="' + this.classes.trigger + '"><div class="'+ this.classes.handler +'"></div></div>');
            this.$label = $('<div class="'+this.classes.label +'">'+this.options.render.label()+'</div>').prependTo(this.$trigger);
            this.$dropdown = $('<div class="' + this.classes.dropdown + '"><ul></ul></div>');
            this.$ul = this.$dropdown.children('ul');

            // parse data from select label
            this.data = this.parse(this.$select.children());

            // render html from data
            this.update();

            // add to page
            this.$wrapper.append(this.$trigger).append(this.$dropdown);

            // attach event
            this.attachEvent();

            // set initial value
            this.select(this.currentIndex);

			// hold every instance
			this.instances.push(this);
			this.$select.trigger('select::ready',this);
		},
		load: function(promise) {
			var self = this;
			this.$wrap.addClass(this.classes.loading);
			promise.then(function(results) {
				var data;
				self.$wrap.removeClass(this.classes.loading);
				data = self.options.onload(results);
				self.data = data;
				self.update();
			}, function() {
				self.$wrap.removeClass(this.classes.loading);
				self.$wrap.addClass(this.classes.error);
				self.data = null;
			});
		},
		render: function(data) {
			var html = '', self = this;
            var buildOption = function(item){
                if(item.value === self.selected){
                    return '<li class="'+self.classes.item+' '+self.classes.selected+'">'+ self.options.render.option.call(self, item) + '</li>';
                } else {
                    return '<li class="'+self.classes.item+'">' + self.options.render.option.call(self, item) + '</li>';
                }
            };
            $.each(data, function(i, item){
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
		parse: function($selects) {
			var self = this;
            var data = [];

            var optionToData = function() {
                return $.extend({},$(this).data(),{
                    'value': this.value,
                    'text':  this.text,
                    'slug': self.replaceDiacritics(this.text)
                });
            };

            $selects.each(function(){
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
		update: function() {
			this.render(this.data);

			this.$items = this.$dropdown.find('.' + this.classes.item);
			this.total = this.$items.length;
			this.last = 0;
			this.currentIndex = this.$items.index('.'+this.classes.selected);
			
			this.$wrap.removeClass(this.classes.error);
		},
		select: function(index) {
			var $item = this.$items[index];
			if (!index) {
				return;
			}
			this._select($item);
		},
		_select: function($item) {
			this.$items.removeClass(this.classes.selected);
			$item.addClass(this.classes.selected);

			this.last = this.currentIndex;
			this.currentIndex = this.$items.index($item);
			this.$label.text($item.text());

			if (this.last !== this.currentIndex) {
				this.$select.trigger('select::change',this);
			}
		},
		replaceDiacritics: function(s) {
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
		attachInitEvent: function() {
			var self = this;
			if (this.options.trigger === 'hover') {
				this.$trigger.on('mouseenter.select', function() {
					self.open();
				});
				this.$wrapper.on('mouseleave.select', function() {
                    self.close();
                    return false;
                });
			} else {
				this.$trigger('click.select', function() {
					if (self.opened) {
						self.close();
					} else {
						self.open();
					}
				});
			}

			this.$select.on('focus.select', function() {
				self.$wrapper.addClass(self.classes.focus);
                self.inFocus = true;
			}).on('blur', function() {
				self.$wrapper.removeClass(self.classes.focus);
                self.inFocus = false;
			});
			
			this.$dropdown.on('click.select', '.'+this.classes.item, function() {
				var index = self.$items.index($(this));
				self.select(index);
				self.close();
			});
		},
		keyboardEvent: function() {
			var self = this;
			$(document).on('keydown.select', function(e) {
				var key = e.which || e.keycode;
				
				if (key < 37 || key > 40) {
					// search
					self.search.call(self,key);
				} else if (/^(39|40)$/.test(key)) {
					// key navigate
					var direction = key === 39 ? 'up':'down';
					self.navigate(direction);
				}

				if (/^(9|13|27)$/.test(key)) {
					// close shortcut
					self.close();
				}
			});
		},
		search: function(key) {
            var searchString,currentIndex;
            clearTimeout(this.timeout);
            searchString = RegExp('^' + (searchString += String.fromCharCode(key)), 'i');
            this.timeout = setTimeout(function() {
                searchString = '';
            }, 16);
            
            $.each(this.$items, function(index,value) {
                var string = $.trim($(value).text());
                if (searchString.test(string)) {
                    currentIndex = index;
                    return false;
                }
            });
            this.scrollToVisibility(currentIndex);
        },
        scrollToVisibility: function(index) {
            var $item = this.$items[index],
            	bottom = this.$ul.outerHeight() - this.$dropdown.height(),
                distance = $item.position().top;

            if (distance < 0){
                distance = 0;
            } else if (distance > bottom) {
                distance = bottom;
            }
            this.$dropdown.scrollTop(distance);
        },
        navigate: function(direction) {
            var index = this.currentIndex,total = this.total;
            if (direction === 'up') {
                index = index > total ? total: index;
            } else {
                index = index < 0 ? 0 : index;
            } 
            this.select(index);
        },
		open: function() {
			if (this.opened) { 
				return;
			}
			this.$select.focus();
            this.$wrapper.addClass(this.classes.open);

			this.keyboardEvent();
			this.position();

			this.$select.trigger('select::open', this);
			this.opened = true;
		},
		close: function() {
			this.$wrapper.removeClass(this.classes.open);
			$(document).off('keydown.select');
			this.$select.trigger('select::close', this);
			this.opened = false;
		},                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
		closeAll: function() {
			$.each(this.instances, function(key,instance) {
				if (instance.opened) {
					instance.close();
				}
			});
		},
		addData: function(data) {
			return data;
		},
		removeData: function(data) {
			return data;
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