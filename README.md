# jQuery select

The powerful jQuery plugin that creates select. <a href="http://amazingsurge.github.io/jquery-select/">Project page and demos</a><br />
Download: <a href="https://github.com/amazingSurge/jquery-select/archive/master.zip">jquery-select-master.zip</a>

***

## Features

* **Lightweight size** — 1 kb gzipped

## Dependencies
* <a href="http://jquery.com/" target="_blank">jQuery 1.83+</a>

## Usage

Import this libraries:
* jQuery
* jquery-select.min.js

And CSS:
* jquery-select.css - desirable if you have not yet connected one


Create base html element:
```html
<select class="custom-select">
    <option value="a">beijing</option>
    <option value="b">fujian</option>
    <option value="c">zhejiang</option>
    <option value="d">tianjin</option>
    <option value="e">shanghai</option>
</select>
```

Initialize select:
```javascript
$('.custom-select').select({skin: 'simple'});
```

Or initialize select with custom settings:
```javascript
$(".custom-select").select({
        namespace: 'select',
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

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>namespace</td>
            <td>'.select'</td>
            <td>Optional property,set a namspace for css class, for example, we have <code>.select_active</code> class for active effect, if namespace set to 'as-select', then it will be <code>.as-select_active</code></td>
        </tr>
        <tr>
            <td>skin</td>
            <td>"simple"</td>
            <td>Optional property, set transition effect, it works after you load   specified skin file</td>
        </tr>
        <tr>
            <td>trigger</td>
            <td>'click'</td>
            <td>Optional property, the way to active select, optioal 'hover'</td>
        </tr>
        <tr>
            <td>value</td>
            <td>'a'</td>
            <td>Optional property, set the value of bar that element have no option when select initilized</td>
        </tr>
        <tr>
            <td>offset</td>
            <td>[0,0]</td>
            <td>Optional property, set the offset between bar and comment</td>
        </tr>
        <tr>
            <td>status</td>
            <td>{
            a: 'beijing',<br/>
            b: 'fujian',<br/>
            c: 'zhejiang'
          }</td>
            <td>Optional property, set the status of elements,for example <code>a:beijing</code> means the element's value is 'a',the text is 'beijing'</td>
        </tr>
        <tr>
            <td>Onchange</td>
            <td>function(){}</td>
            <td>callback when element is seted refresh</td>
        </tr>
    </tbody>
</table>

## Public methods

jquery select has different methods , we can use it as below :
```javascript
// show comment
$(".custom-select").select("show");

// hide comment
$(".custom-select").select("hide");

// set element's status
$(".custom-select").select("set");

// get option's value
$(".custom-select").select("get");

// bar enable be actived
$(".custom-select").select("enable");

// bar can't be actived 
$(".custom-select").select("disable");

// remove all event
$(".custom-select").select("destroy");

```

## Event / Callback

* <code>change</code>: trigger when select chage

how to use event:
```javascript
$(document).on('change', function(event,instance) {
    // instance means current select instance 
    // some stuff
});
```

## Browser support
jquery-select is verified to work in Internet Explorer 7+, Firefox 2+, Opera 9+, Google Chrome and Safari browsers. Should also work in many others.

Mobile browsers (like Opera mini, Chrome mobile, Safari mobile, Android browser and others) is coming soon.

## Changes

| Version | Notes                                                            |
|---------|------------------------------------------------------------------|
|   0.2.x | ([compare][compare-1.2]) add history function                    |
|   0.1.x | ([compare][compare-1.1]) add keyboard function                   |
|     ... | ...                                                              |

[compare-1.2]: https://github.com/amazingSurge/jquery-select/compare/v1.2.0...v1.3.0
[compare-1.1]: https://github.com/amazingSurge/jquery-select/compare/v1.1.0...v1.2.0

## Author
[amazingSurge](http://amazingSurge.com)

## License
jQuery-select plugin is released under the <a href="https://github.com/amazingSurge/jquery-select/blob/master/LICENCE.GPL" target="_blank">GPL licence</a>.


