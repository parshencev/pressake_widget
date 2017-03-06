// ----------------------------------------------------------------------------
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
// ----------------------------------------------------------------------------
// Created by kozlov on 21.02.2017.
// ----------------------------------------------------------------------------
var $pt = {};
// ----------------------------------------------------------------------------
$pt.dbg = {
  active: true,
  console_log: true,
  err_list: [],

  trace_empty: function(value, err_no_msg) {
    if (!value)
      this.trace(err_no_msg);
  },

  trace_undef: function(value, err_no_msg) {
    if (typeof value == 'undefined')
      this.trace(err_no_msg);
  },

  _trace: function(err_no_msg) {
    if (this.active) {
      this.err_list.push(err_no_msg);
      if (this.console_log)
        console.log(err_no_msg);
    }
  }
};
// ----------------------------------------------------------------------------
$pt.Mixin = function(dst_obj, src_obj) {
  var _obj = {};
  for (var x in src_obj)
    if ((typeof _obj[x] == 'undefined')||(_obj[x] != src_obj[x]))
      dst_obj.prototype[x] = src_obj[x];
};
// ----------------------------------------------------------------------------
$pt.Subject = {
  bind: function(event_type, handler) {
    if (this[event_type])
      this[event_type].push(handler);
    else
      throw Error('У объекта отсутствует событие ' + event_type);
  },

  unbind: function(event_type, handler) {
    if (this[event_type]) {
      for (var i = 0; i < this[event_type].length; i++) {
        var _handler = this[event_type][i];
        if (typeof _handler == 'undefined') continue;
        if ((_handler.obj == handler.obj)&&(_handler.func == handler.func)) {
          delete this[event_type][i];
          return;
        }
      }
    }
  },

  handle: function(event_type, data) {
    if (this[event_type]) {
      for (var i = 0; i < this[event_type].length; i++) {
        var handler = this[event_type][i];
        if (typeof handler == 'undefined') continue;
        var func = handler.obj[handler.func];
        if (data)
          func.call(handler.obj, data);
        else
          func.call(handler.obj);
      }
    }
    else {
      throw Error('У объекта отсутствует событие ' + event_type);
    }
  }
};
// ----------------------------------------------------------------------------
$pt.elem_class = function(elem_type, class_name) {
  var elem = document.createElement(elem_type);
  elem.classList.add(class_name);
  return elem;
};
// ----------------------------------------------------------------------------
$pt.Env = function(site) {
  var clent_os_def = {
    android:    ['android'],
    ios:        ['iphone', 'ipad', 'ipod'],
    windows:    ['win', 'windows'],
    macosx:     ['macintosh']
  };

  var device_type_def = {
    smartphone: ['mobile', 'phone'],
    tablet:     ['tablet']
  };

  var loader_id  = 'presstake-loader';
  this.loader = document.getElementById(loader_id);
  this.view_type = this.loader.getAttribute('data-view');
  this.direction = this.loader.getAttribute('data-direction');
  this.size = this.loader.getAttribute('data-size');
  if (!this.direction)
    this.direction = 'horizontal';
  $pt.dbg.active = (this.loader.getAttribute('data-dbg') == 1);

  var user_agent  = navigator.userAgent.toLowerCase();

  this.location   = window.location.href;
  if ($pt.dbg.active)
    this.location = 'http://www.presstake.com/banner-test/anons5.html';

  this.protocol   = this._protocol();
  if (this.loader.getAttribute('data-site'))
    this.site     = this.loader.getAttribute('data-site');
  else
    this.site     = 'presstake.com/';
  this.os         = this._client_os(clent_os_def, user_agent);
  this.device     = this._device_type(device_type_def, user_agent);
  this.platform   = this._platform();

};

$pt.Env.prototype = {
  _protocol: function() {
    var protocol = document.location.protocol;
    return ('https:' === protocol) ? 'https://' : 'http://';
  },

  _client_os: function(client_os_def, user_agent) {
    for (var client_os in client_os_def) {
      var os_def = client_os_def[client_os];
      for (var i = 0; i < os_def.length; i++) {
        if (user_agent.indexOf(os_def[i]) !== -1)
          return client_os;
      }
    }
    return 'other';
  },

  _device_type: function(device_type_def, user_agent) {
    for (var device_type in device_type_def) {
      var type_def = device_type_def[device_type];
      for (var i = 0; i < type_def.length; i++) {
        if (user_agent.indexOf(type_def[i]) !== -1)
          return device_type;
      }
    }
    if (this.os == 'android')
      return 'tablet';
    else
      return 'desktop';
  },

  _platform: function (){
    if (this.os === 'other')
      return this.os;

    return [this.os, this.device].join('_');
  }
};
// ----------------------------------------------------------------------------
$pt.Page = function(env) {
  this.env = env;
};

