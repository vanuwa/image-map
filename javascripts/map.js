(function() {
 
  SETTINGS = {
    version: '0.0.1',
    env: 'dev'
  };


  // HELPERS

  // show msg
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
  
  // "clearing" events
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

  var Point = (function() {
    
    var self = null;


    //constructor
    function Point(point) {
      point || (point = {});
      self = this;
      
      for (attr in point) {
        this[attr] = point[attr];
      }
      
      this.el = document.createElement('div');
      this.el.setAttribute('class','point');
      //this.el.innerHTML = this.name || "point";

      this.x ? (this.el.style.left = this.x + 'px') : true
      this.y ? (this.el.style.top = this.y + 'px') : true

      bind(this.el, 'click', on_click, false);

    }


    // public methods

    Point.prototype.append_to = function(node) {
      if (typeof node !== 'undefined' && node.appendChild) {
        node.appendChild(this.el);
      }
      return this.el;
    };
    
    Point.prototype.update = function(point) {
      point || (point = {});
      for (attr in point) {
        this[attr] = point[attr];
      }
    };

    Point.prototype.kill = function() {
      var model = {};
      for (attr in this) {
        model[attr] = this[attr];
      }

      this.el.parentNode.removeChild(this.el);

      return model;
    };


    // private methods: helpers and listeners

    var on_click = function(e) {
      puts('dot_on_click');
    };  
      


    return Point;

  })();

  var Map = (function() {

    var self;

    function Map(node) {
      self = this;
      node || (node = document.createElement('img'));
      this.el = node;

      bind(node, 'click', on_click, false);

    }

    
    // public methods
    
    Map.prototype.add_point = function(point) {
      if (typeof point !== 'undefined' && point) {
        this.el.parentNode.appendChild(point.el);
        return true;
      }
      return false;
    };

    
    // private methods: helpers and listeners

    var on_click = function(e) {
      e || (e = window.event);

      var element = null;
      if (typeof e.target !== 'undefined') {
        element = e.target;
      } else if (typeof e.srcElement !== 'undefined'){
        element = e.srcElement;
      }

      puts(e.offsetX + " < - > " + e.layerX);
      var x = e.offsetX ? e.offsetX : e.layerX; //e.pageX - self.el.parentNode.offsetLeft;
      var y = e.offsetY ? e.offsetY : e.layerY; //pageY - self.el.parentNode.offsetTop;
      //puts("CLIENT: " + e.clientX + " , " + e.clientY + " | " + element.offsetLeft + " , " + element.offsetTop + " | " + element.offsetLeft + " , " + element.offsetTop);
      //puts( e.offsetX + " , " + e.offsetY);

      var point = new Point({
        x: x,
        y: y 
      });

      self.add_point(point);
    };

    var show_point_edit_form = function(point) {
      var div = document.createElement('div');
      div.setAttribute('class', 'edit_point_form');
      div.style.top = point.y;
      div.style.left = point.x;

      self.el.appendChild(div);
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
