package test;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({ 
	ApplicationTest.class, 
	DatabaseConnectionTest.class, 
	FloorPlanImageActionTest.class,
	HeatMapActionTest.class, 
	KMeansTest.class, 
	MallAndStoreAnalysisTest.class, 
	MallListActionTest.class,
	OUIActionTest.class, 
	PointTest.class, 
	StoreListActionTest.class, 
	UserAnalysisTest.class })
public class AllTests {

}


//https://www.tutorialspoint.com/junit/junit_test_framework.htm