$pt.Page.prototype = {
  scroll: function () {
    var windowScrollTop = window.scrollY;
    var clientHeight    = Math.max(document.documentElement.clientHeight, document.body.clientHeight);
    var scrollHeight    = document.documentElement.scrollHeight;

    var _scroll = (windowScrollTop * 100) / clientHeight;
    if (_scroll == 0 && scrollHeight <= window.innerHeight)
      _scroll = 100;

    return _scroll;
  },

  zoom : function () {
    var width = window.innerWidth;
    var width_scale;
    var orientation = this.orientation();
    if (orientation == 'landscape' && this.env.device != 'desktop')
      width_scale = 2;
    else
    if (orientation == 'landscape' && this.env.device == 'desktop')
      width_scale = 3;
    else
      width_scale = 1;

    return (width / width_scale) / 700;
  },

  left : function() {
    var clientWidth = document.documentElement.clientWidth;
    var scrollLeft  = window.scrollX;

    if (this.env.os != 'ios')
      return (scrollLeft * 100) / clientWidth;
    else
      return 0;
  },

  bottom: function() {
    return 0;
  },

  orientation: function() {
    return ((window.innerHeight / window.innerWidth) > 1) ?  'portrait' : 'landscape';
  }
};
// ----------------------------------------------------------------------------
$pt.Model = function(env) {
  this.env = env;
  this.target_url = env.protocol + env.site;

  this.banner_id = env.loader.getAttribute('data-bid');
  this.client_id = env.loader.getAttribute('data-clid');

  this.bpage_status = 0;
  this.page_id      = null;
  this.ovid         = null;

  this.bpage_status = 0;
  this.banner_type  = null;
  this.banner_items  = [];
  this.geo_name     = null;

};

$pt.Model.prototype = {
  set_bpage_data: function(bpage_response) {
    this.bpage_status = bpage_response.status;
    this.page_id      = bpage_response.page;
    this.ovid         = bpage_response.banId;
  },

  set_banner_data: function(banner_response) {
    this.banner_status = banner_response.status;
    this.banner_type   = banner_response.bannerType == undefined ? 0 : banner_response.bannerType;
    this.banner_items  = banner_response.data;
    this.geo_name      = banner_response.geo.name;

    var _this = this;
    this.banner_items.map(function(item){
      item.link = _this._tracking_url(item);
      if (item.hasOwnProperty('name'))
        item.title = _this._calc_title(item.name);
      item.price = item.price == 0.0 ?  'БЕСПЛАТНО' : item.price;
    });
  },

  bpage_url: function() {
    var env   = this.env;
    var app = 'queries/parse';
    var params = '?clid=' + encodeURIComponent(this.client_id) +
      '&bid=' + encodeURIComponent(this.banner_id) +
      '&loc=' + encodeURIComponent(env.location) +
      '&os='  + encodeURIComponent(env.platform) +
      '&action=pgst';
    return this.target_url + app + params;
  },

  banner_url: function() {
    var env   = this.env;
    var app = 'queries/list';
    var params = '?clid=' + encodeURIComponent(this.client_id) +
      '&bid='   + encodeURIComponent(this.banner_id) +
      '&pgid='  + encodeURIComponent(this.page_id) +
      '&os='    + encodeURIComponent(env.platform) +
      '&banid=' + encodeURIComponent(this.ovid);
    return this.target_url + app + params;
  },

  stat_url: function(action) {
    var app = 'queries/stat';
    var params = '?clid=' + encodeURIComponent(this.client_id) +
      '&bid='    + encodeURIComponent(this.banner_id) +
      '&pgid='   + encodeURIComponent(this.page_id) +
      '&ovid='   + encodeURIComponent(this.ovid);
    if (typeof action !== 'undefined')
      params += '&action=' + encodeURIComponent(action);

    return this.target_url + app + params;
  },

  _tracking_url: function(banner_item) {
    var app = 'tracking/index.php';
    var params = '?clid=' + encodeURIComponent(this.client_id) +
      '&bid='  + encodeURIComponent(this.banner_id) +
      '&pgid=' + encodeURIComponent(this.page_id) +
      '&item=' + encodeURIComponent(banner_item.sitid) +
      '&ovid=' + encodeURIComponent(this.ovid);
    return this.target_url + app + params;
  },

  _calc_title: function(name) {
    var length = name.length;
    var max_length = 48;
    name = name.slice(0, max_length);
    if (name.length == max_length && length > max_length)
      name = name + '...';

    return name;
  }
};
// ----------------------------------------------------------------------------
$pt.Ajax = {
  repeat_counter: 3,
  repeat_timeout : 1000,

  request : function (url, callback, callbackError, intervalId){
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function() {
      if (request.readyState != 4)
        return false;

      if (request.status == 200 && callback) {
        var response = JSON.parse(request.responseText);
        callback(response, intervalId);
      }
      else
      if (callbackError)
        callbackError();
    };

    request.send();
  },

  repeater: function (ajax_func, url, callback, callbackError) {
    var _this = this;
    var intervalId = setInterval((function(){
      if (!this.tick)
        this.tick = 1;
      else
        this.tick ++;

      ajax_func(url, callback, callbackError, intervalId);

      if (this.tick >= _this.repeat_counter)
        clearInterval(intervalId);
    }), this.repeat_timeout);

    return intervalId;
  }
};
// ----------------------------------------------------------------------------
$pt.Controller = function(model) {
  this.model = model;

  this.on_bpage  = [];
  this.on_banner = [];

  this.bind('on_bpage', {obj:this, func:'banner'});
};

