package test;

import static org.junit.Assert.*;

import java.io.IOException;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Objects;

//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import org.apache.struts2.interceptor.ServletRequestAware;
//import org.apache.struts2.interceptor.ServletResponseAware;
//import org.apache.struts2.json.annotations.JSON;
//
//import com.opensymphony.xwork2.ActionSupport;

import junit.framework.TestCase;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

public class ApplicationTest extends TestCase{
	private static long serialVersionUID;
	private static ZonedDateTime PAST;
	private byte MAX_LENGTH_OF_MOVING_AVERAGE;
//	private HttpServletRequest request;
//	private HttpServletResponse response;
	private HashMap<String, Number> dataMap;
	private byte lengthOfMovingAverage;
	private short interval;
	private int storeId;
	private long start; 
	private long end;
	private double bounceSD;
	private String mallId;
	private String type;
	private String userMac;
	private int[] dwellTimeThresholds;

	@Before
	public void setUp() throws Exception {
		super.setUp();
		
		try {
			serialVersionUID = -706028425927965519L;
			ZonedDateTime PAST = ZonedDateTime.of(2005, 1, 1, 0, 0, 0, 0, ZoneId.of("Asia/Hong_Kong"));
			MAX_LENGTH_OF_MOVING_AVERAGE = Byte.MAX_VALUE;
//			HttpServletRequest request = null;
//			HttpServletResponse response = null;
			HashMap<String, Number> dataMap = null;
			lengthOfMovingAverage = 1;
			interval = 1;
			storeId = 1;
			start = 1;
			end = 1;
			bounceSD = 0.35;
			mallId = null;
			type = null;
			userMac = null;
			dwellTimeThresholds = null;
		}
		catch(Exception e) {
		}
		
	}

	@After
	public void tearDown() throws Exception {
		serialVersionUID = 0;
		PAST = null;
		MAX_LENGTH_OF_MOVING_AVERAGE = 0;
//		request = null;
//		response = null;
		dataMap = null;
		lengthOfMovingAverage = 0;
		interval = 0;
		storeId = 0; 
		start = 0;
		end = 0;
		bounceSD = 0.0;
		mallId = null;
		type = null; 
		userMac = null;
		dwellTimeThresholds = null;
	}

	@Test
	public void testGetDataMap() {
		assertEquals(dataMap, null);
	}

	@Test
	public void testGetInterval() {
		assertEquals(interval, 1);
		
	}

	@Test
	public void testGetStoreId() {
		assertEquals(storeId, 1);
	}

	@Test
	public void testGetStart() {
		assertEquals(start, 1);
	}

	@Test
	public void testGetEnd() {
		assertEquals(end, 1);
	}

	@Test
	public void testGetUserMac() {
		assertEquals(userMac, null);
	
	}

	@Test
	public void testGetType() {
		assertEquals(type, null);
	}

	@Test
	public void testGetDwellTimeThresholds() {
		assertEquals(dwellTimeThresholds, null);
	}

}
