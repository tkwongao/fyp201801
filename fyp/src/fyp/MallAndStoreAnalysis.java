package fyp;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Objects;
import java.util.OptionalInt;

public class MallAndStoreAnalysis extends DatabaseConnection {
	private static final byte WHOLE_MALL = -1;
	private static final short MILLISECONDS_TO_SECONDS = 1000;
	private final short maxLengthOfMovingAverage;
	private final int storeId;
	private final String mallId;

	/**
	 * 
	 * @param mallId
	 * @param storeId
	 */
	MallAndStoreAnalysis(String mallId, int storeId, short maxLengthOfMovingAverage) throws SQLException {
		this.mallId = mallId;
		this.storeId = storeId;
		this.maxLengthOfMovingAverage = maxLengthOfMovingAverage;
	}

	/**
	 * Connect the database to count the number of devices detected in the whole mall or
	 * a particular store in a certain period of time.
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds.
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @return A {@code int} representing the count in the specific time range..
	 */
	Integer[] visitorCount(final long[] period, short numberOfIntervals, final short lengthOfMovingAverage) {
		if (lengthOfMovingAverage >= maxLengthOfMovingAverage || lengthOfMovingAverage < 1)
			throw new IllegalArgumentException("Invalid Moving Average Length: " + lengthOfMovingAverage);
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		numberOfIntervals += lengthOfMovingAverage - 1;
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
				storeIdFilter = (storeId == WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?";
		String sql = "SELECT width_bucket(startts, ?, ?, ?), count(DISTINCT(did)) FROM " + dbName
				+ " WHERE startts BETWEEN ? AND ? " + storeIdFilter + " GROUP BY width_bucket;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setShort(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			if (storeId != WHOLE_MALL)
				ps.setInt(6, storeId);
			else
				ps.setString(6, mallId);
			Integer[] value = new Integer[numberOfIntervals];
			Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getShort("width_bucket") - 1] = rs.getInt("count");
			rs.close();
			return value;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}
	
