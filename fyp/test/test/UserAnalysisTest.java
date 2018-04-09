package test;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import junit.framework.TestCase; 

public class UserAnalysisTest extends TestCase{
	private static byte testWholeMall;	//	private static final byte WHOLE_MALL = -1;
	private static float testNotMeaningful;	//private static final float NOT_MEANINGFUL = 0.5f;
	private static double testMillisecondsToSeconds;	//	private static final double MILLISECONDS_TO_SECONDS = 1000;
	private byte testMaxLengthOfMovingAverage;	//	private final byte maxLengthOfMovingAverage, a non-positive number of byte type range from 2 to "Byte.MAX_VALUE", i.e. 127
	private int testStoreId;	//	private final int storeId, possibles values are "WHOLE_MALL"
	private long testMacAddress;		//	private final long macAddress;
	private String testMallId;		//	private final String mallId;
	private long[] testPeriod; //final long[] period, 
	private short testNumberOfIntervals;	// final short numberOfIntervals, a non-negative number range from 0 to positive integer with a default value
	private short testLengthOfMovingAverage; //final short lengthOfMovingAverage, a non-negative number range from 0 to Byte.MAX_VALUE, i.e. 127
		
	private fyp.UserAnalysis testUserAnalysis;
	
	public UserAnalysisTest(String testName) {
		super(testName);
//		try {
//			testUserAnalysis = new fyp.UserAnalysis(testMallId, testStoreId, testMacAddress, testLengthOfMovingAverage);
//		}
//		catch(Exception e) {}
	}
	
//	@BeforeClass
//	public static void setUpBeforeClass() throws Exception {
//	}

//	@AfterClass
//	public static void tearDownAfterClass() throws Exception {
//	}

	@Before
	public void setUp() throws Exception {
		super.setUp();
		testWholeMall = -1;
		testNotMeaningful = 0.5f;
		testMillisecondsToSeconds = 1000;
		testMaxLengthOfMovingAverage = Byte.MAX_VALUE;	//127
		testStoreId = 1;
		testMacAddress = 1;	
		testMallId = "";		
		testPeriod = null; 
		testNumberOfIntervals = 1;
		testLengthOfMovingAverage = Byte.MAX_VALUE;
		try {	
			testUserAnalysis = new fyp.UserAnalysis(testMallId, testStoreId, testMacAddress, testMaxLengthOfMovingAverage);
		}
		catch(Exception e) {}
	}

	@After
	public void tearDown() throws Exception {
		testWholeMall = 0;
		testNotMeaningful = 0.0f;
		testMillisecondsToSeconds = 0;
		testMaxLengthOfMovingAverage = 2;
		testStoreId = 0;
		testMacAddress = 0L;
		testMallId = null;
		testPeriod = null;
		testNumberOfIntervals = 0;
		testLengthOfMovingAverage = 0;
	}

	@Test
	public void test() {
	}
	
	@Test
	public void testUserAnalysis() {
		try {
		assertEquals(testUserAnalysis, new fyp.UserAnalysis(testMallId, testStoreId, testMacAddress, testMaxLengthOfMovingAverage));
		}
		catch(Exception e) {}
	}

	@Test
	public void testUserStayTime() {
	}

	@Test
	public void testLoyaltyCheck() {
	}

	@Test
	public void testNumberOfStoresVisited() {
	}
	
	@Test
	public void TestAnalyzeOUI(){
		
/*
		String sql = "SELECT vendor FROM oui WHERE mac = ?;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setString(1, String.format("%1$" + 12 + "s", Long.
			toHexString(macAddress)).replace(' ', '0').toUpperCase().substring(0, 6));
			ArrayList<String> value = new ArrayList<String>(1);
			ResultSet rs = ps.executeQuery();
			while (rs.next())
				value.add(rs.getString("vendor").trim());
			if (value.isEmpty())
				value.add("Unknown");
			return value;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
*/
		
	}
	
	

}