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
		$.each(this.$select.data(), function(k, v) {
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
        //this.loading = false;
        this.currentIndex = 0;
        this.isScroll = false;
        this.last = 0;
        this.disabled = false;

        this.$select.trigger('select::init', this);
        this.init();
	};
	Select.prototype = {
		constructor: Select,
		instances: [],
		init: function(){

			this.$wrapper = this.$select.wrap('<div class="'+this.classes.wrapper+'"><div class="'+this.classes.old+'" ></div></div>').parent().parent();
            this.$trigger = $('<div class="' + this.classes.trigger + '"><div class="'+ this.classes.handler +'"></div></div>');
            this.$label = $('<div class="'+this.classes.label +'">'+this.options.render.label()+'</div>').prependTo(this.$trigger);
            this.$dropdown = $('<div class="' + this.classes.dropdown + '"><ul></ul></div>');
            this.$ul = this.$dropdown.children('ul');
            this.$options = this.$select.find('option');

			if (this.options.skin) {
				this.$wrapper.addClass(this.classes.skin);
			}

            if (this.$select.prop('disabled')) {
                this.disable();
            }

            this.unChooseText = this.$label.text();
            this.$dropdown.css('maxHeight',this.options.maxHeight);

            // parse data from select label
            this.data = this.parse(this.$select.children());

            // render html from data
            this.update(true);

            // add to page
            this.$wrapper.append(this.$trigger).append(this.$dropdown);

            // attach event
            this.attachInitEvent();

            // set initial value
            this.select(this.currentIndex);

            if (this.options.preload) {
                this.onLoad();
            }

			// hold every instance
			this.instances.push(this);
			this.$select.trigger('select::ready',this);
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
                    self.addData(results);
                }
                if (!self.loading) {
                    self.$wrapper.removeClass('loading');
                }

                self.$select.trigger('select::load', self, results);
            }]);
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
        freshOptions: function(data) {
            var self = this, html = '';
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
            self.$select.html(html);
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
		update: function(noFreshOptions) {
			this.render(this.data);
            noFreshOptions && this.freshOptions(this.data);

			this.$items = this.$dropdown.find('.' + this.classes.item);
            this.$options = this.$select.find('option');
			this.total = this.$items.length;
			this.last = 0;
			this.currentIndex = this.$items.index('.'+this.classes.selected);

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
		},
		select: function(index) {
			if (index < 0 || index === undefined) {
				return;
			}
            this._select(index);
            this._set(index);
		},
		_select: function(index) {
            var item = this.$items[index],
                $item = $(item);

            this.isScroll && this.scrollToVisibility(index);

			this.$items.removeClass(this.classes.selected);
			$item.addClass(this.classes.selected);
		},
        _set: function(index) {
            var item = this.$items[index],
                $item = $(item);
            this.last = this.currentIndex;
            this.currentIndex = index;
            this.$label.text($item.text());

            this.$options.length && $(this.$options[index]).prop('selected',true);

            if (this.last !== this.currentIndex) {
                // pass source data object 
                this.$select.trigger('select::change',this.getCurrentData(index));
            }
        },
        getCurrentData: function(index) {
            var count = 0, result = null;
            $.each(this.data, function(i, item){
                if(item.group){
                    if($.isArray(item.options)){
                        $.each(item.options, function(j, option){
                            count ++;
                            if (index+1===count) {
                                result = option;
                            }
                        });
                    }
                } else {
                    count ++;
                    if (index+1===count) {
                        result = item;
                    }
                }
            });

            return result;
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
				this.$trigger.on('click.select', function() {
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
        dettachInitEvents: function() {
            this.$trigger.off('.select');
            this.$wrap.off('.select');
            this.$select.off('.select');
            this.$dropdown.off('.select');
        },
		keyboardEvent: function() {
			var self = this;
			$(document).on('keydown.select', function(e) {
				var key = e.which || e.keycode;

                if (/^(9|13|27)$/.test(key)) {
                    // close shortcut
                    self.close();
                    return false;
                }
				
				if (key < 37 || key > 40) {
					// search
					self.isScroll && self.search.call(self,key);
				} else if (/^(38|40)$/.test(key)) {
					// key navigate
					var direction = key === 38 ? 'up':'down';
					self.navigate(direction);
                    return false;
				}
				
			});
		},
		search: function(key) {
            var searchString = '',currentIndex;
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
            if (currentIndex >= 0) {
                this.select(currentIndex);
            }
        },
        scrollToVisibility: function(index) {
            var item = this.$items[index],scrollTop,
                itemHeight = $(item).outerHeight(),
                oriScrollTop = this.$dropdown.scrollTop(),
                bottom = oriScrollTop + this.$dropdown.height(),
                distance = $(item).position().top;

            if (distance < oriScrollTop){
                scrollTop = distance;
            } else if (distance > bottom - itemHeight) {
                scrollTop = distance + itemHeight - this.$dropdown.height();
            } else {
                return;
            }
            this.$dropdown.scrollTop(scrollTop);
        },
        navigate: function(direction) {
            var total = this.total,
                index = this.currentIndex < 0 ? 0 : this.currentIndex ;
            if (direction === 'up') {
                index = index <= 0 ? total-1 : index - 1;
            } else {
                index = index >= total-1 ? 0: index + 1;
                
            } 
            this.select(index);
        },
        _generateMask: function() {
            var self = this;
            if (this.options.trigger === 'hover') { return; }
            this.$mask = $('<div class="' + this.classes.mask +'"></div>').appendTo(this.$wrapper);
            this.$mask.on('click.select', function() {
                self.close();
                return false;
            });
        },
        _clearMask: function() {
            if (this.options.trigger === 'hover') { return; }
            this.$mask.off('click.select');
            this.$mask.remove();
            this.$mask = null;
        },
		open: function() {
			if (this.opened || this.disabled) { 
				return;
			}

			this.$select.focus();
            this.closeAll();
            this.$wrapper.addClass(this.classes.open);
            this._generateMask();
			this.keyboardEvent();
			this.position();

			this.$select.trigger('select::open', this);
			this.opened = true;
		},
		close: function() {
			this.$wrapper.removeClass(this.classes.open);
            this._clearMask();
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
			var self = this;
            if($.isArray(data)){
                $.each(data, function(i, item){
                    if(!item.group){
                        data[i].slug = self.replaceDiacritics(item.text);
                    }
                });
                this.data = this.data.concat(data);
                this.update();
            }
		},
		removeData: function(data) {
			return data;
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
            this.dettachInitEvents();
            $(document).off('.select');

            this.$dropdown.remove();
            this.$trigger.remove();
            this.$select.unwrap().unwrap();
        }
	};
	Select.defaults = {
        namespace: 'select',
        skin: null,
        trigger: 'click', // 'hover' or 'click'
        offset: [0, 0],
        json: null,
        preload: false,
        maxHeight: 350,
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