package fyp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
	private static final Connection connection = connect("jdbc:postgresql://143.89.50.151:7023/fypps", "fyp", "123456");

	private DatabaseConnection() {}

	/**
	 * 
	 * @return
	 */
	public static Connection getConnection() {
		return connection;
	}

	/**
	 * Connect to the PostgreSQL database at {@code url}, using user name specified in {@code user} and password specified in {@code password}
	 * @param url The JDBC URL of the database
	 * @param user The user name to access the database
	 * @param password The database password
	 * @return 
	 */
	private static Connection connect(String url, String user, String password) {
		try {
			Class.forName("org.postgresql.Driver");
			Connection c = DriverManager.getConnection(url, user, password);
			c.setAutoCommit(false);
			System.out.println("Connected to the PostgreSQL server successfully.");
			return c;
		} catch (ClassNotFoundException | SQLException e ) {
			e.printStackTrace();
			return null;
		}
	}
}