package fyp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Objects;
import java.util.TimeZone;

public class Database {
	private Connection conn;
	private static final double MILLISECONDS_TO_SECONDS = 1000;
	public static final int[] FUTURE = {2099, 12, 31, 23, 59, 59},
			PAST = {2015, 1, 1, 0, 0, 0};

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
		conn.setAutoCommit(false);
		System.out.println("Connected to the PostgreSQL server successfully.");
	}

	/**
	 * Connect the database to count the number of devices detected in the whole mall in a certain period of time.
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @return A {@code int} representing the count in the specific time range.
	 * @throws SQLException if an error occurs on database operations.
	 */
	public int totalVisitorCount(final int[] start, final int[] end) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = "SELECT count(DISTINCT(DID)) FROM site_results WHERE startts BETWEEN ? AND ?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getInt("count");
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * Connect the database to count the number of devices detected in a particular store in a certain period of time.
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param storeID The ID of the store.
	 * @return A non-negative {@code int} representing the count in the specific time range.
	 * @throws SQLException if an error occurs on database operations.
	 */
	public int eachStoreVisitorCount(final int[] start, final int[] end, final int storeID) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = "SELECT count(DISTINCT(DID)) FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]); // Use parameterized statement to prevent SQL injection.
		ps.setLong(2, period[1]);
		ps.setInt(3, storeID);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getInt("count");
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @return
	 * @throws SQLException
	 */
	public double averageEnterToLeaveTimeInMall(final int[] start, final int[] end) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = ("SELECT avg(endts - startts) FROM site_results WHERE startts BETWEEN ? AND ?");
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getLong("avg") / MILLISECONDS_TO_SECONDS;
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	public double averageEnterToLeaveTimeInEachStore(final int[] start, final int[] end, final int storeId) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = ("SELECT avg(endts - startts) FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?");
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setInt(3, storeId);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getLong("avg") / MILLISECONDS_TO_SECONDS;
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @return
	 * @throws SQLException
	 */
	public double totalFreqRatio(final int[] start, final int[] end) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = "SELECT cast(freq.count AS DOUBLE PRECISION) /" + 
				"((SELECT count(DISTINCT (did)) FROM site_results WHERE startts BETWEEN ? AND ?) - freq.count) AS ratio FROM" + 
				"(SELECT count(*) FROM (SELECT DISTINCT (did) FROM (SELECT did, startts / 604800000 AS weekId, startts / 86400000 AS day FROM site_results " + 
				"WHERE startts BETWEEN ? AND ?) AS dataWithWeek GROUP BY did, weekId HAVING count(DISTINCT (day)) >= 3) AS freqUsers) AS freq";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, period[0]);
		ps.setLong(4, period[1]);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getDouble("ratio");
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	public double eachStoreFreqRatio(final int[] start, final int[] end, final int storeId) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = "SELECT cast(freq.count AS DOUBLE PRECISION) /" + 
				"((SELECT count(DISTINCT (did)) FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?) - freq.count) AS ratio FROM" + 
				"(SELECT count(*) FROM (SELECT DISTINCT (did) FROM (SELECT did, startts / 604800000 AS weekId, startts / 86400000 AS day FROM store_results " + 
				"WHERE startts BETWEEN ? AND ? AND storeid = ?) AS dataWithWeek GROUP BY did, weekId HAVING count(DISTINCT (day)) >= 3) AS freqUsers) AS freq";
		PreparedStatement ps = conn.prepareStatement(sql);
		for (int i = 0; i < 2; i++) {
			ps.setLong(3 * i + 1, period[0]);
			ps.setLong(3 * i + 2, period[1]);
			ps.setInt(3 * i + 3, storeId);
		}
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getDouble("ratio");
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param storeId The ID of the store.
	 * @param thresholdSD
	 * @return
	 * @throws SQLException
	 */
	public int bounceRate(final int[] start, final int[] end, final int storeId, final double thresholdSD) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = "WITH cache AS (SELECT (endts - startts) / ? AS cache FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?)," + 
				"stat AS (SELECT avg(cache) AS avg, count(*) FROM cache)," + 
				"sd AS (SELECT POWER(SUM(POWER(cache - (SELECT avg FROM stat), 2)) / (SELECT count FROM stat), 0.5) FROM cache)" + 
				"SELECT count(*) FROM cache WHERE cache < greatest(0, (SELECT avg FROM stat) - ? * (SELECT power FROM sd))";	
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setDouble(1, MILLISECONDS_TO_SECONDS);
		ps.setLong(2, period[0]);
		ps.setLong(3, period[1]);
		ps.setInt(4, storeId);
		ps.setDouble(5, thresholdSD);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getInt("count");
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param macAddress
	 * @return
	 * @throws SQLException
	 */
	public int userStayTimeInMall(final int[] start, final int[] end, final long macAddress) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = "SELECT sum(endts - startts) AS dwellTimeMs FROM site_results WHERE startts BETWEEN ? AND ? AND did = ?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, macAddress);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return (int) (rs.getLong("dwellTimeMs") / MILLISECONDS_TO_SECONDS);
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param macAddress
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	public int userStayTimeInEachStore(final int[] start, final int[] end, final long macAddress, final int storeId) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = ("SELECT sum(endts - startts) AS dwellTimeMs FROM store_results WHERE startts BETWEEN ? AND ? AND did = ? AND storeid = ?");
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, macAddress);
		ps.setInt(4, storeId);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return (int) (rs.getLong("dwellTimeMs") / MILLISECONDS_TO_SECONDS);
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param end The latest time the counted data could come from, as arrays of length 6 containing
	 * year, month, day, hour, minute, and second.
	 * @param macAddress
	 * @return
	 * @throws SQLException
	 */
	public int loyaltyCheck(final int[] start, final int[] end, final long macAddress) throws SQLException {
		Long[] period = time2Period(start, end);
		String sql = "SELECT count(storeid) FROM store_results WHERE startts BETWEEN ? AND ? AND did = ?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, macAddress);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getInt("count");
		throw new SQLException("No value was sent from the database.");
	}


	/**
	 * 
	 * @param start The start time of the period, as arrays of length 6 containing year, month, day, hour, minute, and second.
	 * @param end The end time of the period, as arrays of length 6 containing year, month, day, hour, minute, and second.
	 * @return
	 * @throws IllegalArgumentException
	 */
	public static Long[] time2Period(final int[] start, final int[] end) throws IllegalArgumentException{
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
	 * @param year The year. Cannot be {@code null}. If it is less than 2015, IllegalArgumentException will be thrown.
	 * @param month The month. If {@code null}, the period will contain the whole year.
	 * @param day The day. If {@code null}, the period will contain the whole month.
	 * @param hour The hour. If {@code null}, the period will contain the whole day.
	 * @param minute The minute. If {@code null}, the period will contain the whole hour.
	 * @param second The second. If {@code null}, the period will contain the whole minute.
	 * @return A {@code Long} array with length 2, with its first element the start time, and the second one the end time.
	 * The second element in the array is optional.
	 * @throws IllegalArgumentException if year is less than 2015, or either of year, month, day, hour, minute or second is out of valid range.
	 */
	public static Long[] time2Period(final Integer year, Integer month, final Integer day, final Integer hour, final Integer minute, final Integer second) throws IllegalArgumentException{
		Calendar c = new GregorianCalendar(TimeZone.getTimeZone("GMT+8:00"));
		c.clear();
		c.setLenient(false);
		Long[] time = new Long[2];
		if (Objects.nonNull(month))
			month--; // month -1 to fit with the month definition in the Calendar class.
		if (year < 2015)
			throw new IllegalArgumentException("Year too early: " + year); // The system was not there such early...... this means invalid data
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

	// Temporary method for testing
	public static void main(String[] args) throws SQLException {
		Database db = new Database();
		int[] start = {2017, 10, 23, 22, 0, 0}, end = {2017, 10, 23, 23, 0, 0};
		System.out.println(db.bounceRate(start, end, 1000001, 0.75));
	}
}