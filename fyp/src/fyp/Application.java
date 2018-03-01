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
	private HttpServletRequest request = null;
	private HttpServletResponse response = null;
	private HashMap<String, Number> dataMap = null;
	private int interval, storeId;
	private long start, end;
	private String type = null, userMac = null;
	private int[] dwellTimeThresholds = null;

	@SuppressWarnings("finally")
	@Override
	public String execute() {
		try {
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
			ZonedDateTime startTime = Utilities.timestampToTime(start),
					endTime = Utilities.timestampToTime(end);
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
		Connection connection = Objects.requireNonNull(DatabaseConnection.getConnection(), "Failed to connect to the database server");
		long[] period = Objects.requireNonNull(Utilities.timeToPeriod(startTime, endTime), "Invalid start or end time");
		if (type.equals("user") || type.equals("loyalty")) {
			UserAnalysis ua = new UserAnalysis(connection, Long.parseLong(userMac.replaceAll(":", ""), 16));
			return (type.equals("user")) ? ua.userStayTime(period, numberOfIntervals, storeId) : ua.loyaltyCheck(period, numberOfIntervals);
		}
		else {
			MallAndStoreAnalysis msa = new MallAndStoreAnalysis(storeId, connection);
			switch (type) {
			case "count":
				return msa.visitorCount(period, numberOfIntervals);
			case "average":
				return msa.averageEnterToLeaveTime(period, numberOfIntervals);
			case "avgtimedistribution":
				return msa.averageEnterToLeaveTimeDistribution(period, numberOfIntervals, dwellTimeThresholds);
			case "freq":
				return msa.freqRatio(period, numberOfIntervals);
			case "bounce":
				return msa.bounceRate(period, numberOfIntervals, 0.75);
			default:
				throw new IllegalArgumentException("Request type is invalid: " + type);
			}
		}
	}

	@JSON(serialize = false) 
	public HttpServletRequest getServletRequest() {
		return request;
	}

	public HashMap<String, Number> getDataMap() {  
		return dataMap;  
	}

	@JSON(serialize = false)
	public HttpServletResponse getServletResponse() {
		return response;
	}

	@JSON(serialize = false)
	public int getInterval() {
		return interval;
	}

	@JSON(serialize = false)
	public int getStoreId() {
		return storeId;
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
	public String getUserMac() {
		return userMac;
	}

	@JSON(serialize = false)
	public String getType() {
		return type;
	}

	@JSON(serialize = false)
	public int[] getDwellTimeThresholds() {
		return dwellTimeThresholds;
	}

	@Override
	public void setServletRequest(HttpServletRequest request) {
		this.request = request;
	}

	@Override
	public void setServletResponse(HttpServletResponse response) {
		this.response = response;
	}

	public void setInterval(int interval) {
		this.interval = interval;
	}

	public void setStoreId(int storeId) {
		this.storeId = storeId;
	}

	public void setStart(long start) {
		this.start = start;
	}

	public void setEnd(long end) {
		this.end = end;
	}

	public void setUserMac(String userMac) {
		this.userMac = userMac;
	}

	public void setType(String type) {
		this.type = type.toLowerCase();
	}

	public void setDwellTimeThresholds(int[] dwellTimeThresholds) {
		this.dwellTimeThresholds = dwellTimeThresholds;
	}
}