package fyp;

import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts2.interceptor.ServletRequestAware;
import org.apache.struts2.interceptor.ServletResponseAware;
import org.apache.struts2.json.annotations.JSON;

import com.opensymphony.xwork2.ActionSupport;

public class ApplicationContext extends ActionSupport implements ServletRequestAware, ServletResponseAware {
	private static final long serialVersionUID = 5958518038208358569L;
	private HttpServletRequest request;
	private HttpServletResponse response;
	private HashMap<String, Number> dataMap;

	@Override
	public String execute() {
		String mallName = request.getParameter("mallName");
		try {
			switch (mallName) {
			case "base_1":
				try {
					String sql = "SELECT id, name FROM stores WHERE areaid = ?";
					PreparedStatement ps = DatabaseConnection.getConnection().prepareStatement(sql);
					ps.setString(1, mallName);
					ResultSet rs = ps.executeQuery();
					dataMap = new HashMap<String, Number>();
					while (rs.next())
						dataMap.put(rs.getString("name"), rs.getInt("id"));
				} catch (SQLException e) {
					e.printStackTrace();
					response.sendError(500);
					return ERROR;
				}
				break;
			default:
				new IllegalArgumentException("Unsupported Mall!").printStackTrace();
				response.sendError(403);
				return ERROR;
			}
		} catch (IOException e) {
			return ERROR;
		}
		return SUCCESS;
	}

	@Override
	public void setServletRequest(HttpServletRequest request) {
		this.request = request;
	}

	@JSON(serialize = false) 
	public HttpServletRequest getServletRequest() {
		return request;
	}

	public HashMap<String, Number> getDataMap() {  
		return dataMap;  
	}

	@Override
	public void setServletResponse(HttpServletResponse response) {
		this.response = response;
	}
}