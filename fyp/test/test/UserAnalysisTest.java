package test;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import junit.framework.TestCase;

public class UserAnalysisTest extends TestCase{

	private static byte testWholeMall;	//	private static final byte WHOLE_MALL = -1;
	private static float testNotMeaningful;	//private static final float NOT_MEANINGFUL = 0.5f;
	private static double testMillisecondsToSeconds;	//	private static final double MILLISECONDS_TO_SECONDS = 1000;
	private int testStoreId;	//	private final int storeId, possibles values are "WHOLE_MALL"
	private long testMacAddress;		//	private final long macAddress;
	private String testMallId;		//	private final String mallId;
	private long[] testPeriod; //final long[] period, 
	private short testNumberOfIntervals;	// final short numberOfIntervals, a non-negative number range from 0 to positive integer with a default value
	private short testLengthOfMovingAverage; //final short lengthOfMovingAverage
	
	public UserAnalysisTest(String testName) {
		super(testName);
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
		testStoreId = 1;
		testMacAddress = 1;	
		testMallId = "";		
		testPeriod = null; 
		testNumberOfIntervals = 1;
		testLengthOfMovingAverage = 1;
		
	}

	@After
	public void tearDown() throws Exception {
		testWholeMall = 0;
		testNotMeaningful = 0.0f;
		testMillisecondsToSeconds = 0;
		testStoreId = 0;
		testMacAddress = 0L;
		testMallId = null;
		testPeriod = null;
		testNumberOfIntervals = 0;
		testLengthOfMovingAverage = 0;
	}

	@Test
	public void testUserAnalysis() {
	}

	@Test
	public void testUserStayTime() {
	}

	@Test
	public void testLoyaltyCheck() {
	}

}
