package fyp;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Objects;
import java.util.Random;

public class KMeans extends DatabaseConnection {
	private final short FETCH_SIZE = 0x190;

	private long macAddress;
	private String areaId;

	// Data members - instance variables
	private double[][] data; //array of all records in the dataset from the database
	private int[] labels, labelCount; //labels of the generated clusters
	// if the original labels exist, load them to "existedLabels".
	// We can compute accuracy by computing "labels" and "existedLabels", though the accuracy function/loss function is not yet defined.
	private int[] existedLabels;
	private HashMap<Long, ArrayList<Long>[]> pointsInCluster;
	private double[][] centroids; //the center of clusters
	private int numberOfRows, numberOfClusters;
	private byte numberOfDimensions;
	private ArrayList<Point> points;

	public KMeans(final long[] period, String areaId) throws SQLException {
		numberOfDimensions = 2;
		this.areaId = areaId;
		points = new ArrayList<Point>();
		String sql = "SELECT did, areaid, x, y, ts FROM location_results WHERE ts BETWEEN ? AND ? AND areaid = ?;";
		try (PreparedStatement ps = getConnection().prepareStatement(sql)) {
			ps.setLong(1, period[0]);
			ps.setLong(2, period[1]);
			ps.setString(3, areaId);
			ps.setFetchSize(FETCH_SIZE); // Fetch FETCH_SIZE (400) rows a time.
			ResultSet rs = ps.executeQuery();
			int i = 0, j = 0;
			while (rs.next()) {
				// to get the record from the table
				points.add(new Point(rs.getLong("did"), rs.getString("areaid"), rs.getDouble("x"), rs.getDouble("y"), rs.getLong("ts")));
				if (++i % FETCH_SIZE == 0)
					System.err.println(++j + " fetches are processed.");
			}
			System.out.println("There are total " + i + " records.");
			numberOfRows = points.size();
			data = new double[numberOfRows][];
			Arrays.parallelSetAll(data, a -> new double[] {points.get(a).getX(), points.get(a).getY()});
		} catch (SQLException e) {
			throw new IllegalStateException("An error occurred during database access.", e);
		}
	}

	/**
	 * Perform k-means clustering with the specified number of clusters and distance comparison metrics (Euclidean distance or Manhattan distance)
	 * @param numberOfClusters
	 * @param numberOfIterations The number of iterations. If it is set to -1, the k-means iteration is only terminated by the converging condition.
	 * @param cens Optional parameter for the initial centroids. If set to {@code null}, the initial centroids will be generated randomly.
	 */
	@SuppressWarnings("unchecked")
	public void clustering(short numOfClusters, short numberOfIterations, double[][] cens) {
		// note: To optimize the algorithm, the initial centroids can be initialized to any values of the locations inside the stores
		// or the locations of passby/corridors in the shopping malls (e.g. K11) or the BASE
		numberOfClusters = Math.min(numOfClusters, numberOfRows);
		if (cens != null)
			centroids = cens;
		else {
			// randomly selected centroids
			centroids = new double[numberOfClusters][];
			ArrayList<Integer> index = new ArrayList<Integer>();
			Random r = new Random(15775);
			for (short i = 0; i < numberOfClusters; ++i) {
				int c = 0, randomNumberGeneratorcounter = 0;
				do {
					c = r.nextInt(numberOfRows);
					randomNumberGeneratorcounter++;
					if (randomNumberGeneratorcounter > 0x20) {
						boolean hasValidValue = false;
						for (int j = 0; j < numberOfRows; j++) {
							hasValidValue |= !checkDuplicate(index, j);
							if (hasValidValue) {
								c = j;
								break;
							}
						}
						if (!hasValidValue) {
							numberOfClusters = i;
							c = -1;
							break;
						}
					}
				} while (checkDuplicate(index, c)); // avoid duplicates
				if (c >= 0) {
					index.add(c);
					// copy the value from "data[c]"
					centroids[i] = data[c].clone();
				}
				if (numberOfClusters <= 0)
					throw new RuntimeException("Cannot generate valid clusters!");
			}
		}
		double[][] c1 = centroids;
		final double THRESHOLD = Double.MIN_VALUE; // this can be tuned.
		int round = 0;

		while (true) {
			// update this.centroids based on the assignments
			centroids = c1;

			// assign a new point to its closest centroid and its cluster
			labels = new int[numberOfRows];
			labelCount = new int[numberOfClusters];
			for (int i = 0; i < numberOfRows; i++) {
				labels[i] = closest(data[i]);
				labelCount[labels[i]]++;
			}

			// compute the centroids based on the new assignments of points again
			c1 = updateCentroids();
			round++;
			if ((numberOfIterations > 0 && round >= numberOfIterations) || converge(centroids, c1, THRESHOLD))
				break;
		}

		pointsInCluster = new HashMap<Long, ArrayList<Long>[]>();
		for (int i = 0; i < numberOfRows; i++) {
			ArrayList<Long>[] pointOfThisUser = pointsInCluster.getOrDefault(points.get(i).getDid(), (ArrayList<Long>[]) new ArrayList<?>[numberOfClusters]);
			for (int j = 0; j < numberOfClusters; j++)
				if (Objects.isNull(pointOfThisUser[j]))
					pointOfThisUser[j] = new ArrayList<Long>(0);
			pointOfThisUser[labels[i]].add(points.get(i).getTs());
			pointsInCluster.put(points.get(i).getDid(), pointOfThisUser);
		}

		System.out.println("This K-means clustering converges at iteration " + round + ", starting from iteration 1");
		for (int i = 0; i < numberOfClusters; i++)
			System.out.println("In the " + (i + 1) + "th cluster, we have the centroid at (x, y) = (" + centroids[i][0] + ", " + centroids[i][1] + ") with " + labelCount[i] + " items.");
	}

