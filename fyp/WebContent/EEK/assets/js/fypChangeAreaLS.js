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
			var list = "";
			for (var prop in malls)
				list += "<li><a href=\"javascript:changeMall('" + prop + "', '" + malls[prop].name.en + "');\">" + malls[prop].name.en + "</a></li>";
			$("#malls").html(list);
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

//HTML5 Local Storage Required
function changeMall(a, name) {
	if (name === undefined)
		name = getMallName(a);
	mall = a;
	localStorage.setItem("mall_id", a);
	document.getElementById("currentMall").innerHTML = name + " <span class=\"caret\"></span>";
	var list = "", i = 0, newArea = null, newAreaName = null;
	for (var prop in malls[a].areas) {
		var name2 = malls[a].areas[prop].en;
		list += "<li><a href=\"javascript:changeArea('" + prop + "', '" + name2 + "');\">" + name2 + "</a></li>";
		if (i++ === 0) {
			newArea = prop;
			newName = name2;
		}
	}
	document.getElementById("areas").innerHTML = list;
	setTimeout(changeArea(newArea, newName), 2000);
}

function getMallName(a) {
	var items = document.getElementById("malls").children;
	for (var i = 0; i < items.length; i++)
        if (items[i].children[0].attributes[0].value.toString().search(a) !== -1)
        	return items[i].children[0].innerHTML;
}

function changeArea(a, name) {
	if (name === undefined)
		name = getAreaName(a);
	area = a;
	localStorage.setItem("area_id", a);
	document.getElementById("currentArea").innerHTML = name + " <span class=\"caret\"></span>";
	ajaxGettingStores(area);
	if (typeof(mainProcedure) === 'function')
		mainProcedure();
}

function getAreaName(a) {
	var items = document.getElementById("areas").children;
	for (var i = 0; i < items.length; i++)
        if (items[i].children[0].attributes[0].value.toString().search(a) !== -1)
        	return items[i].children[0].innerHTML;
}