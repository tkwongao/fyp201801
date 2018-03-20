package fyp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Objects;

public class UserAnalysis {
	private final String mallId;
	private final int storeId;
	private final long macAddress;
	private final Connection connection;
	private static final float NOT_MEANINGFUL = 0.5f;
	
	/**
	 * @param macAddress
	 */
	UserAnalysis(String mallId, int storeId, Connection connection, long macAddress) {
		if (Objects.requireNonNull(connection, "connection must not be null") != DatabaseConnection.getConnection())
			Objects.requireNonNull(connection = null, "Unauthorized connection is being used");
		switch (mallId) {
		case "base_1":
			this.mallId = mallId;
			this.storeId = storeId;
			this.macAddress = macAddress;
			this.connection = connection;
			break;
		default:
			throw new IllegalArgumentException("Unsupported Mall!");
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @return
	 */
	Integer[] userStayTime(final long[] period, final int numberOfIntervals) {
		try {
			String dbName = (storeId == MallAndStoreAnalysis.WHOLE_MALL) ? "site_results" : "store_results",
					storeIdFilter = (storeId == MallAndStoreAnalysis.WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?",
							sql = "SELECT width_bucket(startts, ?, ?, ?), sum(endts - startts) FROM " + dbName +
							" WHERE startts BETWEEN ? AND ? AND did = ? " + storeIdFilter + "GROUP BY width_bucket;";
			PreparedStatement ps = connection.prepareStatement(sql);
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			ps.setLong(6, macAddress);
			if (storeId != MallAndStoreAnalysis.WHOLE_MALL)
				ps.setInt(7, storeId);
			else
				ps.setString(7, mallId);
			Integer[] value = new Integer[numberOfIntervals];
			Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value[rs.getInt("width_bucket") - 1] = (int) (rs.getLong("sum") / Utilities.MILLISECONDS_TO_SECONDS);
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
	 * @return
	 */
	Integer[] loyaltyCheck(final long[] period, final int numberOfIntervals) {
		try {
			String dbName = (storeId == MallAndStoreAnalysis.WHOLE_MALL) ? "site_results" : "store_results",
					storeIdFilter = (storeId == MallAndStoreAnalysis.WHOLE_MALL) ? "AND buildingid = ?" : "AND storeid = ?";
			String sql = "SELECT width_bucket(startts, ?, ?, ?), count(*) FROM " + dbName +
					" WHERE startts BETWEEN ? AND ? AND did = ? " + storeIdFilter + " GROUP BY width_bucket;";
			PreparedStatement ps = connection.prepareStatement(sql);
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setInt(3, numberOfIntervals);
			ps.setLong(4, period[0]);
			ps.setLong(5, period[1]);
			ps.setLong(6, macAddress);
			if (storeId != MallAndStoreAnalysis.WHOLE_MALL)
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
			e.printStackTrace();
			return new Integer[] {-1};
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @return
	 */
	Number[] numberOfStoresVisited(final long[] period, final int numberOfIntervals) {
		try {
			if (storeId != MallAndStoreAnalysis.WHOLE_MALL) {
				Float[] value = new Float[numberOfIntervals];
				Arrays.fill(value, NOT_MEANINGFUL);
				return value;
			}
			String sql = "SELECT width_bucket(startts, ?, ?, ?), count(DISTINCT(storeid)) FROM store_results "
					+ "WHERE startts BETWEEN ? AND ? AND did = ? AND storeid IN (SELECT id FROM stores WHERE areaid = ?) "
					+ "GROUP BY width_bucket;";
			PreparedStatement ps = connection.prepareStatement(sql);
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
			e.printStackTrace();
			return new Integer[] {-1};
		}
	}
}