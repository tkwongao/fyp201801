package fyp;

import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.struts2.interceptor.ServletRequestAware;
import org.apache.struts2.json.annotations.JSON;

import com.opensymphony.xwork2.ActionSupport;

public class DatabaseConnectionAction extends ActionSupport implements ServletRequestAware {
	private static final long serialVersionUID = -706028425927965519L;
	private HttpServletRequest request;
	private Map<String, Number> dataMap;

	@Override
	public String execute() {
		try {
			dataMap = new HashMap<String, Number>();
			DatabaseConnection dbc = new DatabaseConnection();
			GregorianCalendar startTime = Utilities.timestampToTime(Long.parseLong(request.getParameter("start"))),
					endTime = Utilities.timestampToTime(Long.parseLong(request.getParameter("end")));
			int storeId = Integer.parseInt(request.getParameter("storeId")),
					interval = Integer.parseInt(request.getParameter("interval"));
			long macAddress = 0;
			String requestType = request.getParameter("type").toLowerCase();
			int i = 0;
			Number value = 0;
			Integer internalInterval;
			switch (interval) {
			case 0:
			case 1:
				internalInterval = GregorianCalendar.HOUR;
				break;
			case 24:
				internalInterval = GregorianCalendar.DAY_OF_MONTH;
				break;
			case 720:
				internalInterval = GregorianCalendar.MONTH;
				break;
			default:
				throw new IllegalArgumentException("Interval is invalid");
			}
			do {
				GregorianCalendar startTimeInInterval = (GregorianCalendar) startTime.clone();
				startTimeInInterval.add(internalInterval, i++);
				if (startTimeInInterval.compareTo(endTime) >= 0)
					break;
				GregorianCalendar endTimeInInterval = (GregorianCalendar) startTimeInInterval.clone();
				endTimeInInterval.add(internalInterval, 1);
				if (interval == 0)
					endTimeInInterval = endTime;
				switch (requestType) {
				case "count":
					value = (storeId == -1) ? dbc.totalVisitorCount(startTimeInInterval, endTimeInInterval)
							: dbc.eachStoreVisitorCount(startTimeInInterval, endTimeInInterval, storeId);
					break;
				case "average":
					value = (storeId == -1) ? dbc.averageEnterToLeaveTimeInMall(startTimeInInterval, endTimeInInterval) :
						dbc.averageEnterToLeaveTimeInEachStore(startTimeInInterval, endTimeInInterval, storeId);
					break;
				case "freq":
					value = (storeId == -1) ? dbc.totalFreqRatio(startTimeInInterval, endTimeInInterval) :
						dbc.eachStoreFreqRatio(startTimeInInterval, endTimeInInterval, storeId);
					break;
				case "bounce":
					if (storeId == -1)
						throw new IllegalArgumentException();
					else
						value = dbc.bounceRate(startTimeInInterval, endTimeInInterval, storeId, 0.75);
					break;
				case "user":
					macAddress = Long.parseLong(request.getParameter("userMac"), 16);
					value = (storeId == -1) ? dbc.userStayTimeInMall(startTimeInInterval, endTimeInInterval, macAddress) :
						dbc.userStayTimeInEachStore(startTimeInInterval, endTimeInInterval, macAddress, storeId);
					break;
				case "loyalty":
					macAddress = Long.parseLong(request.getParameter("userMac").replaceAll(":", ""), 16);
					value = dbc.loyaltyCheck(startTimeInInterval, endTimeInInterval, macAddress);
					break;
				default:
					throw new IllegalArgumentException("Request type is invalid");
				}
				dataMap.put("dataPoint" + i, value);
			} while (interval != 0);
		} catch (Exception e) {
			e.printStackTrace();
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

	public Map<String, Number> getDataMap() {  
		return dataMap;  
	} 
}
