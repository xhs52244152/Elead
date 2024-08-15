(function ($) {

	var menu, shadow, trigger, content, hash, currentTarget;
	var defaults = {
		menuStyle:{
			border: 'none',
			padding: '0'
		},
		itemStyle :{
			backgroundColor: '#fcfcfc',
			color: '#333',
			border: 'none',
			padding: '0px',
			padding: '6px 0',
			borderBottom: '1px solid #eaeaea',
			textAlign:'left'
		},
		itemHoverStyle: {
			color: '#333',
			backgroundColor: '#fcfcfc',
			border: 'none',
			borderBottom: '1px solid #eaeaea'
		},
		eventPosX: 'pageX',
		eventPosY: 'pageY',
		shadow: true,
		onContextMenu: null,
		onShowMenu: null,
		onLoadMenu: null,
		onClick:null
	};

	$.fn.contextMenu = function (id, options) {
		if (!menu) { // Create singleton menu
			menu = $('<div id="jqContextMenu"></div>')
				.hide()
				.css({
					position: 'absolute',
					zIndex: '500'
				})
				.appendTo('body')
				.bind('click', function (e) {
					e.stopPropagation();
				});
		}
		if (!shadow) {
			shadow = $('<div></div>')
				.css({
					backgroundColor: '#000',
					position: 'absolute',
					opacity: 0,
					zIndex: 499
				})
				.appendTo('body')
				.hide();
		}
		hash = hash || [];
		hash.push({
			id: id,
			menuStyle: $.extend({}, defaults.menuStyle, options.menuStyle || {}),
			itemStyle: $.extend({}, defaults.itemStyle, options.itemStyle || {}),
			itemHoverStyle: $.extend({}, defaults.itemHoverStyle, options.itemHoverStyle || {}),
			bindings: options.bindings || {},
			shadow: options.shadow || options.shadow === false ? options.shadow : defaults.shadow,
			onContextMenu: options.onContextMenu || defaults.onContextMenu,
			onShowMenu: options.onShowMenu || defaults.onShowMenu,
			onLoadMenu: options.onLoadMenu || defaults.onLoadMenu,
			onClick: options.onClick || defaults.onClick,
			eventPosX: options.eventPosX || defaults.eventPosX,
			eventPosY: options.eventPosY || defaults.eventPosY
		});

		var index = hash.length - 1;
		var cur = hash[index];
		content = $('#' + cur.id).find('ul').clone(true);
		content.css(cur.menuStyle).find('li').css(cur.itemStyle).hover(
			function () {
				$(this).css(cur.itemHoverStyle);
			},
			function () {
				$(this).css(cur.itemStyle);
			}
		).find('img').css({
			verticalAlign: 'middle',
			paddingRight: '2px'
		});

		menu.html(content);
		if (!!cur.onShowMenu) menu = cur.onShowMenu(e, menu);

		$.each(cur.bindings, function (id, func) {
			$('#' + id, menu).bind('click', function (e) {
				hide();
				func(trigger, currentTarget);
			});
		});
		
		$('#jqContextMenu li').on('mousedown', function (e) {
			menu.hide();
			shadow.hide();

			cur.onClick && cur.onClick($(this));
			e.stopPropagation();
			e.preventDefault();
		});
		
		$(this).bind('contextmenu', function (e) {
			// Check if onContextMenu() defined
			var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
			if (bShowContext) display(index, this, e, options);
			return false;
		});
		return menu;
	};

	function display(index, trigger, e, options) {
		// if there's an onShowMenu, run it now -- must run after content has been added
		// if you try to alter the content variable before the menu.html(), IE6 has issues
		// updating the content
		if(options.checkMenu && options.checkMenu()) return;
		
		var index = hash.length - 1;
		var cur = hash[index];
		
		cur.onLoadMenu && cur.onLoadMenu();
		
		var pos = {
			x:e[cur.eventPosX],
			y:e[cur.eventPosY]
		}
		
		if(pos.x + menu.width() > document.body.clientWidth) pos.x -= menu.width();
		if(pos.y + menu.height() > document.body.clientHeight) pos.y -= menu.height();
		
		menu.css({
			'left': pos.x,
			'top': pos.y
		}).show();
		if (cur.shadow) shadow.css({
			width: menu.width(),
			height: menu.height(),
			left: e.pageX + 2,
			top: e.pageY + 2
		}).show();
		
		$("body").one('mousedown touchstart', hide);
	}

	function hide(e) {
		menu.hide();
		shadow.hide();
		if (!$("#attrEdit").is(":visible")&&!$("#attrDelete").is(":visible")) {
			$('.attribute-box').hide();
		}
	}
	// Apply defaults
	$.contextMenu = {
		defaults: function (userDefaults) {
			$.each(userDefaults, function (i, val) {
				if (typeof val == 'object' && defaults[i]) {
					$.extend(defaults[i], val);
				} else defaults[i] = val;
			});
		}
	};

})(jQuery);

$(function () {
	$('div.contextMenu').hide();
});
