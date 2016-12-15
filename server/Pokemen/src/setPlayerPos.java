

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class setPlayerPos
 */
@WebServlet("/setPlayerPos")
public class setPlayerPos extends HttpServlet {
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		int x = Integer.parseInt(request.getParameter("xPos"));
		int y = Integer.parseInt(request.getParameter("yPos"));
		
		System.out.println(x+","+y);
		int[] pos = new int[2];
		pos[0] = x;
		pos[1] = y;
		PlayerInfoDAO.setPlayerLastPos(pos);
		response.getWriter().write("done");
	}

}
