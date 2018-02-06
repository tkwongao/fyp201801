package fyp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.GregorianCalendar;

public class DatabaseConnection {
	private Connection conn;
	private static final double MILLISECONDS_TO_SECONDS = 1000;
	public static final GregorianCalendar PAST = new GregorianCalendar(2015, 0, 1, 0, 0, 0),
			FUTURE = new GregorianCalendar(2099, 12, 31, 23, 59, 59);
			
	public DatabaseConnection() {
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @return A {@code int} representing the count in the specific time range.
	 * @throws SQLException if an error occurs on database operations.
	 */
	public int totalVisitorCount(final GregorianCalendar start, final GregorianCalendar end) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param storeId The ID of the store.
	 * @return A non-negative {@code int} representing the count in the specific time range.
	 * @throws SQLException if an error occurs on database operations.
	 */
	public int eachStoreVisitorCount(final GregorianCalendar start, final GregorianCalendar end, final int storeId) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
		String sql = "SELECT count(DISTINCT(DID)) FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?";
		PreparedStatement ps = conn.prepareStatement(sql);
		ps.setLong(1, period[0]); // Use parameterized statement to prevent SQL injection.
		ps.setLong(2, period[1]);
		ps.setInt(3, storeId);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getInt("count");
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @return
	 * @throws SQLException
	 */
	public double averageEnterToLeaveTimeInMall(final GregorianCalendar start, final GregorianCalendar end) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	public double averageEnterToLeaveTimeInEachStore(final GregorianCalendar start, final GregorianCalendar end, final int storeId) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @return
	 * @throws SQLException
	 */
	public double totalFreqRatio(final GregorianCalendar start, final GregorianCalendar end) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	public double eachStoreFreqRatio(final GregorianCalendar start, final GregorianCalendar end, final int storeId) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param storeId The ID of the store.
	 * @param thresholdSD
	 * @return
	 * @throws SQLException
	 */
	public int bounceRate(final GregorianCalendar start, final GregorianCalendar end, final int storeId, final double thresholdSD) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param macAddress
	 * @return
	 * @throws SQLException
	 */
	public int userStayTimeInMall(final GregorianCalendar start, final GregorianCalendar end, final long macAddress) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param macAddress
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	public int userStayTimeInEachStore(final GregorianCalendar start, final GregorianCalendar end, final long macAddress, final int storeId) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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
	 * @param start The earliest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param end The latest time the counted data could come from, as {@code GregorianCalendar} objects. 
	 * @param macAddress
	 * @return
	 * @throws SQLException
	 */
	public int loyaltyCheck(final GregorianCalendar start, final GregorianCalendar end, final long macAddress) throws SQLException {
		Long[] period = Utilities.timeToPeriod(start, end);
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

	// Temporary method for testing
	public static void main(String[] args) throws SQLException {
		System.out.println(new DatabaseConnection().bounceRate(PAST, FUTURE, 1000001, 0.75));
	}
}