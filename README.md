# jQuery asSelect

The powerful jQuery plugin that creates a custom asSelect. 
Download: <a href="https://github.com/amazingSurge/jquery-asSelect/archive/master.zip">jquery-asSelect-master.zip</a>

***

## Features

* **Extremely fast**
* **Option group support**
* **Javascript only 4KB compressed**
* **Lightweight size** — 1 kb gzipped

## Dependencies
* <a href="http://jquery.com/" target="_blank">jQuery 1.83+</a>

## Usage

Import this libraries:
* jQuery
* jquery-asSelect.min.js

And CSS:
* jquery-asSelect.css - desirable if you have not yet connected one


Create base html element:
```html
<asSelect class="custom-asSelect">
    <option value="a">beijing</option>
    <option value="b">fujian</option>
    <option value="c">zhejiang</option>
    <option value="d">tianjin</option>
    <option value="e">shanghai</option>
</asSelect>
```

Initialize asSelect:
```javascript
$('.custom-asSelect').asSelect({skin: 'simple'});
```

Or initialize asSelect with custom settings:
```javascript
$(".custom-asSelect").asSelect({
        namespace: 'asSelect',
        skin: 'simple',
        trigger: 'click', // 'hover' or 'click'
        value: 'a',
        offset: [0, 0],
        status: {
            a: 'beijing',
            b: 'fujian',
            c: 'zhejiang'
        },
        onChange: function() {}
});
```



## Settings

```javascript
    //Optional property,set a namspace for css class, for example, we have <code>.asSelect_active
    //</code> class for active effect, if namespace set to 'as-asSelect', then it will be <code>.
    //as-asSelect_active</code>
    namespace: '.asSelect',

    //Optional property, set transition effect, it works after you load specified skin file
    skin: 'simple',

    //Optional property, the way to active asSelect, optioal 'hover
    trigger: 'click',

    //Optional property, set the value of bar that element have no option when asSelect initilized
    value: 'a',

    //Optional property, set the offset between bar and comment
    offset: [0,0]

    //Optional property, set the status of elements,for example 
    //<code>a:beijing</code> means the element's value is 'a',
    //the text is 'beijing'
    status: {
         a: 'beijing',
         b: 'fujian',
         c: 'zhejiang'
    },

    //callback when element is seted refresh
    Onchange: function(){}
```

## Public methods

jquery asSelect has different methods , we can use it as below :
```javascript
// show comment
$(".custom-asSelect").asSelect("show");

// hide comment
$(".custom-asSelect").asSelect("hide");

// set element's status
$(".custom-asSelect").asSelect("set");

// get option's value
$(".custom-asSelect").asSelect("get");

// bar enable be actived
$(".custom-asSelect").asSelect("enable");

// bar can't be actived 
$(".custom-asSelect").asSelect("disable");

// remove all event
$(".custom-asSelect").asSelect("destroy");
```

## Event / Callback

* <code>change</code>: trigger when asSelect chage

how to use event:
```javascript
$(document).on('change', function(event,instance) {
    // instance means current asSelect instance 
    // some stuff
});
```

## Browser support
jquery-asSelect is verified to work in Internet Explorer 7+, Firefox 2+, Opera 9+, Google Chrome and Safari browsers. Should also work in many others.

Mobile browsers (like Opera mini, Chrome mobile, Safari mobile, Android browser and others) is coming soon.

## Author
[amazingSurge](http://amazingSurge.com)

## License
jQuery-asSelect plugin is released under the <a href="https://github.com/amazingSurge/jquery-asSelect/blob/master/LICENCE.GPL" target="_blank">GPL licence</a>.


