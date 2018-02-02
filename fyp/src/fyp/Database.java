package fyp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Objects;
import java.util.TimeZone;

public class Database {
	private Connection conn;

	public Database() {
		try {
			connect("jdbc:postgresql://143.89.50.151:7023/fypps", "fyp", "123456");
		} catch (ClassNotFoundException | SQLException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Connect to the PostgreSQL database at {@code url}, using user name specified in {@code user} and password specified in {@code password}
	 * @param url The JDBC URL of the database
	 * @param user The user name to access the database
	 * @param password The database password
	 * @throws SQLException if an error occurs on database operations.
	 * @throws ClassNotFoundException if the PostgreSQL Driver is not found.
	 */
	private void connect(String url, String user, String password) throws SQLException, ClassNotFoundException {
		Class.forName("org.postgresql.Driver");
		conn = DriverManager.getConnection(url, user, password);
		System.out.println("Connected to the PostgreSQL server successfully.");
	}

	/**
	 * Connect the database to count the number of devices detected in the whole mall or a particular store in a certain period of time.
	 * @param period The earliest and latest times the counted data could come from, as UTC milliseconds from the epoch.
	 * @param storeID The ID of the store. If {@code null}, the mall level data will be counted.
	 * @return A non-negative {@code int} representing the count in the specific time range.
	 * @throws SQLException if an error occurs on database operations.
	 */
	public int peopleCounting(final int[] start, final int[] end, final Integer storeID) throws SQLException {
		Long[] period = time2Period(start, end);
		if (Objects.isNull(period) || Objects.isNull(period[0]) || Objects.isNull(period[1]))
			throw new NullPointerException();
		long count = -1;
		String sql = (Objects.isNull(storeID)) ? 
				"SELECT count(DISTINCT(DID)) FROM site_results WHERE startts > ? AND startts < ?" :
					"SELECT count(DISTINCT(DID)) FROM store_results WHERE startts > ? AND startts < ? AND storeid = ?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]); // Use parameterized statement to prevent SQL injection.
		ps.setLong(2, period[1]);
		if (Objects.nonNull(storeID))
			ps.setInt(3, storeID);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			count = rs.getLong("count");
		if (count < 0)
			throw new SQLException("Some exceptions have occurred.");
		return (int) count;
	}

	/**
	 * 
	 * @param start
	 * @param end
	 * @param macAddress
	 * @return
	 * @throws SQLException
	 */
	public int stayTimeInMall(final int[] start, final int[] end, final long macAddress) throws SQLException {
		Long[] period = time2Period(start, end);
		if (Objects.isNull(period) || Objects.isNull(period[0]) || Objects.isNull(period[1]))
			throw new NullPointerException();
		double totalSecond = 0;
		String sql = "SELECT endts - startts AS dwellTimeMs FROM store_results WHERE startts > ? AND startts < ? AND did = ?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, macAddress);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			totalSecond += rs.getLong("dwellTimeMs") / 1000.0;
		System.out.println(totalSecond + "seconds");
		return (int) totalSecond;
	}

	/**
	 * 
	 * @param start
	 * @param end
	 * @param macAddress
	 * @param storeId
	 * @return
	 * @throws SQLException
	 */
	public int stayTimeInEachStore(final int[] start, final int[] end, final long macAddress, final int storeId) throws SQLException {
		Long[] period = time2Period(start, end);
		if (Objects.isNull(period) || Objects.isNull(period[0]) || Objects.isNull(period[1]))
			throw new NullPointerException();
		double totalSecond = 0;
		String sql = ("SELECT endts - startts AS dwellTimeMs FROM store_results WHERE startts > ? AND startts < ? AND did = ? AND storeid = ?");
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, macAddress);
		ps.setInt(4, storeId);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			totalSecond += rs.getLong("dwellTimeMs") / 1000.0;
		System.out.println(totalSecond + " seconds");
		return (int) totalSecond;
	}

	/**
	 * 
	 * @param start
	 * @param end
	 * @return
	 * @throws SQLException
	 */
	public double averageEnterToLeaveTimeInMall(final int[] start, final int[] end) throws SQLException {
		Long[] period = time2Period(start, end);
		if (Objects.isNull(period) || Objects.isNull(period[0]) || Objects.isNull(period[1]))
			throw new NullPointerException();
		double totalSecond = 0;
		String sql = ("SELECT avg(endts - startts) FROM store_results WHERE startts > ? AND startts < ?");
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			totalSecond = rs.getLong("avg") / 1000.0;
		System.out.println(totalSecond + " seconds");
		return totalSecond;
	}

	/**
	 * 
	 * @param start
	 * @param end
	 * @param thresholdSD
	 * @return
	 * @throws SQLException
	 */
	public int bounceRate(final int[] start, final int[] end, final double thresholdSD) throws SQLException {
		Long[] period = time2Period(start, end);
		if (Objects.isNull(period) || Objects.isNull(period[0]) || Objects.isNull(period[1]))
			throw new NullPointerException();
		double sd = 0, squaredDifferences = 0;
		double mean = averageEnterToLeaveTimeInMall(start, end);
		int count = 0;
		ArrayList<Double> dwellTimeList = new ArrayList<Double>();
		String sql = ("SELECT endts - startts AS dwellTimeMs FROM store_results WHERE startts > ? AND startts < ?");
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ResultSet rs = ps.executeQuery();
		while (rs.next()) {
			double dwellTimeSeconds = rs.getLong("dwellTimeMs") / 1000.0;
			dwellTimeList.add(dwellTimeSeconds);
			squaredDifferences += Math.pow(dwellTimeSeconds - mean, 2);
			count++;
		}
		sd = Math.sqrt(squaredDifferences / count);
		final double belowSD = Math.max(0, mean - thresholdSD * sd);
		System.out.println("Standard derivation: " + sd + ", " + thresholdSD + " standard derivations below mean: " + belowSD);
		return dwellTimeList.stream().filter(e -> e < belowSD).toArray().length; // Same as what did by count(*), count elements < belowSD
	}

	/**
	 * 
	 * @param start
	 * @param end
	 * @param macAddress
	 * @return
	 * @throws SQLException
	 */
	public int LoyaltyCheck(final int[] start, final int[] end, final long macAddress) throws SQLException {
		Long[] period = time2Period(start, end);
		if (Objects.isNull(period) || Objects.isNull(period[0]) || Objects.isNull(period[1]))
			throw new NullPointerException();
		int count = 0;
		String sql = "SELECT count(storeid) FROM store_results WHERE startts > ? AND startts < ? AND did = ?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, macAddress);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			count = rs.getInt("count");
		System.out.println(count);
		return count;
	}

	/**
	 * 
	 * @param start
	 * @param end
	 * @return
	 * @throws SQLException
	 */
	public double freqRatio(final int[] start, final int[] end) throws SQLException {
		Long[] period = time2Period(start, end);
		if (Objects.isNull(period) || Objects.isNull(period[0]) || Objects.isNull(period[1]))
			throw new NullPointerException();
		int freqRatio = 0, infreqRatio = 0;
		String sqlFreq = "(SELECT count(did) FROM store_results WHERE startts > ? AND startts < ? GROUP BY did HAVING count(did) >= 15) AS freq",
				sqlInfreq = "(SELECT count(did) FROM store_results WHERE startts > ? AND startts < ? GROUP BY did HAVING count(did) < 15) AS infreq",
		sql1 = "SELECT count(*) AS ratio1 FROM " + sqlFreq, sql2 = "SELECT count(*) AS ratio2 FROM " + sqlInfreq;
		PreparedStatement ps1 = conn.prepareStatement(sql1), ps2 = conn.prepareStatement(sql2);
		ps1.setLong(1, period[0]);
		ps1.setLong(2, period[1]);
		ps2.setLong(1, period[0]);
		ps2.setLong(2, period[1]);
		ResultSet rs1 = ps1.executeQuery(), rs2 = ps2.executeQuery();
		while (rs1.next())
			freqRatio = rs1.getInt("ratio1");
		while (rs2.next())
			infreqRatio = rs2.getInt("ratio2");
		return (double) freqRatio / infreqRatio;
	}

	/**
	 * 
	 * @param start
	 * @param end
	 * @return
	 */
	public Long[] time2Period(final int[] start, final int[] end) {
		if (start.length != 6 || end.length != 6)
			throw new IllegalArgumentException("The length of start and end time array must be 6");
		Long[] period = {time2Period(start[0], start[1], start[2], start[3], start[4], start[5])[0],
				time2Period(end[0], end[1], end[2], end[3], end[4], end[5])[0]};
		if (period[0] >= period[1])
			throw new IllegalArgumentException("The starting time must be earlier than the end time");
		return period;
	}

	/**
	 * Convert a human-readable date to UTC milliseconds from the epoch, optionally as a period of a second, a minute, an hour,
	 * a day, a month or a year. The human-readable date is in GMT+8:00 (Hong Kong time) time zone.
	 * @param year The year. Cannot be {@code null}.
	 * @param month The month. If {@code null}, the period will contain the whole year.
	 * @param day The day. If {@code null}, the period will contain the whole month.
	 * @param hour The hour. If {@code null}, the period will contain the whole day.
	 * @param minute The minute. If {@code null}, the period will contain the whole hour.
	 * @param second The second. If {@code null}, the period will contain the whole minute.
	 * @return A {@code Long} array with length 2, with its first element the start time, and the second one the end time.
	 * The second element is optional.
	 */
	public Long[] time2Period(final Integer year, Integer month, final Integer day, final Integer hour, final Integer minute, final Integer second) {
		Calendar c = new GregorianCalendar(TimeZone.getTimeZone("GMT+8:00"));
		c.clear();
		c.setLenient(false);
		Long[] time = new Long[2];
		if (Objects.nonNull(month))
			month--; // month -1 to fit with the month definition in the Calendar class.
		// throws IllegalArgumentException if year, month, day, hour, minute or second is out of range.
		if (year < 2015)
			throw new IllegalArgumentException(year.toString()); // The system was not there such early...... this means invalid data
		if (Objects.nonNull(second)) {
			c.set(year, month, day, hour, minute, second);
			time[0] = c.getTimeInMillis(); 
			c.add(Calendar.SECOND, 1);
		} else if (Objects.nonNull(minute)) {
			c.set(year, month, day, hour, minute, 0);
			time[0] = c.getTimeInMillis(); 
			c.add(Calendar.MINUTE, 1);
		} else if (Objects.nonNull(hour)) {
			c.set(year, month, day, hour, 0, 0);
			time[0] = c.getTimeInMillis(); 
			c.add(Calendar.HOUR_OF_DAY, 1);
		} else if (Objects.nonNull(day)) {
			c.set(year, month, day, 0, 0, 0);
			time[0] = c.getTimeInMillis(); 
			c.add(Calendar.DAY_OF_YEAR, 1);
		} else if (Objects.nonNull(month)) {
			c.set(year, month, 0, 0, 0, 0);
			time[0] = c.getTimeInMillis(); 
			c.add(Calendar.MONTH, 1);
		} else if (Objects.nonNull(year)) {
			c.set(year, 0, 0, 0, 0, 0);
			time[0] = c.getTimeInMillis(); 
			c.add(Calendar.YEAR, 1);
		} else
			throw new NullPointerException();
		time[1] = c.getTimeInMillis();
		return time;
	}

	// Temporary method
	public int count() throws SQLException {
		int count = 0;
		String sql = "SELECT count(DISTINCT(did)) from store_results";
		PreparedStatement ps = conn.prepareStatement(sql);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			count = rs.getInt("count");
		return count;
	}

	// Temporary method for testing
	public static void main(String[] args) throws SQLException {
		Database db = new Database();
		int[] start = {2017, 10, 23, 22, 0, 0}, end = {2017, 10, 23, 23, 0, 0};
		System.out.println(db.peopleCounting(start, end, null));
		System.out.println(db.bounceRate(start, end, 0.75));
	}
}