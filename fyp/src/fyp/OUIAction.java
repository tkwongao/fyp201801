package fyp;

import java.io.IOException;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts2.interceptor.ServletRequestAware;
import org.apache.struts2.interceptor.ServletResponseAware;
import org.apache.struts2.json.annotations.JSON;

import com.opensymphony.xwork2.ActionSupport;

public class OUIAction extends ActionSupport implements ServletRequestAware, ServletResponseAware {
	private static final long serialVersionUID = 1277816418981985584L;
	private HttpServletRequest request = null;
	private HttpServletResponse response = null;
	private HashMap<String, Integer> dataMap = null;
	private String userMac = null;

	@Override
	public String execute() throws IOException, SQLException {
		try {
			if (userMac == null)
				throw new IllegalArgumentException("MAC Addresses to be analyzed is not provided.");
			else {
				dataMap = new HashMap<String, Integer>();
				try (UserAnalysis ua = new UserAnalysis(null, 0, Long.parseLong(userMac.replaceAll(":", ""), 16))) {
					ua.analyzeOUI().forEach(anOUI -> dataMap.put(anOUI, dataMap.getOrDefault(anOUI, 0) + 1));
				} catch (SQLException e) {
					throw new IllegalStateException("An error occurred during database access.", e);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			response.sendError(500);
		} finally {
			Enumeration<Driver> drivers = DriverManager.getDrivers();
			while (drivers.hasMoreElements())
				DriverManager.deregisterDriver(drivers.nextElement());
		}
		return SUCCESS;
	}

	public HttpServletRequest getRequest() {
		return request;
	}

	public HttpServletResponse getResponse() {
		return response;
	}

	public HashMap<String, Integer> getDataMap() {
		return dataMap;
	}

	@JSON(serialize = false)
	public String getUserMac() {
		return userMac;
	}

	@Override
	public void setServletRequest(HttpServletRequest request) {
		this.request = request;
	}

	@Override
	public void setServletResponse(HttpServletResponse response) {
		this.response = response;
	}

	public void setUserMac(String userMac) {
		this.userMac = userMac;
	}
}