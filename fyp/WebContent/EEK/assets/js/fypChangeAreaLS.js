var area;
const serverTimeZone = "+0800";

// HTML5 Local Storage Required
function changeArea(a) {
	area = a;
	localStorage.setItem("area_id", a);
}