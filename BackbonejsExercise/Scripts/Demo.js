

$(function () {
    var UserInfo = { ID: 1, UserName: "Jimmy", Password: "nicaicai", Sex: "0", Age: 15, Hobby: "play" };

    var User = Backbone.Model.extend({
        urlRoot: "/Home/Save",
        initialize: function () {
            this.on("change:UserName",
                function () {

                }, this);
            this.on("change:Password", function () {

            }, this);
        },
        default: { UserName: "aaaa", Password: "bbb", ID: 1, Hobby: "cccc" },
        validate: function (attributes) {
            if (attributes.UserName == "") {
                return "UserName不能为空！";
            }
            if (attributes.Password == "") {
                return "Password不能为空！";
            }
            if (attributes.Sex == "0") {
                return "Sex不能为未知！";
            }
        }
    });

    var UserList = Backbone.Collection.extend({
        model: User
    });

    var Sex = Backbone.Model.extend({
        Value: "", Text: "", ID: 1
    });
    var SexList = Backbone.Collection.extend({
        model: Sex
    });

    var userList = new UserList;
    userList.fetch({
        type: "post",
        url: '/Home/GetList', success: function (collection, response) {

            testFun();

        }, error: function () {
            alert("error");
        },
        async: true
    });




   var testFun = function () {


       //BackboneView
       var SexView = Backbone.View.extend({
           tagName: "select",
           events: { "change": "selectOne" },
           sexTemplate: _.template($("#sexTemplate").html()),
           initialize: function () {
               this.sexInfos = new SexList;
               this.listenTo(this.sexInfos, "add", this.render);

               var sexArray = [
                   { Value: "1", Text: "男性", ID: 1 },
                   { Value: "2", Text: "女性", ID: 2 },
                   { Value: "0", Text: "未知", ID: 3 },
                   { Value: "9", Text: "其他", ID: 99 }
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




       var UserListView = Backbone.View.extend({
           tagName: "tr",
           userlistTemplate: _.template($("#userlistTemplate").html()),
           events: {
               "click #deleteUser": "deleteUser"
           },
           initialize: function () {
               this.listenTo(this.model, "change", this.render);
               this.listenTo(this.model, "destroy", this.remove);
               this.sexView = new SexView();

               this.render();
           },
           initSexPairs: function () {
               if (this.sexPairs == null) {
                   this.sexPairs = {};
                   this.sexView.sexInfos.each(function (sexinfo) {
                       this.sexPairs[sexinfo.get("Value")] = sexinfo.toJSON();
                   }, this);
               }
           },
           render: function () {
               this.$el.html(this.userlistTemplate(this.model.toJSON()));

               this.initSexPairs();
               var me = this;
               $(this.$el.find("td[name='tdSexReplace']").each(function (key, td) {
                   $(td).html(me.sexPairs[$(td).html()].Text);
               }))

               return this;
           },
           clear: function () {
               this.model.destroy;
           },
           deleteUser: function () {
               //this.model.set("urlRoot", "/Home/Delete");
               //this.model.destroy(null, {
               //    success: function () {
               //        alert("删除成功！");
               //    }
               //});
               this.model.destroy({
                   url: '/Home/Delete?id=' + this.model.get("ID"),
                   success: function () {
                       alert("删除成功！");
                   }
                   , wait: true,
                   emulateHTTP: true
               });

               


               //userList.fetch({
               //    url: "/Home/Delete", data: { model: this.model }, success: function () {

               //    }
               //});
           }
       });

       var UserView = Backbone.View.extend({
           tagName: "div",
           newuserTemplate: _.template($("#newuserTemplate").html()),
           initialize: function () {
               this.listenTo(this.model, "change", this.render);
               //this.listenTo(this.model, "destroy", this.remove);

               this.sexView = new SexView;
               this.model.trigger("change");
               //this.render();
           },
           render: function () {
               this.$el.html(this.newuserTemplate(this.model.toJSON()));
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
               var pairs = {
                   ID: this.$("#txtID"),
                   UserName: this.$("#txtUserName"),
                   Password: this.$("#txtPassword"),
                   Sex: this.selectSex.find("select"),
                   Age: this.$("#txtAge")
               };
               var modelObject = {};
               //if (!this.isEdit)
               //modelObject["Id"] = this.models.nextId();

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
           el: $("#divPanel"),
           appTemplate: _.template($("#userlistTemplate").html()),
           events: {
               "click #btnNew": "newItem",
               "click #btnSave": "saveToDababase"
           },
           initialize: function () {
               this.userInfos = new UserList;
               this.listenTo(this.userInfos, "all", this.myRender);
               this.divNewUser = this.$("#divNewUser");
               this.addAll();
           },
           //newItem
           newItem: function (e) {
               var user = new User;
               user.set(_.clone(UserInfo));
               if (user.collection == null)
                   user.collection = this.userInfos;
               this.newUserView = new UserView({ model: user }); //@5:传入的参数一定是内定的key,如model,models,el等，但是自定义的不行，如传入{edit:true}这样是传不进去
               this.divNewUser.html(this.newUserView.$el);
               //this.addOne(this.newUserView.getModel());
           },
           myRender: function (eventName) {
               alert(eventName);
           },
           addOne: function (todouser) {
               var trView = new UserListView({ model: todouser });
               this.$("#tbodyList").append(trView.el);
           },
           addAll: function () {
               userList.each(this.addOne);
           },
           saveToDababase: function (e) {
               var thatObj = this;
               var u = new User();

               var hobbyVal = "";
               this.$('input[name="chkHobby"]:checked').each(function () {
                   hobbyVal += $(this).attr("data-text") + ",";
               });
               if (hobbyVal != "") {
                   hobbyVal = hobbyVal.substring(0, hobbyVal.length - 1);
               }

               u.set({
                   "ID": userList.length + 1,
                   "UserName": this.$("#txtUserName").val(),
                   "Password": this.$("#txtPassword").val(),
                   "Sex": this.$("#spanSex").find("select").val(),
                   "Age": this.$("#txtAge").val(),
                   "Hobby": hobbyVal
               });

               if (!u.isValid())
               {
                   alert(u.validationError);
               }
               u.save(null, {
                   //emulateJSON: true,
                   success: function (model, response, options) {
                       alert("success");
                       //var random = Math.random();
                       //model.attributes.id = random;
                       thatObj.addOne(model);
                       //return;
                       userList.fetch({
                           type: "post", url: "/Home/GetList", async: false, success: function () {
                               thatObj.$("#tbodyList").html("");
                               thatObj.addAll();
                           }
                       });
                       
                   },
                   error: function () {
                       alert("error");
                   }
               });

           }
       });

        var appView = new AppView;
        appView.$("#btnNew").click();
   };
});