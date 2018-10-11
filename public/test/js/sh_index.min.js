/*
 * 1. 项目名称：smart hone
 * 2. 作者：bangyao.chen
 * 3. 时间：2015.08.09
 * 4. 功能：首页用JS，
 * 5. 备注：继承于Controller，Port基类(smart_hone_common.js)
 */

// SmartHoneIndex事件
function SmartHoneIndex() {
	'use strict';
	// 继承于Controller基类
	Controller.call(this);
	// 继承获取接口类
	Port.call(this);
	// 获取userid
	this.userid = getUserId();
	//初始化事件
	this.init();

}

SmartHoneIndex.prototype = {

	// 初始加载事件
	init: function() {

		// 根据游览器设置iframe外层容器的高度
		this.autoMainContent();
		// 获取用户状况提交,30秒发送一次
		this.getUserState(30);
		// 左侧菜单事件 && 面包屑事件
		this.menuTabs();
		// 初始化，获取左侧菜单，第一个TAB的列表
		this.getMenus(0, 1);
		// 获得待办列表，30秒刷新一次
		this.getMsgList("todo", 30);
		// 获取通知列表，30秒刷新一次
		this.getMsgList("notice", 30);

	},

	// 根据游览器设置iframe外层容器的高度
	autoMainContent: function() {
		var root = this;
		autoHieht();
		// 根据窗体改变改变高度
		$(window).resize(root.throttle(function() {
			autoHieht();
		}, 70, 150));

		// 改变高度方法
		function autoHieht() {
			var navHeight = $('.navbar').outerHeight(),
				breadcrumbs = $('#breadcrumbs').outerHeight(),
				wHeight = $(window).height();
			$('.main-content').height(wHeight - navHeight - breadcrumbs - 5);
		}
	},

	// 获取用户状况提交,second单位=秒
	getUserState: function(second) {
		var root = this;

		function userState(second) {
			setTimeout(function() {
				$.get(root.getUrl("ping"), {
					'userid': root.userid
				}, function() {
					userState(second);
				});
			}, second * 1000);
		};
		// 执行获取状态方法
		userState(second);
	},

	// 左侧菜单事件 && 面包屑事件
	menuTabs: function() {
		var root = this;
		// 面包屑默认显示第一个TAB
		var firstBtn = $("#sidebar-shortcuts .btn:first")
		setBreadCrumbs(firstBtn.attr('title'), null, firstBtn.children('i').attr('class'), 0);
		// 左侧TAB切换
		$("#sidebar-shortcuts").on('click', ".btn", function() {
			var index = $(this).index(),
				tmenuId = $(this).data('tmenuids'),
				navList = $("#sidebar .nav-list").eq(index);
			if (!$("li", navList).length) {
				root.getMenus(index, tmenuId);
			}
			navList.removeClass('hide').siblings('ul').addClass('hide');
			// 写入左侧面包屑
			setBreadCrumbs($(this).attr('title'), null, $(this).children('i').attr('class'), 0);
		});

		// 左侧树形菜单点击事件，点击重写面包屑
		$(".nav-list").on('click', 'a', function() {
			var title = $(this).children('.menu-text').text(),
				url = $(this).attr('href'),
				icon = $(this).children('i').attr('class'),
				level = $(this).data('level');
			// 写入左侧面包屑
			setBreadCrumbs(title, url, icon, level);
		});

		// 面包屑点击事件
		$("#breadcrumbs").on('click', 'li', function(e) {
			if ($(this).hasClass('active')) {
				if (e && e.stopPropagation) {
					e.stopPropagation();
				} else {
					window.event.cancelBubble = true;
				}
				return false;
			} else {
				$(this).addClass('active').nextAll('li').remove();
				return true;
			}
		});

		// 写入左侧面包屑方法
		function setBreadCrumbs(title, url, icon, level) {
			var con = $('#breadcrumbs ul'),
				li = $('li', con);
			if (!con.length) {
				return false;
			}
			var html = '<i class="' + icon + ' home-icon"></i><a href="' + (url || '#') + '" target="iframeStyle">' + title + '</a><span class="divider"><i class="icon-angle-right arrow-icon"></i></span>';
			if (!li.eq(level).length) {
				con.append('<li></li>');
				li = $('li', con);
			}
			li.eq(level).addClass('active').html(html).siblings('li').removeClass('active').end().nextAll('li').remove();
		}
	},

	// 获取左侧菜单 index:显示几个TAB 从0开始，tmenu_id：请求接口用的参数tmenu_id
	getMenus: function(index, tmenu_id) {
		var root = this,
			Sidebar = $('#sidebar');

		// 如果有子列表则调用此方法
		function getSubMenus(list, level) {
			return '<ul class="submenu">\r\n' + gitMenusList(list, level) + '</ul>\r\n';
		};

		// 绘制LI列表
		function gitMenusList(list, level) {
			var html = '',
				url,
				isSubMenus,
				nowlevel;
			$.each(list, function(i, m) {
				// 判断是否有菜单
				isSubMenus = m.hasOwnProperty("sub_menus") && m.sub_menus.length;
				nowlevel = level;
				url = m.hasOwnProperty("url") && m.url != "" ? m.url : 'javascript:void(0);';
				html += '<li>\r\n';
				html += ' <a href="' + url + '" ' + (isSubMenus ? 'class="dropdown-toggle"' : '') + ' data-id="' + m.id + '" data-level="' + level + '" target="iframeStyle">\r\n<i class="' + m.icon + '"></i>\r\n<span class="menu-text"> ' + m.name + ' </span>\r\n' + (isSubMenus ? '<b class="arrow icon-angle-down"></b>\r\n' : '') + '</a>\r\n';
				html += isSubMenus ? getSubMenus(m.sub_menus, nowlevel + 1) : '';
				html += '</li>\r\n';
			});
			return html;
		};

		// ajax接口调用
		root.myAjax({
			'url': root.getUrl("menus"),
			'type': root.getType("menus"),
			'json': {
				'userid': root.userid,
				'tmenu_id': tmenu_id
			}
		}, function(data) {
			var list = data.list,
				html = gitMenusList(list, 1);
			// 写入左侧菜单
			$("ul.nav-list", Sidebar).eq(index).html(html);
		});
	},

	// 获得待办接口&& 通知接口
	getMsgList: function(type, second) {
		second = second || 30;
		var root = this,
			ListBox = $('#' + type + 'List'),
			allMsgUrl = $('.' + type + 'ListBox', ListBox).children("li:last").children('a').attr("href");;

		function getListFun(rows, list) {
			var i, numHtml,
				icon = (type === 'todo' ? 'icon-envelope-alt' : 'icon-warning-sign');
			html = ' <li class="nav-header">\r\n<i class="' + icon + '"></i>您有 ' + rows + ' 条消息\r\n</li>\r\n';
			if (rows > 0) {
				for (i = 0; i < rows; i++) {
					if (type === 'todo') {
						html += '<li>\r\n<a href="#">\r\n<span class="msg-body">\r\n<span class="msg-title">\r\n<span class="blue">' + list[i].user + ':</span> ' + list[i].type + ',' + list[i].desc + ' </span>\r\n<span class="msg-time"><i class="icon-time"></i><span> ' + list[i].time + '</span></span>\r\n</span>\r\n</a>\r\n</li>\r\n';
					} else {
						numHtml = list[i].num > 0 && list[i].hasOwnProperty("num") ? '<span class="pull-right badge badge-' + list[i].color + '">+' + list[i].num + '</span>\r\n' : '';
						html += '<li>\r\n <a href="' + list[i].url + '">\r\n<div class="clearfix">\r\n<span class="pull-left"><i class="btn btn-mini no-hover btn-' + list[i].color + ' ' + list[i].icon + '"></i> ' + list[i].desc + ' </span>\r\n' + numHtml + '</div>\r\n</a>\r\n</li>\r\n';
					}

				}
			}
			html += '<li><a href="' + allMsgUrl + '">查看所有消息<i class="icon-arrow-right"></i></a></li>';
			return html;
		};

		// ajax接口调用
		root.myAjax({
			'url': root.getUrl(type + 'List'),
			'type': root.getType(type + 'List'),
			'json': {
				'userid': root.userid
			}
		}, function(data) {
			var list = data.list,
				html = getListFun(data.total, list);
			// 生成HTML
			$('.' + type + 'Total', ListBox).html(data.total);
			$('.' + type + 'ListBox', ListBox).html(html);
			// 定时调用接口
			setTimeout(function() {
				root.getMsgList(type, second)
			}, second * 1000);
		});
	}

};

// 类初始化
$(document).ready(function() {
	new SmartHoneIndex;
});