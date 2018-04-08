	private int shortestDistance(int locationXOld, int locationYOld, int locationXNew, int locationYNew, int width, int height) {
		ArrayList<Point2D> discovered = new ArrayList<>(), undiscovered = new ArrayList<>();
		undiscovered.add(new Point2D(locationXOld, locationYOld));
		Point2D[][] pathMap = new Point2D[height][width];
		int[][] distanceFromOldLocation = new int[height][width], distanceToNewLocation = new int[height][width];
		for (int[] row : distanceFromOldLocation)
			Arrays.fill(row, Integer.MAX_VALUE);
		distanceFromOldLocation[locationYOld][locationXOld] = 0;
		for (int[] row : distanceToNewLocation)
			Arrays.fill(row, Integer.MAX_VALUE);
		distanceToNewLocation[locationYOld][locationXOld] = heuristicCostEstimate(locationXOld, locationYOld, locationXNew, locationYNew);
		while (!undiscovered.isEmpty()) {
			undiscovered.sort(new Comparator<Point2D>() {
				@Override
				public int compare(Point2D p1, Point2D p2) {
					return Long.signum((long) distanceToNewLocation[(int) p1.getY()][(int) p1.getX()] -
							(long) distanceToNewLocation[(int) p2.getY()][(int) p2.getX()]);
				}
			});
			Point2D current = undiscovered.get(0);
			int currentX = (int) current.getX(), currentY = (int) current.getY();
			if (currentX == locationXNew && currentY == locationYNew)
				return pathLength(pathMap, current);
			undiscovered.remove(current);
			discovered.add(current);
			for (Point2D neighbor : new Point2D[] {
					new Point2D(currentX, currentY - 1), new Point2D(currentX, currentY + 1),
					new Point2D(currentX - 1, currentY), new Point2D(currentX + 1, currentY),
			}) {
				int neighborX = (int) neighbor.getX(), neighborY = (int) neighbor.getY();
				if (!discovered.contains(neighbor)) {
					if (!undiscovered.contains(neighbor))
						undiscovered.add(neighbor);
					int tentativeDistanceFromOldLocation = distanceFromOldLocation[currentY][currentX] + 1;
					if (terrainMap[neighborY][neighborX] != TERRAIN_EMPTY)
						tentativeDistanceFromOldLocation = Integer.MAX_VALUE;
					if (tentativeDistanceFromOldLocation < distanceFromOldLocation[neighborY][neighborX]) {
						pathMap[neighborY][neighborX] = current;
						distanceFromOldLocation[neighborY][neighborX] = tentativeDistanceFromOldLocation;
						distanceToNewLocation[neighborY][neighborX] = distanceFromOldLocation[neighborY][neighborX] + 
								heuristicCostEstimate(neighborX, neighborY, locationXNew, locationYNew);
					}
				}
			}
		}
		return Integer.MAX_VALUE;
	}
	private static int pathLength(Point2D[][] pathMap, Point2D currentLocation) {
		Point2D previous = pathMap[(int) currentLocation.getY()][(int) currentLocation.getX()];
		if (previous != null)
			return pathLength(pathMap, previous) + 1;
		return 0;
	}