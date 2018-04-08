package fyp;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;

public class KMeans extends DatabaseConnection {
	private int storeId;
	private long macAddress;
	private String mallId;

	private Point center; 

	//Data members - instance variables
	private double[][] data; //array of all records in the dataset from the database
	private int[] labels; //labels of the generated clusters
	private int[] existedLabels;	//if the original labels exist, load them to "existedLabels". We can compute accuracy by computing "labels" and "existedLabels", though the accuracy function/loss function is not yet defined.
	private double[][] centroids;		//the center of clusters
	private int numberOfRows;
	private int numberOfDimensions;
	private int numberOfClusters;

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
		ArrayList<Point> points = new ArrayList<Point>();
		String stmnt = "select did, CAST(areaid AS VARCHAR) areaID, x, y, ts from location_results WHERE  areaid = 'base_1';";
		//at this stage, just consider location data at the BASE "base_1".
		try (PreparedStatement ps = getConnection().prepareStatement(stmnt)) {
			Point pt[] = new Point[0];
			//Arrays.fill(value, 0);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				int did = rs.getInt("did");
				String areaID = rs.getString("areaID");
				double x = rs.getDouble("x");
				double y = rs.getDouble("y");
				long ts = rs.getLong("ts");
				Point p = new Point(did, areaID, x, y, ts);
				points.add(p);	//to get the record from the table
			}
			numberOfRows = points.size();
			data = new double[numberOfRows][];
			Arrays.parallelSetAll(data, a -> new double[] {points.get(a).getX(), points.get(a).getY()});
			//return values;
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}

	//Perform k-means clustering with the specified number of clusters and distance comparison metrics (Euclidean distance or Manhattan distance)
	//"numberOfInterations" is the number of iterations If it is set to -1, the k-means iteration is only terminated by the converging condition.
	//"centroids" are the initial centroids and these are optional. If "centroids" are set to null, the initial centroids will be generated randomly.
	public void clustering(int numberOfClusters, int numberOfInterations, double[][] centroids) {
		//note: To optimize the algorithm, the initial centroids can be initialized to any values of the locations inside the stores or the locations of passby/corridors in the shopping malls (e.g. K11) or the BASE
		this.numberOfClusters = numberOfClusters;
		if (centroids != null)
			this.centroids = centroids;
		else {
			// randomly selected centroids
			this.centroids = new double[this.numberOfClusters][];
			ArrayList index = new ArrayList();
			for (int i = 0; i < numberOfClusters; ++i) {
				int c = 0;
				do {
					c = (int) (Math.random() * numberOfRows);
				} while (index.contains(c)); //avoid duplicates
				index.add(c);

				//copy the value from "this.data[c]"
				this.centroids[i] = new double[numberOfDimensions];
				for (int j = 0; j < numberOfDimensions; j++)
					this.centroids[i][j] = data[c][j];
			}	
		}

		double[][] c1 = this.centroids;
		double threshold = 0.001;	//this can be tuned.
		int round = 0;

		while (true) {
			//update this.centroids based on the assignments
			this.centroids = c1;

			//assign a new point to its closest centroid and its cluster
			labels = new int[numberOfRows];
			for (int i = 0; i < numberOfRows; i++)
				labels[i] = closest(data[i]);

			//compute the centroids based on the new assignments of points again
			c1 = updateCentroids();
			round++;
			if ((numberOfInterations > 0 && round >= numberOfInterations) || converge(this.centroids, c1, threshold))
				break;
		}
		System.out.println("This K-means clustering converges at iteration " + round + ", starting from iteration 1");
	}

	//Find the closest centroid for the point p
	private int closest(double[] p) {
		double minDist = EuclideanDistance(p, this.centroids[0]);	//calculate the minimum distance between point p  and the centroid
		int label = 0;
		for(int i = 1; i < this.numberOfClusters; i++) {
			double distance = EuclideanDistance(p, this.centroids[i]);	//Compare each centroid with the input parameter point p
			if(minDist > distance) {	//update the minimum distance and the label of the point if a shorter distance is found 
				minDist = distance;
				label = i;
			}
		}
		return label;
	}

	//Compute the Euclidean distance between points p1 and p2 (as vectors) 
	private double EuclideanDistance(double[] p1, double[] p2) {	//Default choice of our algorithm
		double sum = 0;
		for(int i = 0; i < this.numberOfDimensions; i++)
			sum += Math.pow(p1[i] - p2[i], 2);
		return Math.sqrt(sum);
	}

	private double ManhattanDistance(double[] p1, double[] p2) {	
		double sum = 0;
		int length = 0;
		if(p1.length == p2.length)
			length = p1.length;
		else {
			System.err.println("Invalid points!");
			System.exit(-1);
		}
		// For each point, find the distance to the rest
		for(int i = 0; i < length; ++i)
			sum += Math.abs(p1[i] - p2[i]);
		return sum;
	}

	//According to the cluster labels, we compute the centroids again:
	//Each centroid is updated by averaging its members in the cluster. Currently this is more suitable to apply to Euclidean distance as the similarity measure for simplicity.
	private double[][] updateCentroids() {
		double[][] newCentroids = new double[numberOfClusters][];	//create an array of new centroids
		int[] counts = new int[numberOfClusters];	//define the size of clusters

		// initialize the centroids with zero value
		for(int i = 0; i < numberOfClusters; i++) {
			counts[i] = 0;
			newCentroids[i] = new double[numberOfDimensions];
			for (int j = 0; j < numberOfDimensions; j++)
				newCentroids[i][j] = 0;
		}

		for (int i = 0; i < numberOfRows; i++) {
			int clusterID = labels[i];		//the cluster label ID for each record i
			for (int j = 0; j < numberOfDimensions; j++)
				newCentroids[clusterID][j] += data[i][j];	//update that centroid by adding the data record
			++counts[clusterID];
		}

		//Finally, we compute the average
		for (int i = 0; i < numberOfClusters; i++) {
			for (int j = 0; j < numberOfDimensions; j++)
				newCentroids[i][j] /= counts[i];
		}
		return newCentroids;
	}

	//check the following convergence condition: 
	//max(dist(c1[i], c2[i]), for i from 1 to numberOfClusters < threshold
	private boolean converge(double[][] c1, double[][] c2, double threshold) {
		//c1 and c2 are 2 sets of centroids
		double maxValue = 0;
		for (int i = 0; i < numberOfClusters; ++i) {
			double difference = EuclideanDistance(c1[i], c2[i]);
			if (maxValue < difference)
				maxValue = difference;
		}	
		return maxValue < threshold;
	}
	
	public int[] getLabels() {
		return labels;
	}

	public double[][] getCentroids() {
		return centroids;
	}

	public int getNumberOfRows() {
		return numberOfRows;
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
			KM.clustering(100, 100, null);	//100 clusters for creating 100 nodes (the number can be parameterized), maximum 100 iterations
			KM.printResults();
			KM.close();
		}
		catch (SQLException e) {
			e.printStackTrace();
		}
	}
}