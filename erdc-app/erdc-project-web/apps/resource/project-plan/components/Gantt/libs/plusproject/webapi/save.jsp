<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" import="java.util.*,com.plusoft.util.*, com.plusoft.service.*"%>
<% 	
	request.setCharacterEncoding("UTF-8");
	response.setCharacterEncoding("UTF-8");	
	
	String projectJSON = request.getParameter("project");
	 
	HashMap dataProject = (HashMap)JSON.decode(projectJSON);
	
	String projectUID = new ProjectService().saveProject(dataProject, true);
	
	response.getWriter().write(projectUID);		
	
%>