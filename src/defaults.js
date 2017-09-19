/*eslint no-empty-function: "off"*/

export default {
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
