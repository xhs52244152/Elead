﻿using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Collections;
using PluSoft.BLL;

public partial class project_services_load : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        String projectuid = Request["projectuid"];

        Hashtable dataProject = new ProjectService().LoadProject(projectuid);

        String json = PluSoft.Utils.JSON.Encode(dataProject);

        Response.Write(json);
    }
}