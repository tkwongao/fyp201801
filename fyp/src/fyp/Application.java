package fyp;

import java.io.IOException;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Enumeration;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts2.interceptor.ServletRequestAware;
import org.apache.struts2.interceptor.ServletResponseAware;
import org.apache.struts2.json.annotations.JSON;

import com.opensymphony.xwork2.ActionSupport;

public class Application extends ActionSupport implements ServletRequestAware, ServletResponseAware {
	private static final long serialVersionUID = -706028425927965519L;
	private static final ZonedDateTime PAST = ZonedDateTime.of(2015, 1, 1, 0, 0, 0, 0, ZoneId.of("Asia/Hong_Kong"));
	private HttpServletRequest request = null;
	private HttpServletResponse response = null;
	private HashMap<String, Number> dataMap = null;
	private short interval, lengthOfMovingAverage;
	private int storeId;
	private long start, end;
	private String mallId = null, type = null, userMac = null;
	private int[] dwellTimeThresholds = null;

	@Override
	public String execute() throws IOException, SQLException {
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
			if (lengthOfMovingAverage < 1)
				throw new IllegalArgumentException("Invalid Moving Average Length: " + lengthOfMovingAverage);
			ZonedDateTime startTime = ZonedDateTime.ofInstant(Instant.ofEpochMilli(start), ZoneId.of("Asia/Hong_Kong")),
					endTime = ZonedDateTime.ofInstant(Instant.ofEpochMilli(end), ZoneId.of("Asia/Hong_Kong"));
			short numberOfIntervals = 0;
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
			if (lengthOfMovingAverage > 1)
				startTime.minus(lengthOfMovingAverage - 1, internalInterval);
			if (startTime.isBefore(PAST)) // The system was not there such early...... this means invalid data
				throw new IllegalArgumentException("Start time too early: " + start);
			if (!startTime.isBefore(endTime) || !startTime.isBefore(endTimeForCompleteIntervals) || endTimeForCompleteIntervals.isAfter(endTime))
				throw new IllegalArgumentException("The start time must be earlier than the end time");
			dataMap = new HashMap<String, Number>();
			Number[] overallData = makeDatabaseRequest(startTime, endTime, (short) 1, (short) 1),
					eachIntervalData = makeDatabaseRequest(startTime, endTimeForCompleteIntervals, numberOfIntervals, lengthOfMovingAverage);
			for (int i = 0; i < overallData.length; i++) {
				if (overallData[i].doubleValue() < 0)
					throw new IllegalStateException("An error occurred during database access.");
				dataMap.put("dataPoint" + i, overallData[i]);
			}
			int prefixLength = overallData.length;
			for (int i = 0; i < eachIntervalData.length; i++) {
				if (eachIntervalData[i].doubleValue() < 0)
					throw new IllegalStateException("An error occurred during database access.");
				dataMap.put("dataPoint" + (i + prefixLength), eachIntervalData[i]);
			}
			if (isLastIntervalIncomplete) {
				int nextI = eachIntervalData.length + prefixLength;
				eachIntervalData = makeDatabaseRequest(endTimeForCompleteIntervals, endTime, (short) 1, lengthOfMovingAverage);
				if (eachIntervalData[0].doubleValue() < 0)
					throw new IllegalStateException("An error occurred during database access.");
				dataMap.put("dataPoint" + nextI, eachIntervalData[0]);
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

	/**
	 * 
	 * @param startTime
	 * @param endTime
	 * @param numberOfIntervals
	 * @return
	 * @throws SQLException 
	 * @throws ClassNotFoundException 
	 */
	private Number[] makeDatabaseRequest(ZonedDateTime startTime, ZonedDateTime endTime, short numberOfIntervals, short lengthOfMovingAverage) {
		long[] period = {startTime.toInstant().toEpochMilli(), endTime.toInstant().toEpochMilli()};
		switch (type) {
		case "user":
		case "loyalty":
		case "numofstore":
			try (UserAnalysis ua = new UserAnalysis(mallId, storeId, Long.parseLong(userMac.replaceAll(":", ""), 16))) {
				switch (type) {
				case "user":
					return ua.userStayTime(period, numberOfIntervals, lengthOfMovingAverage);
				case "loyalty":
					return ua.loyaltyCheck(period, numberOfIntervals, lengthOfMovingAverage);
				case "numofstore":
					return ua.numberOfStoresVisited(period, numberOfIntervals, lengthOfMovingAverage);
				default:
					throw new AssertionError("makeDatabaseRequest() type switch");
				}
			} catch (SQLException e) {
				throw new IllegalStateException("An error occurred during database access.", e);
			}
		default:
			Number[] value;
			try (MallAndStoreAnalysis msa = new MallAndStoreAnalysis(mallId, storeId, (short) 0x100)) {
				switch (type) {
				case "count":
					value = msa.visitorCount(period, numberOfIntervals, lengthOfMovingAverage);
					break;
				case "average":
					value = msa.averageEnterToLeaveTime(period, numberOfIntervals, lengthOfMovingAverage);
					break;
				case "avgtimedistribution":
					value = msa.averageEnterToLeaveTimeDistribution(period, numberOfIntervals, lengthOfMovingAverage, dwellTimeThresholds);
					break;
				case "freq":
					return msa.freqRatio(period, numberOfIntervals, lengthOfMovingAverage);
				case "bounce":
					return msa.bounceRate(period, numberOfIntervals, lengthOfMovingAverage, 0.6/*0.75*/); // For debugging purpose change to 0.6
				default:
					throw new IllegalArgumentException("Request type is invalid: " + type);
				}
			} catch (SQLException e) {
				throw new IllegalStateException("An error occurred during database access.", e);
			}
			if (lengthOfMovingAverage == 1)
				return value;
			double firstMovingSum = 0;
			for (short i = 0; i < lengthOfMovingAverage; i++)
				firstMovingSum += value[i].doubleValue();
			Double[] movingAverage = new Double[numberOfIntervals];
			movingAverage[0] = firstMovingSum;
			for (short i = 0; i < movingAverage.length - 1; i++)
				movingAverage[i + 1] = movingAverage[i] + value[i + lengthOfMovingAverage].doubleValue() - value[i].doubleValue();
			for (short i = 0; i < movingAverage.length; i++)
				movingAverage[i] /= lengthOfMovingAverage;
			return movingAverage;
		}
	}

	@JSON(serialize = false) 
	public HttpServletRequest getServletRequest() {
		return request;
	}

	@JSON(serialize = false)
	public HttpServletResponse getServletResponse() {
		return response;
	}

	public HashMap<String, Number> getDataMap() {  
		return dataMap;  
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
	public int getLengthOfMovingAverage() {
		return lengthOfMovingAverage;
	}

	@JSON(serialize = false)
	public String getMallId() {
		return mallId;
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

	public void setInterval(short interval) {
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

	public void setLengthOfMovingAverage(short lengthOfMovingAverage) {
		this.lengthOfMovingAverage = lengthOfMovingAverage;
	}

	public void setMallId(String mallId) {
		this.mallId = mallId;
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