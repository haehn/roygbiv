var NV_Window = function(div) {

  // div is the name of the div for the window
  this.init(div)
}

NV_Window.prototype = {
  
  constructor: NV_Window,
  
  init: function(div) {

    this.div_name = div
    this.div = jQuery("#" + this.div_name);
    this.div.addClass("dropdown")
    this.renderer = null
  },
  
  run_setup: function() {

    var tbg = "<form style='margin-top:20px' class='form-horizontal'><div class='control-group'><label class='control-label' for='select01'>Viewer: </label>"
    tbg += "<div class='controls'>"
    tbg += "<select id='select_" + this.div_name + "'>"
    for (plugin in nv_plugins) {
      tbg += "<option>" + nv_plugins[plugin].name + "</option>";
    }
    tbg += "</select></div></div>"
    tbg += "<div class='control-group'>"
    tbg += "<label class='control-label' for='file_input'>File:</label>"
    tbg += "<div class='controls'>"
    tbg += "<input id='file_" + this.div_name +
        "' type='file' name='file' /></div></div>"
    tbg += "<div class='controls'><button id='" + this.div_name +
        "_button' class='btn btn-primary' type='button'>Start</button></div>"
    tbg += "</form>"
    this.div.html(tbg);
    
    var temp_button = jQuery("#" + this.div_name + "_button");
    var file_button = jQuery("#file_" + this.div_name);
    var _this = this;
    file_button.change(function(evt) {

      var plugin = jQuery("#select_" + _this.div_name).attr('value');
      var files = evt.target.files;
      create_plugin_UI(_this);
      _this.run_plugin(_this.div_name, plugin, files[0])

    });
    temp_button.click(function() {

      var plugin = jQuery("#select_" + _this.div_name).attr('value');
      var file = jQuery("#file_" + _this.div_name).attr('value').replace(
          /^.*[\\\/]/, '');
      create_plugin_UI(_this);
      _this.run_plugin(_this.div_name, plugin, file)
    });
    
  },
  
  run_plugin: function(div, plugin, file) {

    var temp_object = nv_plugins[plugin].run(div, file);
    
    this.gui = temp_object["gui"]
    this.renderer = temp_object["renderer"]

    jQuery("." + dat.gui.GUI.CLASS_AUTO_PLACE_CONTAINER)[0]
        .removeChild(this.gui.domElement)
    this.guiDiv.append(this.gui.domElement)
  },
  
  destroy: function() {

    this.renderer.destroy()
    this.div.html("")
    this.div.css({
      'background-color': 'white'
    })
    this.run_setup()
    // clearing dead variables
    this.renderer = null
    this.gui = null
    this.button = null
  }
};

function create_plugin_UI(this_window) {

  this_window.div.html("")

  // make a div to contain the dat.GUI
  jQuery('<div/>', {
    'id': 'guidiv' + this_window.div_name.slice(1)// in the form guidiv_i_j,
  // where (i,j) is location in
  // the grid
  }).appendTo("#" + this_window.div_name)

  this_window.guiDiv = jQuery('#guidiv' + this_window.div_name.slice(1))

  this_window.guiDiv.css({
    'position': 'fixed',
    'z-index': 10,
    'width': '245px',
    'right': jQuery("#container").width() -
        this_window.div.css("left").slice(0, -2) -
        this_window.div.css("width").slice(0, -2) - 2,
    'top': 1 + parseInt(this_window.div.css("top").slice(0, -2))
  
  })

  // make a fixed dropdown menu
  
  jQuery('<button/>', {
    'id': 'button' + this_window.div_name.slice(1),// in the form guidiv_i_j,
    // where (i,j) is location
    // in the grid
    'class': 'btn btn-primary dropdown-toggle',
    'data-toggle': 'dropdown',
    'href': "#" + this_window.div_name
  }).appendTo("#" + this_window.div_name)

  this_window.button = jQuery('#button' + this_window.div_name.slice(1))

  this_window.button.css({
    'position': 'fixed',
    'z-index': 15,
  })

  this_window.button
      .html("<i class='icon-chevron-down'></i><ul style='z-index:15' class='dropdown-menu'><li onclick=\"NV_open_windows['" +
          this_window.div_name.slice(2) +
          "'].destroy()\"><a href='#'>Close</a></li></ul>")

  this_window.div.css({
    'background-color': 'black'
  })


}

var NV_open_windows = new Array()


jQuery(window).load(function() {

  set_sizes();
  make_window_grid(1, 1)
});

function set_sizes() {

  jQuery("#container").height(
      jQuery(window).height() - jQuery(".navbar").height())
}

function make_window_grid(n_rows, n_cols) {

  jQuery("#container").html(""); // clear container html
  for (i in NV_open_windows) {
    NV_open_windows[i] = null
  }
  
  var container = jQuery("#container")
  var c_width = container.width()
  var c_height = container.height()
  for ( var i = 0; i < n_rows; i++) {
    for ( var j = 0; j < n_cols; j++) {
      
      jQuery('<div/>', {
        'id': 'r_' + i + '_' + j
      }).appendTo("#container")

      var thisDiv = jQuery('#r_' + i + '_' + j)

      thisDiv.css({
        'position': 'absolute',
        'left': Math.round(c_width / n_cols * j) + 'px',
        'top': jQuery(".navbar").height() + Math.round(c_height / n_rows * i) +
            'px',
        'height': (Math.round(c_height / n_rows * (i + 1)) - Math
            .round(c_height / n_rows * i)) +
            'px',
        'width': (Math.round(c_width / n_cols * (j + 1)) - Math.round(c_width /
            n_cols * j)) +
            'px',
        'border': '1px #ddd solid',
      })

      var temp_window = new NV_Window('r_' + i + '_' + j);
      temp_window.run_setup();
      NV_open_windows[i + '_' + j] = temp_window

    }
  }
}
