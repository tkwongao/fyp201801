function changeScope(i, requestType) {
	switch (i) {
	case 0:
		$("#scope").text("Past Day");
		interval = 1;
		numberOfDataInGraph = 24;
		break;
	case 1:
		$("#scope").text("Past 7 Days");
		interval = 24;
		numberOfDataInGraph = 7;
		break;
	case 2:
		$("#scope").text("Past Month");
		interval = 24;
		numberOfDataInGraph = 30;
		break;
	case 3:
		$("#scope").text("Past 3 Months");
		interval = 720;
		numberOfDataInGraph = 3;
		break;
	case 4:
		$("#scope").text("Past Year");
		interval = 720;
		numberOfDataInGraph = 12;
		break;
	default:
		interval = -1;
	break;
	}
	valFromDB1 = new Array(numberOfDataInGraph);
	valFromDB2 = new Array(numberOfDataInGraph);
	for (var j = 0; j < numberOfDataInGraph; j++) {
		valFromDB1[j] = 0;
		valFromDB2[j] = 0;
	}
	scope = i;
	var requestTypeL = requestType.toLowerCase();
	if (requestTypeL === "average")
		updateDwellTimeGraph();
	else if (requestTypeL === "loyalty")
		updateLoyaltyGraph();
	else if (requestTypeL === "index")
		updateIndexGraph();
}