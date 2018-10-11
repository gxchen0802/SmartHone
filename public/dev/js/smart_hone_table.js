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
		// 批量操作事件
		this.batchOperatio();
	},

	// 生成TABLE
	getTableListFun: function() {
		var root = this,
			opts = {
				"dataModel": {
					"columnDef": [{ //动态表头
						"name": "标题3", //表格表头显示中文名称
						"type": "select", //需要快速编辑时，添加此参数
						"index": "3", //更具index，从小到大依次排序
						"width": "10%", //设置表格TH的宽度
						"order": "none", //需要排序时添加此参数，none：默认，asc：升序，desc：降序，disabled：禁用
						"optionData": "gradeName" //select选项的对应的JSON数据中的KEY的
					}, {
						"name": "标题2",
						"type": "int",
						"index": "2",
						"width": "10%",
						"order": "asc"
					}, {
						"name": "标题1",
						"type": "string",
						"index": "1",
						"width": "30%",
						"order": "desc",
						"renderFunction": "myRenderFun" //自定义方法名
					}, {
						"name": "标题5",
						"type": "date",
						"index": "5",
						"width": "20%",
						"order": "none"
					}, {
						"name": "操作",
						"type": "string",
						"index": "6",
						"width": "30%",
						"order": "disabled"
					}, {
						"name": "标题4",
						"type": "string",
						"index": "4",
						"width": "10%",
						"order": "none"
					}],
					"classname": ["a1", "a2", "a3", "a4", "a5", "a6"], // 自定义样式，必须是数组。非必填
					"tbody": ["reName", "schulstufeName", "gradeName", "subjectName", "createTime"], // 获取各个列数据的字段名，请按照显示顺序排列。必填项
					"btns": [{ // 按钮列表，必须是数组。非必填
						"id": "edit", // 按钮的DOM的ID
						"text": "修改", // 按钮的DOM的显示名字
						"icon": "icon-ok bigger-120", // 按钮的DOM的ICON的CLASS，多个请用空格分开
						"className": "btn btn-mini btn-success", // 按钮的DOM的CLASS，多个请用空格分开
						"attr": {
							"data-id": "id",
							"data-name": "name"
						}, // 自定义属性，KEY为对象的名称，VALUE是对象的值。例子"data-id": "id" ==》 data-id='123'(返回数据中id的值)
						"fun": function(_this, elenemt, table) {
							// 按钮的自定义绑定方法
							// 参数说明 _this：按钮的jquery对象，elenemt：autoTableList方法绑定容器(这里指$('#listBox')对象)，table：table的JQUERY对象
							alert("修改");
						}
					}, {
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
				'checkBox': 1, //是否有checkBox框，1：有，0没有
				'container': 'listTable', //table的ID
				'form': 'seachForm', //form 的ID
				'port': root.getUrl("dynTable"), //ajax交互需要的接口
				'pageSize': 10,
				'quickEdit': 1, //快速编辑，1：支持，0：不支持
				'hasPagination': 1, //是否显示分页，1：显示，0：不显示
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
				'order': 1 //是否有排序1：有排序，0：没排序
			};
		// 初始化autoTableList事件，生成表格
		$('#listBox').autoTableList(opts);
	},

	// 批量操作
	batchOperatio: function() {
		var root = this;
		// 批量删除示例
		$('#quickDele').click(function(event) {
			var checked = $('.ch:checked').length;
			// 判断是否选中数据
			if (!checked) {
				// 一条都没选，弹出错误提示
				root.tips('<p class="text-warning"><i class="icon-warning-sign orange2"></i> 请至少选择一条数据！</p>', 3);
			} else {
				// 选了至少1条
				var obj = {
					"userid": root.userid
				};
				// 获取ID并用逗号分割
				$('.ch:checked').each(function(i, e) {
					obj.ids += (i === 0 ? '' : ',') + $(this).val();
				});
				// 弹出带按钮的弹出框
				root.confirm({
					title: "批量删除",
					//内容
					content: '确定删除选中的' + checked + '条数据？',
					//确定的事件
					confirmInterface: function() {
						var obj = {
							url: root.getUrl("quickDele"),
							json: obj,
							type: root.getType("quickDele")
						};
						root.myAjax(obj, function(data) {
							// ajax 成功后弹出对话框
							root.tips('<p class="text-success"><i class="icon-ok"></i> 删除成功!</p>', 3, function() {
								// 刷新列表
								$('#listBox').autoTableList("refresh");
							});
						});
					},
					//取消事件
					cancelInterface: function() {

					}
				});
			}
		});
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