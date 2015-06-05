$(function () {
    var UserRow = { UserName: "陈如暖-View", Password: "crn-View", Age: 35, Sex: "1", Id: 0, LoginName: "dragonchen" };

    //Backbone.Model
    var User = Backbone.Model.extend({
        initialize: function () {
            //@4:可以通过自己的Events来总控事件函数集
            this.on("change:UserName", function (eventName) {
                UserEvents.trigger("change:UserName", this);
                //alert("change UserName:"+this.get("UserName"));
            }, this);
            /*this.on("all",function(eventName){
            UserEvents.trigger(eventName, this);
            });*/
            this.on("change:Age", function () {
                UserEvents.trigger("change:Age", this);
                //this.set("Age",parseInt(this.get("Age"), 10));
            }, this);
        },
        defaults: { UserName: "", Password: "", Id: 1 }
    });

    var Sex = Backbone.Model.extend({
        //Selected: false, Model:{ Value:"", Text:"", Id:1}
        Value: "", Text: "", Id: 1
    });
    //var sexInfo = new Sex;



    //Backbone.Events
    //var UserEvents = _.clone(Backbone.Events);
    var UserEvents = {};
    _.extend(UserEvents, Backbone.Events);
    UserEvents.on("change:UserName", function (me) {
        //alert("change UserName:"+me.get("UserName"));
    });
    UserEvents.on("change:Age", function (me) {
        me.set("Age", parseInt(me.get("Age"), 10));
    });



    //Backbone.Router  不是锚点
    var AppRouter = Backbone.Router.extend({
        routes: {
            "query": "query",
            "query/:content": "query",
            "query/:content/:page": "query",
            //"query/:content/p:page": "query",//@7:有冲突
            "query2/:content/p:page": "query2"
        },
        query: function (content, page) {
            alert("content:" + content + ",page:" + page);
        },
        query2: function (content, page) {
            this.query(content, page);
        }
    });



    //Backbone.Collection
    var UserList = Backbone.Collection.extend({
        model: User,
        nextId: function () {
            var id = 0;
            if (this.last() != null)
                var id = this.last().get("Id");
            return id + 1;
        },
        // UserList are sorted by their original insertion order.
        comparator: 'order'
    });

    var SexList = Backbone.Collection.extend({ model: Sex });



    //Backbone View
    var SexView = Backbone.View.extend({
        tagName: "select",
        //el:$("#spanSex"),
        events: {
            "change": "selectOne"
        },
        sexTemplate: _.template($('#sexTemplate').html()),
        initialize: function () {
            this.sexInfos = new SexList;
            this.listenTo(this.sexInfos, 'add', this.render);

            //init sexView data
            var sexArray = [
				{ Value: "1", Text: "男性", Id: 1 },
				{ Value: "2", Text: "女性", Id: 2 },
				{ Value: "0", Text: "未知", Id: 3 },
				{ Value: "9", Text: "其它", Id: 99 }
			];
            for (var i = 0; i < sexArray.length; i++) {
                var sexObj = sexArray[i];
                var sex = new Sex;
                sex.set(sexObj);
                this.sexInfos.add(sex);
            }
        },
        selectOne: function (e) {
            this.model = this.sexInfos.models[this.el.selectedIndex];
            alert(this.model.get("Text"));
            return this.model;
        },
        render: function (sex) {
            this.$el.append(this.sexTemplate(sex.toJSON()));
            return this;
        },
        setValue: function (sexValue) {
            this.$el.val(sexValue);
        },
        getValue: function () {
            return this.model == null ? this.$el.val() : this.model.get("Value");
        }
    });

    var UserView = Backbone.View.extend({
        tagName: "tr",
        events: {
            "click": "selectItem",
            "click .aDel": "clear",
            "click .aEdit": "editItem"
        },
        userTemplate: _.template($("#userTemplate").html()),
        initialize: function () {
            this.isSelected = false;
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.models = this.model.collection;

            this.sexView = new SexView;
            /*******************   replace sex   ******************/
            //set sex key value pairs
            //this.sexInfos = this.model.sexInfos;
            /*******************   replace sex   ******************/
        },
        initSexPairs: function () {
            if (this.sexPairs == null) {
                this.sexPairs = {};
                this.sexView.sexInfos.each(function (sexInfo) {
                    this.sexPairs[sexInfo.get("Value")] = sexInfo.toJSON();
                }, this);
            }
        },
        // Re-render the item.
        render: function () {
            this.$el.html(this.userTemplate(this.model.toJSON()));

            /*******************   replace sex   ******************/
            //replace sex
            this.initSexPairs();
            var me = this;
            $(this.$el.find("td[name='tdSexPlace']")).each(function (key, td) {
                $(td).html(me.sexPairs[$(td).html()].Text);
            });
            /*******************   replace sex   ******************/

            return this;
        },
        selectItem: function (e) {
            if (!this.isSelected)
                this.$el.css("background-color", "yellow");
            else
                this.$el.css("background-color", "");
            this.isSelected = !this.isSelected;
        },
        clear: function () {
            this.model.destroy();
        },
        editItem: function (e) {//@2:这里不同的view可以通过事件来关系操作，如edit事件
            this.models.trigger("edit", this.model);
        }
    });

    var UserPanelView = Backbone.View.extend({
        tagName: "div",
        newUserTemplate: _.template($("#newUserTemplate").html()),
        initialize: function () {
            this.edit = !!this.model.edit;
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.models = this.model.collection;

            //init the sex view
            this.sexView = new SexView;
            /*******************   replace sex   ******************/
            //            var sexArray = [
            //				{ Value: "1", Text: "男性", Id: 1 },
            //				{ Value: "2", Text: "女性", Id: 2 },
            //				{ Value: "0", Text: "未知", Id: 3 },
            //				{ Value: "9", Text: "其它", Id: 99 }
            //			];
            //            for (var i = 0; i < sexArray.length; i++) {
            //                var sexObj = sexArray[i];
            //                var sex = new Sex;
            //                sex.set(sexObj);
            //                this.sexView.sexInfos.add(sex);
            //            }
            /*******************   replace sex   ******************/

            this.model.trigger("change");

            this.txtUserName = this.$("#txtUserName");
            this.txtUserName.focus();
        },
        // Re-render the item.
        render: function () {
            this.$el.html(this.newUserTemplate(this.model.toJSON()));

            this.selectSex = this.$("#spanSex");
            this.selectSex.html(this.sexView.$el);
            this.sexView.setValue(this.model.get("Sex"));

            return this;
        },
        setIsEdit: function (val) {
            this.isEdit = val;
        },
        getIsEdit: function () {
            return !!this.isEdit;
        },
        getModel: function () {
            //@1:一定要重新获得元素，如this.$("#txtPassword")，不然获取的value将是原始值
            var pairs = {
                Sex: this.selectSex.find("select"),
                UserName: this.$("#txtUserName"),
                Password: this.$("#txtPassword"),
                Age: this.$("#txtAge"),
                LoginName: this.$("#txtLoginName")
            };
            var modelObject = {};
            if (!this.isEdit)
                modelObject["Id"] = this.models.nextId();

            for (var key in pairs) {
                var pair = pairs[key];
                if (this.model.get(key) != pair.val())
                    modelObject[key] = pair.val();
            }
            //@3:change事件绑定太多了，会导致render重复，所以改变一个后其它的内容将会被刷掉，所以最好是set一次
            this.model.set(modelObject);
            return this.model;
        }
    });

    var AppView = Backbone.View.extend({
        // Instead of generating a new element, bind to the existing HTML element in app view.
        el: $("#divInputPanel"),
        //app view template
        appTemplate: _.template($('#userTemplate').html()),
        //Delegated events for creating new items, and clearing completed ones.
        events: {
            "click #btnNew": "newItem",
            "click #btnAdd": "createItem",
            "click #btnDelete": "deleteItems"
        },
        initialize: function () {
            this.userInfos = new UserList;
            this.listenTo(this.userInfos, 'add', this.addOne);
            this.listenTo(this.userInfos, 'remove', this.removeOne);
            this.listenTo(this.userInfos, 'reset', this.addAll);
            this.listenTo(this.userInfos, 'edit', this.editOne);
            this.listenTo(this.userInfos, 'all', this.myRender);

            this.divNewUser = this.$("#divNewUser");

            //this.txtUserName = this.$("#txtUserName");
            //this.txtLoginName = this.$("#txtLoginName");
            //this.txtPassword = this.$("#txtPassword");


            //this.txtAge = this.$("#txtAge");

            //column name
            //this.txtUserName.columnName = "UserName";
            //this.txtLoginName.columnName = "LoginName";
            //this.txtPassword.columnName = "Password";
            //this.selectSex.columnName = "Sex";
            //this.txtAge.columnName = "Age";

            this.tableBody = this.$("#tableUserList").find(">tbody");

            this.userViewPair = {};
        },
        //newItem
        newItem: function (e) {
            var user = new User;
            user.set(_.clone(UserRow));
            if (user.collection == null)
                user.collection = this.userInfos;
            this.newUserView = new UserPanelView({ model: user }); //@5:传入的参数一定是内定的key,如model,models,el等，但是自定义的不行，如传入{edit:true}这样是传不进去
            this.divNewUser.html(this.newUserView.$el);
        },
        // create a new user item
        createItem: function (e) {
            if (this.newUserView.getIsEdit()) {
                var user = this.newUserView.model;
                user.set(this.newUserView.getModel().toJSON());
            }
            else {
                var user = new User;
                user.set(this.newUserView.getModel().toJSON());
                this.userInfos.add(user);
            }
        },
        // delete the user items
        deleteItems: function (e) {
            for (var key in this.userViewPair) {
                var view = this.userViewPair[key];
                if (view.isSelected)
                    this.userInfos.remove(view.model);
            }
        },
        addOne: function (user) {
            /*******************   replace sex   ******************/
            user.sexInfos = this.newUserView.sexView.sexInfos;
            /*******************   replace sex   ******************/
            var view = new UserView({ model: user });
            this.tableBody.append(view.render().el);
            this.userViewPair[user.cid] = view;
        },
        removeOne: function (user) {
            var view = this.userViewPair[user.cid];
            view.clear();
            delete this.userViewPair[user.cid];
        },
        editOne: function (user) {
            this.newUserView.remove();
            this.newUserView = new UserPanelView({ model: user });
            this.newUserView.setIsEdit(true);
            this.divNewUser.html(this.newUserView.$el);
        },
        addAll: function () {
        },
        myRender: function (eventName) {
            //@5:看一下集合绑定的事件名
            //alert(eventName);
        } /*,
        render: function(){
        }*/
    });

    var appView = new AppView;
    appView.$("#btnNew").click();

    var appRouter = new AppRouter;
    Backbone.history.start();

    var userInfo = new User;
    userInfo.on("change:Password", function () {
        //alert("change Password:"+this.get("Password"));
    });
    userInfo.set(_.clone(UserRow));

    /*for(var i=0;i<10;i++){
    var info = new User;
    var row = _.clone(UserRow);
    for(var key in row){
    row[key] += i;
    }
    info.set(row);
    userInfos.add(info);
    }*/


    /*var User2 = Backbone.Model.extend(
    {UserName:"",Password:"",Id:1}
    );
	
    var userInfo2 = new User2;
    userInfo2.set({"UserName":"Crn",Password:"Pwd"});*/
    //alert("userInfo2:" + userInfo2.get("Password"));
});