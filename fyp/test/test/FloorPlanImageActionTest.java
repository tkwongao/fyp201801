package test;

import static org.junit.Assert.*;

import java.util.HashMap;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import junit.framework.TestCase;

public class FloorPlanImageActionTest extends TestCase{
	private static long serialVersionUID;
	private HashMap<Byte, String> dataMap;
	private String mallName;
	
	@Before
	public void setUp() throws Exception {
		try{
			serialVersionUID = 4324689693785813174L;
			dataMap = null;
			mallName = null;
		}
		catch(Exception e){}
	}

	@After
	public void tearDown() throws Exception {
		serialVersionUID = 0;
		dataMap = null;
		mallName = null;
	}

}
