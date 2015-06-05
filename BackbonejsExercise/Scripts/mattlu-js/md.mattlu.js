var MdDataTable={};
MdDataTable.GlobalObject = {
    ModelInfos: null,
    MdDataTable:null,
    DataItemView: {},
    PrimaryKey:"",
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
        DescKey: "desc"

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
            DataTableWidth: 1200,/*表格宽度*/
            DataTableHeight: 700,/*表格高度*/
            //DataModel: {Pk:'0001',UserName:'mattlu',Card:'88051668',Pwd:"123456",Age:28,Email:"88051668@qq.com",Tel:"13205711058",Address:"浙江省杭州市滨江区长河路351号"},/*单个实体类,顺序要排好，后面会调用backbone的keys()方法*/
            SortName: 'UserName',/*排序字段*/
            SortBy: 'asc',/*asc,desc*/
            Rp: 20,/*每页显示条数*/
            TotalCount: 0,/*总条数*/
            PageIndex:0,/*当前第几页*/
            SearchOptions: {
                SearchText: 'matlu',/*搜索内容*/
                SearchFields: ['UserName', 'Card', 'Tel'],/*搜索字段数组*/
                EnableSearch: true,/*是否启用Seach*/
                SearchToolBtns: {
                    /* 按钮组*/
                    add: { val: "添加", IsEnable: true, Fun: function (e) { alert("自定义的添加"); } },
                    edit: { val: "编辑", IsEnable: true, Fun: function (e) { alert("自定义的修改"); } },
                    del: {val:"删除", IsEnable: true }
                }
            },/*后台交互Url  查询，添加，删除等*/
            Urls: {
                QueryUrl: "../mattlu/queryList",
                AddUrl: "",
                EditUrl:"../mattlu/editInfo",
                DelUrl: "../mattlu/delInfos"
            },
            HeadHeight: 40,/*表头高度*/
            Columns: {
                Height:20,/*表头高度*/
                Itmes: {
                    /*Show,Sort默认为true*/
                    Pk: {
                        Title:"Pk",Width: 20, Show: true, PrimaryKey: true, Sort: false, HeadFun: function () { alert('单击表头后触发事件'); }, Render: function (data) {
                            /*格式化数据用的，用来替换自动生成的值,对表头没有用*/
                            
                            return "<input type='checkbox' />";
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
            }
        }, options);
        this.mdTableId = $(this).attr("id");
        var pThat = this;
        /*初始化宽高度以及兼容问题*/
        var init = function () {
            $('.mdTableFlex').height(pThat.Options.DataTableHeight);
            var maxH = pThat.Options.DataTableHeight - $(".mHead").height() - $(".mFooter").height() - $(".mSearch").height();
            $('.mHeadContent').css("max-width", pThat.Options.DataTableWidth + "px");
            if (Sys.safari || true) {
                var iWidthSum = 0;
                for (var key in pThat.Options.Columns.Itmes) {
                    iWidthSum += pThat.Options.Columns.Itmes[key].Width;
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
            var curModel = {};
            for (var key in pThat.Options.Columns.Itmes) {
                curModel[key] = "";
            }
            var Model = Backbone.Model.extend({ default: curModel });
            var ModelList = Backbone.Collection.extend({ model: Model });/*定义集合*/
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
                        if(key == "edit")
                            this.model[key].Fun(e, editInfos);
                        else if(key == "del")
                            this.model[key].Fun(e, delInfos);
                        else
                            this.model[key].Fun(e);
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
                    for (var key in this.model.Itmes) {
                        var m = this.model.Itmes[key];
                        if (m.Show == null) {
                            m.Show = true;
                        }
                        if (m.Sort == null) {
                            m.Sort = true;
                        }
                        var temp = { key: key, sort: m.Sort, title: m.Title, sortVal: "",width: m.Width, height: pThat.Options.HeadHeight };
                        if (m.Sort)
                            temp.sortVal = go.SortIconByKey.defaulSort;
                        /*当前排序字段，设置图标状态*/
                        if (pThat.Options.SortName != null && pThat.Options.SortName == key)
                        {
                            temp.sortVal = go.SortIconByKey[pThat.Options.SortBy];
                            m.adesc = pThat.Options.SortBy;
                        }
                        if (m.PrimaryKey == true)
                        {
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
                    for (var key in this.model.Itmes) {
                        var m = this.model.Itmes[key];
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
                    if (this.model.Itmes[key] != null && this.model.Itmes[key].HeadFun != null) {
                        this.model.Itmes[key].HeadFun(e, pThat.Options.SortName, pThat.Options.SortBy);
                    }
                    this.render();
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
                    "click div": "clickDiv"
                },
                render: function () {
                    var keys = this.model.keys();
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        var column = pThat.Options.Columns.Itmes[key];
                        if (column.Show == null) {
                            column.Show = true;
                        }
                        if (column.Show) {
                            var tempVal = { key: key, val: this.model.get(key), width: column.Width, height: pThat.Options.Columns.Height, displayVal: "" };
                            /*判断是否有自定义内容*/
                            if (column.Render != null) {
                                var rtnRender = column.Render(this.model);
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
                    return this;

                },
                clickDiv: function () {
                    //alert("单击行");
                },
                setCheckBoxState: function (isSelect) {
                    /*attr 来改 checkbox属性checked="checked"已有，但复选框却不显示打钩的，jquery版本问题，而jQuery的版本用的是1.9，这就是存在一个兼容性和稳定性问题*/
                    this.$el.find("input[type='checkbox']").eq(0).prop("checked", isSelect);
                },
                getCheckBoxState:function(){
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
                }
            });

            /*定义footer(分页)视图*/
            var FooterView = Backbone.View.extend({});

            /*定义AppView 用来控制整个MdDataTable */
            var DataTableAppView = Backbone.View.extend({
                el: "<div class='md-datatable'></div>",
                initialize: function () {
                    this.listenTo(go.ModelInfos, "add", this.addItem);
                    this.listenTo(go.ModelInfos, 'reset', this.removeItems);
                    var searchDiv = go.DataTableTemplate.SearchDivTemplate;
                    var searchDivAdd = false;
                    /*加载search*/
                    if (pThat.Options.SearchOptions.EnableSearch)
                    {
                        var search = new SearchView();
                        searchDiv = $(searchDiv).append(search.$el);
                        searchDivAdd = true;
                    }
                    /*加载按钮*/
                    if (pThat.Options.SearchOptions.SearchToolBtns != null)
                    {
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
                removeItems: function (cur, delInfos) { },
                queryList: function () {}
            });
            var app = new DataTableAppView();
            go.MdDataTable = app;
        });
    },
    editItem: function (model) {
        var editInfo = null;
        for (var k in go.DataItemView) {
            if (go.DataItemView[k].getCheckBoxState()) {
                editInfo = go.DataItemView[k].model;
                return false;
            }
        }
        if (editInfo != null) {
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
                    console.log("removeItems error", arguments);
                }
            });
        }
    },
    clear: function () {
        for (var key in go.DataItemView)
            go.DataItemView[key].remove();
    }
});
});