package fyp;

class Point {
	private int did;
	private String areaID;
	private double x;
	private double y;
	private long ts;

	public Point(int did, String areaID, double x, double y, long ts) {
		this.did = did;
		this.areaID = areaID;
		this.x = x;
		this.y = y;
		this.ts = ts;
	}

	public int getDid() {
		return did;
	}

	public String getAreaID() {
		return areaID;
	}

	public double getX() {
		return x;
	}

	public double getY() {
		return y;
	}

	public long getTs() {
		return ts;
	}

	public void setDid(int did) {
		this.did = did;
	}

	public void setAreaID(String areaID) {
		this.areaID = areaID;
	}

	public void setX(double x) {
		this.x = x;
	}

	public void setY(double y) {
		this.y = y;
	}

	public void setTs(long ts) {
		this.ts = ts;
	}
}