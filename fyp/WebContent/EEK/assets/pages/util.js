var MapTool = {
	AREA_SELECT : 0,
	DRAG : 1
};

function intersectSVGRect(rect1, rect2)
{
	var r1 = {
		left: rect1.x,
		right: rect1.x + rect1.width,
		top: rect1.y,
		bottom: rect1.y + rect1.height
	};
	
	var r2 = {
		left: rect2.x,
		right: rect2.x + rect2.width,
		top: rect2.y,
		bottom: rect2.y + rect2.height
	};
	
	return !(
		r2.left > r1.right || 
		r2.right < r1.left || 
		r2.top > r1.bottom ||
		r2.bottom < r1.top
	);
}

function svgToScreen(svgDom, svgPoint)
{
	var screenPoint = svgDom.createSVGPoint();
		screenPoint.x = svgPoint.x;
		screenPoint.y = svgPoint.y;

	var ctm = svgDom.getScreenCTM();
	
	return screenPoint.matrixTransform(ctm);
}

function screenToSvg(svgDom, screenPoint)
{
	var svgPoint = svgDom.createSVGPoint();
		svgPoint.x = screenPoint.x;
		svgPoint.y = screenPoint.y;

	var ctm = svgDom.getScreenCTM();
	
	return svgPoint.matrixTransform(ctm.inverse());
}

function worldToSvg(svgDom, worldPos, camera)
{
	var vector = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z);

	// map to normalized device coordinate (NDC) space
	vector.project( camera );

	// map to 2D SVG space
	var svgPoint = svgDom.createSVGPoint();
		svgPoint.x = (   vector.x + 1 ) * renderer.domElement.getAttribute('width')  / 2 ;
		svgPoint.y = ( - vector.y + 1 ) * renderer.domElement.getAttribute('height') / 2 ;
		
	return svgPoint;
}

function svgToWorld(svgDom, svgPoint, camera)
{
	var worldPos = new THREE.Vector3(
		(svgPoint.x * 2 / renderer.domElement.getAttribute('width') - 1),
		-1 * (svgPoint.y * 2 / renderer.domElement.getAttribute('height') - 1),
		0.9979162836305694	//magic number
	);

	worldPos.unproject(camera);
		
	return worldPos;
}