package fyp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserAnalysis {
	private final long macAddress;
	private final Connection connection;

	/**
	 * @param macAddress
	 */
	UserAnalysis(Connection connection, long macAddress) {
		if (connection != DatabaseConnection.getConnection())
			throw new SecurityException("Unauthorized connection is being used");
		this.macAddress = macAddress;
		this.connection = connection;
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @param storeId The ID of the store.
	 * @return
	 * @throws SQLException
	 */
	int userStayTime(final long[] period, final int storeId) throws SQLException {
		String dbName = (storeId == MallAndStoreAnalysis.WHOLE_MALL) ? "site_results" : "store_results",
				sql = "SELECT sum(endts - startts) AS dwellTimeMs FROM " + dbName + " WHERE startts BETWEEN ? AND ? AND did = ?";
		if (storeId != MallAndStoreAnalysis.WHOLE_MALL)
			sql += " AND storeid = ?";
		PreparedStatement ps = connection.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, macAddress);
		if (storeId != MallAndStoreAnalysis.WHOLE_MALL)
			ps.setInt(4, storeId);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return (int) (rs.getLong("dwellTimeMs") / Utilities.MILLISECONDS_TO_SECONDS);
		throw new SQLException("No value was sent from the database.");
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds. 
	 * @return
	 * @throws SQLException
	 */
	int loyaltyCheck(final long[] period) throws SQLException {
		String sql = "SELECT count(storeid) FROM store_results WHERE startts BETWEEN ? AND ? AND did = ?";
		PreparedStatement ps = connection.prepareStatement(sql);
		ps.setLong(1, period[0]);
		ps.setLong(2, period[1]);
		ps.setLong(3, macAddress);
		ResultSet rs = ps.executeQuery();
		while (rs.next())
			return rs.getInt("count");
		throw new SQLException("No value was sent from the database.");
	}
}