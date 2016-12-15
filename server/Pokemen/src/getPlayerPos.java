

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.sun.xml.internal.bind.v2.runtime.unmarshaller.IntArrayData;

@WebServlet("/getPlayerPos")
public class getPlayerPos extends HttpServlet {

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		int[] getPos = PlayerInfoDAO.getPlayerLastPos();
		System.out.println("get From the Server:"+getPos[0]+"  "+getPos[1]);
		response.getWriter().write(getPos[0]+","+getPos[1]);
	}

}
