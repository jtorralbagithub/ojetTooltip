define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout',
  'ojs/ojpopup'], function (oj, ko, $) {
    $(function () {
      var root = $("#popupWrapper");
      var tooltipHelper = new TooltipHelper(root);
      ko.applyBindings(null, root[0]);
    });
  });


function TooltipHelper(rootElement, helpDataAttr) {
  this.Init(rootElement, helpDataAttr);
}

TooltipHelper.prototype.Init = function (rootElement, helpDataAttr) {
  this._AUTO_TIMEOUT = 3000;
  this._OPEN_DELAY = 500;
  this._CONTEXT_NODE = "tooltip-context-node";

  this._helpDataAttr = !helpDataAttr ? "data-title" : helpDataAttr;
  this._rootElement = rootElement;

  var tooltipPopup = $(document.createElement("oj-popup")).uniqueId();
  tooltipPopup.css("max-width", "340px");
  tooltipPopup.appendTo(rootElement);

  this._tooltipPopupId = "#" + tooltipPopup.attr("id");

  var callbackClearTimeout = this._handleClearTimeout.bind(this);
  var callbackSetTimeout = this._handleSetTimeout.bind(this);

  var tooltipPopupDom = tooltipPopup[0];
  tooltipPopupDom.position =
    {
      my: { horizontal: "start", vertical: "top" },
      offset: { x: 0, y: 10 },
      at: { horizontal: "start", vertical: "end" }
    };

  tooltipPopupDom.initialFocus = "none";
  tooltipPopupDom.autoDismiss = "focusLoss";
  tooltipPopupDom.modality = "modeless";
  tooltipPopupDom.addEventListener("ojOpen", callbackSetTimeout);
  tooltipPopupDom.addEventListener("ojBeforeClose", callbackClearTimeout);
  tooltipPopupDom.addEventListener("ojFocus", callbackClearTimeout);
  tooltipPopupDom.addEventListener("mouseenter", callbackClearTimeout);

  var callbackOpen = this._callbackOpen = this._handleOpen.bind(this);
  this._callbackClose = this._handleClose.bind(this);

  rootElement[0].addEventListener("mouseenter", callbackOpen, true);
  rootElement[0].addEventListener("focus", callbackOpen, true);
};

TooltipHelper.prototype._handleOpen = function (event) {
  var target = event.target;
  event = $.Event(event);
  var titleContext = this._getTitleContext(target);

  var tooltipPopupId = this._tooltipPopupId;
  var popup = $(tooltipPopupId);

  if (titleContext) {
    var oldNode = popup.data(this._CONTEXT_NODE);
    if (oldNode && oldNode === titleContext.node)
      return;

    setTimeout(function () {
      popup.data(this._CONTEXT_NODE, titleContext.node);
      var content = this._getContentNode(popup);
      content.html(titleContext.title);
      popup[0].open(target);
    }.bind(this),
      this._OPEN_DELAY);
  }
};

TooltipHelper.prototype._getContentNode = function (popup) {
  var content = popup.find(".oj-popup-content").first();
  return content;
};

TooltipHelper.prototype._handleSetTimeout = function (event) {
  this._timeoutId = window.setTimeout(this._callbackClose, this._AUTO_TIMEOUT);
};

TooltipHelper.prototype._handleClearTimeout = function (event) {
  var timeoutId = this._timeoutId;
  delete this._timeoutId;
  window.clearTimeout(timeoutId);
};

TooltipHelper.prototype._handleClose = function (event) {

  var tooltipPopupId = this._tooltipPopupId;
  var popup = $(tooltipPopupId);

  var isOpen = !popup[0].isOpen();
  if (!isOpen) {
    popup[0].close();
    this._getContentNode(popup).html("");
    popup.removeData(this._CONTEXT_NODE);
  }
};

TooltipHelper.prototype._getTitleContext = function (node) {
  var helpDataAttr = this._helpDataAttr;
  var i = 0;
  var MAX_PARENTS = 5;

  while ((node !== null) && (i++ < MAX_PARENTS)) {
    if (node.nodeType === 1) {
      var title = node.getAttribute(helpDataAttr);
      if (title && title.length > 0)
        return { 'title': title, 'node': node };
    }
    node = node.parentNode;
  }
  return null;
};

TooltipHelper.prototype.destroy = function () {
  var callbackOpen = this._callbackOpen;
  delete this._callbackOpen;

  var callbackClose = this._callbackClose;
  delete this._callbackClose;

  var rootElement = this._rootElement;
  delete this._rootElement;

  rootElement[0].removeEventListener("mouseenter", callbackOpen, true);
  rootElement[0].removeEventListener("focus", callbackOpen, true);
  rootElement[0].removeEventListener("mouseleave", callbackClose, true);

  var tooltipPopupId = this._tooltipPopupId;
  delete this._tooltipPopupId;

  var popup = $(tooltipPopupId);
  popup.remove();
}; 