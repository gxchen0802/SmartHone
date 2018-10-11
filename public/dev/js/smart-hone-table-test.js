/*
 * 1. 项目名称：smart hone
 * 2. 作者：bangyao.chen
 * 3. 时间：2015.08.15
 * 4. 功能：table 页面相关JS
 * 5. 备注：继承于Controller，Port基类(smart_hone_common.js)
 */

// SmartHoneTables事件
function SmartHoneTables() {

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

// 方法继承
SmartHoneTables.prototype = {

	// 初始加载事件
	init: function() {
		// 生成TABLE
		this.getTableListFun();
		//初始化搜索条,从Controller继承而来
		this.initSearchBar($("#listBox"));
	},

	// 生成TABLE
	getTableListFun: function() {
		var root = this,
			opts = {
				"dataModel": {
					"tableColumn": [{ //静态表头表头
						"type": "int",
						"width": "30%"//页面上已定义则无须再定义
					}, {
						"type": "string",
						"width": "10%",
						"renderFunction": "myRenderFun" //自定义方法名
					},{
						"type": "select",
						"width": "10%",
						"optionData":"gradeName" //选项的数据
					}, {
						"type": "date",
						"width": "20%"
					}, {
						"type": "string",
						"width": "20%"
					},{
						"width": "20%"
					}],
					"classname": [], // 自定义样式，必须是数组。非必填
					"tbody": ["reName", "schulstufeName", "gradeName", "subjectName", "createTime"], // 获取各个列数据的字段名，请按照显示顺序排列。必填项
					"btns": [{
						"id": "dele",
						"text": "删除",
						"icon": "icon-ok bigger-120",
						"className": "btn btn-mini btn-success",
						"attr": {
							"data-id": "id",
							"data-uuid": "uuid"
						},
						"fun": function(_this, elenemt, table) {
							// 按钮的自定义绑定方法
							// 参数说明 _this：按钮的jquery对象，elenemt：autoTableList方法绑定容器(这里指$('#listBox')对象)，table：table的JQUERY对象
							root.confirm({
								//内容
								content: "确定删除？",
								//确定按钮的事件
								confirmInterface: function() {
									root.tips('<p class="text-success"><i class="icon-ok"></i> 删除成功!</p>', 3);
								},
								//取消按钮的事件
								cancelInterface: function() {

								}
							});
						}
					}]
				}, //数据模型,数据模型为一个对象
				'checkBox': 1, //是否有checkBox框，1：有，0没有，默认值1；
				'container': 'listTable', //table的ID
				'form': 'seachForm', //form 的ID
				'port': root.getUrl("dynTable"), //ajax交互需要的接口
				'pageSize': 20,
				'quickEdit': 1, //快速编辑，1：支持，0：不支持，默认值1；
				'hasPagination': 0, //是否显示分页，1：显示，0：不显示，默认值1；
				'quickEditSaveFun': function(opts) {
					// 快速编辑保存按钮绑定事件
					// 参数说明 
					// opts={
					// 	_this： 按钮的jquery对象$(this),
					// 	elenemt： autoTableList方法绑定容器,这里是$('#listBox'),
					// 	editTable： 编辑table的JQUERY对象,
					// 	editForm： 编辑用的提交表单,
					// 	closeEditTable: 退出编辑状态方法,如果给了参数为true,则退出编辑状态后刷新TABLE
					// }
					var obj = {
						url: root.getUrl("editTable"),
						json: JSON.stringify(root.getFormJson(opts.editForm)),
						type: root.getType("editTable")
					};
					root.myAjax(obj, function(data) {
						// ajax 成功后弹出对话框
						root.tips('<p class="text-success"><i class="icon-ok"></i> 修改成功!</p>', 3, function() {
							// 退出编辑状态并刷新列表,true：刷新table列表，其他：不刷
							opts.closeEditTable(true);
						});
					});

				}, //快速编辑保存方法
				'order': 1 //是否有排序1：有排序，0：没排序，默认值1；
			};
		// 初始化autoTableList事件，生成表格
		$('#listBox').autoTableList(opts);
	}
};

// 类初始化
$(document).ready(function() {
	new SmartHoneTables;
});


// 自定义绘制编辑元素的方法
function myRenderFun(tdData, trData, key) {
	console.log("myRenderFun tdData的值：" + JSON.stringify(tdData));
	console.log("myRenderFun trData的值：" + JSON.stringify(trData));
	console.log("myRenderFun key的值：" + key);
	return '<input type="text" name="' + key + '" value="' + trData[key] + '">';
}