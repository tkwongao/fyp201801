package fyp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Objects;

public class MallAndStoreAnalysis {
	static final int WHOLE_MALL = -1;
	private final int storeId;
	private final Connection connection;

	/**
	 * @param storeId
	 * @param connection
	 */
	MallAndStoreAnalysis(int storeId, Connection connection) {
		if (Objects.requireNonNull(connection, "connection must not be null") != DatabaseConnection.getConnection())
			Objects.requireNonNull(connection = null, "Unauthorized connection is being used");
		this.storeId = storeId;
		this.connection = connection;
	}

	/**
	 * Connect the database to count the number of devices detected in the whole mall or
	 * a particular store in a certain period of time.
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @return A {@code int} representing the count in the specific time range. -1 means that a database error has occurred.
	 */
	Integer[] visitorCount(final long[] period, final int numberOfIntervals) {
		try {
			String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
					storeIdFilter = (storeId == WHOLE_MALL) ? "" : "AND storeid = ? ",
							sql = "SELECT width_bucket(startts, ?, ?, ?), count(DISTINCT(did)) FROM " + dbName
							+ " WHERE startts BETWEEN ? AND ? " + storeIdFilter + "GROUP BY width_bucket;";
			PreparedStatement ps = connection.prepareStatement(sql);
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			if (storeId != WHOLE_MALL)
				ps.setInt(6, storeId);
			Integer[] value = new Integer[numberOfIntervals];
			Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getInt("width_bucket") - 1] = rs.getInt("count");
			return value;
		} catch (SQLException e) {
			e.printStackTrace();
			return new Integer[] {-1};
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @return
	 */
	Double[] averageEnterToLeaveTime(final long[] period, final int numberOfIntervals) {
		try {
			String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
					storeIdFilter = (storeId == WHOLE_MALL) ? "" : "AND storeid = ? ",
							sql = "SELECT width_bucket(startts, ?, ?, ?), avg(endts - startts) FROM " + dbName
							+ " WHERE startts BETWEEN ? AND ? " + storeIdFilter + "GROUP BY width_bucket;";
			if (storeId != WHOLE_MALL)
				sql += " AND storeid = ?";
			PreparedStatement ps = connection.prepareStatement(sql);
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			if (storeId != WHOLE_MALL)
				ps.setInt(6, storeId);
			Double[] value = new Double[numberOfIntervals];
			Arrays.fill(value, (double) 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getInt("width_bucket") - 1] = rs.getLong("avg") / Utilities.MILLISECONDS_TO_SECONDS;
			return value;
		} catch (SQLException e) {
			e.printStackTrace();
			return new Double[] {(double) -1};
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @return
	 */
	private Double[] totalFreqRatio(final long[] period, final int numberOfIntervals) {
		try {
			if (numberOfIntervals != 1)
				throw new IllegalArgumentException("Trend for the ratio of frequent user is not yet supported.");
			String sql = "SELECT cast(freq.count AS DOUBLE PRECISION) /"
					+ "((SELECT count(DISTINCT (did)) FROM site_results WHERE startts BETWEEN ? AND ?) - freq.count) AS ratio FROM"
					+ "(SELECT count(*) FROM (SELECT DISTINCT (did) FROM (SELECT did, startts / 604800000 AS weekId, startts / 86400000 AS day FROM site_results "
					+ "WHERE startts BETWEEN ? AND ?) AS dataWithWeek GROUP BY did, weekId HAVING count(DISTINCT (day)) >= 3) AS freqUsers) AS freq";
			PreparedStatement ps = connection.prepareStatement(sql);
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setLong(3, period[0]);
			ps.setLong(4, period[1]);
			Double[] value = new Double[numberOfIntervals];
			Arrays.fill(value, (double) 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[0] = rs.getDouble("ratio");
			return value;
		} catch (SQLException e) {
			e.printStackTrace();
			return new Double[] {(double) -1};
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
			return new Double[] {(double) -2};
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @return
	 */
	Double[] freqRatio(final long[] period, final int numberOfIntervals) {
		try {
			if (numberOfIntervals != 1)
				throw new IllegalArgumentException("Trend for the ratio of frequent user is not yet supported.");
			if (storeId == WHOLE_MALL)
				return totalFreqRatio(period, numberOfIntervals);
			String sql = "SELECT cast(freq.count AS DOUBLE PRECISION) /"
					+ "((SELECT count(DISTINCT (did)) FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?) - freq.count) AS ratio FROM"
					+ "(SELECT count(*) FROM (SELECT DISTINCT (did) FROM (SELECT did, startts / 604800000 AS weekId, startts / 86400000 AS day FROM store_results "
					+ "WHERE startts BETWEEN ? AND ? AND storeid = ?) AS dataWithWeek GROUP BY did, weekId HAVING count(DISTINCT (day)) >= 3) AS freqUsers) AS freq";
			PreparedStatement ps = connection.prepareStatement(sql);
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, storeId);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			ps.setInt(6, storeId);
			Double[] value = new Double[numberOfIntervals];
			Arrays.fill(value, (double) 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[0] = rs.getDouble("ratio");
			return value;
		} catch (SQLException e) {
			e.printStackTrace();
			return new Double[] {(double) -1};
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
			return new Double[] {(double) -2};
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @param thresholdSD
	 * @return
	 */
	Integer[] bounceRate(final long[] period, final int numberOfIntervals, final double thresholdSD) {
		try {
			if (numberOfIntervals != 1)
				throw new IllegalArgumentException("Checking bounce rate for multiple intervals is not yet supported.");
			if (storeId == WHOLE_MALL)
				throw new IllegalArgumentException("Checking bounce rate for the whole mall is not yet supported.");
			String sql = "WITH cache AS (SELECT (endts - startts) / ? AS cache FROM store_results WHERE startts BETWEEN ? AND ? AND storeid = ?),"
					+ "stat AS (SELECT avg(cache) AS avg, count(*) FROM cache),"
					+ "sd AS (SELECT POWER(SUM(POWER(cache - (SELECT avg FROM stat), 2)) / (SELECT count FROM stat), 0.5) FROM cache)"
					+ "SELECT count(*) FROM cache WHERE cache < greatest(0, (SELECT avg FROM stat) - ? * (SELECT power FROM sd))";
			PreparedStatement ps = connection.prepareStatement(sql);
			ps.setDouble(1, Utilities.MILLISECONDS_TO_SECONDS);
			ps.setLong(2, period[0]);
			ps.setLong(3, period[1]);
			ps.setInt(4, storeId);
			ps.setDouble(5, thresholdSD);
			Integer[] value = new Integer[numberOfIntervals];
			Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getInt("width_bucket") - 1] = rs.getInt("count");
			return value;
		} catch (SQLException e) {
			e.printStackTrace();
			return new Integer[] {-1};
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
			return new Integer[] {-2};
		}
	}
}