$pt.Controller.prototype = {
  run: function() { this._bpage(); },

  _bpage: function() {
    var bpage_url = this.model.bpage_url();
    var _this = this;
    var callback = function(response, intervalId) {
      if (intervalId)
        clearInterval(intervalId);

      if (response && response.requestStatus == 200) {
        _this.model.set_bpage_data(response);
        _this.handle('on_bpage');
      }
    };

    var error = function () {
      _this.repeater(_this.request, bpage_url, callback);
    };

    this.request(bpage_url, callback, error);
  },

  banner: function() {
    var banner_url = this.model.banner_url();
    var _this = this;
    var callback = function(response, intervalId) {
      if (intervalId)
        clearInterval(intervalId);

      if (response && response.requestStatus == 200) {
        _this.model.set_banner_data(response);
        _this.handle('on_banner');
      }
    };

    var error = function () {
      _this.repeater(_this.request, banner_url, callback);
    };

    this.request(banner_url, callback, error);
  },

  stat: function(action) {
    var stat_url = this.model.stat_url(action);
    var _this = this;
    var callback = function(response, intervalId) {
      if (intervalId)
        clearInterval(intervalId);
    };

    var error = function () {
      _this.repeater(_this.request, stat_url, callback);
    };

    this.request(stat_url, callback, error);
  }
};
$pt.Mixin($pt.Controller, $pt.Ajax);
$pt.Mixin($pt.Controller, $pt.Subject);
// ----------------------------------------------------------------------------
$pt.BannerView = function(env, page, model, controller) {
  this.env = env;
  this.banner_space_id = 'prestake-banner';
  this.css_url = model.target_url + 'banner-client/css/presstake-banner.css';
  this.page    = page;
  this.model   = model;
  this.controller = controller;

  this.banner_type_def = [
    ['pt-banner-gadgets',      'То, что Вы ищете, может быть здесь!',      true],
    ['pt-banner-gadgets',      'То, что Вы ищете, может быть здесь!',      true],
    ['pt-banner-books',        'Эти книги могут быть Вам интересны!',      false],
    ['pt-banner-clothes_shop', 'То, что Вы ищете, может быть здесь!',      true],
    ['pt-banner-games',        'Эти приложения могут быть Вам интересны!', false],
    ['pt-banner-films',        'Эти фильмы могут быть Вам интересны!',     false]
  ];

  // dom elements
  this.banner = null;
  this.banner_cover = null;
  this.banner_scroll = null;
  this.banner_close = null;
  this.banner_list_close = null;

  var _this = this;
  $pt.BannerView.event_handlers.scroll_event = function() { _this.scroll_event() };
  $pt.BannerView.event_handlers.page_scroll  = function() { _this.page.scroll()  };
  $pt.BannerView.event_handlers.banner_cover_click_first_event  = function(event) { _this.banner_cover_click_first_event(event) };
  $pt.BannerView.event_handlers.banner_cover_click_second_event = function(event) { _this.banner_cover_click_second_event(event) };

  controller.bind('on_banner', {obj:this, func:'create'})
};
$pt.BannerView.event_handlers = {
  scroll_event: null,
  page_scroll:  null,
  banner_cover_click_first_event: null,
  banner_cover_click_second_event: null
};

