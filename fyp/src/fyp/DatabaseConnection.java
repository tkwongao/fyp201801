package fyp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.postgresql.Driver;

class DatabaseConnection implements AutoCloseable {
	private final Connection connection;

	DatabaseConnection() throws SQLException {
		connection = connect("jdbc:postgresql://143.89.50.151:7023/fypps", "fyp", "123456");
	}

	public final Connection getConnection() {
		return connection;
	}

	/**
	 * Connect to the PostgreSQL database at {@code url}, using user name specified in {@code user} and password specified in {@code password}
	 * @param url The JDBC URL of the database
	 * @param user The user name to access the database
	 * @param password The database password
	 * @return 
	 * @throws ClassNotFoundException 
	 * @throws SQLException 
	 */
	private static final Connection connect(String url, String user, String password) throws SQLException {
		DriverManager.registerDriver(new Driver());
		Connection c = DriverManager.getConnection(url, user, password);
		c.setAutoCommit(false);
		return c;
	}

	@Override
	public final void close() throws SQLException {
		connection.close();
	}
}