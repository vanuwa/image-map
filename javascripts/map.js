(function() {
 
  SETTINGS = {
    version: '0.0.1',
    env: 'dev'
  };


  // HELPERS

  // show msg just for debug info
  function puts(msg) {
    if (SETTINGS.env === 'dev') {
      if (typeof console !== 'undefined' && console !== null) {
        console.log(msg);
      } else {
        alert(msg);
      }
    }
  };

  // subscribe on event
  function bind(element, event_name, listener, capturing) {
    if (element.addEventListener) {
      element.addEventListener(event_name, listener, capturing);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event_name, listener);
    }
  };

  // unsubscribe
  function unbind(element, event_name, listener, capturing) {
    if (element.removeEventListener) {
      element.removeEventListener(event_name, listener, capturing);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event_name, listener);
    }
  };
  
  // blocking events
  function block_event(e) {
    if (!e) e = window.event;
    
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }

    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  };


  // Class Point
  var Point = (function() {
    
    var self = null;

    //constructor
    function Point(point) {
      point || (point = {});
      self = this;
      
      for (attr in point) {
        this[attr] = point[attr];
      }
      this.id = new Date().getTime();
      
      this.el = document.createElement('div');
      this.el.className = 'point';
      this.el.id = this.id;

      this.x ? (this.el.style.left = this.x + 'px') : true
      this.y ? (this.el.style.top = this.y + 'px') : true
    }


    // public methods

    Point.prototype.append_to = function(node) {
      if (typeof node !== 'undefined' && node.appendChild) {
        node.appendChild(this.el);
      }
      return this.el;
    };
    
    // update attributes (or add new) attributes
    Point.prototype.update = function(point) {
      point || (point = {});
      for (attr in point) {
        this[attr] = point[attr];
      }
    };

    // remove point
    Point.prototype.kill = function() {
      var model = {};
      for (attr in this) {
        model[attr] = this[attr];
      }
      this.el.parentNode.removeChild(this.el);
      return model;
    };

    Point.prototype.on_dblclick = function(callback) {
      bind(this.el, 'dblclick', callback, false);
    };


    // private methods: helpers and listeners


    return Point;

  })();


  // Class Map
  var Map = (function() {

    var self;
    var edit_point_form, remove_point_form;
    var mouse_down = false;
    var captured_point = null;

    function Map(node) {
      self = this;
      node || (node = document.createElement('img'));
      this.el = node;
      this.points = [];

      bind(node, 'click', map_on_click, false);

      node.parentNode.appendChild(build_edit_point_form());
      edit_point_form = document.getElementById('edit_point_form');
      hide_edit_point_form();

      remove_point_form = document.getElementById('delete_point_form');

      bind(document.getElementById('hide_form_button'), 'click', function(e) {hide_edit_point_form()}, false);
      bind(document.getElementById('edit_point_form'), 'submit', update_point, false);
      bind(document.getElementById('delete_point_form'), 'submit', remove_point, false);

      initialize_dragndrop();
    }

    
    // public methods
    
    // add point to DOM tree
    Map.prototype.add_point = function(point) {
      if (typeof point !== 'undefined' && point) {
        this.el.parentNode.appendChild(point.el);
        self.points[point.id] = point;
        return true;
      }
      return false;
    };

    
    // private methods: helpers and listeners
    
    // mouse down listener
    var point_on_mouse_down = function(e) {
      e || (e = window.event);
      mouse_down = true;
      captured_point = get_element(e);
      block_event(e);
      return false;
    };

    // mouse move listener
    var map_on_mouse_move = function(e) {
      if (mouse_down) {
        e || (e = window.event);

        captured_point.style.left = (e.offsetX ? e.offsetX : e.layerX) + 'px';
        captured_point.style.top = (e.offsetY ? e.offsetY : e.layerY) + 'px';

        block_event(e);
        return false;
      }
    };

    // mouse up listener
    var document_on_mouse_up = function(e) {
      mouse_down = false;
      captured_point = null;
    };

    // listener for putting dot on the map
    var map_on_click = function(e) {
      e || (e = window.event);
      hide_edit_point_form();

      var x = e.offsetX ? e.offsetX : e.layerX; //e.pageX - self.el.parentNode.offsetLeft;
      var y = e.offsetY ? e.offsetY : e.layerY; //pageY - self.el.parentNode.offsetTop;

      var point = new Point({x: x, y: y});

      if (self.add_point(point)) {
        point.on_dblclick(point_on_dblclick);
        bind(point.el, 'mousedown', point_on_mouse_down, false);
      }
    };

    // listener: show edit point info form
    var point_on_dblclick= function(e) {
      e || (e = window.event);
      var el = get_element(e);
      var point = self.points[el.id];
      show_edit_point_form(point, e);

    };

    // update point info
    var update_point = function(e) {
      e || (e = window.event);
      
      var form = get_element(e);
      var point = self.points[form['point_id'].value];
      point.update({
        name: form['point_name'].value,
        description: form['point_description'].value
      });

      hide_edit_point_form();
      block_event(e);
      return false;
    };

    // delete point from the DOM tre and collection points
    var remove_point = function(e) {
      e || (e = window.event);

      var form = get_element(e);
      var point = self.points[form['point_id'].value];
      point = point.kill();
      delete self.points[point.id];

      hide_edit_point_form();
      block_event(e);
      return false;
    };

    // helper for getting targer (src) element from event
    var get_element = function(event) {
      var element = null;
      if (typeof event.target !== 'undefined') {
        element = event.target;
      } else if (typeof event.srcElement !== 'undefined'){
        element = event.srcElement;
      }
      return element;
    };

    var initialize_dragndrop = function() {
      mouse_down = false;
      bind(self.el, 'mousemove', map_on_mouse_move, false);
      bind(document, 'mouseup', document_on_mouse_up, false);
    };

    // for fast implementation use innerHTML
    var build_edit_point_form = function() {
      var form = document.createElement('div');
      form.id = 'edit_point_form_container';
      form.style.height = '200px';
      form.style.width = '200px';

      form.innerHTML = '\
        <form id="edit_point_form">\
          <input type="hidden" name="point_id" value="" />\
          <p class="form_field">\
            <label for="point_name">Point name:</label><br />\
            <input type="text" id="point_name" name="point_name" value="" />\
          </p>\
          <p class="form_field">\
            <label for="point_description">Point description:</label><br />\
            <textarea id="point_description" cols="20" rows="2" name="point_description"></textarea>\
          </p>\
          <input type="submit" value="Update" />\
        </form>\
        <form id="delete_point_form">\
          <input type="hidden" name="point_id" value="" />\
          <input type="submit" value="Delete" />\
        </form>\
        <input id="hide_form_button" type="button" value="Close" />\
      ';

      var container = self.el.parentNode;
      form.style.top = (container.offsetTop + Math.round((container.offsetHeight - parseInt(form.style.height)) / 2)) + 'px';

      return form;
    };

    var show_edit_point_form = function(point, e) {
      edit_point_form.reset();
      if (typeof point !== 'undefined' && point) {
        remove_point_form['point_id'].value = point.id;
        edit_point_form['point_id'].value = point.id;
        edit_point_form['point_name'].value = (point.name || "");
        edit_point_form['point_description'].innerHTML = (point.description || "");
      }

      var form_width = parseInt(edit_point_form.parentNode.style.width);
      var position = point.el.offsetLeft + point.el.offsetWidth;
      if ((position + form_width) > map.el.offsetWidth) {
        position = map.el.offsetWidth - form_width - 10;
      }
      edit_point_form.parentNode.style.left = position + 'px';
      edit_point_form.parentNode.style.display = 'block';
    };

    var hide_edit_point_form = function(point) {
      edit_point_form.parentNode.style.display = 'none';
    };

    return Map;
  
  })(); 

  this.Map = Map;
  this.Point = Point;


  // usage
  
  window.onload = function() {
    var node = document.getElementById('img');
    map = new Map(node);
  };

 }).call(this);
