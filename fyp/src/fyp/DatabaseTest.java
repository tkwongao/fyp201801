package fyp;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Objects;
import java.util.TimeZone;

public class databaseTest {

	Connection conn;
	PreparedStatement stmt;
	private String url;
	private String user;
	private String password;
	
	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
        conn = null;
        stmt = null;
	}

	//clean up method
	@After
	public static void tearDownAfterClass() throws Exception {
		if (stmt != null) {
			Connection.closeStatement(stmt);
        }
        if (conn != null) {
        	Connection.closeConnection(conn);
        }
	}

	@Before
	public void before() throws SQLException {
        conn = DriverManager.getConnection(url, user, password);
        stmt = conn.createStatement();
	}

	//tearDown used to close the connection or clean up activities
	@After
	public void tearDown() throws Exception {
        if (conn != null) {
            Connection.closeConnection(conn);
            System.out.println("clean up.");
        }
    	 conn = null;
    	 stmt = null;
    	 url = null;
    	 user null;
     password = null;
	}

	@Test
	public void test() {
		fail("Not yet implemented");
        Connection.closeStatement(stmt);
        Assert.assertNull("Error occured", stmt);

	}


	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}
	
//	public void testDriverManager() {
//	    SqlConnection conClient = new SqlConnection();
//	    assertEquals(conClient.getConnection(),...);
//	    or
//	    assertTrue(conClient.getConnection(),...);
//	}

}



