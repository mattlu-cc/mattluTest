using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BackbonejsExercise.Controllers
{
    public class MattluController : Controller
    {
        // GET: Mattlu
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult MdDataTableDome()
        {
            return View();
        }

        public JsonResult queryList(string jsonData)
        {
            List<object> rtnList = new List<object>();
            var userInfo = new { Pk = "0000", UserName = "mattlu00", Card = "88051668", Pwd = "123456", Age = 28, Email = "88051668@qq.com", Tel = "13205711058", Address = "浙江省杭州市滨江区长河路351号" };
            var userInfo1 = new { Pk = "0001", UserName = "mattlu11", Card = "1111111", Pwd = "11111", Age = 28, Email = "111111111@qq.com", Tel = "11111111111", Address = "浙江省杭州市滨江区长河路351号" };
            var userInfo2 = new { Pk = "0002", UserName = "mattlu22", Card = "2222222", Pwd = "2222", Age = 28, Email = "2222222222@qq.com", Tel = "22222222222", Address = "浙江省杭州市滨江区长河路351号" };
            rtnList.Add(userInfo);
            rtnList.Add(userInfo1);
            rtnList.Add(userInfo2);
            var s = new { ListData = rtnList, TotalCount = 10 };
            return Json(s);
        }

        public JsonResult delInfos(string ids)
        {
            return Json(0);
        }

        public JsonResult editInfo(string jsonData)
        {
            return Json(0);
        }
    }
}