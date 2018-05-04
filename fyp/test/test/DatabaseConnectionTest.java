package test;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Objects;
import java.util.TimeZone;

import org.postgresql.Driver;

import junit.framework.TestCase; 


public class DatabaseConnectionTest extends TestCase{
	private Connection connection;
	private PreparedStatement stmt;
	private Statement stmnt;
	private ResultSet rs;
	private String url;
	private String user;
	private String password;
	
	@BeforeClass
	public void setUpBeforeClass() throws Exception {
		connection = null;
        stmt = null;
        stmnt = null;
	}
	
	@Before
	public void before() throws SQLException {
        connection = DriverManager.getConnection(url, user, password);
        stmt = connection.prepareStatement("");
        stmnt = connection.createStatement();
        
	}

	@Before
	protected void setUp() throws Exception {
		super.setUp();
		
		try {
			Class.forName("org.postgresql.Driver");
			connection = DriverManager.getConnection("jdbc:postgresql://143.89.50.151:7023/fypps", "fyp", "123456"); 
			stmnt = connection.createStatement();   // To create a Statement
		}
		catch(ClassNotFoundException ex) {
			ex.printStackTrace();
		}
	}

	//tearDown used to close the connection or clean up activities
	@After
	public void tearDown() throws Exception {
		connection = null;
   	 	stmt = null;
		stmnt = null;
   	 	url = null;
   	 	user = null;
   	 	password = null;
		rs = null;
	}
	
	//clean up method
	@AfterClass
	public void tearDownAfterClass() throws Exception {
		if (stmt != null) {
			stmt = null;
        }
		if (stmnt != null) {
			stmnt = null;
        }
        if (connection != null) {
        		connection = null;
        }
	}

	@Test
	public void testGetConnection() {
		fail("Not yet implemented");
	}
	
	@Test
	public void testConnect(
			/*String url, String user, String password */
			) throws SQLException {
			 
//		DriverManager.registerDriver(new Driver());
//		Connection c = DriverManager.getConnection(url, user, password);
//		c.setAutoCommit(false);
//		return c;
	}

	@Test
	public void testClose() throws SQLException {
		connection.close();
	}

}
