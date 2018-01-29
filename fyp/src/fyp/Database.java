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
	private final String url;
	private final String user;
	private final String password;

	public Database() {
		this("jdbc:postgresql://143.89.50.151:7023/fypps", "fyp", "123456");
	}

	/**
	 * @param url The JDBC URL of the database
	 * @param user The username to access the database
	 * @param password The database password
	 */
	private Database(String url, String user, String password) {
		this.url = url;
		this.user = user;
		this.password = password;
	}

	/**
	 * Connect to the PostgreSQL database
	 *
	 * @return a Connection object
	 */
	public Connection connect() {
		Connection conn = null;
		try {
			Class.forName("org.postgresql.Driver");
			conn = DriverManager.getConnection(url, user, password);
			System.out.println("Connected to the PostgreSQL server successfully.");
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		return conn;
	}

	public int count() {
		int count = 0;
		String sql = "SELECT count(DISTINCT(did)) from store_results";
		Connection connected = this.connect();
		try {
			PreparedStatement ps = connected.prepareStatement(sql);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				count = rs.getInt("count");
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}

		try {
			System.out.println(peopleCounting(time2Period(2017, 10, 23, 22, null, null), null));
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return count;
	}

	/**
	 * Connect the database to count the number of devices detected in the whole mall or a particular store in a certain period of time.
	 * @param period The earliest and latest times the counted data could come from, as UTC milliseconds from the epoch.
	 * @param storeID The ID of the store. If <code>null</code>, the mall level data will be counted.
	 * @return A non-negative <code>int</code> representing the count in the specific time range.
	 * @throws SQLException if an error occurs on database operations.
	 */
	public int peopleCounting(final Long[] period, final Integer storeID) throws SQLException {
		if (Objects.isNull(period) || Objects.isNull(period[0]) || Objects.isNull(period[1]))
			throw new NullPointerException();
		long count = -1;
		String sql = (Objects.isNull(storeID)) ? 
				"SELECT count(DISTINCT(DID)) FROM site_results WHERE startts > ? AND startts < ?" :
					"SELECT count(DISTINCT(DID)) FROM store_results WHERE startts > ? AND startts < ? AND storeid = ?";
		PreparedStatement ps = this.connect().prepareStatement(sql);
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
	 * Convert a human-readable date to UTC milliseconds from the epoch, optionally as a period of a second, a minute, an hour,
	 * a day, a month or a year. The human-readable date is in GMT+8:00 (Hong Kong time) time zone.
	 * @param year The year. Cannot be <code>null</code>.
	 * @param month The month. If <code>null</code>, the period will contain the whole year.
	 * @param day The day. If <code>null</code>, the period will contain the whole month.
	 * @param hour The hour. If <code>null</code>, the period will contain the whole day.
	 * @param minute The minute. If <code>null</code>, the period will contain the whole hour.
	 * @param second The second. If <code>null</code>, the period will contain the whole minute.
	 * @return A <code>Long</code> array with length 2, with its first element the start time, and the second one the end time.
	 * The second element is optional.
	 */
	public Long[] time2Period(Integer year, Integer month, Integer day, Integer hour, Integer minute, Integer second) {
		Calendar c = new GregorianCalendar(TimeZone.getTimeZone("GMT+8:00"));
		c.clear();
		c.setLenient(false);
		Long[] time = new Long[2];
		if (Objects.nonNull(month))
			month--; // month -1 to fit with the month definition in the Calendar class.
		try {
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
		} catch (RuntimeException e) {
			e.printStackTrace();
		}
		return time;
	}

	public int stayTimeInMall(long macAddress) throws SQLException {
		int totalSecond = 0;
		String sql = "SELECT startts, endts FROM store_results WHERE did = ?";
		PreparedStatement ps = this.connect().prepareStatement(sql);
		ps.setLong(1, macAddress);
		ResultSet rs = ps.executeQuery();
		while (rs.next()) {
			long start = rs.getLong("startts"), end = rs.getLong("endts");
			totalSecond += (int) ((end - start) / 1000);
		}
		System.out.println(totalSecond + "seconds");
		return totalSecond;
	}

	public int LoyaltyCheck(long macAddress)
	{	
		int count = 0;
		try {
			ResultSet rs = this.connect().prepareStatement("SELECT count(storeid) FROM store_results WHERE did=" + macAddress).executeQuery();
			while (rs.next())
				count = rs.getInt("count");
			System.out.println(count);
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return count;
	}

	public int averageEnterToLeaveTimeInMall(){
		int totalSecond = 0;
		try {
			ResultSet rs = this.connect().prepareStatement("SELECT avg(endts-startts) FROM store_results").executeQuery();
			while (rs.next())
				totalSecond = rs.getInt("avg");
			System.out.println(totalSecond + "second");
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return totalSecond;
	}

	public int stayTimeInEachStore(long macAddress, int storeId)
	{
		int totalSecond = 0;	
		try {
			ResultSet rs = this.connect().prepareStatement("SELECT startts, endts FROM store_results WHERE did = " + macAddress + "AND storeid = " + storeId).executeQuery();
			while (rs.next()) {
				long start = rs.getLong("startts"), end = rs.getLong("endts");
				totalSecond += (end - start) / 1000;	
			}
			System.out.println(totalSecond + "second");    		
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return totalSecond;
	}

	public int bounceRate(double SD)
	{
		Database db = this;
		double count = 0;
		double squaredDifferences = 0;
		double mean = db.averageEnterToLeaveTimeInMall();
		double sd = 0;
		int bounceRateResult = 0;
		try {
			ResultSet rs = this.connect().prepareStatement("SELECT startts, endts FROM store_results").executeQuery();
			while (rs.next()) {
				Long start = rs.getLong("startts"), end = rs.getLong("endts");
				squaredDifferences += Math.pow((end - start) / 1000.0 - mean, 2);
				count++;
			}
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		sd = Math.sqrt(squaredDifferences / count);
		System.out.println(sd);
		double belowSD = mean - SD * sd;
		if (belowSD <= 0)
			belowSD = 0;
		System.out.println(belowSD);
		try {
			ResultSet rs = this.connect().prepareStatement("SELECT count(*) FROM store_results WHERE ((endts-startts)/1000) < " + belowSD).executeQuery();
			while (rs.next())
				bounceRateResult = rs.getInt("count");
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return bounceRateResult;
	}
}