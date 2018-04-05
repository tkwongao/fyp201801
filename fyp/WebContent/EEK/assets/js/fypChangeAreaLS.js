var area, malls = new Object();
const serverTimeZone = "+0800";

function ajaxGettingMalls() {
	$.ajax({
		type : "post",
		url : "prepareMall",
		traditional: true,
		success : function(json) {
			for ( var prop in json) {
				var jsonS1 = json[prop].split("}w/{");
				var jsonSplitToAreas = jsonS1[1].split(", "), jsonS2 = "{", i = 0;
				for (var anArea in jsonSplitToAreas) {
					if (i++ !== 0)
						jsonS2 += ",";
					jsonS2 += "\"" + jsonSplitToAreas[anArea].replace(/=/g, "\":{") + "}";
				}
				jsonS2 += "}";
				malls[prop] = {name: JSON.parse(jsonS1[0]), areas: JSON.parse(jsonS2)};
			}
			console.log(malls);
		},
		statusCode: {
			403: function() {
				window.location.href = "pages-403.html";
			},
			500: function() {
				window.location.href = "pages-500.html";
			}
		}
	});
}

// HTML5 Local Storage Required
function changeArea(a) {
	area = a;
	localStorage.setItem("area_id", a);
}