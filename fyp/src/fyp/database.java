package fyp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;
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
		method();
		return count; 
	}
	public void method() {
		Calendar c = Calendar.getInstance(TimeZone.getTimeZone("GMT+8:00"));
		c.clear();
		c.set(2017, Calendar.OCTOBER, 23, 22, 0, 0);
		long time1 = c.getTimeInMillis();
		c.set(2017, Calendar.OCTOBER, 23, 0, 0, 0);
		long time2 = c.getTimeInMillis();
		ArrayList<Date> list = new ArrayList<Date>();
		try {
			ResultSet rs = new database().connect().prepareStatement("SELECT startts FROM store_results where startts > " + time1 + " ORDER BY startts LIMIT 400;").executeQuery();
			long start = System.nanoTime();
			while (rs.next())
				list.add(new Date(rs.getLong("startts")));
			double elapsedTimeInSec = (System.nanoTime() - start) * 1.0e-9;
			System.out.println(elapsedTimeInSec);
			rs = new database().connect().prepareStatement("SELECT startts FROM store_results where startts > " + time2 + " ORDER BY startts").executeQuery();
			start = System.nanoTime();
			while (rs.next())
				list.add(new Date(rs.getLong("startts")));
			double elapsedTimeInSec2 = (System.nanoTime() - start) * 1.0e-9;
			System.out.println(elapsedTimeInSec2);
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
	}
}