$pt.BannerView.prototype = {
  create: function() {
    this._create_css();
    this._create_banner();
    this._bind_events();
    this.zoom_event();
    this._show();
  },

  _create_css: function() {
    var css  = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = this.css_url;

    var head = document.head;
    head.appendChild(css);
  },

  _show: function() {
    var scroll_event = $pt.BannerView.event_handlers.scroll_event;
    var page_scroll  = $pt.BannerView.event_handlers.page_scroll;

    window.removeEventListener('scroll', scroll_event);
    window.removeEventListener('scroll', page_scroll);
    this.controller.stat('vis');

    this.banner.classList.add('pt-banner-show');
  },

  _hide: function() {
    this.banner.classList.remove('pt-banner-show');
    this.controller.stat('cl');
  },

  _open_list: function() {
    var click_first_event  = $pt.BannerView.event_handlers.banner_cover_click_first_event;
    var click_second_event = $pt.BannerView.event_handlers.banner_cover_click_second_event;
    this.banner.classList.add('pt-banner-open');
    this.banner_cover.removeEventListener('click', click_first_event);
    this.banner_cover.addEventListener('click', click_second_event);
    this.controller.stat();
  },

  _close_list: function() {
    var click_first_event  = $pt.BannerView.event_handlers.banner_cover_click_first_event;
    var click_second_event = $pt.BannerView.event_handlers.banner_cover_click_second_event;
    this.banner.classList.remove('pt-banner-open');
    this.banner_cover.removeEventListener('click', click_second_event);
    this.banner_cover.addEventListener('click', click_first_event);
  },

  _banner_class:     function() { return this.banner_type_def[this.model.banner_type][0]; },
  _main_text_middle: function() { return this.banner_type_def[this.model.banner_type][1]; },
  _has_list_header:  function() { return this.banner_type_def[this.model.banner_type][2]; },

  _create_banner : function (){
    var banner_cover = this._create_cover();
    this.banner_cover = banner_cover;

    var banner = $pt.elem_class('noindex', 'pt-banner');
    banner.classList.add(this._banner_class());
    banner.id = this.banner_space_id;
    this.banner = banner;

    var list_wrapper = $pt.elem_class('div', 'pt-banner-list-wrapper');

    var banner_list_close = $pt.elem_class('div', 'pt-banner-close');
    banner_list_close.id  = 'pt-banner-close__list';
    this.banner_list_close = banner_list_close;

    var banner_list_scroll = $pt.elem_class('div', 'pt-banner-list-scroll-wrapper');
    banner_list_scroll.id  = 'pt-banner-scroll';
    this.banner_scroll = banner_list_scroll;


    var list = this._create_list();
    banner_list_scroll.appendChild(list);

    if (this._has_list_header()) {

      var list_header          = $pt.elem_class('div', 'pt-banner-list-header');
      var list_header_selector = $pt.elem_class('div', 'pt-banner-list-header-selector-wrapper');

      var list_header_selector_description = $pt.elem_class('div', 'pt-banner-list-header-description');
      list_header_selector_description.innerHTML = 'Актуально для ';

      var list_header_source        = $pt.elem_class('div', 'pt-banner-list-header-source-wrapper');
      var list_header_source_before = $pt.elem_class('div', 'pt-banner-list-header-source-before');
      var list_header_source_after  = $pt.elem_class('a', 'pt-banner-list-header-source-after');

      var list_header_selector_selector = $pt.elem_class('span', 'pt-banner-list-header-selector');
      list_header_selector_selector.id = 'pt-banner-selector';
      list_header_selector_selector.innerHTML = this.model.geo_name;

      list_header_selector.appendChild(list_header_selector_description);
      list_header_selector.appendChild(list_header_selector_selector);

      list_header_source.appendChild(list_header_source_before);
      list_header_source.appendChild(list_header_source_after);

      list_header.appendChild(list_header_selector);
      list_header.appendChild(list_header_source);

      list_wrapper.appendChild(list_header);
    }

    list_wrapper.appendChild(banner_list_close);
    list_wrapper.appendChild(banner_list_scroll);

    banner.appendChild(banner_cover);
    banner.appendChild(list_wrapper);
    document.body.appendChild(banner);
  },

  _create_cover: function() {
    var cover = $pt.elem_class('div', 'pt-banner-main');
    cover.id = 'pt-banner-main';

    var text_wrapper = $pt.elem_class('div', 'pt-banner-text-wrapper');

    var text_top = $pt.elem_class('div', 'pt-banner-text-top');
    text_top.innerHTML = 'Лучшие цены в он-лайн магазинах';

    var text_top_open = $pt.elem_class('div', 'pt-banner-text-top-open');
    text_top_open.innerHTML = 'Узнайте больше о системе ';

    var text_middle = $pt.elem_class('div', 'pt-banner-text-middle');
    text_middle.innerHTML = this._main_text_middle();

    var text_middle_open = $pt.elem_class('a', 'pt-banner-text-middle-open');
    text_middle_open.href = 'http://www.presstake.com/landing/';
    text_middle_open.innerHTML = 'PressTake';

    var text_bottom_colored = $pt.elem_class('a', 'pt-banner-text-bottom__colored');
    text_bottom_colored.innerHTML = 'PressTake';
    text_bottom_colored.href = 'http://www.presstake.com/landing/';

    var text_bottom = $pt.elem_class('div', 'pt-banner-text-bottom');
    text_bottom.innerHTML = 'powered by';
    text_bottom.appendChild(text_bottom_colored);

    text_wrapper.appendChild(text_top);
    text_wrapper.appendChild(text_top_open);
    text_wrapper.appendChild(text_middle);
    text_wrapper.appendChild(text_middle_open);
    text_wrapper.appendChild(text_bottom);

    var logo_wrapper = $pt.elem_class('div', 'pt-banner-logo-wrapper');
    var link = $pt.elem_class('div', 'pt-banner-link');
    link.innerHTML = 'Узнать!'

    var banner_close = $pt.elem_class('div', 'pt-banner-close');
    banner_close.id  = 'pt-banner-close_banner';
    this.banner_close = banner_close;

    cover.appendChild(logo_wrapper);
    cover.appendChild(text_wrapper);
    cover.appendChild(link);
    cover.appendChild(banner_close);

    return cover;
  },

  _create_list: function() {
    var list_container = $pt.elem_class('div', 'pt-banner-list');
    var data_items = this.model.banner_items;
    for (var i = 0; i < data_items.length; i++) {
      list_container.appendChild(
        this._create_list_item(data_items[i])
      );
    }
    return list_container;
  },

  _create_list_item: function(data) {
    var item = $pt.elem_class('div', 'pt-banner-list-item');
    var title = $pt.elem_class('div', 'pt-banner-item-title');
    title.innerHTML =data.title;

    var price = $pt.elem_class('div', 'pt-banner-item-price');
    price.classList.add('pt-banner-item-price-text');
    price.innerHTML = data.price;

    var image = $pt.elem_class('img', 'pt-banner-list-image');
    image.src = data.image;
    image.alt = '';

    var image_wrap = $pt.elem_class('a', 'pt-banner-list-image-wrapper');
    image_wrap.href = data.link;
    image_wrap.appendChild(image);

    var link  = $pt.elem_class('a', 'pt-banner-list-link');
    link.href = data.link;
    link.innerHTML = data.shop_name;

    var button  = $pt.elem_class('a', 'pt-banner-item-shop_button');
    button.href = data.link;

    if (data.itarget.google_play == 1)
      button.classList.add('pt-banner-item-shop_button__google');
    else
    if (data.itarget.appstore == 1)
      button.classList.add('pt-banner-item-shop_button__apple');
    else
      button.innerHTML = 'В магазин';

    if (data.hasOwnProperty('alternativeText')) {
      item.classList.add('pt-banner-list-item__alternative');

      var alternative = $pt.elem_class('div', 'pt-banner-alternative_text');

      var alternative_top = $pt.elem_class('div', 'pt-banner-alternative_text-top');
      alternative_top.innerHTML = data.alternativeText.top;

      var alternative_bottom = $pt.elem_class('div', 'pt-banner-alternative_text-bottom');
      alternative_bottom.innerHTML = data.alternativeText.bottom;

      alternative.appendChild(alternative_top);
      alternative.appendChild(alternative_bottom);

      item.appendChild(alternative);
    }

    item.appendChild(image_wrap);
    item.appendChild(link);
    item.appendChild(title);

    if (data.hasOwnProperty('description')) {
      var description = $pt.elem_class('div', 'pt-banner-item-description');
      description.innerHTML = data.description;

      item.appendChild(description);
    }

    item.appendChild(price);
    item.appendChild(button);
    return item;
  },

  _bind_events: function() {

    var _this = this;
    var scroll_event = $pt.BannerView.event_handlers.scroll_event;
    var page_scroll  = $pt.BannerView.event_handlers.page_scroll;

    window.addEventListener('scroll', scroll_event);
    window.addEventListener('scroll', page_scroll);
    window.addEventListener('scroll', function() { _this.page.left() });

    window.addEventListener('resize',    function() { _this.page.zoom() });
    window.addEventListener('touchmove', function() { _this.page.zoom() });

    window.addEventListener('resize',    function() { _this.page.left() });
    window.addEventListener('touchmove', function() { _this.page.left() });

    window.addEventListener('resize',    function() { _this.page.bottom() });
    window.addEventListener('touchmove', function() { _this.page.bottom() });

    window.addEventListener('resize',    function() { _this.page.orientation() });
    window.addEventListener('touchmove', function() { _this.page.orientation() });

    window.addEventListener('resize',    function() { _this.zoom_event() });
    window.addEventListener('touchmove', function() { _this.zoom_event() });

    document.addEventListener('mousemove', function(event) { _this.document_mouse_move_event(event) } , true);
    document.addEventListener('mouseup',   function() { _this.document_mouse_up_event() }, true);

    this.banner_scroll.addEventListener('touchstart', function(event) { _this.banner_list_touch_start_event(event) }, true);
    this.banner_scroll.addEventListener('touchmove',  function(event) { _this.banner_list_touch_move_event(event) },  true);
    this.banner_scroll.addEventListener('touchend',   function() { _this.banner_list_touch_end_event() }, true);
    this.banner_scroll.addEventListener('mousedown',  function(event) { _this.banner_list_mouse_down_event(event) },  true);
    if (this.env.device == 'desktop')
      this.banner_scroll.addEventListener('wheel', function(event) { _this.banner_list_scroll_event(event) }, true);

    this.banner_cover.addEventListener('click',  function(event) { _this.banner_cover_click_first_event(event) });
    this.banner_close.addEventListener('click', function() { _this.banner_cover_close_button_event() });
    this.banner_list_close.addEventListener('click', function() { _this.banner_list_close_button_event() });
  },

  // Events ----------------------------------------------
  scroll_event: function() { this._show(); },

  scroll_left_event: function() {
    if (window.innerWidth < 700)
      this.banner.style.left = this.page.left() + '%';
  },

  zoom_event: function() {
    if (this.env.device == 'desktop')
      this.banner.classList.add('pt-banner-desktop');
    this.banner.style.left = this.page.left() + '%';
    var zoom = this.page.zoom();
    this.banner.style.transform       = 'scale(' + zoom + ')';
    this.banner.style.webkitTransform = 'scale(' + zoom + ')';
    this.banner.style.mozTransform    = 'scale(' + zoom + ')';
    this.banner.style.msTransform     = 'scale(' + zoom + ')';
    this.banner.style.oTransform      = 'scale(' + zoom + ')';
  },

  banner_cover_click_first_event: function(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;
    if (!target.id || target.id != 'pt-banner-close_banner')
      this._open_list()
  },

  banner_cover_click_second_event: function(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;
    if (!target.id || target.id != 'pt-banner-close_banner')
      this._close_list()
  },

  banner_cover_close_button_event: function() { this._hide(); },

  banner_list_close_button_event: function() { this._close_list();},

  banner_list_scroll_event: function(event) {
    event = event || window.event;
    this.banner_scroll.scrollLeft += event.deltaY;
  },

  banner_list_touch_move_event: function(event) {
    event = event || window.event;
    var scroll = event.targetTouches[0].clientX - this.banner_scroll.scrollProp.x;
    scroll = -1 * scroll;
    if (Math.abs(scroll) < 5)
      scroll = scroll < 0 ? -10 : 10;

    this.banner_scroll.scrollProp.dx = scroll;
    this.banner_scroll.scrollLeft   += scroll;
    this.banner_scroll.scrollProp.x  = event.targetTouches[0].clientX;
    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
  },

  banner_list_touch_start_event: function(event) {
    event = event || window.event;
    if (!this.banner_scroll.hasOwnProperty('scrollProp'))
      this.banner_scroll.scrollProp = {
        x : event.targetTouches[0].clientX
      };
    else {
      this.banner_scroll.scrollProp.x = event.targetTouches[0].clientX;
      if (this.banner_scroll.scrollProp.hasOwnProperty('intervalId'))
        if (this.banner_scroll.scrollProp.intervalId)
          clearInterval(this.banner_scroll.scrollProp.intervalId);
    }
  },

  banner_list_touch_end_event: function() {
    if (this.banner_scroll.hasOwnProperty('scrollProp')){
      if (
        Math.abs(this.banner_scroll.scrollProp.dx) < 7 ||
        Math.abs(this.banner_scroll.scrollProp.dx) == 10
      )
        this.banner_scroll.scrollProp.dx = 0;

      var _this = this;
      this.banner_scroll.scrollProp.intervalId = setInterval(function(){
        if (!this.hasOwnProperty('tick'))
          this.tick = 0;

        if (this.tick >= 200)
          clearInterval(_this.banner_scroll.scrollProp.intervalId);
        else {
          var scroll = ((_this.banner_scroll.scrollProp.dx * 50) / 200);
          _this.banner_scroll.scrollLeft += Math.ceil(scroll);
          this.tick++;
        }
      },1);
    }
  },

  banner_list_mouse_down_event : function(event) {
    event = event || window.event;
    if (!this.banner_scroll.hasOwnProperty('scrollProp'))
      this.banner_scroll.scrollProp = {
        x : event.clientX,
        mousedown : true
      }
    else {
      this.banner_scroll.scrollProp.x = event.clientX;
      this.banner_scroll.scrollProp.mousedown = true;
      if (this.banner_scroll.scrollProp.hasOwnProperty('intervalId'))
        if (this.banner_scroll.scrollProp.intervalId)
          clearInterval(this.banner_scroll.scrollProp.intervalId);
    }
    event.preventDefault ? event.preventDefault() : (event.returnValue=false);
  },

  document_mouse_move_event : function(event) {
    event = event || window.event;
    if (this.banner_scroll.hasOwnProperty('scrollProp')) {
      if (this.banner_scroll.scrollProp.hasOwnProperty('mousedown')) {
        if (this.banner_scroll.scrollProp.mousedown){
          var scroll = event.clientX - this.banner_scroll.scrollProp.x;
          if (Math.abs(scroll) > 0) {
            scroll = -1 * scroll * 2;
            if (Math.abs(scroll) < 5)
              scroll = (Math.sign(scroll) < 0) ? -10 : 10;
          }
        }
        this.banner_scroll.scrollProp.dx = scroll;
        this.banner_scroll.scrollLeft += scroll;
        this.banner_scroll.scrollProp.x = event.clientX;
      }
    }
    event.preventDefault ? event.preventDefault() : (event.returnValue=false);
  },

  document_mouse_up_event: function(){
    if (this.banner_scroll.hasOwnProperty('scrollProp')) {
      this.banner_scroll.scrollProp.mousedown = false;
      if (Math.abs(this.banner_scroll.scrollProp.dx) < 5)
        this.banner_scroll.scrollProp.dx = 0;

      var _this = this;
      this.banner_scroll.scrollProp.intervalId = setInterval(function() {
        if (!this.hasOwnProperty('tick'))
          this.tick = 0;

        if (this.tick >= 200)
          clearInterval(_this.banner_scroll.scrollProp.intervalId);
        else {
          var scroll = ((_this.banner_scroll.scrollProp.dx * 50) / 200);
          _this.banner_scroll.scrollLeft += Math.ceil(scroll);
          this.tick++;
        }
      }, 1);
    }
  }
}
// ----------------------------------------------------------------------------
$pt.WidgetView = function(env, model, controller) {
  this.env = env;
  this.widget_space_id  = 'presstakeWidget';
  this.widget_container_id = 'presstake-data-container';
  this.css_url = model.target_url + 'css/presstake_widget.css';

  if ($pt.dbg.active)
    this.css_url = 'presstake_widget.css';

  this.model   = model;
  this.controller = controller;

  this.scroll_weigth = 100;

  // dom elements
  this.widget = null;
  this.header = null;
  this.body   = null;
  this.footer = null;
  this.list_container = null;
  this.left_button  = null;
  this.right_button = null;

  controller.bind('on_banner', {obj:this, func:'create'})
};

