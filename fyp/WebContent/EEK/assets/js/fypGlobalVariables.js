var numberOfDataInGraph = 30;
var valFromDB1 = new Array(numberOfDataInGraph);
var valFromDB2 = new Array(numberOfDataInGraph);
for (var j = 0; j < numberOfDataInGraph; j++) {
	valFromDB1[j] = 0;
	valFromDB2[j] = 0;
}
var scope = 0;
var interval = 1;
var currentTime = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
//To be replaced by getting the current date