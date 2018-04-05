package fyp;

import java.io.IOException;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts2.interceptor.ServletRequestAware;
import org.apache.struts2.interceptor.ServletResponseAware;
import org.apache.struts2.json.annotations.JSON;

import com.opensymphony.xwork2.ActionSupport;

public class MallListAction extends ActionSupport implements ServletRequestAware, ServletResponseAware {
	private static final long serialVersionUID = -9134681702919720308L;
	private HttpServletRequest request = null;
	private HttpServletResponse response = null;
	private HashMap<String, String> dataMap = null;

	@Override
	public String execute() throws IOException, SQLException {
		try (DatabaseConnection dbc = new DatabaseConnection();
				PreparedStatement ps = dbc.getConnection().prepareStatement("SELECT _id, name, areas FROM buildings")) {
			ResultSet rs = ps.executeQuery();
			dataMap = new HashMap<String, String>();
			while (rs.next()) {
				String name = rs.getString("name").replace("[", "").replace("]", "").replace("{", "").replace("}", "");
				String[] areas = rs.getString("areas").split(",");
				HashMap<String, String> dataMap2 = new HashMap<String, String>();
				for (String anArea : areas)
					try (PreparedStatement ps2 = dbc.getConnection().prepareStatement("SELECT name FROM areas WHERE _id = '" + anArea + '\'')) {
						ResultSet rs2 = ps2.executeQuery();
						while (rs2.next())
							dataMap2.put(anArea, rs2.getString("name"));
					}
				dataMap.put(rs.getString("_id"), "{" + name + "}}w/{" + dataMap2.toString().replace("[", "").replace("]", "").replace("{", "").replace("}", ""));
			}
		} catch (SQLException e) {
			response.sendError(500);
			throw new IllegalStateException("An error occurred during database access.", e);
		} finally {
			Enumeration<Driver> drivers = DriverManager.getDrivers();
			while (drivers.hasMoreElements())
				DriverManager.deregisterDriver(drivers.nextElement());
		}
		return SUCCESS;
	}

	@JSON(serialize = false) 
	public HttpServletRequest getServletRequest() {
		return request;
	}

	@JSON(serialize = false) 
	public HttpServletResponse getServletResponse() {
		return response;
	}

	public HashMap<String, String> getDataMap() {  
		return dataMap;
	}

	@Override
	public void setServletRequest(HttpServletRequest request) {
		this.request = request;
	}

	@Override
	public void setServletResponse(HttpServletResponse response) {
		this.response = response;
	}
}