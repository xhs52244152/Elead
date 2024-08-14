using System;
using System.Collections;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
//using Test;
using System.IO;
using PluSoft.Utils;
using Plusoft.Utils;

public partial class scripts_plusproject_webapi_projectapi : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        String type = Request["type"];

        Hashtable result = new Hashtable();
        try
        {
            switch (type)
            {
                case "loadProject":
                    result["data"] = this.LoadProject();
                    break;
                case "saveProject":
                    result["data"] = this.SaveProject();
                    break;
                case "deleteProject":
                    result["data"] = this.DeleteProject();
                    break;
                case "listProject":
                    result["data"] = this.ListProject();
                    break;
                case "loadTemplate":
                    result["data"] = this.LoadTemplate();
                    break;
                case "listTemplate":
                    result["data"] = this.ListTemplate();
                    break;
                case "saveTemplate":
                    result["data"] = this.SaveTemplate();
                    break;
                case "deleteTemplate":
                    result["data"] = this.DeleteTemplate();
                    break;
                case "changeTemplateName":
                    result["data"] = this.ChangeTemplateName();
                    break;
                case "importProject":
                    result["data"] = this.ImportProject();
                    break;
                case "exportProject":
                    this.ExportProject();
                    return;
              
                case "lazyLoadProject":
                    break;
            }
            result["success"] = true;
        }
        catch (Exception ex)
        {
            result["success"] = false;
            result["message"] = ex.Message;
            result["stackTrace"] = ex.StackTrace;
        }

        String json = PluSoft.Utils.JSON.Encode(result);
        Response.Write(json);

    }


    /////////////////////////////////////////////////////////////////////////////////        

    Object LoadProject()
    {
        String id = Request["id"];

        Hashtable project = DoLoadProject(id);

        return project;
    }


    Object SaveProject()
    {
        String json = Request["data"];

        Hashtable project = (Hashtable)PluSoft.Utils.JSON.Decode(json);

        String id = DoSaveProject(project);

        return id;
    }

    Object DeleteProject()
    {
        String id = Request["id"];
        String sql = "delete from project where id ='" + id + "'";
        DapperHelper.Execute(sql);
        return null;
    }

    Object ListProject()
    {
        String sql = "select * from project order by lastupdatedate desc";
        ArrayList list = DapperHelper.Query(sql);

        for (int i = 0, l = list.Count; i < l; i++)
        {
            Hashtable item = list[i] as Hashtable;
            item.Remove("data");
        }

        return list;
    }

    Object ListTemplate()
    {
        String templateType = Request["templateType"];
        String sql = "select * from template where type = " + templateType + " order by lastupdatedate desc";
        ArrayList list = DapperHelper.Query(sql);

        for (int i = 0, l = list.Count; i < l; i++)
        {
            Hashtable item = list[i] as Hashtable;
            item.Remove("data");
        }

        return list;
    }

    Object LoadTemplate()
    {
        String id = Request["id"];

        String sql = "select * from template where id ='" + id + "'";
        ArrayList list = DapperHelper.Query(sql);

        if (list.Count == 0)
        {
            throw new Exception("没有找到模板");
        }

        Hashtable item = (Hashtable)list[0];

        item["data"] = JSON.Decode(item["data"].ToString());

        return item;
    }

    Object SaveTemplate()                   //type: 1 项目模板、2 任务模板
    {
        String json = Request["data"];
        Hashtable item = (Hashtable)PluSoft.Utils.JSON.Decode(json);

        //生成新模板id
        if (item["id"] == null || item["id"].ToString() == "")
        {
            item["id"] = Guid.NewGuid().ToString();
        }
        String id = item["id"].ToString();

        //删除旧模板
        DapperHelper.Execute("delete from template where id ='" + id + "'");

        //保存新模板
        String sql = "insert into template(id, name, type, data, lastupdatedate)" +
                        "values(@id, @name, @type, @data, @lastupdatedate)";
        Hashtable args = new Hashtable();
        args["id"] = id;
        args["name"] = item["name"];
        args["type"] = item["type"];
        args["data"] = JSON.Encode(item["data"]);
        args["lastupdatedate"] = DateTime.Now;
        DapperHelper.Execute(sql, args);

        return id;
    }

    Object DeleteTemplate()
    {
        String id = Request["id"];
        String sql = "delete from template where id ='" + id + "'";
        DapperHelper.Execute(sql, null);
        return null;
    }

    Object ChangeTemplateName()
    {
        String id = Request["id"];
        String name = Request["name"];
        String sql = "update template set name = '" + name + "' where id ='" + id + "'";
        DapperHelper.Execute(sql, null);
        return null;
    }

    ///////////////////////////////////////////////////////////////////////////
    Object ImportProject()
    {
        // 获得程序路径
        string tempFile = Request.PhysicalApplicationPath;
        string path = tempFile + "Upload\\";

        //找到目标文件对象
        HttpPostedFile uploadFile = Request.Files["Fdata"];

        bool isMPP = uploadFile.FileName.IndexOf(".mpp") != -1;
        bool isXML = uploadFile.FileName.IndexOf(".xml") != -1;

        //string[] ss = uploadFile.FileName.Split('.');

        if (!isXML && !isMPP)
        {
            throw new Exception("请上传导入.xml或.mpp文件");
        }

        string FileName = uploadFile.FileName;
        FileName = FileName.Replace(".mpp", "");
        FileName = FileName.Replace(".xml", "");
        FileName = FileName + "_" + DateTime.Now.ToString("yyyyMMddhhmmss") + (isMPP ? ".mpp" : ".xml");

        //string id = "123";

        // 如果有文件, 则保存到一个地址
        if (uploadFile.ContentLength > 0)
        {
            string filePath = string.Format("{0}{1}{2}", tempFile, "Upload\\", FileName);
            uploadFile.SaveAs(filePath);

            //读取XML, 导入项目

            Hashtable project = null;
            try
            {
                project = PluSoft.Utils.PlusProject.Read(path + FileName, false);
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                System.IO.File.Delete(filePath);
            }

            return project;

            //如果想把默认的任务UID转换为GUID，则调用此方法
            //ProjectService.TransformTasksUID(dataProject);

            //string projectUID = new ProjectService().SaveProject(dataProject);

            //Response.Write("导入项目UID：" + projectUID + ", 您可以在<a href='Projects.aspx'>项目列表</a>页面打开本项目");
        }

        return null;
    }

    void ExportProject()
    {
        string id = Convert.ToString(Request["id"]);

        //1)导出为XML
        //Hashtable dataProject = new ProjectService().LoadProject(id);
        Hashtable dataProject = (Hashtable)LoadProject();

        //导出自定义任务属性
        ExportHelper.ExportExtendedAttributes(dataProject);

        //对固定工期的摘要任务，设置为手动模式，以便在MSProject完整显示。
        ExportHelper.ExportFixedDateSummarys(dataProject);

        string fileName = Path.GetFileNameWithoutExtension(Convert.ToString(dataProject["Name"])) + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".";
        string fileType = Request["filetype"];
        if (string.IsNullOrEmpty(fileType))
        {
            fileType = "xml";
        }
        fileName += fileType;
        string filePath = HttpContext.Current.Server.MapPath(@"~/Upload/" + fileName);

        PluSoft.Utils.PlusProject.Write(filePath, dataProject);

        //2)下载XML
        Response.Clear();
        Response.AddHeader("Content-Disposition", "attachment;  filename=" + HttpUtility.UrlEncode(fileName, System.Text.Encoding.UTF8));
        Response.WriteFile(filePath);

        Response.Flush();
        FileInfo file = new FileInfo(filePath);
        file.Delete();

        Response.End();

    }

    ////////////////////////////////////////////////////////////
    //获取部门数据
    public ArrayList GetDepartments(String projectuid)
    {
        //这里创建静态数据, 实际应使用项目projectuid从数据找出分配给此项目的部门列表
        ArrayList Departments = new ArrayList();

        Hashtable d1 = new Hashtable();
        d1["UID"] = 1;
        d1["Name"] = "研发部";
        Departments.Add(d1);

        Hashtable d2 = new Hashtable();
        d2["UID"] = 2;
        d2["Name"] = "财务部";
        Departments.Add(d2);

        Hashtable d3 = new Hashtable();
        d3["UID"] = 3;
        d3["Name"] = "人事部";
        Departments.Add(d3);

        return Departments;
    }

    //获取负责人集合
    public ArrayList GetPrincipals(String projectuid)
    {
        //实际应用, 从数据库查询此项目的负责人集合
        ArrayList Principals = new ArrayList();

        //这里造一些数据
        Hashtable p1 = new Hashtable();
        p1["UID"] = 1;
        p1["Name"] = "张三";
        p1["Department"] = "1";

        Hashtable p2 = new Hashtable();
        p2["UID"] = 2;
        p2["Name"] = "李四";
        p2["Department"] = "1";

        Hashtable p3 = new Hashtable();
        p3["UID"] = 3;
        p3["Name"] = "赵五";
        p3["Department"] = "1";

        Hashtable p4 = new Hashtable();
        p4["UID"] = 4;
        p4["Name"] = "Jack";
        p4["Department"] = "2";

        Hashtable p5 = new Hashtable();
        p5["UID"] = 5;
        p5["Name"] = "Rose";
        p5["Department"] = "2";

        Hashtable p6 = new Hashtable();
        p6["UID"] = 6;
        p6["Name"] = "Mark";
        p6["Department"] = "2";

        Hashtable p7 = new Hashtable();
        p7["UID"] = 7;
        p7["Name"] = "Niko";
        p7["Department"] = "2";

        Hashtable p8 = new Hashtable();
        p8["UID"] = 8;
        p8["Name"] = "李泉";
        p8["Department"] = "3";

        Hashtable p9 = new Hashtable();
        p9["UID"] = 9;
        p9["Name"] = "陈光";
        p9["Department"] = "3";

        Hashtable p10 = new Hashtable();
        p10["UID"] = 10;
        p10["Name"] = "李健";
        p10["Department"] = "3";

        Hashtable p11 = new Hashtable();
        p11["UID"] = 11;
        p11["Name"] = "顾姗姗";
        p11["Department"] = "3";

        Principals.Add(p1);
        Principals.Add(p2);
        Principals.Add(p3);
        Principals.Add(p4);
        Principals.Add(p5);
        Principals.Add(p6);
        Principals.Add(p7);
        Principals.Add(p8);
        Principals.Add(p9);
        Principals.Add(p10);
        Principals.Add(p11);

        return Principals;
    }

    ///////////////////////////////////////////////////////////////////

    private Hashtable DoLoadProject(string id)
    {
        String sql = "select * from project where id ='" + id + "'";
        ArrayList list = DapperHelper.Query(sql);

        if (list.Count == 0)
        {
            throw new Exception("没有找到项目");
        }

        Hashtable item = (Hashtable)list[0];

        Hashtable project = (Hashtable)JSON.Decode(item["data"].ToString());

        //负责人
        project["Principals"] = GetPrincipals(id);

        //部门
        project["Departments"] = GetDepartments(id);

        return project;
    }

    private string DoSaveProject(Hashtable project)
    {

        //生成新项目UID

        if (project["UID"] == null || project["UID"].ToString() == "")
        {
            project["UID"] = Guid.NewGuid().ToString();
        }
        String id = project["UID"].ToString();

        //删除旧项目
        DapperHelper.Execute("delete from project where id ='" + id + "'");

        //保存新项目
        String sql = "insert into project(id, name, startdate, finishdate, status, data, lastupdatedate)" +
                        "values(@id, @name, @startdate, @finishdate, @status, @data, @lastupdatedate)";
        Hashtable args = new Hashtable();
        args["id"] = project["UID"];
        args["name"] = project["Name"];
        args["startdate"] = project["StartDate"];
        args["finishdate"] = project["FinishDate"];
        args["status"] = project["Status"];
        args["data"] = JSON.Encode(project);
        args["lastupdatedate"] = DateTime.Now;
        DapperHelper.Execute(sql, args);

        return id;
    }
}