	private final boolean checkDuplicate(final ArrayList<Integer> index, final int value) {
		if (value < 0)
			return false;
		if (index.contains(value))
			return true;
		for (double[] centroid : centroids)
			if (Objects.nonNull(centroid)) {
				boolean thisValueDuplicate = true;
				for (byte i = 0; i < numberOfDimensions; i++)
					thisValueDuplicate &= data[value][i] == centroid[i];
				if (thisValueDuplicate)
					return true;
			}
		return false;
	}

	/**
	 * Find the closest centroid for the point p
	 * @param p
	 * @return
	 */
	private int closest(double[] p) {
		double minDist = EuclideanDistance(p, this.centroids[0]);	//calculate the minimum distance between point p and the centroid
		int label = 0;
		for (int i = 1; i < this.numberOfClusters; i++) {
			double distance = EuclideanDistance(p, this.centroids[i]);	//Compare each centroid with the input parameter point p
			if (minDist > distance) {	//update the minimum distance and the label of the point if a shorter distance is found 
				minDist = distance;
				label = i;
			}
		}
		return label;
	}

	/**
	 * Compute the Euclidean distance between points p1 and p2 (as vectors).
	 * @param p1
	 * @param p2
	 * @return
	 */
	private double EuclideanDistance(double[] p1, double[] p2) {	// Default choice of our algorithm
		double sum = 0;
		for (int i = 0; i < this.numberOfDimensions; i++)
			sum += Math.pow(p1[i] - p2[i], 2);
		return Math.sqrt(sum);
	}

	private double ManhattanDistance(double[] p1, double[] p2) {	
		double sum = 0;
		int length = 0;
		if(p1.length == p2.length)
			length = p1.length;
		else
			throw new IllegalArgumentException("Invalid points!");
		// For each point, find the distance to the rest
		for(int i = 0; i < length; ++i)
			sum += Math.abs(p1[i] - p2[i]);
		return sum;
	}

	/**
	 * According to the cluster labels, we compute the centroids again:
	 * Each centroid is updated by averaging its members in the cluster.
	 * Currently this is more suitable to apply to Euclidean distance as the similarity measure for simplicity.
	 * @return
	 */
	private double[][] updateCentroids() {
		double[][] newCentroids = new double[numberOfClusters][];	//create an array of new centroids
		int[] counts = new int[numberOfClusters];	//define the size of clusters

		// initialize the centroids with zero value
		for (int i = 0; i < numberOfClusters; i++) {
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

		// Finally, we compute the average
		for (int i = 0; i < numberOfClusters; i++)
			for (int j = 0; j < numberOfDimensions; j++)
				newCentroids[i][j] /= counts[i];
		return newCentroids;
	}

	/**
	 * Check the following convergence condition: max(dist(c1[i], c2[i]), for i from 1 to numberOfClusters < threshold
	 * @param c1
	 * @param c2
	 * @param threshold
	 * @return
	 */
	private boolean converge(final double[][] c1, final double[][] c2, final double threshold) {
		// c1 and c2 are 2 sets of centroids
		double maxValue = 0;
		for (int i = 0; i < numberOfClusters; ++i)
			maxValue = Math.max(maxValue, EuclideanDistance(c1[i], c2[i]));
		return maxValue < threshold;
	}

	private final class Node {
		public short clusterId;
		public long ts;
		public Node(short clusterId, long ts) {
			this.clusterId = clusterId;
			this.ts = ts;
		}
	}
	
	ArrayList<Node> getPath(final long macAddress) {
		Objects.requireNonNull(centroids, "centroids must not be null");
		Objects.requireNonNull(pointsInCluster, "pointsInCluster must not be null");
		ArrayList<Long>[] hisVisits = pointsInCluster.get(macAddress);
		if (Objects.isNull(hisVisits))
			return null;
		ArrayList<Node> hisVisitsForPathFinding = new ArrayList<Node>();	
		for (short i = 0; i < numberOfClusters; i++) {
			final short clusterId = i;
			hisVisits[i].forEach(l -> hisVisitsForPathFinding.add(new Node(clusterId, l)));
		}
		hisVisitsForPathFinding.sort((a, b) -> Long.compare(a.ts, b.ts));
		return hisVisitsForPathFinding;
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

	public HashMap<Long, ArrayList<Long>[]> getPointsInCluster() {
		return pointsInCluster;
	}

	// TODO Reduce the popular path to shortest (Dijsktra, cost being distance) OR A*
	public static void main(String[] args) {
		try (KMeans KM = new KMeans(new long[] {1520000000000l, 1521000000000l}, "base_1")) {	
			KM.clustering((short) 0x64, Byte.MAX_VALUE, null);
			KM.getPointsInCluster().forEach((macAddress, aa) -> KM.getPath(macAddress));
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}