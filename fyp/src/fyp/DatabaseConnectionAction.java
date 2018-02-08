package fyp;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Objects;

import javax.servlet.http.HttpServletRequest;

import org.apache.struts2.interceptor.ServletRequestAware;
import org.apache.struts2.json.annotations.JSON;

import com.opensymphony.xwork2.ActionSupport;

public class DatabaseConnectionAction extends ActionSupport implements ServletRequestAware {
	private static final long serialVersionUID = -706028425927965519L;
	private HttpServletRequest request;
	private HashMap<String, Number> dataMap;

	@Override
	public String execute() {
		try {
			int interval = Integer.parseInt(request.getParameter("interval"));
			ChronoUnit internalInterval;
			switch (interval) {
			case 0:
			case 1:
				internalInterval = ChronoUnit.HOURS;
				break;
			case 24:
				internalInterval = ChronoUnit.DAYS;
				break;
			case 720:
				internalInterval = ChronoUnit.MONTHS;
				break;
			default:
				throw new IllegalArgumentException("Interval is invalid: " + interval);
			}
			ZonedDateTime startTime = Utilities.timestampToTime(Long.parseLong(request.getParameter("start"))),
					endTime = Utilities.timestampToTime(Long.parseLong(request.getParameter("end")));
			int storeId = Integer.parseInt(request.getParameter("storeId"));
			String requestType = request.getParameter("type").toLowerCase();
			Connection connection = Objects.requireNonNull(DatabaseConnection.getConnection());
			int i = 0;
			Number value = 0;
			dataMap = new HashMap<String, Number>();
			do {
				ZonedDateTime startTimeInInterval = startTime.plus(i++, internalInterval);
				if (startTimeInInterval.isAfter(endTime))
					break;
				ZonedDateTime endTimeInInterval = startTimeInInterval.plus(1, internalInterval);
				if (interval == 0)
					endTimeInInterval = endTime;
				long[] period = Utilities.timeToPeriod(startTimeInInterval, endTimeInInterval);
				if (requestType.equals("user") || requestType.equals("loyalty")) {
					UserAnalysis ua = new UserAnalysis(connection, Long.parseLong(request.getParameter("userMac").replaceAll(":", ""), 16));
					value = (requestType.equals("user")) ? ua.userStayTime(period, storeId) : ua.loyaltyCheck(period);
				}
				else {
					MallAndStoreAnalysis msa = new MallAndStoreAnalysis(storeId, connection);
					switch (requestType) {
					case "count":
						value = msa.VisitorCount(period);
						break;
					case "average":
						value = msa.averageEnterToLeaveTime(period);
						break;
					case "freq":
						value = msa.freqRatio(period);
						break;
					case "bounce":
						value = msa.bounceRate(period, 0.75);
						break;
					default:
						throw new IllegalArgumentException("Request type is invalid: " + requestType);
					}
				}
				dataMap.put("dataPoint" + i, value);
			} while (interval != 0);
		} catch (SQLException | IllegalArgumentException | NullPointerException e) {
			e.printStackTrace();
			return ERROR;
		} catch (Exception e) {
			e.printStackTrace();
			return "Serious" + ERROR;
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
}