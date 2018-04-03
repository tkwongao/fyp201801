package fyp;

import java.math.BigInteger;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;

public class KMeans extends DatabaseConnection {
	private int storeId;
	private long macAddress;
	private String mallId;
	
	private ArrayList<Point> points;
	
	private Point centroid; 
	
	class Point {
		private int did;
		private String areaID;
		private double x;
		private double y;
		private int ts;
		
		public Point(int did,String areaID,double x,double y,int ts){
			this.did = did;
			this.areaID = areaID;
			this.x = x;
			this.y = y;
			this.ts = ts;
		}
		
		public int getDid() {
			return this.did;
		}
		
		public void setDid(int did) {
			this.did = did;
		}
		
		public String getAreaID() {
			return this.areaID;
		}
		
		public void setAreaID(String areaID) {
			this.areaID = areaID;
		}
		
		public double getX() {
			return this.x;
		}
		
		public void setX(double x) {
			this.x = x;
		}
		
		public double getY() {
			return this.y;
		}
		
		public void setY(double y) {
			this.y = y;
		}
		
		public int getTs() {
			return this.ts;
		}
		
		public void setTs(int ts) {
			this.ts = ts;
		}
	}

	/**
	 * 
	 * @param mallId
	 * @param storeId
	 * @param macAddress
	 */
	KMeans(String mallId, int storeId, long macAddress) throws SQLException {
		this.mallId = mallId;
		this.storeId = storeId;
		this.macAddress = macAddress;
	}

	public KMeans() throws SQLException{
		this.points = new ArrayList<Point>();
		String stmnt = 
		"select did, CAST(areaid AS VARCHAR) areaID, x, y, ts from location_results WHERE  areaid = 'base_1';";
		//at this stage, just consider location data at the BASE "base_1".
		try (PreparedStatement ps = getConnection().prepareStatement(stmnt)) {
			//Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				int did = rs.getInt("did");
				String areaID = rs.getString("areaID");
				double x = rs.getDouble("x");
				double y = rs.getDouble("y");
				int ts = rs.getInt("ts");
				Point p = new Point(did, areaID, x, y, ts);
				points.add(p);	//to get the record from the table
			}
			//return values;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}
	
	public void clustering(int numberOfClusters, int interations, double[][] centroids) {
		
	}
	
	private int closest(double[] v) {
		int label = 0;
		return label;
	}
	
	private double EuclideanDistance(double[] v1, double[] v2) {
		double sum = 0;
		return Math.sqrt(sum);
	}
	
	private double ManhattanDistance(double[] v1, double[] v2) {
		double sum = 0;
		return Math.sqrt(sum);
	}

	private double[][] updateCentroids() {
		double[][] newc = new double[1][];
		return newc;
	}
	
	private boolean converge(double[][] c1, double[][] c2, double threshold) {
		return true;
	}
	
	private double[][] getControids() {
		return null;
	}
	
	private int[] getLabels() {
		return null;
	}
	
	private int nrows() {
		return 1;
	}
	
	public void printResults() {
//		for(int i = 0; i < numberOfClusters; ++i) {
//			for(int j = 0; j < numberOfDimensions; ++i) {
//				System.out.println("In the "+ i + "th cluster, we have the centroid " + centroids[i][j] + "at (x, y) = (" + x + ", " + y + ").");
//			}
//		}
	}
	
	public static void main(String[] args) {
		try {
			KMeans KM = new KMeans();
			KM.clustering(100, 100, null);	//100 clusters, maximum 100 iterations
			KM.printResults();
		}
		catch(SQLException e){
			e.printStackTrace();
		}
	}

	/**
	 * 
	 * @param period The earliest and latest time the counted data could come from,
	 * as {@code long} array of length 2 containing UTC milliseconds.
	 * @param numberOfIntervals
	 * @param lengthOfMovingAverage
	 * @return
	 */

}