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
	UserAnalysisTest.class })
public class AllTests {

}
