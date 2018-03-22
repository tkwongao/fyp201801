package fyp;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;

public class UserAnalysis extends DatabaseConnection {
	private static final byte WHOLE_MALL = -1;
	private static final float NOT_MEANINGFUL = 0.5f;
	private static final double MILLISECONDS_TO_SECONDS = 1000;
	private final int storeId;
	private final long macAddress;
	private final String mallId;

	/**
	 * 
	 * @param mallId
	 * @param storeId
	 * @param macAddress
	 */
	UserAnalysis(String mallId, int storeId, long macAddress) throws SQLException {
		this.mallId = mallId;
		this.storeId = storeId;
		this.macAddress = macAddress;
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds.
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @return
	 */
	Integer[] userStayTime(final long[] period, final short numberOfIntervals, final short lengthOfMovingAverage) {
		if (lengthOfMovingAverage != 1)
			throw new IllegalArgumentException("The moving average for the user stay time is not yet supported.");
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
				storeIdFilter = (storeId == WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?",
						sql = "SELECT width_bucket(startts, ?, ?, ?), sum(endts - startts) FROM " + dbName +
						" WHERE startts BETWEEN ? AND ? AND did = ? " + storeIdFilter + "GROUP BY width_bucket;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			ps.setLong(6, macAddress);
			if (storeId != WHOLE_MALL)
				ps.setInt(7, storeId);
			else
				ps.setString(7, mallId);
			Integer[] value = new Integer[numberOfIntervals];
			Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getInt("width_bucket") - 1] = (int) (rs.getLong("sum") / MILLISECONDS_TO_SECONDS);
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
	Integer[] loyaltyCheck(final long[] period, final short numberOfIntervals, final short lengthOfMovingAverage) {
		if (lengthOfMovingAverage != 1)
			throw new IllegalArgumentException("The moving average for the user loyalty is not yet supported.");
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		String dbName = (storeId == WHOLE_MALL) ? "site_results" : "store_results",
				storeIdFilter = (storeId == WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?";
		String sql = "SELECT width_bucket(startts, ?, ?, ?), count(*) FROM " + dbName +
				" WHERE startts BETWEEN ? AND ? AND did = ? " + storeIdFilter + " GROUP BY width_bucket;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			ps.setLong(6, macAddress);
			if (storeId != WHOLE_MALL)
				ps.setInt(7, storeId);
			else
				ps.setString(7, mallId);
			Integer[] value = new Integer[numberOfIntervals];
			Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getInt("width_bucket") - 1] = rs.getInt("count");
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
	Number[] numberOfStoresVisited(final long[] period, final short numberOfIntervals, final short lengthOfMovingAverage) {
		if (lengthOfMovingAverage != 1)
			throw new IllegalArgumentException("The moving average for the number of stores visited by a user is not yet supported.");
		if (numberOfIntervals <= 0)
			throw new IllegalArgumentException("Invalid number of intervals: " + numberOfIntervals);
		if (storeId != WHOLE_MALL) {
			Float[] value = new Float[numberOfIntervals];
			Arrays.fill(value, NOT_MEANINGFUL);
			return value;
		}
		String sql = "SELECT width_bucket(startts, ?, ?, ?), count(DISTINCT(storeid)) FROM store_results "
				+ "WHERE startts BETWEEN ? AND ? AND did = ? AND storeid IN (SELECT id FROM stores WHERE areaid = ?) "
				+ "GROUP BY width_bucket;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			ps.setLong(6, macAddress);
			ps.setString(7, mallId);
			Integer[] value = new Integer[numberOfIntervals];
			Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getInt("width_bucket") - 1] = rs.getInt("count");
			return value;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}
}