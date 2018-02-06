var currentTime = 1508515200000;

function changeScope(i, requestType) {
	var interval;
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
	scope = i;
	updateGraph(requestType);
}

function updateGraph(requestType) {
	var requestTypeL = requestType.toLowerCase();
	if (requestTypeL === "average") {
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : currentTime - 3600000 * interval * numberOfDataInGraph,
				end : currentTime,
				storeId : -1,
				interval : 0,
				userMac : 0,
				type : requestTypeL
			},
			success : function(json) {
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json[prop]);
				$("#avgDwellTime").text(valFromDB[0]);
			}
		});
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : currentTime - 3600000 * interval * numberOfDataInGraph,
				end : currentTime,
				storeId : -1,
				interval : interval,
				userMac : 0,
				type : requestTypeL
			},
			success : function(json) {
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json[prop]);
				drawGraph();
			}
		});
	}
	else if (requestTypeL === "index") {
		$.when(ajax1(), ajax2()).done(function(a1, a2) {
			afterAJAXs();
		});
		function ajax1() {
			return $.ajax({
				type : "get",
				url : "databaseConnection",
				data : {
					start : currentTime - 3600000 * interval * numberOfDataInGraph,
					end : currentTime,
					storeId : -1,
					interval : 0,
					userMac : 0,
					type : "count"
				},
				success : function(json) {
					valFromDB = new Array();
					for ( var prop in json)
						valFromDB.push(json[prop]);
					$(".totalVisitorCount").text(valFromDB[0]);
				}
			});
		}
		function ajax2() {
			return $.ajax({
				type : "get",
				url : "databaseConnection",
				data : {
					start : currentTime - 3600000 * interval * numberOfDataInGraph,
					end : currentTime,
					storeId : -1,
					interval : 0,
					userMac : 0,
					type : "average"
				},
				success : function(json) {
					valFromDB = new Array();
					for ( var prop in json)
						valFromDB.push(json[prop]);
					$("#avgDwellTime").text(valFromDB[0]);
				}
			});
		}
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : currentTime - 3600000 * interval * numberOfDataInGraph,
				end : currentTime,
				storeId : 1000001,
				interval : 0,
				userMac : 0,
				type : "count"
			},
			success : function(json) {
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json[prop]);
				$("#s1scount").text(valFromDB[0]);
			}
		});
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : currentTime - 3600000 * interval * numberOfDataInGraph,
				end : currentTime,
				storeId : 1000002,
				interval : 0,
				userMac : 0,
				type : "count"
			},
			success : function(json) {
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json[prop]);
				$("#s2scount").text(valFromDB[0]);
			}
		});
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : currentTime - 3600000 * interval * numberOfDataInGraph,
				end : currentTime,
				storeId : 1000003,
				interval : 0,
				userMac : 0,
				type : "count"
			},
			success : function(json) {
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json[prop]);
				$("#s3scount").text(valFromDB[0]);
			}
		});
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : currentTime - 3600000 * interval * numberOfDataInGraph,
				end : currentTime,
				storeId : 1000004,
				interval : 0,
				userMac : 0,
				type : "count"
			},
			success : function(json) {
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json[prop]);
				$("#s4scount").text(valFromDB[0]);
			}
		});
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : currentTime - 3600000 * interval * numberOfDataInGraph,
				end : currentTime,
				storeId : -1,
				interval : interval,
				userMac : 0,
				type : "count"
			},
			success : function(json) {
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json[prop]);
				drawGraph();
			}
		});
	}
}