$pt.WidgetView.prototype = {
  create: function() {
    this._create_css();
    this._create_widget();
    this._bind_events();
    this._show();
  },

  _create_css: function() {
    var css  = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = this.css_url;

    var head = document.head;
    head.appendChild(css);
  },

  _show: function() {
    var widget_container = document.getElementById(this.widget_container_id);
    widget_container.parentNode.replaceChild(this.widget, widget_container);
    this.controller.stat('vis');
  },

  _create_widget: function() {
    var direction = this.env.direction;
    var widget = $pt.elem_class('noindex', 'presstakeWidgetContainer');
    widget.classList.add('presstakeWidget_' + direction);
    if (this.env.size)
      widget.classList.add(this.env.size);
    widget.id = this.widget_space_id;
    this.widget = widget;

    var header = this._create_header();
    this.header = header

    var body = this._create_body(direction);
    this.body = body;

    // var footer = this._create_footer();
    // this.footer = footer;

    widget.appendChild(header);
    widget.appendChild(body);
    // widget.appendChild(footer);

    return widget;
  },

  _create_header: function() {
    var header = $pt.elem_class('div', 'presstakeWidgetHeader');
    header.id  = 'presstakeWidgetHeader';

    var city_container = $pt.elem_class('div', 'presstakeCityContainer');

    var city_stat_words = $pt.elem_class('span', 'presstakeCityIntroduction');
    city_stat_words.innerHTML = 'Актуально для города:';

    var city_dyn_words = $pt.elem_class('span', 'presstakeCityContent');
    city_dyn_words.innerHTML = this.model.geo_name;

    var merchant_container  = $pt.elem_class('div', 'presstakeMerchantContainer');
    var merchant_stat_words = $pt.elem_class('span', 'presstakeMerchantIntroduction');
    merchant_stat_words.innerHTML = 'powered by';

    var merchant_dyn_words = $pt.elem_class('a', 'presstakeMerchantContent');
    merchant_dyn_words.innerHTML = 'PressTake';
    merchant_dyn_words.href = 'http://presstake.com';

    city_container.appendChild(city_stat_words);
    city_container.appendChild(city_dyn_words);

    merchant_container.appendChild(merchant_stat_words);
    merchant_container.appendChild(merchant_dyn_words);

    header.appendChild(city_container);
    header.appendChild(merchant_container);

    return header;
  },

  _create_body: function(direction) {
    var body = $pt.elem_class('div', 'presstakeWidgetList');
    body.id = 'presstakeWidgetBody';

    var left_button = $pt.elem_class('input', 'presstakeListButton');
    left_button.classList.add('presstakeListButton_left');
    left_button.id = 'presstakeWidgetLeftButton';
    left_button.type  = 'button';
    left_button.value = direction == 'horizontal' ? '<' : '˄';
    this.left_button  = left_button;

    var list = this._create_list();
    this.list_container = list;

    var right_button = $pt.elem_class('input', 'presstakeListButton');
    right_button.classList.add('presstakeListButton_right');
    right_button.id = 'presstakeWidgetRightButton';
    right_button.type  = 'button';
    right_button.value = direction == 'horizontal' ?'>' : '˅';
    this.right_button  = right_button;

    body.appendChild(left_button);
    body.appendChild(list);
    body.appendChild(right_button);

    return body;
  },

  _create_footer: function() {
    var footer = $pt.elem_class('div', 'presstakeWidgetFooter');
    footer.id = 'presstakeWidgetFooter';

    var link = document.createElement('div');
    link.classList.add('presstakeFooterLink');
    link.href = 'http://presstake.com';
    link.innerHTML = 'powered by PressTake';

    footer.appendChild(link);
    return footer;
  },

  _create_list: function() {
    var list_container = $pt.elem_class('div', 'presstakeListContainer');
    list_container.id = 'presstakeWidgetList';

    var data_items = this.model.banner_items;
    for (var i = 0; i < data_items.length; i++) {
      list_container.appendChild(
        this._create_list_item(data_items[i])
      );
    }
    return list_container;
  },

  _create_list_item: function(data) {
    var item  = $pt.elem_class('a', 'presstakeListItemContainer');
    item.href = data.link;

    var image = $pt.elem_class('img', 'presstakeListImage');
    image.src = data.image;
    image.alt = '';
    image.title = data.name;

    var link = $pt.elem_class('a', 'presstakeListShopLink');
    link.href = data.link;
    link.innerHTML =  data.shop_name;

    var description = $pt.elem_class('div', 'presstakeListDescription');
    description.title = data.name;
    description.innerHTML = data.name;

    var price = $pt.elem_class('div', 'presstakeListPrice');
    price.innerHTML = data.price;

    var button = $pt.elem_class('a', 'presstakeShopButton')
    button.href = data.link;
    button.innerHTML = 'В магазин';

    item.appendChild(image);
    item.appendChild(link);
    item.appendChild(description);
    item.appendChild(price);
    item.appendChild(button);

    return item;
  },

  _bind_events: function() {
    var _this = this;
    this.left_button.addEventListener('click', function() { _this.left_button_event() });
    this.right_button.addEventListener('click', function() { _this.right_button_event() });
    if (/Firefox/i.test(navigator.userAgent))
      this.list_container.addEventListener('DOMMouseScroll', function(event) { _this.list_container_mouse_whell_event(event) });
    else
      this.list_container.addEventListener('mousewheel', function(event) { _this.list_container_mouse_whell_event(event) });
    this.list_container.addEventListener('touchstart', function(event) { _this.list_container_touch_start_event(event) });
    this.list_container.addEventListener('touchmove', function(event) { _this.list_container_touch_move_event(event) });
  },

  // Events ----------------------------------------------
  left_button_event: function() {
    if (this.env.direction == 'horizontal')
      this.list_container.scrollLeft -= this.scroll_weigth;
    else
      this.list_container.scrollTop -= this.scroll_weigth;
  },

  right_button_event: function() {
    if (this.env.direction == 'horizontal')
      this.list_container.scrollLeft += this.scroll_weigth;
    else
      this.list_container.scrollTop += this.scroll_weigth;
  },

  list_container_mouse_whell_event: function(event) {
    event = event || window.event;
    var deltaY = event.detail || event.wheelDelta || event.deltaY;
    if (Math.abs(deltaY) < 100)
      deltaY = Math.sign(deltaY) * 100;
    if (!/Firefox/i.test(navigator.userAgent))
      deltaY *= -1;
    if (this.env.direction == 'horizontal')
      this.list_container.scrollLeft += deltaY;
    else
      this.list_container.scrollTop += deltaY;

    event.preventDefault();
  },

  list_container_touch_start_event: function(event){
    event = event || window.event;
    var touch = event.targetTouches[0],
        container = this.list_container;
    if (this.env.direction == 'horizontal')
      container = touch.clientX;
    else
      container = touch.clientY;
  },

  list_container_touch_move_event: function(event){
    event = event || window.event;
    var touch = event.targetTouches[0],
        container = this.list_container;
    if (this.env.direction == 'horizontal'){
      container.scrollLeft += container.touchX - touch.clientX;
      container.touchX = touch.clientX;
    }
    else {
      container.scrollTop += container.touchY - touch.clientY;
      container.touchY = touch.clientY;
    }

    event.preventDefault();
  }
};

// ----------------------------------------------------------------------------

$pt.app = function(site) {
  var env   = new $pt.Env(site);
  var model = new $pt.Model(env);
  var ctrl  = new $pt.Controller(model);
  switch (env.view_type) {
    case 'banner':
      new $pt.BannerView(env, new $pt.Page(env), model, ctrl);
      break;
    case 'widget':
      new $pt.WidgetView(env, model, ctrl);
      break;
    default:
      return;
  }
  return ctrl;
}();

$pt.app.run();

// ----------------------------------------------------------------------------
