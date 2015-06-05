using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BackbonejsExercise.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult BackbonejsDemo()
        {
            return View();
        }

        public JsonResult GetList()
        {
            List<UserEntity> userList = new List<UserEntity>();
            userList.Add(new UserEntity()
            {
                ID = "1",
                UserName = "zhangsan",
                Password = "nicaicai",
                Sex = "1",
                Age = "15",
                Hobby = "like"
            });
            return Json(userList);
            //string jsonStr = "[{ID:'1',UserName:'zhangsan',Password:'nicaicai',Sex:'1',Age:15,Hobby:'like'}]";
            //return jsonStr;
        }
    }

    public class UserEntity
    {
        public string ID { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Sex { get; set; }
        public string Age { get; set; }
        public string Hobby { get; set; }
    }
}