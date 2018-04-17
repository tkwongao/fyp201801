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

public class FloorPlanImageAction extends ActionSupport implements ServletRequestAware, ServletResponseAware {
	private static final long serialVersionUID = 4324689693785813174L;
	private HttpServletRequest request = null;
	private HttpServletResponse response = null;
	private HashMap<Byte, String> dataMap = null;
	private String mallName = null;

	@Override
	public String execute() throws IOException, SQLException {
		switch (mallName) {
		case "base_1":
		case "k11_sh_1":
		case "k11_sh_2":
		case "k11_sh_3":
			String sql = "SELECT impath FROM imgs WHERE _id = ?";
			try (DatabaseConnection dbc = new DatabaseConnection();
					PreparedStatement ps = dbc.getConnection().prepareStatement(sql)) {
				ps.setString(1, mallName);
				ResultSet rs = ps.executeQuery();
				dataMap = new HashMap<Byte, String>();
				while (rs.next())
					dataMap.put((byte) 0, rs.getString("impath"));
			} catch (SQLException e) {
				response.sendError(500);
				throw new IllegalStateException("An error occurred during database access.", e);
			} finally {
				Enumeration<Driver> drivers = DriverManager.getDrivers();
				while (drivers.hasMoreElements())
					DriverManager.deregisterDriver(drivers.nextElement());
			}
			break;
		default:
			response.sendError(403);
			throw new IllegalArgumentException("Unsupported Mall: " + mallName);
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

	public HashMap<Byte, String> getDataMap() {  
		return dataMap;
	}

	@JSON(serialize = false) 
	public String getMallName() {
		return mallName;
	}

	@Override
	public void setServletRequest(HttpServletRequest request) {
		this.request = request;
	}

	@Override
	public void setServletResponse(HttpServletResponse response) {
		this.response = response;
	}

	public void setMallName(String mallName) {
		this.mallName = mallName.toLowerCase();
	}
}