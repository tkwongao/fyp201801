package fyp;

import java.io.IOException;
import java.sql.Connection;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Objects;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts2.interceptor.ServletRequestAware;
import org.apache.struts2.interceptor.ServletResponseAware;
import org.apache.struts2.json.annotations.JSON;

import com.opensymphony.xwork2.ActionSupport;

public class Application extends ActionSupport implements ServletRequestAware, ServletResponseAware {
	private static final long serialVersionUID = -706028425927965519L;
	private HttpServletRequest request;
	private HttpServletResponse response;
	private HashMap<String, Number> dataMap;

	@SuppressWarnings("finally")
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
			int numberOfIntervals = 0;
			boolean isLastIntervalIncomplete = false;
			ZonedDateTime endTimeForCompleteIntervals = startTime;
			if (interval != 0) {
				for (; !endTimeForCompleteIntervals.plus(1, internalInterval).isAfter(endTime); numberOfIntervals++)
					endTimeForCompleteIntervals = endTimeForCompleteIntervals.plus(1, internalInterval);
				isLastIntervalIncomplete = !Duration.between(endTimeForCompleteIntervals, endTime).isZero();
			}
			else {
				endTimeForCompleteIntervals = endTime;
				numberOfIntervals = 1;
			}
			dataMap = new HashMap<String, Number>();
			Number[] value = makeDatabaseRequest(startTime, endTimeForCompleteIntervals, numberOfIntervals);
			for (int i = 0; i < value.length; i++) {
				if (value[i].doubleValue() < 0)
					throw new IllegalStateException("An error occurred during database access.");
				dataMap.put("dataPoint" + (i + 1), value[i]);
			}
			if (isLastIntervalIncomplete) {
				int nextI = value.length + 1;
				value = makeDatabaseRequest(endTimeForCompleteIntervals, endTime, 1);
				if (value[0].doubleValue() < 0)
					throw new IllegalStateException("An error occurred during database access.");
				dataMap.put("dataPoint" + nextI, value[0]);
			}
		} catch (IllegalArgumentException | IllegalStateException | NullPointerException e) {
			e.printStackTrace();
			try {
				response.sendError(500);
			} catch (IOException e1) {
				e1.printStackTrace();
			} finally {
				return ERROR;
			}
		} catch (Exception e) {
			e.printStackTrace();
			try {
				response.sendError(501);
			} catch (IOException e1) {
				e1.printStackTrace();
			} finally {
				return "Unknown" + ERROR;
			}
		}
		return SUCCESS;
	}

	private Number[] makeDatabaseRequest(ZonedDateTime startTime, ZonedDateTime endTime, int numberOfIntervals) {
		int storeId = Integer.parseInt(request.getParameter("storeId"));
		String requestType = request.getParameter("type").toLowerCase();
		Connection connection = Objects.requireNonNull(DatabaseConnection.getConnection(), "Failed to connect to the database server");
		long[] period = Objects.requireNonNull(Utilities.timeToPeriod(startTime, endTime), "Invalid start or end time");
		if (requestType.equals("user") || requestType.equals("loyalty")) {
			UserAnalysis ua = new UserAnalysis(connection, Long.parseLong(request.getParameter("userMac").replaceAll(":", ""), 16));
			return (requestType.equals("user")) ? ua.userStayTime(period, numberOfIntervals, storeId) : ua.loyaltyCheck(period, numberOfIntervals);
		}
		else {
			MallAndStoreAnalysis msa = new MallAndStoreAnalysis(storeId, connection);
			switch (requestType) {
			case "count":
				return msa.visitorCount(period, numberOfIntervals);
			case "average":
				return msa.averageEnterToLeaveTime(period, numberOfIntervals);
			case "freq":
				return msa.freqRatio(period, numberOfIntervals);
			case "bounce":
				return msa.bounceRate(period, numberOfIntervals, 0.75);
			default:
				throw new IllegalArgumentException("Request type is invalid: " + requestType);
			}
		}
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