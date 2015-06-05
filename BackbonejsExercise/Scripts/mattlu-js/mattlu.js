var MdDataTable={};
MdDataTable.GlobalObject = {
    ModelInfos: null,
    MdDataTable:null,
    DataItemView: {},
    PrimaryKey: "",
    InitRowIndex:1,
    DataTableTemplate: {
        /*相关模板*/
        SearchDivTemplate:"<div class='mSearch'></div>",
        SearchTemplate: "<%=searchTitle %><input name='txtSearch' type='text' placeholder='输入搜索内容' /><div class='searchBtn'><%=searchBtn %></div>",
        BtnTemplate: "<div key='<%=key%>'><%=val %></div>",
        HeadItemTemplate: "<div key='<%=key%>' sort='<%=sort%>' style='width:<%=width%>px;height:<%=height%>px;'><%=title%><span class='sortHead-span <%=sortVal%>'></span></div>",
        DataItemContentTemplate: "<div class='mDataContent'><div class='mItems'></div></div>",
        DataItemTemplate: "<div key='<%=key%>' old-data='<%=val%>' title='<%=val%>' style='width:<%=width%>px;height:<%=height%>px;'><%=displayVal%></div>"
    },
    SortIconByKey: {
        defaulSort: "sSortDefaul",
        asc: "sSortAsc",
        desc: "sSortDesc",
        AscKey: "asc",
        DescKey:"desc"
    },
    AlertMsg: {
        EditOne: "请选择一项进行编辑!",
        SelectOne: "请至少选择一项!",
        DeleteConfirm: "确定要删除吗?"
    }
};
define(function () {
    var go = MdDataTable.GlobalObject;
    $.fn.extend({
        mdDataTable: function (options) {
            this.Options = $.extend({
                DataTableWidth: 855,/*表格宽度*/
                DataTableHeight: 700,/*表格高度*/
                SortName: 'UserName',/*排序字段*/
                SortBy: 'asc',/*asc,desc*/
                Rp: 20,/*每页显示条数*/
                TotalCount: 0,/*总条数*/
                PageIndex: 0,/*当前第几页*/
                SearchOptions: {
                    SearchText: 'matlu',/*搜索内容*/
                    SearchFields: ['UserName', 'Card', 'Tel'],/*搜索字段数组*/
                    EnableSearch: true,/*是否启用Seach*/
                    SearchToolBtns: {
                        /* 按钮组*/
                        add: { val: "添加", IsEnable: true, Fun: function (e) { alert("自定义的添加"); } },
                        edit: { val: "编辑", IsEnable: true, Fun: function (e) { alert("自定义的修改"); } },
                        del: { val: "删除", IsEnable: true }
                    }
                },/*后台交互Url  查询，添加，删除等*/
                Urls: {
                    QueryUrl: "../mattlu/queryList",
                    AddUrl: "",
                    EditUrl: "../mattlu/editInfo",
                    DelUrl: "../mattlu/delInfos"
                },
                HeadHeight: 40,/*表头高度*/
                Columns: {
                    Height: 20,/*表头高度*/
                    Items: {
                        /*Show,Sort默认为true*/
                        Pk: {
                            Title: "Pk", Width: 20, Show: true, PrimaryKey: true, Sort: false, HeadFun: function () { alert('单击表头后触发事件'); }, Render: function (data) {
                                /*格式化数据用的，用来替换自动生成的值,对表头没有用*/
                                //console.log(data);
                                return "<input type='checkbox' value='" + data.Pk+ "' />";
                            }
                        },
                        UserName: { Title: "用户名", Width: 120, HeadFun: function () { alert('单击表头后触发事件'); }, Render: function () { } },
                        Card: { Title: "身份证号", Width: 120, HeadFun: function () { }, Render: function () { } },
                        Pwd: { Title: "密码", Width: 120, Sort: false, HeadFun: function () { }, Render: function () { } },
                        Age: { Title: "年龄", Width: 80, HeadFun: function () { }, Render: function () { } },
                        Email: { Title: "邮箱", Width: 150, Sort: false, HeadFun: function () { }, Render: function () { } },
                        Tel: { Title: "手机号", Width: 120, Sort: false, HeadFun: function () { }, Render: function () { } },
                        Address: { Title: "地址", Width: 320, Sort: false, HeadFun: function () { }, Render: function () { } }
                    }
                },
                RowColor: {
                    0: "#EEE",/*偶数颜色*/
                    1: "#FFF",/*奇数颜色*/
                    2: "#DDD", /*选中颜色*/
                    3: '#CCC' //排序列的颜色
                }
            }, options);
            this.mdTableId = $(this).attr("id");
            var pThat = this;

            var initWidth = function () {
                var sumWidth = pThat.Options.DataTableWidth;
                var iTemp = 0, avgWidth = 0;
                for (var key in pThat.Options.Columns.Items) {
                    if (pThat.Options.Columns.Items[key].Width != null) {
                        sumWidth -= pThat.Options.Columns.Items[key].Width;
                    }
                    else
                        iTemp++;
                }
                if (iTemp > 0)
                    avgWidth = sumWidth / iTemp;
                for (var key in pThat.Options.Columns.Items) {
                    if (pThat.Options.Columns.Items[key].Width == null) {
                        pThat.Options.Columns.Items[key].Width = avgWidth;
                    }
                }
            };
            initWidth();






            /*初始化宽高度以及兼容问题*/
            var init = function () {
                $('.mdTableFlex').height(pThat.Options.DataTableHeight);
                var maxH = pThat.Options.DataTableHeight - $(".mHead").height() - $(".mFooter").height() - $(".mSearch").height();
                $('.mHeadContent').css("max-width", pThat.Options.DataTableWidth + "px");
                if (Sys.safari || true) {
                    var iWidthSum = 0;
                    for (var key in pThat.Options.Columns.Items) {
                        iWidthSum += pThat.Options.Columns.Items[key].Width;
                    }
                    $(".mItems").width(iWidthSum);/*列数*每列的宽度*/
                }
                $(".mHead").width($('.mItems').width());
                $(".mSearch,.mFooter").width(pThat.Options.DataTableWidth);
                $('.mDataContent').css({ "max-height": maxH + "px", "width": pThat.Options.DataTableWidth + "px" });
                /*行数*高度*/
                if (($(".mItems").find(".mItem").length * $(".mItem").height()) > $(".mDataContent").height()) {
                    if (!isIpadOrIphoneOrAndroid()) {
                        if (Sys.safari) {
                            $(".mItem").find("div:last").attr("style", "border-right:none !important;");
                        }
                    }
                    else {
                        $(".mItem").find("div:last").attr("style", "border-right:none !important;");
                    }
                }
                $(".mDataContent").bind("scroll", function () {
                    var l = $(".mDataContent").scrollLeft();
                    if (Sys.safari)
                        $(".mHead").css({ "position": "relative", "left": -l + "px" });
                    else
                        $('.mHeadContent').scrollLeft(l);
                });
            };
            return this.each(function () {
                go.CurModel = {};
                for (var key in pThat.Options.Columns.Items) {
                    go.CurModel[key] = "";
                }
                go.Model = Backbone.Model.extend({ default: go.CurModel });
                var ModelList = Backbone.Collection.extend({ model: go.Model });/*定义集合*/
                go.ModelInfos = new ModelList();
                /*定义search视图*/
                var SearchView = Backbone.View.extend({
                    el: "<div class='searchLeft'></div>",
                    searchTemplate: _.template(go.DataTableTemplate.SearchTemplate),
                    events: {
                        "click div[class='searchBtn']": "doSearch"
                    },
                    initialize: function () {
                        this.render();
                        return this;
                    },
                    render: function () {
                        this.$el.html(this.searchTemplate({ searchTitle: "搜索:", searchBtn: "搜索" }));
                        return this;
                    },
                    doSearch: function () {
                        var searchVal = this.$el.find("input[name='txtSearch']").val();
                        alert("搜索内容：" + searchVal);
                        /************************************调用事件*/
                        pThat.Options.SearchOptions.SearchText = searchVal;
                    }
                });

                /*定义tools(添加，修改，删除) 视图*/
                var SearchToolsView = Backbone.View.extend({
                    el: "<div class='searchToolBtns'></div>",
                    BtnTemplate: _.template(go.DataTableTemplate.BtnTemplate),
                    initialize: function () {
                        this.render();
                        return this;
                    },
                    events: {
                        "click div[key!='']": "btnClick"
                    },
                    render: function () {
                        for (var key in this.model) {
                            if (this.model[key].IsEnable) {
                                this.$el.append(this.BtnTemplate({ key: key, val: this.model[key].val }));
                            }
                        }
                        return this;
                    },
                    btnClick: function (e) {
                        var key = $(e.target).attr("key");
                        var editInfos = [], delInfos = [];
                        for (var k in go.DataItemView) {
                            if (go.DataItemView[k].getCheckBoxState()) {
                                editInfos.push(go.DataItemView[k].model);
                            }
                            else
                                delInfos.push(go.DataItemView[k].model);
                        }
                        /*调用自定义按钮的方法*/
                        if (this.model[key] != null && this.model[key].Fun != null) {
                            if (key == "edit")
                                this.model[key].Fun(e, editInfos);
                            else if (key == "del")
                                this.model[key].Fun(e, delInfos);
                            else
                                this.model[key].Fun(e);
                        }
                        else {
                            /*
                            //用不到，一定是在外面传个新的model进来
                            if (key == "edit")
                            {
                                if (editInfos.length == 1) {
                                    editInfos[0].set("UserName", "mattlu88");                                
                                }
                                else if(go.AlertMsg.EditOne != null && go.AlertMsg.EditOne != ""){
                                    alert(go.AlertMsg.EditOne);
                                }
                            }
                            else*/ if (key == "del") {
                            if (editInfos.length > 0) {
                                if (go.AlertMsg.DeleteConfirm != null && go.AlertMsg.DeleteConfirm != "" && confirm(go.AlertMsg.DeleteConfirm)) {
                                    /*
                                    for (var i = 0; i < editInfos.length; i++) {
                                        //go.ModelInfos.reset();
                                        editInfos[i].descsd();
                                        //单个删除
                                    }*/
                                    /*批量删除用 reset方法*/
                                    go.ModelInfos.reset(delInfos, editInfos);
                                }
                            }
                            else if (go.AlertMsg.SelectOne != null && go.AlertMsg.SelectOne != "") {
                                alert(go.AlertMsg.SelectOne);
                            }
                        }
                        }
                    }
                });

                /*定义head视图*/
                var HeadView = Backbone.View.extend({
                    el: "<div class='mHeadContent' style='height:" + pThat.Options.HeadHeight + "px;'><div class='mHead' style='height:" + pThat.Options.HeadHeight + "px;'></div></div>",
                    HeadItemTemplate: _.template(go.DataTableTemplate.HeadItemTemplate),
                    initialize: function () {
                        this.render();
                        return this;
                    },
                    events: {
                        "click div[sort='true']": "headClick",
                        "click input[name='checkAll']": "checkAll"
                    },
                    render: function () {
                        this.$el.find(".mHead").eq(0).html("");
                        for (var key in this.model.Items) {
                            var m = this.model.Items[key];
                            if (m.Show == null) {
                                m.Show = true;
                            }
                            if (m.Sort == null) {
                                m.Sort = true;
                            }
                            var temp = { key: key, sort: m.Sort, title: m.Title, sortVal: "", width: m.Width, height: pThat.Options.HeadHeight };
                            if (m.Sort)
                                temp.sortVal = go.SortIconByKey.defaulSort;
                            /*当前排序字段，设置图标状态*/
                            if (pThat.Options.SortName != null && pThat.Options.SortName == key) {
                                temp.sortVal = go.SortIconByKey[pThat.Options.SortBy];
                                m.adesc = pThat.Options.SortBy;
                            }
                            if (m.PrimaryKey == true) {
                                temp.title = "<input name='checkAll' type='checkbox' />";
                                go.PrimaryKey = key;/*编辑，删除时根据这个获取PK值*/
                            }
                            this.$el.find(".mHead").eq(0).append(this.HeadItemTemplate(temp));
                        }
                        return this;
                    },
                    headClick: function (e) {
                        var curKey = $(e.target).attr("key");
                        /*排序变化图标*/
                        for (var key in this.model.Items) {
                            var m = this.model.Items[key];
                            if (key == curKey) {
                                if (m.adesc == null) {
                                    pThat.Options.SortBy = go.SortIconByKey.AscKey;
                                }
                                else if (m.adesc == go.SortIconByKey.AscKey) {
                                    pThat.Options.SortBy = go.SortIconByKey.DescKey
                                }
                                else {
                                    pThat.Options.SortBy = go.SortIconByKey.AscKey;
                                }
                                pThat.Options.SortName = curKey;
                            }
                            else {
                                m.adesc = null;
                            }
                        }
                        /*处理完后调用自定义的函数*/
                        if (this.model.Items[key] != null && this.model.Items[key].HeadFun != null) {
                            this.model.Items[key].HeadFun(e, pThat.Options.SortName, pThat.Options.SortBy);
                        }
                        this.render();
                        /*排序重新查询数据*/
                        /*********************************************************************************************/
                        go.MdDataTable.queryList();
                    },
                    checkAll: function (e) {
                        var bischecked = $(e.target).is(':checked');
                        for (var key in go.DataItemView) {
                            go.DataItemView[key].setCheckBoxState(bischecked);
                        }
                    }
                });

                /*定义数据视图*/
                var DataItemView = Backbone.View.extend({
                    el: "<div class='mItem' style='height:" + pThat.Options.Columns.Height + "px;'></div>",
                    DataItemTemplate: _.template(go.DataTableTemplate.DataItemTemplate),
                    initialize: function () {
                        this.listenTo(this.model, "change", this.editItem);
                        //this.listenTo(this.model, "destroy", this.deleteItem);单个删除有用
                        this.render();
                        return this;
                    },
                    events: {
                        "click div": "clickDiv",
                        'click div:first>input[type="checkbox"]': 'checkItem'
                    },
                    render: function () {
                        for (var key in go.CurModel) {
                            var column = pThat.Options.Columns.Items[key];
                            if (column.Show == null) {
                                column.Show = true;
                            }
                            if (column.Show) {
                                var tempVal = { key: key, val: this.model.get(key), width: column.Width, height: pThat.Options.Columns.Height, displayVal: "" };
                                /*判断是否有自定义内容*/
                                if (column.Render != null) {
                                    var rtnRender = column.Render(this.model.attributes);
                                    if (rtnRender != null) {
                                        tempVal.displayVal = rtnRender;
                                    }
                                    else {
                                        tempVal.displayVal = tempVal.val;
                                    }
                                }
                                this.$el.append(this.DataItemTemplate(tempVal));
                            }
                        }
                        this.$el.css('background-color', pThat.Options.RowColor[go.InitRowIndex % 2]);
                        return this;

                    },
                    clickDiv: function () {
                        //alert("单击行");
                    },
                    setCheckBoxState: function (isSelect) {
                        /*attr 来改 checkbox属性checked="checked"已有，但复选框却不显示打钩的，jquery版本问题，而jQuery的版本用的是1.9，这就是存在一个兼容性和稳定性问题*/
                        this.$el.find("input[type='checkbox']").eq(0).prop("checked", isSelect);
                        (function (z, y) {
                            if (true == z) {
                                y.prop("data-checked", true);
                                y.css('background-color', pThat.Options.RowColor[2]);
                                y.find('div').each(function (a, b) {
                                    $(b).css('background-color', pThat.Options.RowColor[2]);
                                });
                            } else {
                                y.removeProp("data-checked");
                                y.css('background-color', pThat.Options.RowColor[y.index() % 2]);
                                y.find('div').each(function (a, b) {
                                    $(b).css('background-color', 'transparent');//记住设置为背景透明，为避免内容div的颜色遮盖到底层div的颜色
                                });
                            }
                        })(isSelect, this.$el);
                    },
                    getCheckBoxState: function () {
                        return this.$el.find("input[type='checkbox']").eq(0).prop("checked");
                    },
                    editItem: function () {
                        this.$el.html("");
                        this.render();
                        this.setCheckBoxState(true);
                    },
                    deleteItem: function () {
                        /*单个删除方法,提交到后台,后台删除完成后，调用this.remove()*/
                        alert("删除方法，提交到后台");
                        this.remove();
                        //console.log(go.ModelInfos);
                        //go.DataItemView[this.cid]=null;
                    },
                    checkItem: function (e) {
                        this.setCheckBoxState($(e.target).is(':checked'));
                    }
                });

                /*定义footer(分页)视图*/
                var FooterView = Backbone.View.extend({});

                /*定义AppView 用来控制整个MdDataTable */
                var DataTableAppView = Backbone.View.extend({
                    el: "<div class='md-datatable'></div>",
                    initialize: function () {
                        this.listenTo(go.ModelInfos, "add", this.addItem);
                        //this.listenTo(go.ModelInfos, 'edit', this.editItem);
                        //this.listenTo(go.ModelInfos, 'remove', this.removeItems);
                        this.listenTo(go.ModelInfos, 'reset', this.removeItems);
                        var searchDiv = go.DataTableTemplate.SearchDivTemplate;
                        var searchDivAdd = false;
                        /*加载search*/
                        if (pThat.Options.SearchOptions.EnableSearch) {
                            var search = new SearchView(/*{ model: pThat.Options }*/);
                            searchDiv = $(searchDiv).append(search.$el);
                            searchDivAdd = true;
                        }
                        /*加载按钮*/
                        if (pThat.Options.SearchOptions.SearchToolBtns != null) {
                            var btns = new SearchToolsView({ model: pThat.Options.SearchOptions.SearchToolBtns });
                            searchDiv = $(searchDiv).append(btns.$el);
                            searchDivAdd = true;
                        }
                        if (searchDivAdd) {
                            this.$el.append(searchDiv);
                        }
                        /*加载表头*/
                        var head = new HeadView({ model: pThat.Options.Columns });
                        this.$el.append(head.$el);
                        /*加载内容*/
                        this.$el.append($(go.DataTableTemplate.DataItemContentTemplate));

                        this.render();
                        return this;
                    },
                    render: function () {
                        $("#" + pThat.mdTableId).append(this.$el);
                        this.DataItems = $("#" + pThat.mdTableId).find("div.mItems").eq(0);
                        this.queryList();
                        init();
                        return this;
                    },
                    addItem: function (m) {
                        /*添加每一行数据*/
                        var dataItem = new DataItemView({ model: m });
                        this.DataItems.append(dataItem.$el);
                        go.DataItemView[dataItem.cid] = dataItem;
                    },
                    removeItems: function (cur, delInfos) {
                        var ids = "";
                        for (var i = 0; i < delInfos.length; i++) {
                            ids += delInfos[i].get(go.PrimaryKey) + "";
                        }
                        var that = this;
                        $.ajax({
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: { ids: ids },
                            url: pThat.Options.Urls.QueryUrl,
                            success: function (data, textStatus) {
                                that.queryList();
                            },
                            error: function (msg) {
                                console.log("removeItems error", arguments);
                            }
                        });
                    },
                    queryList: function () {
                        for (var key in go.DataItemView)
                            go.DataItemView[key].remove();
                        go.ModelInfos.reset();
                        var jsonDataModel = {
                            Rp: pThat.Options.Rp,
                            PageIndex: pThat.Options.PageIndex,
                            QueryString: pThat.Options.SearchOptions.SearchText,
                            QueryFields: pThat.Options.SearchOptions.SearchFields,
                            SortName: pThat.Options.SortName,
                            SortBy: pThat.Options.SortBy
                        }

                        alert(pThat.Options.Urls.QueryUrl);
                        $.ajax({
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: { jsonData: jsonDataModel },
                            url: pThat.Options.Urls.QueryUrl,
                            success: function (data, textStatus) {
                                pThat.Options.TotalCount = 0;
                                if (data != null && data.ListData.length > 0) {
                                    for (var i = 0; i < data.ListData.length; i++) {
                                        var m = new go.Model();
                                        m.set(data.ListData[i]);
                                        go.ModelInfos.add(m);
                                        go.InitRowIndex++;
                                    }
                                    pThat.Options.TotalCount = data.ListData.length;
                                }
                                else {
                                    alert("没有查询到数据");
                                }
                            },
                            error: function (msg) {
                                console.log("querylist error", arguments);
                            }
                        });


                        /*
                        分页不能使用
                        go.ModelInfos.fetch({
                            type: "post",
                            data: {jsonData:"111"},
                            url: pThat.Options.Urls.QueryUrl, success: function (collection, response) {
                                if (collection.length == 0) {
                                    alert("没有查询到数据");
                                }
                            }, error: function () {
                                alert("查询错误");
                                console.log(arguments);
                            },
                            async: true
                        });*/
                    }
                });
                var app = new DataTableAppView();
                go.MdDataTable = app;
            });
        },
        editItem: function (model) {
            $.ajax({
                type: "post",
                dataType: "json",
                cache: false,
                data: { jsonData: model },
                url: pThat.Options.Urls.QueryUrl,
                success: function (data, textStatus) {
                    editInfo.set(model);
                },
                error: function (msg) {
                    console.log("editItem error", arguments);
                }
            });
        },
        clear: function () {
            for (var key in go.DataItemView)
                go.DataItemView[key].remove();
            go.ModelInfos.reset();
        },
        initData: function (infos) {
            this.clear();
            for (var i = 0; i < infos.length; i++) {
                var m = new go.Model();
                m.set(infos[i]);
                go.ModelInfos.add(m);
                go.InitRowIndex++;
            }
        },
        getSelectModel: function () {
            var selectInfos = [];
            for (var key in go.DataItemView) {
                var isSelect = go.DataItemView[key].getCheckBoxState();
                if (isSelect)
                    selectInfos.push(go.DataItemView[key].model);
            }
            return selectInfos;
        },
        getSelectPks: function () {
            var pks = [];
            var rtn = this.getSelectModel();
            for (var i = 0; i < rtn.length; i++) {
                pks.push(rtn[i].get(go.PrimaryKey));
            }
            return pks;
        }
    });
});