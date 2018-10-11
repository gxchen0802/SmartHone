/*
 * 1. 项目名称：smart hong
 * 2. 作者：bangyao.chen
 * 3. 时间：2015.08.09
 * 4. 功能：公共的JS
 * 5. 备注：文件包含，Controller、Port、getUserId、$.fn.autoTableList 4个公共方法
 */

// 公共方法
function Controller() {
    'use strict';
    //tips框的id值
    this.tipsDialogId = "smart-hong-tips";
    //confirm框的id值
    this.confirmDialogId = "smart-hong-confirm";

    /*
     * 新增模态框的公共方法，是下面的this.dialog和this.tips两个方法的基础方法
     * 1. 使用方法：
     * this.createModalDialog({
     * 	 "type": "dialog", //模态框类型，值为：dialog | tips
     * 	 "id": "my-modal-dialog", //模态框ID值,type为dialog,新增的模态框id为参数给出的id,否则id就是"ttpaicrm-tips"
     *	 "tabindex": 1 //模态框的tabindex值
     * });
     */
    this.createModalDialog = function(params) {
        var type = (params === null || params.type === null || params.type === undefined) ? "dialog" : params.type;
        var id = params.id;
        if (type === "tips") id = this.tipsDialogId;
        else if (type === "confirm") id = this.confirmDialogId;
        var tabindex = (params === null || params.tabindex === null || params.tabindex === undefined) ? null : params.tabindex;
        var modal = $(document.createElement("DIV")).attr("id", id).attr("role", "dialog").attr("aria-labelledby", "myModalLabel").addClass("modal fade");
        if (tabindex) $(modal).attr("tabindex", tabindex);
        var modalDialog = $(document.createElement("DIV")).attr("role", "document").addClass("modal-dialog").append($(document.createElement("DIV")).addClass("modal-content"));
        $(modal).append(modalDialog);
        $("body").prepend(modal);
    };

    /*
     * 弹出普通的内容为某个url的html结构的模态框，始终都是先干掉先前如果存在的同样ID的模态框再新增
     * 备注：这个方法只能打开同域名下的页面
     */
    this.dialog = function(params) {
        var tabindex = (params === null || params.tabindex === null || params.tabindex === undefined) ? null : params.tabindex;
        if ($("#" + params.id).size() > 0) $("#" + params.id).remove();
        this.createModalDialog({
            "type": "dialog",
            "id": params.id,
            "tabindex": tabindex
        });
        $("#" + params.id).modal({
            remote: params.url
        });

        $.fn.modal.Constructor.prototype.enforceFocus = function() {};
    };

    /*
     * 弹出tips提示框，参数：
     * @content：提示的html信息
     * @time：表示多少秒之后关闭，如果为0表示不关闭，单位为秒
     * @callback：关闭后的回调方法
     * @bgClick：是否支持点击背景关闭，默认支持，不支持：'static'
     */
    this.tips = function(content, time, callback, bgClick) {
        var root = this;

        if ($("#" + this.tipsDialogId).size() > 0) {
            // 如果提示框html结构已经存在，就改变内容再显示
            $("#" + this.tipsDialogId + " .modal-tips").html(content);
            $("#" + this.tipsDialogId).modal("show");
        } else {
            // 如果先前页面都没有提示过就先创建模态框
            this.createModalDialog({
                "type": "tips"
            });
            $("#" + this.tipsDialogId).addClass("bs-example-modal-sm");
            $("#" + this.tipsDialogId + " .modal-dialog").addClass("modal-sm");
            $("#" + this.tipsDialogId + " .modal-content").append($(document.createElement("DIV")).addClass("modal-tips").html(content));

            $("#" + this.tipsDialogId).modal({
                "backdrop": bgClick || true,
                "keyboard": false
            });
        }
        // 最后根据需要决定是否关闭
        if (time) {
            window.setTimeout(function() {
                $("#" + root.tipsDialogId).modal("hide");
                if (callback) callback();
            }, time * 1000);
        }
    };

    /*最后根据需要决定是否关闭*/
    this.confirm = function(params) {
        var root = this;
        var title = (params === null || params.title === null || params.title === undefined) ? "系统确认" : params.title;
        var content = (params === null || params.content === null || params.content === undefined) ? "" : params.content;
        var confirmLabel = (params === null || params.confirmLabel === null || params.confirmLabel === undefined) ? "确认" : params.confirmLabel;
        var cancelLabel = (params === null || params.cancelLabel === null || params.cancelLabel === undefined) ? "取消" : params.cancelLabel;
        var confirmInterface = (params === null || params.confirmInterface === null || params.confirmInterface === undefined) ? null : params.confirmInterface;
        var cancelInterface = (params === null || params.cancelInterface === null || params.cancelInterface === undefined) ? null : params.cancelInterface;
        // 如果先前有这个dialog就删除
        if ($("#" + this.confirmDialogId).size() > 0) $("#" + this.confirmDialogId).remove();

        // 先创建一个dialog
        this.createModalDialog({
            "type": "confirm"
        });
        // 再将节点贴进去
        $("#" + this.confirmDialogId + " .modal-content").append($(document.createElement("DIV")).addClass("modal-header").append('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times; </span></button ><h4 class="modal-title">' + title + '</h4>'));
        $("#" + this.confirmDialogId + " .modal-content").append($(document.createElement("DIV")).addClass("modal-confirm").html(content));
        var confirmFooter = $(document.createElement("DIV")).addClass("modal-footer");
        var confirmBtn = $(document.createElement("BUTTON")).attr("type", "button").addClass("btn btn-primary").text(confirmLabel);

        $(confirmBtn).click(function() {
            if (confirmInterface) confirmInterface();
            $("#" + root.confirmDialogId).modal("hide");
        });
        $(confirmFooter).append(confirmBtn);
        var cancelBtn = $(document.createElement("BUTTON")).attr("type", "button").addClass("btn btn-default").attr("data-dismiss", "modal").text(cancelLabel);

        $(cancelBtn).click(function() {
            if (cancelInterface) cancelInterface();
        });
        $(confirmFooter).append(cancelBtn);
        $("#" + this.confirmDialogId + " .modal-content").append(confirmFooter);

        $("#" + this.confirmDialogId).modal({
            "keyboard": true
        });
    };

    // 延时执行方法
    this.throttle = function(fn, delay, mustRunDelay) {
        var timer = null;
        var t_start;
        return function() {
            var context = this,
                args = arguments,
                t_curr = +new Date();
            clearTimeout(timer);
            if (!t_start) {
                t_start = t_curr;
            }
            if (t_curr - t_start >= mustRunDelay) {
                fn.apply(context, args);
                t_start = t_curr;
            } else {
                timer = setTimeout(function() {
                    fn.apply(context, args);
                }, delay);
            }
        };
    };

    // 初始化搜索条
    this.initSearchBar = function(TableList) {
        var searchBar = $('.search-bar'),
            searchLeft = $('.pull-left', searchBar),
            clearBtn = $('.clear-conds', searchBar),
            submitBtn = $('.submit-btn', searchBar),
            searchIcon = $('.search-icon', searchBar);

        // 清空搜索条件
        clearBtn.click(function(event) {
            searchBar.find('input,select').val('');
        });

        // 查询事件绑定
        submitBtn.click(function() {
            TableList.autoTableList('refresh');
        });

        // 收起多余搜索条件
        searchBar.on('click', '.search-icon', function() {
            if ($(this).hasClass('icon-angle-down')) {
                $(this).removeClass('icon-angle-down');
                searchBar.css('height', 'auto');
            } else {
                $(this).addClass('icon-angle-down');
                searchBar.css('height', '40px');
            }
            TableList.autoTableList('setEditBg');
        });

        // 是否显示下拉箭头
        autoSearchLeft();
        $(window).resize(function(event) {
            autoSearchLeft();
        });

        function autoSearchLeft() {
            if (searchBar.height() > 40) {
                searchBar.css('height', '40px');
                searchIcon.css('visibility', 'visible ');
            } else {
                searchBar.css('height', 'auto');
                searchIcon.css('visibility', 'hidden ');
            }
        };

    };

    // ajax提交方法
    this.myAjax = function(data, successfun, errorfun) {
        if (!$.isFunction(successfun)) return false;
        var root = this,
            opts = $.extend({
                url: "",
                type: "GET",
                json: "",
                dataType: "json",
                async: true,
                cache: false
            }, data);
        // root.tips('数据载入中，请稍候……');
        try {
            $.ajax({
                url: opts.url,
                type: opts.type,
                data: opts.json,
                dataType: opts.dataType,
                async: opts.async,
                timeout: 30000,
                cache: opts.cache,
                headers: {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                success: function(data) {
                    if (data.result === "success") {
                        successfun(data);
                    } else {
                        root.tips('<p class="text-error"><i class="icon-remove"></i> ' + data.message + "</p>", 3);
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    if ($.isFunction(errorfun) && errorfun) {
                        errorfun();
                    } else if (textStatus == "timeout") {
                        root.tips('<p class="text-error"><i class="icon-remove"></i> ajax Error: 请求超时！</p>', 3);
                        return false;
                    } else {
                        root.tips('<p class="text-error"><i class="icon-remove"></i> ajax Error : 其他错误,' + textStatus + '</p>', 3);
                        return false;
                    }
                }
            });
        } catch (e) {
            console.log("错误名称：" + e.name + "\n错误描述：" + e.message);
        }
    };

    this.customAjaxSave = function(_form, _dialog, successFun, beforeFun, setJsonFun) {
        var _this = this;
        _form.ajaxsave({
            submitBtnSelector: $('button[type="submit"]', _form).get(0), // 提交按钮选择器
            beforeSaveInterface: function() {
                if (_dialog && _dialog !== null) {
                    _dialog.modal('hide');
                }
                _this.tips('保存数据中，请稍等……', null, null, 'static');
                // 保存前的处理
                if (beforeFun && $.isFunction(beforeFun)) {
                    beforeFun();
                }
            }, // 保存前的接口方法
            onErrorInterface: function() {
                _this.tips('服务器发生异常，请重试！', 2, function() {
                    if (_dialog && _dialog !== null) {
                        _dialog.modal('show');
                    }
                });
            }, // 请求接口出错的时候的接口方法
            onSuccessInterface: successFun, // 成功获取数据后的接口方法，这个方法中的唯一参数就是以结果json中的result这个key的内容
            onExceptionInterface: function(message) {
                _this.tips(message, 2, function() {
                    if (_dialog && _dialog !== null) {
                        _dialog.modal('show');
                    }
                });
            }, // 成功获取数据但是出现异常后的接口方法，这个方法中的唯一参数就是以结果json中的message这个key的内容
            dataType: "json", //_this.isJsonpFun(_form.attr('action')), // 保存接口返回的数据类型，默认为jsonp
            json: function() {
                if (setJsonFun && $.isFunction(setJsonFun)) {
                    return setJsonFun(_form);
                } else {
                    return _this.getFormJson(_form, true);
                }

            }
        });
    };
    // 获取掉单Json
    this.getFormJson = function(form) {
        var json = {},
            key = "";
        $.each(form.serializeArray(), function(i, m) {
            key = m.name;
            json[key] = m.value;
        });
        return json;
    };
}

//获取接口
function Port() {
    'use strict';
    var port = {
        menus: {
            // 获取左侧菜单列表
            // url: "/{$app}/menus",
            url: "/menus.json",
            type: 'get'
        },
        todoList: {
            // 获得待办接口
            url: "/json/todo_list.json",
            // url: "/{$app}/todo_list",
            type: 'get'
        },
        noticeList: {
            // 获得通知接口
            url: "/json/notice_list.json",
            // url: "/{$app}/notice_list",
            type: 'get'
        },
        ping: {
            // 用户状况提交
            // url: "/{$app}/ping",
            url: "/json/ping.json",
            type: 'get'
        },
        searchUser: {
            // 普通表格接口
            url: "/{$app}/searchUser",
            type: 'post'
        },
        dynTable: {
            // 动态表格接口
            // url: "/{$app}/dynTable",
            url: "/json/dynTable.json",
            type: 'get'
        },
        editTable: {
            // 修改数据
            // url: "/{$app}/dynTable",
            url: "/json/ping.json",
            type: 'post'
        },
        quickDele: {
            // 批量删除
            // url: "/{$app}/dynTable",
            url: "/json/ping.json",
            type: 'get'
        }
    };

    // 获取接口URL
    this.getUrl = function(key) {
        return port.hasOwnProperty(key) ? port[key]["url"] : null;
    };

    // 获取接口类型
    this.getType = function(key) {
        return port.hasOwnProperty(key) ? port[key]["type"] : null;
    };
}

// 获取userid
function getUserId() {
    return 1111;
}


// 自动生成TABLE方法
$.fn.autoTableList = function() {
    'use strict';
    var options = arguments[0],
        message = arguments[1],
        settings = {
            'dataModel': null, //数据模型,数据模型为一个对象
            'checkBox': 1, //是否有checkBox框，1：有，0没有，默认值1；
            'container': null, //table的ID
            'form': null, //form 的ID
            'port': null, //ajax交互需要的接口
            'hasPagination': 1, //是否显示分页，1：显示，0：不显示，默认值1；
            'pageSize': 10,
            'quickEdit': 1, //快速编辑，1：支持，0：不支持，默认值1；
            'quickEditSaveFun': null, //快速编辑保存方法
            'order': 1 //是否有排序1：有排序，0：没排序，默认值1；
        };
    // 验证参数异常
    if (typeof options === 'object') {
        settings = $.extend(true, {}, settings, options);
        // 验证参数异常
        if (typeof settings.dataModel !== 'object') {
            throw new Error('autoTableList dataModel error : 不是一个对象 !');
        }
        if (settings.container === null || typeof settings.container !== 'string') {
            throw new Error('autoTableList container error : 请使用table的ID绑定');
        }
        if (settings.form === null || typeof settings.form !== 'string') {
            throw new Error('autoTableList form error : 请使用form的ID绑定');
        }
        if (settings.port === null || typeof settings.port !== 'string') {
            throw new Error('autoTableList port error : ajax port 不正确');
        }
        if (settings.pageSize <= 0 || typeof settings.pageSize !== 'number') {
            throw new Error('autoTableList port error : 分页不正确');
        }
    } else if (typeof options !== 'string' || options === 'undefined') {
        throw new Error('autoModel Parameter error : options error !');
    }


    function MyFun(element, opts) {
        //继承Controller的方法
        Controller.call(this);
        this.opts = opts;
        this._this = $(element);

        // 选中的编辑框
        this.editTr = null;
        //初始化
        this.init();
    }

    //方法继承开始
    MyFun.prototype = {
        // 初始化方法
        init: function() {

            // 绘制必要HTML
            this.insertHtmlFun();
            // 显示列表,刷新表头
            this.insertListFun(1);
            //事件绑定
            this.attachEventFun();

        },

        //初始插入框架html
        insertHtmlFun: function() {
            var root = this;
            root._this.addClass('table-con');
            // 判断TABLE是否存在
            root.table = $('#' + root.opts.container);
            if (!root.table.length) {
                root.table = $('<table id="' + root.opts.container + '" class="table table-striped table-bordered table-hover"></table>').appendTo(root._this);
            };
            // 判断是否有分页DIV
            root.pagination = $('#pagination');
            if (root.opts.hasPagination && !root.pagination.length) {
                root.pagination = $('<div id="pagination" class="pagination clearfix"></div>').appendTo(root._this);
            }

            // 是有需要生成edit Table 
            if (root.opts.quickEdit) {
                root._this.append('<form id="editForm"></form>\n\r<div class="table-bg"></div>');
                root.editTable = $('<table class="table table-striped table-bordered  inside-edit"><tbody><tr></tr></tbody></table>').appendTo("#editForm");
            }

            //设置 thead 数据 
            var model = root.opts.dataModel;
            if (model.hasOwnProperty('columnDef') && model.columnDef.length) {
                // 动态表头
                root.theadData = root.setTheadData(model.columnDef);
            }
            if (model.hasOwnProperty('tableColumn') && model.tableColumn.length) {
                // 静态表头
                root.theadData = root.setTheadData(model.tableColumn);
            }

            // 是否插入表头排序
            if (root.opts.order) {
                var form = $('#' + root.opts.form);
                $.each(model.tbody, function(i, m) {
                    form.append('<input type="hidden" name="' + m + '" value="' + (root.theadData[i].order || 'disabled') + '" id="order-' + m + '">');
                });
            }
        },

        //事件绑定
        attachEventFun: function() {
            var root = this;
            // 绑定分页事件
            root.opts.hasPagination && root._this.on('click', '#pagination li', function(e) {
                var page = $(this).data('page');
                $('#page').val(page);
                // 显示列表
                root.insertListFun();
                // 阻止冒泡
                root.stopBubble(e);
            });

            // 按钮列表事件绑定
            if (root.opts.dataModel.hasOwnProperty('btns') && root.opts.dataModel.btns.length) {
                var btns = root.opts.dataModel.btns;
                $.each(btns, function(i, m) {
                    if (m.hasOwnProperty('fun') && $.isFunction(m.fun)) {
                        root.table.on('click', '#' + m.id, function(e) {
                            m.fun($(this), root._this, root.table);
                            // 阻止冒泡
                            root.stopBubble(e);
                            return false;
                        });
                    }
                });
            };

            // checkbox 事件绑定
            root.checkboxFun();

            // inside-edit 绑定事件
            if (root.opts.quickEdit) {
                // 点几行进入编辑状态
                root.table.on('click', 'tbody>tr', function(e) {
                    root.editTr = $(this);
                    // 生成insertEditTable
                    root.insertEditTable();
                    // 设置背景&编辑TABLE的的位置
                    root.autoEditTable();
                    // 显示编辑条
                    root._this.addClass('onEdit');
                    // 阻止冒泡
                    root.stopBubble(e);
                });
                $(window).resize(root.throttle(function() {
                    // 生成insertEditTable
                    root.setEditTableWidth();
                    // 设置背景&编辑TABLE的的位置
                    root.autoEditTable();
                }, 70, 150));
                // 保存&关闭按钮事件绑定
                root.editTable.on('click', '.et-close', function(e) {
                    // 关闭背景
                    root.closeEditTable();
                    // 阻止冒泡
                    root.stopBubble(e);
                }).on('click', '.et-save', function(e) {
                    // 保存事件
                    if (root.opts.hasOwnProperty('quickEditSaveFun') && $.isFunction(root.opts.quickEditSaveFun)) {
                        var obj = {
                            _this: $(this),
                            element: root._this,
                            editTable: root.editTable,
                            editForm: root._this.find("#editForm"),
                            closeEditTable: function(isRefresh) {
                                root.closeEditTable(isRefresh);
                            }
                        };
                        // 执行回调方法
                        root.opts.quickEditSaveFun(obj);
                        // 阻止冒泡
                        root.stopBubble(e);
                    }
                });
            }

            // 点击表头，升降序
            if (root.opts.order) {
                root.table.on('click', 'thead>tr>th', function(e) {
                    var order = $(this).attr('data-order').split('|'),
                        value = '';
                    $(this).removeClass('sort-none sort-asc sort-desc');
                    switch (order[1]) {
                        case "none":
                            $(this).attr('data-order', order[0] + '|asc').addClass('sort-asc');
                            value = 'asc';
                            break;
                        case "asc":
                            $(this).attr('data-order', order[0] + '|desc').addClass('sort-desc');
                            value = 'desc';
                            break;
                        case "desc":
                            $(this).attr('data-order', order[0] + '|none').addClass('sort-none');
                            value = 'none';
                            break;
                        default:
                            break;
                    }
                    $("#order-" + order[0]).val(value);
                    // 刷新列表
                    root.insertListFun();
                });
            }
        },

        // checkbox 事件绑定
        checkboxFun: function() {
            var root = this;
            root.table.on('click', '.checkAll', function(e) {
                if ($(this).prop('checked')) {
                    root.table.find('.ch').prop("checked", true);
                } else {
                    root.table.find('.ch').prop("checked", false);
                }
                // 阻止冒泡
                root.stopBubble(e);
            }).on('click', '.ch', function(e) {
                var max = root.table.find('.ch').length,
                    checked = root.table.find('.ch:checked').length;
                if (max === checked) {
                    root.table.find('.checkAll').prop("checked", true);
                } else {
                    root.table.find('.checkAll').prop("checked", false);
                }
                // 阻止冒泡
                root.stopBubble(e);
            }).on('click', '.no-edit', function(e) {
                // 阻止冒泡
                root.stopBubble(e);
                return false;
            });
        },

        // 设置数据
        setTbodyData: function(data) {
            var json = {},
                key = "";
            $.each(data, function(index, val) {
                key = val.id;
                json[key] = (val == null ? '' : val);
            });
            return json;
        },

        // 设置数据：更具index排序，从小到大
        setTheadData: function(data) {
            var x, y, n, rows = data.length;
            for (x = 0; x < rows; x++) {
                // 判断是否包含index属性
                if (data[x].hasOwnProperty['index']) {
                    for (y = x + 1; y < rows; y++) {
                        if (data[y].hasOwnProperty['index'] && data[x]['index'] > data[y]['index']) {
                            n = data[y];
                            data[y] = data[x];
                            data[x] = n;
                        }
                    }
                }
            }
            //		console.log(JSON.stringify(data));
            return data;
        },

        // 写入动态编辑
        insertEditTable: function() {
            var root = this,
                html = '',
                id = root.editTr.data('id'),
                trData = root.tbodyData[id],
                thObj,
                model = root.opts.dataModel;
            // 有checkBox则留出位置
            if (root.opts.checkBox) {
                html += '<td class="center"><span class="no-ch"></span></td>\n';
            }
            // 更具tbody参数循环生成编辑框
            $.each(model.tbody, function(i, m) {
                thObj = root.theadData[i];
                // 如果有自定义方法,则按照自定义方法生成
                if (thObj.hasOwnProperty('renderFunction') && $.isFunction(thObj.renderFunction)) {
                    html += '<td>' + thObj.renderFunction(thObj, trData, m) + '</td>';
                } else {
                    // select 下拉框的数据
                    if (thObj.hasOwnProperty('optionData') && root.selList.hasOwnProperty(thObj.optionData) && root.selList[thObj.optionData].length) {
                        thObj.option = root.selList[thObj.optionData];
                    }
                    // 强制将root.theadData.type转成小写字母
                    html += '<td>' + root['set' + (thObj.type).toLowerCase() + 'Fun'](thObj, trData, m) + '</td>\n';
                }
            });
            html += '<td><a href="javascript:void(0);" class="btn btn-mini btn-success et-save"><i class="icon-ok"></i></a><a href="javascript:void(0);" class="btn btn-mini btn-danger et-close"><i class="icon-remove"></i></a></td>\n';
            root.editTable.find('tr').html(html);
            // 绑定时间控件
            root.editTable.find('.date-picker').datepicker().next().on(ace.click_event, function() {
                $(this).prev().focus();
            });
            // 设置编辑框宽度
            root.setEditTableWidth();
        },

        // 设置string input 框
        setstringFun: function(tdData, trData, key) {
            return '<input type="text" name="' + key + '" value="' + trData[key] + '" class="edit-box">';
        },

        // 设置int input 框
        setintFun: function(tdData, trData, key) {
            return '<input type="text" name="' + key + '" value="' + trData[key] + '" class="edit-box">';
        },

        // 设置date input 框
        setdateFun: function(tdData, trData, key) {
            return '<div class="row-fluid input-append edit-box"><input type="text" name="' + key + '" value="' + trData[key] + '" class="date-picker" readonly="readonly" data-date-format="yyyy-dd-mm"><span class="add-on"><i class="icon-calendar"></i></span></div>';
        },

        // 设置select 框
        setselectFun: function(tdData, trData, key) {
            var html = '',
                selected = '';
            $.each(tdData.option, function(i, m) {
                selected = (m.name === trData[key] ? ' selected="selected" ' : '');
                html += '<option ' + selected + ' value="' + m.value + '">' + m.name + '</option>';
            });
            return '<select class="input-small" id="' + key + '" name="' + key + '">' + html + '</select>\n';
        },

        // 根据表头TH的宽度设置编辑框TD的宽度
        setEditTableWidth: function() {
            var root = this,
                nowTh = root.table.find('th'),
                editTd = root.editTable.find('td'),
                model = root.opts.dataModel,
                width;
            nowTh.each(function(i, m) {
                width = $(this).width();
                editTd.eq(i).css('width', width).children('.edit-box').css('width', width - 30);
            });
        },

        // 窗体自适应高度
        autoEditTable: function() {
            var root = this;
            if (root.editTr !== null) {
                // 设置背景的位置
                root._this.find(".table-bg").css({
                    "top": root.table.offset().top,
                    "left": root.table.offset().left,
                    "width": root.table.outerWidth(),
                    "height": root.table.outerHeight()
                });
                // 设置编辑TABLE的位置
                root.editTable.css({
                    "top": root.editTr.offset().top,
                    "left": root.editTr.offset().left,
                    "width": root.table.outerWidth()
                });
            }
        },

        // 退出编辑状态
        closeEditTable: function(isRefresh) {
            this.editTr = null;
            this._this.removeClass('onEdit');
            // 判断是否刷新列表
            if (isRefresh) {
                this.insertListFun();
            }
        },

        // 显示列表,isRefreshTh是否刷新表头,1:刷新，0:不刷新
        insertListFun: function(isRefreshTh, msg) {
            var root = this,
                form = $('#' + root.opts.form),
                obj = {
                    url: root.opts.port,
                    json: root.getFormJson(form),
                    type: 'get',
                    cache: true
                };
            // 弹出提示信息,背景关闭无效
            root.tips('<p class="text-info">' + (msg || '数据载入中，请稍候……') + ' </p>', null, null, 'static');
            // 退出编辑模式
            if (root.opts.quickEdit && root.editTr !== null) {
                root.closeEditTable();
            }
            root.myAjax(obj, function(data) {
                // 保存数据
                root.saveData(data);
                // 显示TABLE
                root.showTableList(data, (isRefreshTh || 0));
                // 显示分页
                root.shwoPagination(data);
                // 关闭提示框
                $("#" + root.tipsDialogId).modal('hide');
            });
        },

        //停止事件冒泡
        stopBubble: function(e) {
            //如果提供了事件对象，则这是一个非IE浏览器
            if (e && e.stopPropagation) {
                e.stopPropagation();
            } else {
                //用IE的方式来取消事件冒泡
                window.event.cancelBubble = true;
            }
        },

        // 保存数据
        saveData: function(data) {
            var root = this;
            //if (root.opts.quickEdit) {
            // 保存并格式化 tbody数据 
            if (data.hasOwnProperty('valueList') && data.valueList.length) {
                root.tbodyData = root.setTbodyData(data.valueList);
            }
            // 保存column select 下拉框的数据
            root.selList = data.columnOption;
            // }
        },

        // 显示完整列表
        showTableList: function(data, isRefreshTh) {
            var root = this,
                model = root.opts.dataModel;
            // 是否刷新表头
            if (isRefreshTh) {
                // 生成静态表头
                if (model.hasOwnProperty('tableColumn') && model.tableColumn.length && root.theadData.length) {
                    root.returnThead(model, root.theadData);
                }

                // 生成动态表头
                if (model.hasOwnProperty('columnDef') && model.columnDef.length && root.theadData.length) {
                    root.returnDiyThead(model, root.theadData);
                }
            }

            // 生成tab主体
            if (model.hasOwnProperty('tbody') && model.tbody.length && data.hasOwnProperty('valueList') && data.valueList.length) {
                root.returnTbody(model, data.valueList);
            }
        },

        // 生成静态表头
        returnThead: function(model, data) {
            var root = this,
                thead = $('thead', root.table),
                className, orderType,
                index = 0;
            // 判断Thead是否存在
            if (!thead.length) {
                throw new Error('autoTableList thead error : 没有找到<thead>标签 !');
            }
            // 是否显示checkBox
            if (root.opts.checkBox) {
                $('tr>th:first', thead).addClass('center no-edit').attr('width', '1').html('<label><input type="checkbox" class="checkAll" value=""><span class="lbl"></span></label>');
                index = 1;
            }
            // 生成表头
            $.each(data, function(i, y) {
                className = (model.hasOwnProperty('classname') && model.classname.length ? model['classname'][i] : '') + (root.opts.order && model.tbody[i] != 'undefined' ? ' sort-' + (y.order || 'none') : ' sort-disabled');
                orderType = root.opts.order ? (y.order || 'none') : 'disabled';
                console.log(i, index + i, root.opts.order && model.tbody[i] != 'undefined')
                $('tr>th', thead).eq(index + i).addClass(className).attr({
                    'width': y.width,
                    'data-order': model.tbody[i] + "|" + orderType
                });
            });
        },

        // 生成动态表头
        returnDiyThead: function(model, data) {
            var root = this,
                html = "",
                thead = root.table.children('thead'),
                className, orderType;
            // 判断Thead是否存在
            if (!thead.length) {
                thead = $('<thead></thead>').appendTo(root.table);
            }
            // 是否显示checkBox
            if (root.opts.checkBox) {
                html += '<th class="center no-edit" width="1"><label><input type="checkbox" class="checkAll" value=""><span class="lbl"></span></label></th>\n';
            }
            // 生成表头
            $.each(data, function(i, y) {
                className = (model.hasOwnProperty('classname') && model.classname.length ? model['classname'][i] : '') + (root.opts.order ? ' sort-' + (y.order || 'none') : ' sort-disabled');
                orderType = root.opts.order ? y.order : 'disabled';
                html += '<th width="' + y.width + '" class="' + className + '" data-order="' + model.tbody[i] + "|" + (y.order || 'none') + '">' + y.name + '</th>\n';
            });
            thead.html('<tr>\n' + html + '</tr>\n');
        },

        // 生成table
        returnTbody: function(model, data) {
            var root = this,
                html = "",
                tbody = root.table.children('tbody'),
                className;
            // 判断tbody是否存在
            if (!tbody.length) {
                tbody = $('<tbody></tbody>').appendTo(root.table);
            }
            $.each(data, function(i, el) {
                html += '<tr data-id="' + el.id + '">\n';
                // 是否显示checkBox
                if (root.opts.checkBox) {
                    html += '<td class="center no-edit" width="1"><label><input type="checkbox" class="ch" value="' + el.id + '"><span class="lbl"></span></label></td>\n';
                }
                // 生成td
                $.each(model.tbody, function(n, m) {
                    className = model.hasOwnProperty('className') && model.className.length ? model['className'][m] : '';
                    html += '<td class="' + className + '">' + el[m] + '</td>\n';
                });
                // 是否有按钮
                if (model.hasOwnProperty("btns") && model.btns.length) {
                    className = model.hasOwnProperty('className') && model.className.length ? model['className'][model.className.length - 1] : '';
                    html += '<td class="' + className + ' no-edit">' + root.getBtnsFun(model, el) + '</td>\n';
                }
                html += '</tr>\n';
            });
            tbody.html(html);
        },

        // 生成操作按钮
        getBtnsFun: function(model, data) {
            var btns = '',
                icon = '',
                id = '';
            $.each(model.btns, function(i, m) {
                if (m.hasOwnProperty('attr') && typeof m.attr === 'object') {
                    var attr = '';
                    var obj = m.attr;
                    for (var key in obj) {
                        attr += (key + '="' + data[obj[key]] + '" ');
                    }
                }
                id = m.hasOwnProperty('id') && m.id != '' ? 'id="' + m.id + '" ' : '';
                icon = m.hasOwnProperty('icon') && m.icon != '' ? '<i class="' + m.icon + '"></i>' : '';
                btns += '<button ' + id + attr + ' class="' + m.className + '" type="button">' + icon + (m.text || '') + '</button>\n';
            });
            return btns;
        },

        // 显示分页
        shwoPagination: function(data) {
            var root = this;
            //判断是否显示分页信息
            if (!root.opts.hasPagination) return;
            var sum = data.total, //总记录条数
                pagesize = root.opts.pageSize, //每页显示几条
                page = data.page + 1, //当前页码
                maxpage = Math.ceil(sum / pagesize), //最大页码 
                row = maxpage > 5 ? 5 : maxpage, //显示几个分页页码
                //起始页码
                satart = ((page - 3) <= 0 ? 1 : ((page + 2) >= maxpage ? maxpage + 1 - row : page - 2)),
                end = ((page + 2) >= maxpage ? maxpage : (page + 2 < row ? row : page + 2)),
                htmlpage = "";
            htmlpage = '<div class="total pull-left">\n<span class="text-primary arial">1-' + maxpage + '页</span>\n<span> / 共</span>\n<span class="text-primary arial">' + sum + '</span>\n<span>条</span>\n</div>\n<ul class="pull-right">\n';

            if (sum != 0) {
                // 首页&&上一页
                if (page == 1) {
                    htmlpage += '';
                } else {
                    htmlpage += '<li data-page="1"><a href="javascript:void(0);"><i class="icon-double-angle-left"></i></a></li>\n<li data-page="' + (page - 1) + '"><a href="javascript:void(0);"><i class="icon-angle-left"></i></a></li>\n';
                }
                // 页码
                for (var i = satart; i < end + 1; i++) {
                    if (i == page) {
                        htmlpage += '<li class="active"><a href="javascript:void(0);">' + i + '</a></li>\n';
                    } else {
                        htmlpage += '<li data-page="' + i + '"><a href="javascript:void(0);">' + i + '</a></li>\n';
                    }
                }
                // 下一页&&末页
                if (page == maxpage) {
                    htmlpage += '';
                } else {
                    htmlpage += '<li data-page="' + (page + 1) + '"><a href="javascript:void(0);"><i class="icon-angle-right"></i></a></li>\n<li data-page="' + maxpage + '"><a href="javascript:void(0);"><i class="icon-double-angle-right"></i></a></li>\n';
                }
            }
            htmlpage += "</div>\n";
            root.pagination.html(htmlpage);
        },

        // 外部调用刷新列表方法
        refresh: function(msg) {
            this.insertListFun(0, msg);
        },

        // 外部调用,进入编辑状态后调整背景的方法
        setEditBg: function() {
            if (this.opts.quickEdit && this.editTr !== null) {
                this.autoEditTable();
            }
        }
    };

    // 执行方法
    try {
        var _this = $(this);
        var data = _this.data('tablelist');
        if (!data) {
            _this.data('tablelist', (data = new MyFun(this, settings)));
        }
        // 向外暴露调用方法
        if (typeof options === 'string' && /^(refresh|setEditBg)$/.test(options)) {
            data[options](message || "");
        }
    } catch (err) {
        throw new Error("tablelist error:" + err.message);
    }
};
