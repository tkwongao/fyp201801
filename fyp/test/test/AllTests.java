package test;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({ 
	ApplicationContextTest.class, 
	ApplicationTest.class, 
	DatabaseConnectionTest.class,
	MallAndStoreAnalysisTest.class, 
	OUIActionTest.class, 
	UserAnalysisTest.class })
public class AllTests {

}

//https://www.tutorialspoint.com/junit/junit_test_framework.htm