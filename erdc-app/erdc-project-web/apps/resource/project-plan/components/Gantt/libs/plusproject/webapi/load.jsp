<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" import="java.util.*,com.plusoft.util.*, com.plusoft.service.*"%>
<% 		
	request.setCharacterEncoding("UTF-8");
	response.setCharacterEncoding("UTF-8");
	
    String projectuid = request.getParameter("projectuid");
	
    Map dataProject = new ProjectService().loadProject(projectuid);
	
    Date sss = new Date();
    
    String json = PluSoft.Data.Project.Encode(dataProject);
     
    Long t = new Date().getTime() - sss.getTime();
    
    System.out.print(t);
    
    response.getWriter().write(json);
%>