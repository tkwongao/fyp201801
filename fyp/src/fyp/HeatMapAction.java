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

public class HeatMapAction extends ActionSupport implements ServletRequestAware, ServletResponseAware {
	private static final long serialVersionUID = -891989885724959429L;
	private HttpServletRequest request = null;
	private HttpServletResponse response = null;
	private HashMap<Integer, double[]> dataMap = null;
	private long start, end;
	private String mallName = null;

	@Override
	public String execute() throws IOException, SQLException {
		switch (mallName) {
		case "base_1":
		case "k11_sh_1":
		case "k11_sh_2":
		case "k11_sh_3":
			try (KMeans KM = new KMeans(new long[] {start, end}, mallName)) {
				int counter = 0;
				double[][] data = KM.getData();
				dataMap = new HashMap<Integer, double[]>();
				for (double[] aRecord : data)
					dataMap.put(counter++, aRecord);
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

	public HashMap<Integer, double[]> getDataMap() {  
		return dataMap;
	}
	
	@JSON(serialize = false)
	public long getStart() {
		return start;
	}

	@JSON(serialize = false)
	public long getEnd() {
		return end;
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
	
	public void setStart(long start) {
		this.start = start;
	}

	public void setEnd(long end) {
		this.end = end;
	}

	public void setMallName(String mallName) {
		this.mallName = mallName.toLowerCase();
	}
}