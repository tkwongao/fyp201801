var currentTime = 1508515200000;
var userMac;
var storeId;

function changeScopeWithMac(i, requestType, macAddress, stid) {
	userMac = macAddress;
	storeId = stid;
	changeScope(i, requestType);
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : currentTime - 3600000 * interval * numberOfDataInGraph,
			end : currentTime,
			storeId : -1,
			interval : 0,
			userMac : userMac,
			type : "loyalty"
		},
		success : function(json) {
			var i = 0;
			valFromDB = new Array();
			for ( var prop in json)
				valFromDB.push(json["dataPoint" + ++i]);
			$("#loyalty").text(valFromDB[0]);
		}
	});
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : currentTime - 3600000 * interval * numberOfDataInGraph,
			end : currentTime,
			storeId : -1,
			interval : 0,
			userMac : userMac,
			type : "user"
		},
		success : function(json) {
			var i = 0;
			valFromDB = new Array();
			for ( var prop in json)
				valFromDB.push(json["dataPoint" + ++i]);
			$("#userDwellTime").text(valFromDB[0]);
		}
	});
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : currentTime - 3600000 * interval * numberOfDataInGraph,
			end : currentTime,
			storeId : stid,
			interval : 0,
			userMac : userMac,
			type : "user"
		},
		success : function(json) {
			var i = 0;
			valFromDB = new Array();
			for ( var prop in json)
				valFromDB.push(json["dataPoint" + ++i]);
			$("#userDwellTimeInStore").text(valFromDB[0]);
		}
	});
}

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
				var i = 0;
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json["dataPoint" + ++i]);
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
				var i = 0;
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json["dataPoint" + ++i]);
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
					var i = 0;
					valFromDB = new Array();
					for ( var prop in json)
						valFromDB.push(json["dataPoint" + ++i]);
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
					var i = 0;
					valFromDB = new Array();
					for ( var prop in json)
						valFromDB.push(json["dataPoint" + ++i]);
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
				var i = 0;
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json["dataPoint" + ++i]);
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
				var i = 0;
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json["dataPoint" + ++i]);
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
				var i = 0;
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json["dataPoint" + ++i]);
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
				var i = 0;
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json["dataPoint" + ++i]);
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
				var i = 0;
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json["dataPoint" + ++i]);
				drawGraph();
			}
		});
	}
	else if (requestTypeL === "loyalty") {
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : currentTime - 3600000 * interval * numberOfDataInGraph,
				end : currentTime,
				storeId : -1,
				interval : interval,
				userMac : userMac,
				type : "loyalty"
			},
			success : function(json) {
				var i = 0;
				valFromDB = new Array();
				for ( var prop in json)
					valFromDB.push(json["dataPoint" + ++i]);
				drawGraph();
			}
		});
	}
}