	/**
	 * 
	 * @param period
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @return
	 */
	Number[] ouiDistribution(final long[] period, short numberOfIntervals, final short lengthOfMovingAverage) {
		if (lengthOfMovingAverage >= maxLengthOfMovingAverage || lengthOfMovingAverage < 1)
			throw new IllegalArgumentException("Invalid Moving Average Length: " + lengthOfMovingAverage);
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		numberOfIntervals += lengthOfMovingAverage - 1;
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
				storeIdFilter = (storeId == WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?";
		String sql = "SELECT " + 
				"  width_bucket, " + 
				"  coalesce, " + 
				"  count(*) " + 
				"FROM (SELECT " + 
				"        width_bucket, " + 
				"        coalesce(vendor, 'Unknown') " + 
				"      FROM oui\r\n" + 
				"        RIGHT OUTER JOIN (SELECT " + 
				"                            width_bucket, " + 
				"                            upper(substring(to_hex, 1, 6)) " + 
				"                          FROM (SELECT DISTINCT " + 
				"                                  width_bucket(startts, ?, ?, ?), " + 
				"                                  to_hex(did) " + 
				"                                FROM " + dbName + 
				"                                WHERE startts BETWEEN ? AND ? " + storeIdFilter + 
				"                                ORDER BY width_bucket) AS temp1) AS temp2 " + 
				"          ON upper = mac) AS temp3 " + 
				"GROUP BY width_bucket, coalesce " + 
				"ORDER BY width_bucket, coalesce;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setShort(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			if (storeId != WHOLE_MALL)
				ps.setInt(6, storeId);
			else
				ps.setString(6, mallId);
			@SuppressWarnings("unchecked")
			HashMap<String, Integer>[] value = new HashMap[numberOfIntervals];
			Arrays.fill(value, new HashMap<String, Integer>());
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getShort("width_bucket") - 1].put(rs.getString("coalesce").trim(), rs.getInt("count"));
			rs.close();
			// TODO Process the value array
			return null;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds.
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @return
	 */
	Double[] averageEnterToLeaveTime(final long[] period, short numberOfIntervals, final short lengthOfMovingAverage) {
		if (lengthOfMovingAverage >= maxLengthOfMovingAverage || lengthOfMovingAverage < 1)
			throw new IllegalArgumentException("Invalid Moving Average Length: " + lengthOfMovingAverage);
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		numberOfIntervals += lengthOfMovingAverage - 1;
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
				storeIdFilter = (storeId == WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?";
		String sql = "SELECT width_bucket(startts, ?, ?, ?), avg(endts - startts) FROM " + dbName
				+ " WHERE startts BETWEEN ? AND ? " + storeIdFilter + " GROUP BY width_bucket;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setShort(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			if (storeId != WHOLE_MALL)
				ps.setInt(6, storeId);
			else
				ps.setString(6, mallId);
			Double[] value = new Double[numberOfIntervals];
			Arrays.fill(value, 0.0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getShort("width_bucket") - 1] = rs.getDouble("avg") / MILLISECONDS_TO_SECONDS;
			return value;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds.
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @param thresholds
	 * @return
	 */
	Integer[] averageEnterToLeaveTimeDistribution(final long[] period, short numberOfIntervals, final short lengthOfMovingAverage, final int[] thresholds) {
		if (lengthOfMovingAverage >= maxLengthOfMovingAverage || lengthOfMovingAverage < 1)
			throw new IllegalArgumentException("Invalid Moving Average Length: " + lengthOfMovingAverage);
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		numberOfIntervals += lengthOfMovingAverage - 1;
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		boolean noThresholds = Objects.isNull(thresholds);
		OptionalInt minimumThreshold = null;
		if (!noThresholds) {
			minimumThreshold = Arrays.stream(thresholds).min();
			noThresholds |= !minimumThreshold.isPresent();
		}
		if (noThresholds)
			return visitorCount(period, numberOfIntervals, lengthOfMovingAverage);
		else if (minimumThreshold.getAsInt() < 0)
			throw new IllegalArgumentException("Illegal Threshold: " + minimumThreshold.getAsInt());
		final long[] thresholdsMsArr = Arrays.stream(thresholds).distinct().sorted().asLongStream().map(x -> x * 1000).toArray();
		String sql = "WITH arr AS (SELECT ARRAY" + Arrays.toString(thresholdsMsArr) + "::BIGINT[]),\n" + 
				"histogram AS (SELECT\n" + 
				"                     width_bucket(startts, ?, ?, ?),\n" + 
				"                     width_bucket((endts - startts), arr.array) AS dwell_time_distribution,\n" + 
				"                     min(endts - startts), max(endts - startts), count(DISTINCT (did))\n" + 
				"                   FROM " + ((storeId == WHOLE_MALL) ? "site_results" : "store_results") + ", arr\n" + 
				"                   WHERE startts BETWEEN ? AND ? " + ((storeId == WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?") + "\n" +
				"                   GROUP BY width_bucket, dwell_time_distribution)\n" + 
				"SELECT\n" + 
				"  width_bucket,\n" + 
				"  dwell_time_distribution,\n" + 
				"  coalesce(arr.array[dwell_time_distribution], min) AS min,\n" + 
				"  coalesce(arr.array[dwell_time_distribution + 1] - 1, max) AS max,\n" + 
				"  count\n" + 
				"FROM histogram, arr;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setShort(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			if (storeId != WHOLE_MALL)
				ps.setInt(6, storeId);
			else
				ps.setString(6, mallId);
			Integer[] value = new Integer[numberOfIntervals * (thresholdsMsArr.length + 1)];
			Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[(rs.getShort("width_bucket") - 1) * (thresholdsMsArr.length + 1) + rs.getInt("dwell_time_distribution")] = rs.getInt("count");
			return value;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds.
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @return
	 */
	private Double[] totalFreqRatio(final long[] period, final short numberOfIntervals, final short lengthOfMovingAverage) {
		if (numberOfIntervals != 1)
			throw new IllegalArgumentException("Trend for the ratio of frequent user is not yet supported.");
		if (lengthOfMovingAverage != 1)
			throw new IllegalArgumentException("The moving average for the ratio of frequent user is not yet supported.");
		String sql = "SELECT count(*) FROM (SELECT DISTINCT (did) FROM (SELECT did, startts / 604800000 AS weekId, startts / 86400000 AS day FROM site_results "
				+ "WHERE startts BETWEEN ? AND ? AND buildingid = ?) AS dataWithWeek GROUP BY did, weekId HAVING count(DISTINCT (day)) >= 3) AS freqUsers";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setString(3, mallId);
			Double[] value = new Double[numberOfIntervals];
			Arrays.fill(value, 0.0);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				Double ratio = rs.getDouble("count") * 100.0 / visitorCount(period, numberOfIntervals, lengthOfMovingAverage)[0];
				if (!ratio.isNaN() && !ratio.isInfinite())
					value[0] = ratio;
			}
			return value;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds.
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @return
	 */
	Double[] freqRatio(final long[] period, final short numberOfIntervals, final short lengthOfMovingAverage) {
		if (numberOfIntervals != 1)
			throw new IllegalArgumentException("Trend for the ratio of frequent user is not yet supported.");
		if (lengthOfMovingAverage != 1)
			throw new IllegalArgumentException("The moving average for the ratio of frequent user is not yet supported.");
		if (storeId == WHOLE_MALL)
			return totalFreqRatio(period, numberOfIntervals, lengthOfMovingAverage);
		String sql = "SELECT count(*) FROM (SELECT DISTINCT (did) FROM (SELECT did, startts / 604800000 AS weekId, startts / 86400000 AS day FROM store_results "
				+ "WHERE startts BETWEEN ? AND ? AND storeid = ?) AS dataWithWeek GROUP BY did, weekId HAVING count(DISTINCT (day)) >= 3) AS freqUsers";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, storeId);
			Double[] value = new Double[numberOfIntervals];
			Arrays.fill(value, 0.0);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				Double ratio = rs.getInt("count") * 100.0 / visitorCount(period, numberOfIntervals, lengthOfMovingAverage)[0];
				if (!ratio.isNaN() && !ratio.isInfinite())
					value[0] = ratio;
			}
			return value;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds.
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @param thresholdSD
	 * @return
	 */
	Double[] bounceRate(final long[] period, final short numberOfIntervals, final short lengthOfMovingAverage, final double thresholdSD) {
		if (numberOfIntervals != 1)
			throw new IllegalArgumentException("Checking bounce rate for multiple intervals is not yet supported.");
		if (lengthOfMovingAverage != 1)
			throw new IllegalArgumentException("The moving average for the bounce rate is not yet supported.");
		String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
				storeIdFilter = (storeId == WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?";
		String sql = "WITH cache AS (SELECT (endts - startts) / ? AS cache, did FROM " + dbName + " WHERE startts BETWEEN ? AND ? " + storeIdFilter + "),"
				+ "stat AS (SELECT avg(cache.cache) AS avg, count(*) FROM cache),"
				+ "sd AS (SELECT POWER(SUM(POWER(cache.cache - (SELECT avg FROM stat), 2)) / (SELECT count FROM stat), 0.5) FROM cache)"
				+ "SELECT count(DISTINCT(did)) FROM cache WHERE cache.cache < greatest(0, (SELECT avg FROM stat) - ? * (SELECT power FROM sd))";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setDouble(1, MILLISECONDS_TO_SECONDS);
			ps.setLong(2, period[0]);
			ps.setLong(3, period[1]);
			if (storeId != WHOLE_MALL)
				ps.setInt(4, storeId);
			else
				ps.setString(4, mallId);
			ps.setDouble(5, thresholdSD);
			Double[] value = new Double[numberOfIntervals];
			Arrays.fill(value, 0.0);
			ResultSet rs = ps.executeQuery();
			int bounceCount = 0;
			while (rs.next())
				bounceCount = rs.getInt("count");
			int count = visitorCount(period, numberOfIntervals, (short) 1)[0];
			if (count != 0)
				value[0] = bounceCount * 100.0 / count;
			return value;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}
}