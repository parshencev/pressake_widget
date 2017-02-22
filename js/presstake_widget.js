var PRESSTAKE_WIDGET_CORE = {
  CONFIG:{
    URLS:{
      TARGET:"presstake.com/",
      LIST:"banner/index.php",
      PARSE:"bpage/banner.php",
      STAT:"stat/index.php",
      CSS:"widget-client/css/presstake_widget.css"
    },
    USER_INFORMATION:{

    },
    SERVER_INFORMATION:{
      ERROR_STATUSES: ["404", "3", "error"],
      SUCCESS_STATUSES: ["200", "1", "success"],
      WAIT_STATUSES: ["2"]
    },
    WIDGET_INFORMATION:{
      WIDGET_LOADER_ID: "presstakeWidgetLoader",
      WIDGET_ID: "presstakeWidget",
      WIDGET_HEADER_ID: "presstakeWidgetHeader",
      WIDGET_BODY_ID: "presstakeWidgetBody",
      WIDGET_FOOTER_ID: "presstakeWidgetFooter",
      LEFT_BUTTON_ID: "presstakeWidgetLeftButton",
      RIGHT_BUTTON_ID: "presstakeWidgetRightButton",
      WIDGET_LIST_ID: "presstakeWidgetList",
      TIMEOUT: 30000,
      TICK_LIMIT: 3,
      SCROLL_WEIGTH: 100
    }
  },
  DATA:{
    WIDGET_DATA:{

    },
    QUERY_DATA:{
      QUERY_TICK: 0
    },
    LIST:{

    }
  },
  CONTROLLER:{
    init : function(information){
      var information_model = PRESSTAKE_WIDGET_CORE.INFORMATION_MODEL,
          config = PRESSTAKE_WIDGET_CORE.CONFIG,
          queryModel = PRESSTAKE_WIDGET_CORE.QUERY_MODEL,
          urlModel = PRESSTAKE_WIDGET_CORE.URL_MODEL,
          middlewareModel = PRESSTAKE_WIDGET_CORE.MIDDLEWARE_MODEL,
          renderModel = PRESSTAKE_WIDGET_CORE.RENDER_MODEL,
          supportFunctions = PRESSTAKE_WIDGET_CORE.SUPPORT_FUNCTIONS,
          data = PRESSTAKE_WIDGET_CORE.DATA,
          eventsModel = PRESSTAKE_WIDGET_CORE.EVENTS_MODEL,
          listCallbackSuccess = function(responce){

            data.QUERY_DATA.QUERY_TICK = 0;

            data.LIST = middlewareModel.listQueryAdditional(
              responce,
              urlModel.getTrackingQueryUrl,
              config.USER_INFORMATION,
              config.SERVER_INFORMATION,
              config.URLS
            ).data;

            information_model.appendInformation(information_model.getListQueryInformation(responce), config);

            data.WIDGET_DATA = renderModel.getFooter(
              renderModel.getList(
                renderModel.getHeader(
                  renderModel.getFrame(
                    config.WIDGET_INFORMATION,
                    supportFunctions.RENDER
                  ),
                  config.WIDGET_INFORMATION,
                  supportFunctions.RENDER
                ),
                config.WIDGET_INFORMATION,
                data.LIST,
                supportFunctions.RENDER
              ),
              config.WIDGET_INFORMATION,
              supportFunctions.RENDER
            );

            eventsModel.addEventToElement(data.WIDGET_DATA.querySelector("#"+config.WIDGET_INFORMATION.LEFT_BUTTON_ID), eventsModel.leftButtonEvent, "click");
            eventsModel.addEventToElement(data.WIDGET_DATA.querySelector("#"+config.WIDGET_INFORMATION.RIGHT_BUTTON_ID), eventsModel.rightButtonEvent, "click");
            eventsModel.addEventToElement(data.WIDGET_DATA.querySelector("#"+config.WIDGET_INFORMATION.WIDGET_LIST_ID), eventsModel.listContainerMouseWhellEvent, "mousewheel");
            eventsModel.addEventToElement(data.WIDGET_DATA.querySelector("#"+config.WIDGET_INFORMATION.WIDGET_LIST_ID), eventsModel.listContainerMouseWhellEvent, "DOMMouseScroll");

            renderModel.renderCss(urlModel.getCssUrl(config.URLS, config.USER_INFORMATION), supportFunctions.RENDER);

            renderModel.renderFrame(data.WIDGET_DATA, config.WIDGET_INFORMATION);

            queryModel.ajaxQuery(
              urlModel.getStatQueryUrl(config.URLS, config.USER_INFORMATION, config.SERVER_INFORMATION, "vis"),
              callbackSuccess,
              callbackError,
              queryModel.ajaxQuery,
              config.SERVER_INFORMATION,
              config.WIDGET_INFORMATION,
              data.QUERY_DATA
            );
            queryModel.ajaxQuery(
              urlModel.getStatQueryUrl(config.URLS, config.USER_INFORMATION, config.SERVER_INFORMATION),
              callbackSuccess,
              callbackError,
              queryModel.ajaxQuery,
              config.SERVER_INFORMATION,
              config.WIDGET_INFORMATION,
              data.QUERY_DATA
            );
          },
          parseCallbackSuccess = function(responce){
            information_model.appendInformation(information_model.getParseQueryInformation(responce), config);
            data.QUERY_DATA.QUERY_TICK = 0;
            queryModel.ajaxQuery(
              urlModel.getListQueryUrl(config.URLS, config.USER_INFORMATION, config.SERVER_INFORMATION),
              listCallbackSuccess,
              callbackError,
              queryModel.ajaxQuery,
              config.SERVER_INFORMATION,
              config.WIDGET_INFORMATION,
              data.QUERY_DATA
            );
          },
          callbackError = function(){
            document.querySelector("#"+config.WIDGET_INFORMATION.WIDGET_LOADER_ID).style.display = "none";
          },
          callbackSuccess = function(){
            data.QUERY_DATA.QUERY_TICK = 0;
          };

      listCallbackSuccess = listCallbackSuccess.bind(this);
      parseCallbackSuccess = parseCallbackSuccess.bind(this);
      callbackError = callbackError.bind(this);
      callbackSuccess = callbackSuccess.bind(this);

      if (information){
        information_model.updateInformation(information, config);
      }
      information_model.appendInformation(information_model.getUserInformation(config.WIDGET_INFORMATION.WIDGET_LOADER_ID), config);
      information_model.appendInformation(information_model.getWidgetInformation(config.WIDGET_INFORMATION.WIDGET_LOADER_ID), config);
      queryModel.ajaxQuery(
        urlModel.getParseQueryUrl(config.URLS, config.USER_INFORMATION),
        parseCallbackSuccess,
        callbackError,
        queryModel.ajaxQuery,
        config.SERVER_INFORMATION,
        config.WIDGET_INFORMATION,
        data.QUERY_DATA
      );


    }
  },
  INFORMATION_MODEL:{
    getUserInformation: function(widgetLoaderId){
      var dom = document.querySelector("#"+widgetLoaderId),
          userAgent = window.navigator.userAgent.toLowerCase(),
          userInformation = {
            PROTOCOL : window.location.protocol+"//",
            BID : dom.getAttribute('data-bid'),
            CLID : dom.getAttribute('data-clid'),
            LOCATION: window.location.href
          },
          find = function(value){
            return userAgent.indexOf(value) !== -1;
          },
          device = {
            fxos : function () {
              return (find('(mobile;') || find('(tablet;')) && find('; rv:');
            },
            blackberry : function () {
              return find('blackberry') || find('bb10') || find('rim');
            },
            windows : function () {
              return find('windows');
            },
            android : function () {
              return !device.windows() && find('android');
            },
            fxosTablet : function () {
              return device.fxos() && find('tablet');
            },
            windowsTablet : function () {
              return device.windows() && (find('touch') && !device.windowsPhone());
            },
            blackberryTablet : function () {
              return device.blackberry() && find('tablet');
            },
            androidTablet : function () {
              return device.android() && !find('mobile');
            },
            ipad : function () {
              return find('ipad');
            },
            meego : function () {
              return find('meego');
            },
            fxosPhone : function () {
              return device.fxos() && find('mobile');
            },
            blackberryPhone : function () {
              return device.blackberry() && !find('tablet');
            },
            windowsPhone : function () {
              return device.windows() && find('phone');
            },
            ipod : function () {
              return find('ipod');
            },
            iphone : function () {
              return !device.windows() && find('iphone');
            },
            androidPhone : function () {
              return device.android() && find('mobile');
            },
            mobile : function () {
              return device.androidPhone() ||
                     device.iphone() ||
                     device.ipod() ||
                     device.windowsPhone() ||
                     device.blackberryPhone() ||
                     device.fxosPhone() ||
                     device.meego();
            },
            tablet : function () {
              return device.ipad() ||
                     device.androidTablet() ||
                     device.blackberryTablet() ||
                     device.windowsTablet() ||
                     device.fxosTablet();
            },
            desktop : function () {
              return !device.tablet() && !device.mobile();
            }
          };
      if (!device.desktop()){
        if (!device.tablet()){
          if (!device.mobile()){
            userInformation.DEVICE = "other";
          } else {
            userInformation.DEVICE = "smartphone";
          }
        } else {
          userInformation.DEVICE = "tablet";
        }
      } else {
        userInformation.DEVICE = "desktop";
        if (device.windows()){
          userInformation.CLIENTOS = "windows";
        } else {
          userInformation.CLIENTOS = "macosx";
        }
      }
      if (userInformation.CLIENTOS == "other" || userInformation.DEVICE == "other") {
        userInformation.PLATFORM = "other";
      } else {
        userInformation.PLATFORM = encodeURIComponent(userInformation.CLIENTOS+"_"+userInformation.DEVICE);
      }
      return {
        USER_INFORMATION:{
          PROTOCOL: userInformation.PROTOCOL,
          BID: userInformation.BID,
          CLID: userInformation.CLID,
          LOCATION: userInformation.LOCATION,
          PLATFORM: userInformation.PLATFORM
        }
      };
    },
    getWidgetInformation: function(widgetLoaderId){
      var dom = document.querySelector("#"+widgetLoaderId);
      return {
        WIDGET_INFORMATION:{
          WIDGET_ORIENTATION_CLASS: "presstakeWidget_"+dom.getAttribute("data-orientation")
        }
      };
    },
    getParseQueryInformation: function(responce){
      return {
        SERVER_INFORMATION:{
          PAGE: responce.page,
          BANID : responce.banId
        }
      };
    },
    getListQueryInformation: function(responce){
      return {
        WIDGET_INFORMATION:{
          CITY_NAME: responce.geo.name
        }
      }
    },
    updateInformation: function(information, config){
      for (var key in information){
        if (typeof(information[key]) == "object"){
          for (var secondKey in information[key]){
            config[key][secondKey] = information[key][secondKey];
          }
        } else {
          config[key] = information[key];
        }
      }
    },
    appendInformation: function(information, config){
      for (var key in information){
        if (typeof(information[key]) == "object"){
          for (var secondKey in information[key]){
            if (!config[key][secondKey]){
              config[key][secondKey] = information[key][secondKey];
            }
          }
        } else if (!config[key]){
          config[key] = information[key];
        }
      }
    }
  },
  RENDER_MODEL:{
    getFrame: function(widgetInformation, supportFunctionsElement){
      var element = supportFunctionsElement.elementFunction,
          appendChilds = supportFunctionsElement.appendChildsFunction,
          container = element('noindex', ['presstakeWidgetContainer', widgetInformation.WIDGET_ORIENTATION_CLASS], {
            id: widgetInformation.WIDGET_ID
          }),
          header = element('div', ['presstakeWidgetHeader'], {id: widgetInformation.WIDGET_HEADER_ID}),
          body = element('div', ['presstakeWidgetList'], {id: widgetInformation.WIDGET_BODY_ID}),
          footer = element('div', ['presstakeWidgetFooter'], {id: widgetInformation.WIDGET_FOOTER_ID});
      appendChilds(container, [header, body, footer]);
      return container;
    },
    getList: function(frame, widgetInformation, dataList, supportFunctionsElement){
      var element = supportFunctionsElement.elementFunction,
          appendChilds = supportFunctionsElement.appendChildsFunction,
          listTags = dataList.map(function(listItem){
            var listItemContainer = element('a', ['presstakeListItemContainer'], {href: listItem.link}),
                listItemImage = element('img', ['presstakeListImage'], {src: listItem.image, alt:"", title: listItem.name}),
                listItemShopLink = element('a', ['presstakeListShopLink'], {href: listItem.link}, listItem.linkName),
                listItemDescription = element('div', ['presstakeListDescription'], {title: listItem.name}, listItem.name),
                listItemPrice = element('div', ['presstakeListPrice'], {}, listItem.price),
                listItemButton = element('a', ['presstakeShopButton'], {href: listItem.link}, "В магазин");
            appendChilds(listItemContainer, [listItemImage, listItemShopLink, listItemDescription, listItemPrice, listItemButton]);
            return listItemContainer;
          }),
          listContainer = element('div', ['presstakeListContainer'], {id: widgetInformation.WIDGET_LIST_ID}),
          leftButton = element('input', ['presstakeListButton', 'presstakeListButton_left'], {
            id: widgetInformation.LEFT_BUTTON_ID,
            type: "button",
            value: (widgetInformation.WIDGET_ORIENTATION_CLASS == "presstakeWidget_landscape" ? "<" : "˄")
          }),
          rightButton = element('input', ['presstakeListButton', 'presstakeListButton_right'], {
            id: widgetInformation.RIGHT_BUTTON_ID,
            type: "button",
            value: (widgetInformation.WIDGET_ORIENTATION_CLASS == "presstakeWidget_landscape" ? ">" : "˅")
          });
      appendChilds(listContainer, listTags);
      appendChilds(frame.querySelector("#"+widgetInformation.WIDGET_BODY_ID), [leftButton, listContainer, rightButton]);
      return frame;
    },
    getHeader: function(frame, widgetInformation, supportFunctionsElement){
      var element = supportFunctionsElement.elementFunction,
          appendChilds = supportFunctionsElement.appendChildsFunction,
          headerCityContainer = element('div', ['presstakeCityContainer']),
          headerCityStaticWords = element('span', ['presstakeCityIntroduction'], {}, "Актуально для города:"),
          headerCityDynamicWords = element('span', ['presstakeCityContent'], {}, widgetInformation.CITY_NAME),
          headerMerchantContainer = element('div', ['presstakeMerchantContainer']),
          headerMerchantStaticWords = element('span', ['presstakeMerchantIntroduction'], {}, "По данным"),
          headerMerchantDynamicWords = element('a', ['presstakeMerchantContent'], {href: "http://yandex.ru"}, "Яндекс.Маркет");
      appendChilds(headerCityContainer, [headerCityStaticWords, headerCityDynamicWords]);
      appendChilds(headerMerchantContainer, [headerMerchantStaticWords, headerMerchantDynamicWords]);
      appendChilds(frame.querySelector("#"+widgetInformation.WIDGET_HEADER_ID), [headerCityContainer, headerMerchantContainer]);
      return frame;
    },
    getFooter: function(frame, widgetInformation, supportFunctionsElement){
      var element = supportFunctionsElement.elementFunction,
          appendChilds = supportFunctionsElement.appendChildsFunction,
          footerLink = element('a', ['presstakeFooterLink'], {href: "http://presstake.com"}, "powered by PressTake");
          /*footerLogo = element('img', ['presstakeFooterLogo'], {src: 'img/logo.png'});*/
      appendChilds(frame.querySelector("#"+widgetInformation.WIDGET_FOOTER_ID), [/*footerLogo,*/ footerLink]);
      return frame;
    },
    renderFrame: function(frame, widgetInformation){
      if (document.querySelector("#"+widgetInformation.WIDGET_LOADER_ID)){
        var domElement = document.querySelector("#"+widgetInformation.WIDGET_LOADER_ID);
      } else {
        var domElement = document.querySelector("#"+widgetInformation.WIDGET_ID);
      }
      domElement.parentNode.replaceChild(frame, domElement);
    },
    renderCss:function(cssUrl, supportFunctions){
      var element = supportFunctions.elementFunction,
          link = element("link", [], {rel:"stylesheet", href: cssUrl}),
          head = document.head;
      head.appendChild(link);
    },
    renderLinks: function(frame, widgetInformation){
      var linksDomContainer = document.querySelector("#"+widgetInformation.WIDGET_BODY_ID),
          linksElement = frame.querySelector("#"+widgetInformation.WIDGET_BODY_ID),
          parentDom = linksDomContainer.parentNode;
      parentDom.replaceChild(linksElement, linksDomContainer);
    }
  },
  EVENTS_MODEL:{
    leftButtonEvent: function(){
      var domList = document.querySelector("#"+PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.WIDGET_LIST_ID);
      if (PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.WIDGET_ORIENTATION_CLASS == "presstakeWidget_landscape"){
        domList.scrollLeft -= PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.SCROLL_WEIGTH;
      } else {
        domList.scrollTop -= PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.SCROLL_WEIGTH;
      }
    },
    rightButtonEvent: function(){
      var domList = document.querySelector("#"+PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.WIDGET_LIST_ID);
      if (PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.WIDGET_ORIENTATION_CLASS == "presstakeWidget_landscape"){
        domList.scrollLeft += PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.SCROLL_WEIGTH;
      } else {
        domList.scrollTop += PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.SCROLL_WEIGTH;
      }
    },
    listContainerMouseWhellEvent(event){
      var domList = document.querySelector("#"+PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.WIDGET_LIST_ID);
      event = event || window.event;
      var deltaY = event.detail || event.wheelDelta || event.deltaY;
      if (PRESSTAKE_WIDGET_CORE.CONFIG.WIDGET_INFORMATION.WIDGET_ORIENTATION_CLASS == "presstakeWidget_landscape"){
        domList.scrollLeft += Math.abs(deltaY) == 100 ? deltaY : (Math.sign(deltaY) * 100 * -1);
      } else {
        domList.scrollTop += Math.abs(deltaY) == 100 ? deltaY : (Math.sign(deltaY) * 100);
      }
      event.preventDefault();
    },
    addEventToElement: function(element, eventFunction, eventName){
      element.addEventListener(eventName, eventFunction);
    }
  },
  SUPPORT_FUNCTIONS: {
    RENDER: {
      elementFunction: function(tagName, classes, attrebutes, value){
        var element = document.createElement(tagName);
        classes.forEach(function(className){
          element.classList.add(className);
        });
        for(var attrebuteName in attrebutes){
          element.setAttribute(attrebuteName, attrebutes[attrebuteName]);
        }
        if(value){
          element.innerHTML = value;
        }
        return element;
      },
      appendChildsFunction: function(container, elements){
        elements.forEach(function(element){
          container.appendChild(element);
        });
      }
    }
  },
  QUERY_MODEL:{
    ajaxQuery: function(url, callbackSuccess, callbackError, callbackWait, serverInformation, widgetInformation, queryData){
      var errorStatuses = serverInformation.ERROR_STATUSES,
          successStatuses = serverInformation.SUCCESS_STATUSES,
          waitStatuses = serverInformation.WAIT_STATUSES;
          request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.onreadystatechange = function () {
        if (request.status == 200 && request.readyState == 4){
          var responce = JSON.parse(request.responseText);
          if (errorStatuses.indexOf(responce.status) >= 0 || errorStatuses.indexOf(responce.responceType) >= 0){
            callbackError();
          } else if (successStatuses.indexOf(responce.status) >= 0 || successStatuses.indexOf(responce.responceType) >= 0) {
            callbackSuccess(responce);
          } else if (waitStatuses.indexOf(responce.status) >= 0 || waitStatuses.indexOf(responce.responceType) >= 0) {
            if (queryData.QUERY_TICK < widgetInformation.TICK_LIMIT){
              var timeoutID = setTimeout((function(){
                callbackWait(url, callbackSuccess, callbackError, callbackWait, serverInformation, widgetInformation, queryData);
                queryData.QUERY_TICK ++;
                clearTimeout(timeoutID);
              }).bind(this),
                widgetInformation.TIMEOUT
              );
            } else {
              callbackError();
            }
          } else {
            callbackError();
          }
        } else if(request.status == 404 && request.readyState == 4) {
          callbackError();
        }
      };
      request.send();
    }
  },
  MIDDLEWARE_MODEL:{
    listQueryAdditional: function(responce, urlBuilderFunction, userInformation, serverInformation, urls){
      responce.data.forEach(function(item){
        item.link = urlBuilderFunction(urls, userInformation, serverInformation, item);
      });
      return responce;
    }
  },
  URL_MODEL:{
    getStatQueryUrl: function(urls, userInformation, serverInformation, action){
      var attributes = "?clid=" + encodeURIComponent(userInformation.CLID)
                         + '&bid=' + encodeURIComponent(userInformation.BID)
                         + '&pgid=' + encodeURIComponent(serverInformation.PAGE)
                         + '&ovid=' + encodeURIComponent(serverInformation.BANID);
      if (action){
        attributes += '&action='+action;
      }
      return userInformation.PROTOCOL + urls.TARGET + urls.STAT + attributes;
    },
    getListQueryUrl: function(urls, userInformation, serverInformation){
      var attributes = "?clid=" + encodeURIComponent(userInformation.CLID)
                         + '&bid=' + encodeURIComponent(userInformation.BID)
                         + '&pgid=' + encodeURIComponent(serverInformation.PAGE)
                         + '&os=' + userInformation.PLATFORM
                         + '&banid=' + encodeURIComponent(serverInformation.BANID);
      return userInformation.PROTOCOL + urls.TARGET + urls.LIST + attributes;
    },
    getParseQueryUrl: function(urls, userInformation){
      var attributes = "?clid=" + encodeURIComponent(userInformation.CLID)
                         + '&bid=' + encodeURIComponent(userInformation.BID)
                         + '&loc=' + encodeURIComponent(userInformation.LOCATION)
                         + '&action=pgst';
      return userInformation.PROTOCOL + urls.TARGET + urls.PARSE + attributes;
    },
    getTrackingQueryUrl: function(urls, userInformation, serverInformation, item){
      var attributes = "?clid=" + encodeURIComponent(userInformation.CLID)
                         + '&bid=' + encodeURIComponent(userInformation.BID)
                         + '&pgid=' + encodeURIComponent(serverInformation.PAGE)
                         + '&item=' + encodeURIComponent(item.sitid)
                         + '&ovid=' + encodeURIComponent(serverInformation.BANID);
      return userInformation.PROTOCOL + urls.TARGET + urls.TRACKING + attributes;
    },
    getCssUrl: function(urls, userInformation){
      return userInformation.PROTOCOL + urls.TARGET + urls.CSS;
    }
  }
};
