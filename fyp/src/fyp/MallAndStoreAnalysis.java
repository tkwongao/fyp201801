package fyp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class MallAndStoreAnalysis {
	static final int WHOLE_MALL = -1;
	private final int storeId;
	private final Connection connection;

	/**
	 * @param storeId
	 * @param connection
	 */
	MallAndStoreAnalysis(int storeId, Connection connection) {
		if (connection != DatabaseConnection.getConnection())
			throw new SecurityException("Unauthorized connection is being used");
		this.storeId = storeId;
		this.connection = connection;
	}

	/**
	 * Connect the database to count the number of devices detected in the whole mall or
	 * a particular store in a certain period of time.
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @return A non-negative {@code int} representing the count in the specific time range.
	 * @throws SQLException if an error occurs on database operations.
	 */
	int VisitorCount(final long[] period) throws SQLException {
		String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
				sql = "SELECT count(DISTINCT(DID)) FROM " + dbName + " WHERE startts BETWEEN ? AND ?";
		if (storeId != WHOLE_MALL)
			sql += " AND storeid = ?";
		PreparedStatement ps = connection.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		if (storeId != WHOLE_MALL)
			ps.setInt(3, storeId);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getInt("count");
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	double averageEnterToLeaveTime(final long[] period) throws SQLException {
		String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
				sql = "SELECT avg(endts - startts) FROM " + dbName + " WHERE startts BETWEEN ? AND ?";
		if (storeId != WHOLE_MALL)
			sql += " AND storeid = ?";
		PreparedStatement ps = connection.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		if (storeId != WHOLE_MALL)
			ps.setInt(3, storeId);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getLong("avg") / Utilities.MILLISECONDS_TO_SECONDS;
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @return
	 * @throws SQLException
	 */
	private double totalFreqRatio(final long[] period) throws SQLException {
		String sql = "SELECT cast(freq.count AS DOUBLE PRECISION) /" + 
				"((SELECT count(DISTINCT (did)) FROM site_results WHERE startts BETWEEN ? AND ?) - freq.count) AS ratio FROM" + 
				"(SELECT count(*) FROM (SELECT DISTINCT (did) FROM (SELECT did, startts / 604800000 AS weekId, startts / 86400000 AS day FROM site_results " + 
				"WHERE startts BETWEEN ? AND ?) AS dataWithWeek GROUP BY did, weekId HAVING count(DISTINCT (day)) >= 3) AS freqUsers) AS freq";
		PreparedStatement ps = connection.prepareStatement(sql);
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
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	double freqRatio(final long[] period) throws SQLException {
		if (storeId == WHOLE_MALL)
			return totalFreqRatio(period);
		String sql = "SELECT cast(freq.count AS DOUBLE PRECISION) /" + 
				"((SELECT count(DISTINCT (did)) FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?) - freq.count) AS ratio FROM" + 
				"(SELECT count(*) FROM (SELECT DISTINCT (did) FROM (SELECT did, startts / 604800000 AS weekId, startts / 86400000 AS day FROM store_results " + 
				"WHERE startts BETWEEN ? AND ? AND storeid = ?) AS dataWithWeek GROUP BY did, weekId HAVING count(DISTINCT (day)) >= 3) AS freqUsers) AS freq";
		PreparedStatement ps = connection.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setInt(3, storeId);
		ps.setLong(4, period[0]);
		ps.setLong(5, period[1]);
		ps.setInt(6, storeId);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getDouble("ratio");
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @param thresholdSD
	 * @return
	 * @throws SQLException
	 */
	int bounceRate(final long[] period, final double thresholdSD) throws SQLException {
		if (storeId == WHOLE_MALL)
			throw new IllegalArgumentException("Checking bounce rate for the whole mall is not yer supported.");
		String sql = "WITH cache AS (SELECT (endts - startts) / ? AS cache FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?)," + 
				"stat AS (SELECT avg(cache) AS avg, count(*) FROM cache)," + 
				"sd AS (SELECT POWER(SUM(POWER(cache - (SELECT avg FROM stat), 2)) / (SELECT count FROM stat), 0.5) FROM cache)" + 
				"SELECT count(*) FROM cache WHERE cache < greatest(0, (SELECT avg FROM stat) - ? * (SELECT power FROM sd))";	
		PreparedStatement ps = connection.prepareStatement(sql);
		ps.setDouble(1, Utilities.MILLISECONDS_TO_SECONDS);
		ps.setLong(2, period[0]);
		ps.setLong(3, period[1]);
		ps.setInt(4, storeId);
		ps.setDouble(5, thresholdSD);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getInt("count");
		throw new SQLException("No value was sent from the database.");
	}
}