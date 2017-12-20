package fyp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class database {
	private final String url = "jdbc:postgresql://143.89.50.151:7023/fypps";
	private final String user = "fyp";
	private final String password = "123456";

	/**
	 * Connect to the PostgreSQL database
	 *
	 * @return a Connection object
	 */
	public Connection connect() {
		Connection conn = null;
		try {
			Class.forName("org.postgresql.Driver");
			conn = DriverManager.getConnection(url, user, password);
			System.out.println("Connected to the PostgreSQL server successfully.");
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return conn;
	}

	/**
	 * @param args the command line arguments
	 */

	public int count()
	{
		int count =0;
		String sql = "SELECT count(DISTINCT(did)) from store_results";
		database db = new database();
		Connection connected = db.connect();
		try
		{
			PreparedStatement ps = connected.prepareStatement(sql);
			ResultSet rs = ps.executeQuery();
			while (rs.next()){
				count= rs.getInt("count");
			}
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return count; 
	}
}