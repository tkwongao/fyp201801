package fyp;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;

public class KMeans extends DatabaseConnection {
	private final int storeId;
	private final long macAddress;
	private final String mallId;

	/**
	 * 
	 * @param mallId
	 * @param storeId
	 * @param macAddress
	 */
	KMeans(String mallId, int storeId, long macAddress) throws SQLException {
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