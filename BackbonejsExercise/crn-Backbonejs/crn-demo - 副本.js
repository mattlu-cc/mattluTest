$(function(){
	var UserRow = {UserName:"陈如暖",Password:"crn",Age:10,Sex:"男",Id:0,LoginName:"dragonchen"};
	
	//Backbone.Model
	var User = Backbone.Model.extend({
			initialize: function(){
					this.on("change:UserName", function(eventName){
							UserEvents.trigger("change:UserName", this);
							//alert("change UserName:"+this.get("UserName"));
					}, this);
					/*this.on("all",function(eventName){
							UserEvents.trigger(eventName, this);
					});*/
			},
			defaults:{UserName:"",Password:"",Id:1}
	});
	
	var Sex = Backbone.Model.extend({
		Value:"", Text:"", Id:1
	});
	//var sexInfo = new Sex;
	
	
	
	//Backbone.Events
	//var UserEvents = _.clone(Backbone.Events);
	var UserEvents = {};
	_.extend(UserEvents, Backbone.Events);
	UserEvents.on("change:UserName", function(me){
			//alert("change UserName:"+me.get("UserName"));
	});
	
	
	
	//Backbone.Collection
	var UserList = Backbone.Collection.extend({model:User});
	
	var SexList = Backbone.Collection.extend({model:Sex});
	
	
	
	//Backbone View
	var SexView = Backbone.View.extend({
		tagName: "select",
		//el:$("#spanSex"),
		events:{
			"change": "selectOne"
		},
		sexTemplate: _.template($('#sexTemplate').html()),
		initialize: function(){
			this.sexInfos = new SexList;
			this.listenTo(this.sexInfos, 'add', this.render);
		},
		selectOne: function(e){
			var model = this.sexInfos.models[this.el.selectedIndex];
			alert(model.get("Text"));
			return model;
		},
		render: function(sex){
			this.$el.append(this.sexTemplate(sex.toJSON()));
			return this;
		}
	});
	
	var UserView = Backbone.View.extend({
		tagName: "tr",
		events:{
			"click": "selectItem",
			"click .aDel": "clear",
			"click .aEdit": "editItem"
		},
		userTemplate: _.template($("#userTemplate").html()),
    initialize: function() {
    	this.isSelected = false;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    // Re-render the item.
    render: function() {
      this.$el.html(this.userTemplate(this.model.toJSON()));
      return this;
    },
		selectItem: function(e){
			if(!this.isSelected)
				this.$el.css("background-color","yellow");
			else
				this.$el.css("background-color","");
			this.isSelected = !this.isSelected;
		},
		clear: function(){
			this.model.destroy();
		},
		editItem: function(e){
		}
	});
	
	var UserPanelView = Backbone.View.extend({
		tagName: "div",
		newUserTemplate: _.template($("#newUserTemplate").html()),
    initialize: function() {
    	this.edit = !!this.edit;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    }
    
	});
	
	var AppView = Backbone.View.extend({
		// Instead of generating a new element, bind to the existing HTML element in app view.
    el: $("#divInputPanel"),
    //app view template
    appTemplate: _.template($('#userTemplate').html()),
    //Delegated events for creating new items, and clearing completed ones.
    events: {
      "click #btnAdd":  "createItem",
      "click #btnDelete": "deleteItems"
    },
    initialize: function() {
    	//var newUserView = new UserPanelView({model:_.clone(UserRow)});
			this.txtUserName = this.$("#txtUserName");
			this.txtLoginName = this.$("#txtLoginName");
			this.txtPassword = this.$("#txtPassword");
			this.selectSex = this.$("#spanSex");
			this.sexView = new SexView;
			var sexArray = [
				{Value:"1", Text:"男性", Id:1},
				{Value:"2", Text:"女性", Id:2},
				{Value:"0", Text:"未知", Id:3},
				{Value:"9", Text:"其它", Id:99}
			];
			var me = this;
			$(sexArray).each(function(key, sexObj){
				var sex = new Sex;
				sex.set(sexObj);
				me.sexView.sexInfos.add(sex);
			});
			this.selectSex.html(this.sexView.$el);
			
			this.txtAge = this.$("#txtAge");
			this.txtUserName.focus();
			
			//column name
			this.txtUserName.columnName = "UserName";
			this.txtLoginName.columnName = "LoginName";
			this.txtPassword.columnName = "Password";
			this.selectSex.columnName = "Sex";
			this.txtAge.columnName = "Age";
			
			this.tableBody = this.$("#tableUserList").find(">tbody");
			
			this.userInfos = new UserList;
      this.listenTo(this.userInfos, 'add', this.addOne);
      this.listenTo(this.userInfos, 'remove', this.removeOne);
      this.listenTo(this.userInfos, 'reset', this.addAll);
      this.listenTo(this.userInfos, 'all', this.render);
      
      this.userViewPair = {};
    },
    getUser: function(){
    	var userObject = _.clone(UserRow);
    	userObject[this.txtUserName.columnName] = this.txtUserName.val();
    	userObject[this.txtLoginName.columnName] = this.txtLoginName.val();
    	userObject[this.txtPassword.columnName] = this.txtPassword.val();
    	userObject[this.selectSex.columnName] = this.selectSex.find("select").val();
    	userObject[this.txtAge.columnName] = this.txtAge.val();
    	userObject["Id"] = this.userInfos.length;
    	return userObject;
    },
    // create a new user item
    createItem: function(e){
    	var user = new User;
    	user.set(this.getUser());
    	this.userInfos.add(user);
    },
    // delete the user items
    deleteItems: function(e){
    	for(var key in this.userViewPair){
    		var view = this.userViewPair[key];
    		if(view.isSelected)
    			this.userInfos.remove(view.model);
    	}
    },
    addOne: function(user){
      var view = new UserView({model: user});
      this.tableBody.append(view.render().el);
    	this.userViewPair[user.cid] = view;
    },
    removeOne: function(user){
    	var view = this.userViewPair[user.cid];
    	view.clear();
    	delete this.userViewPair[user.cid];
    },
    addAll: function(){
    }/*,
    render: function(){
    }*/
	});
	
	var appView = new AppView;
	
	var userInfo = new User;
	userInfo.on("change:Password",function(){
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