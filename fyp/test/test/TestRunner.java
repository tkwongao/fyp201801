package test;

import org.junit.runner.*;
import org.junit.runner.JUnitCore;
import org.junit.runner.Result;
import org.junit.runner.notification.*;
import org.junit.runner.notification.Failure;
import org.junit.Test;


public class TestRunner {
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Result result = JUnitCore.runClasses(AllTests.class);
		
		for (Failure failure : result.getFailures()) {
			System.out.println(failure.toString());}
		
		System.out.println(result.wasSuccessful());
		
	}

}

//https://www.tutorialspoint.com/junit/junit_test_framework.htm