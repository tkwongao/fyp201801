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
	private HashMap<String, Long> dataMap = null;
	private long start, end;
	private double widthRatio, heightRatio;
	private String mallName = null;

	@Override
	public String execute() throws IOException, SQLException {
		switch (mallName) {
		case "base_1":
		case "k11_sh_1":
		case "k11_sh_2":
		case "k11_sh_3":
			try (KMeans KM = new KMeans(new long[] {start, end}, mallName, -1)) {
				double[][] data = KM.getData();
				dataMap = new HashMap<String, Long>();
				for (double[] aRecord : data) {
					String key = ((int) Math.floor(aRecord[0] * widthRatio)) + " " + ((int) Math.floor(aRecord[1] * heightRatio));
					dataMap.put(key, dataMap.getOrDefault(key, 0l) + 1);
				}
				HashMap<Long, Long> macAddressMap = new HashMap<Long, Long>();
				KM.getPoints().forEach(point -> macAddressMap.put(point.getDid(), Math.max(macAddressMap.getOrDefault(point.getDid(), 0l), point.getTs())));
				dataMap.put("count", Long.valueOf(macAddressMap.size()));
				macAddressMap.forEach((macAddress, count) -> dataMap.put("mac " + String.format("%012x", macAddress).replaceAll("(.{2})", "$1:").substring(0, 17).toUpperCase(), count));
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

	public HashMap<String, Long> getDataMap() {  
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

	@JSON(serialize = false) 
	public double getWidthRatio() {
		return widthRatio;
	}

	@JSON(serialize = false) 
	public double getHeightRatio() {
		return heightRatio;
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

	public void setWidthRatio(double widthRatio) {
		this.widthRatio = widthRatio;
	}

	public void setHeightRatio(double heightRatio) {
		this.heightRatio = heightRatio;
	}
}