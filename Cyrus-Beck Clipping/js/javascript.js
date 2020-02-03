"use strict";

var canvas;
var ctx;
var mouseCoordinate;
var DotX = [];
var DotY = [];
var polygon_axis_x = [];
var polygon_axis_y = [];
var line_axis_x = [];
var line_axis_y = [];
var x_points = [];
var y_points = [];
var entering =  false;
var leaving = false;
var crossProduct;
var checkConvex;
var upZero ;
var lowZero ;
var Nx;
var Ny;
var D;
var Wx;
var Wy;
var vectorLinex;
var vectorLiney;
var T;
var TEmax = [];
var TLmin = [];
var startPosition;
var curPosition;
var lastPosition;
var snapShot;
var dragging;
var tools;
var rect;
var list;
var checkDot;
var checkInside = [];

for (var i = 0; i < 100; i++) {
	TEmax[i] = 0;
	TLmin[i] = 1;
	checkInside[i] = "inside";
}

window.addEventListener("load",initial,false);

function initial(){					
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	list = "dot";
	canvas.addEventListener("mousemove",showCoordinate,false);
}

function showCoordinate(event){
	mouseCoordinate = getCoordinate(event);
	document.getElementById("coordX").innerHTML = "X : " + mouseCoordinate.x;
	document.getElementById("coordY").innerHTML = "Y : " + mouseCoordinate.y;
}

function getCoordinate(event){
	var x = event.clientX - ctx.canvas.offsetLeft;
	var y = event.clientY - ctx.canvas.offsetTop;

	return {x : x, y : y};
}

function takeSnapshot(){
	snapShot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot(){
	ctx.putImageData(snapShot, 0, 0);
}

function drawLine(curPosition){
	ctx.beginPath();
	if (tools == "dot") {
		ctx.arc(startPosition.x, startPosition.y, 3, 0, 2*Math.PI);
		ctx.fill();
	}
	else if(tools == "line" || tools == "polygon"){
	ctx.moveTo(startPosition.x, startPosition.y);
	ctx.lineTo(curPosition.x, curPosition.y);
	ctx.stroke();
	}
}

function dragStart(event){
	dragging = true;
	checkDot = false;
		
	startPosition = getCoordinate(event);
	takeSnapshot();
			
	if (tools != "dot") {
		x_points.push(startPosition.x);
		y_points.push(startPosition.y);
	}
			
	if (tools == "polygon" ) {
		if(x_points[x_points.length-2] != startPosition.x && y_points[y_points.length-2] != startPosition.y){
			polygon_axis_x.push(startPosition.x);
			polygon_axis_y.push(startPosition.y);
		}
	}
	else if(tools == "line"){
		line_axis_x.push(startPosition.x);
		line_axis_y.push(startPosition.y);
	}
	else if(tools == "dot"){
		dragging = false;
		if (DotX.length > 0) {
			for (var i = 0 ; i < DotX.length; i++) {
				if (DotX[i] == startPosition.x && DotY[i] == startPosition.y) {
					checkDot = true;
				}		
			}
		}
		if (checkDot == false) {
			DotX.push(startPosition.x);
			DotY.push(startPosition.y);
		}
	}
}

function drag(event){
	if (dragging == true) {
		restoreSnapshot();
		curPosition = getCoordinate(event);
		drawLine(curPosition);
	}
}

function dragStop(event){
	restoreSnapshot();
	lastPosition = getCoordinate(event);
	drawLine(lastPosition);

	if (tools != "dot") {
		x_points.push(lastPosition.x);
		y_points.push(lastPosition.y);
	}
		
	if (tools == "line") {
		dragging = false;
		line_axis_x.push(lastPosition.x);
		line_axis_y.push(lastPosition.y);

		while(x_points.length != 0 && y_points.length != 0){
			x_points.pop();
			y_points.pop();
		}
	}

	else if(tools == "polygon"){
		if(x_points[x_points.length-1] != lastPosition.x && y_points[y_points.length-1] != lastPosition.y){
			polygon_axis_x.push(lastPosition.x);
			polygon_axis_y.push(lastPosition.y);
		}			
	}

	else if(tools == "polygon" && x_points[0] == lastPosition.x && y_points[0] == lastPosition.y){
		dragging = false;				
		while(x_points.length != 0 && y_points.length != 0){
			x_points.pop();
			y_points.pop();
		}
	}
}

function closePoly(){
	ctx.beginPath();
	ctx.moveTo(lastPosition.x,lastPosition.y);
	ctx.lineTo(polygon_axis_x[0],polygon_axis_y[0]);
	ctx.stroke();
	if (polygon_axis_x.length > 2) {
		clipping();	
	}
	else{
		alert("NOT POLYGON");
		dragging = false;
	}
	
}
function clipping(){
	lowZero = false;
	upZero = false;
	for(var i=0;i < polygon_axis_x.length;i++){
		var firstLinex;
		var firstLiney;
		var secondLinex;
		var secondLiney;

		if(i == polygon_axis_x.length-2){
			firstLinex = polygon_axis_x[i+1] - polygon_axis_x[i];
			firstLiney = polygon_axis_y[i+1] - polygon_axis_y[i];

			secondLinex = polygon_axis_x[0] - polygon_axis_x[i+1];
			secondLiney = polygon_axis_y[0] - polygon_axis_y[i+1];
		}
		else if(i == polygon_axis_x.length - 1){
			firstLinex = polygon_axis_x[0] - polygon_axis_x[i];
			firstLiney = polygon_axis_y[0] - polygon_axis_y[i];

			secondLinex = polygon_axis_x[1] - polygon_axis_x[0];
			secondLiney = polygon_axis_y[1] - polygon_axis_y[0];
		}
		else{
			firstLinex = polygon_axis_x[i+1] - polygon_axis_x[i];
			firstLiney = polygon_axis_y[i+1] - polygon_axis_y[i];

			secondLinex = polygon_axis_x[i+2] - polygon_axis_x[i+1];
			secondLiney = polygon_axis_y[i+2] - polygon_axis_y[i+1];
		}

		crossProduct = (firstLinex *  secondLiney) - (firstLiney * secondLinex);
				
		if (crossProduct > 0){
			upZero = true;					
		}
		else if(crossProduct < 0){
			lowZero = true;				
		}
	}

	if ((upZero == true && lowZero == false) || (upZero == false && lowZero == true) ){
		checkConvex = true;
	}
	else if (upZero == true && lowZero == true){
		checkConvex = false;
	}

	if (checkConvex == true) {
		if (upZero ==  true) {
			for (var i = 0; i < polygon_axis_x.length; i++) {
				if (i == polygon_axis_x.length - 1) {
					Nx =  polygon_axis_y[i] - polygon_axis_y[0];
					Ny = polygon_axis_x[0] - polygon_axis_x[i];
				}
				else{
					Nx = polygon_axis_y[i] - polygon_axis_y[i+1];
					Ny = polygon_axis_x[i+1] - polygon_axis_x[i];
				}

				var k = 0;	

				for (var j = 0; j < line_axis_x.length; j+=2) {							
					vectorLinex = line_axis_x[j+1] - line_axis_x[j];
					vectorLiney =  line_axis_y[j+1] - line_axis_y[j];

					D = (Nx * vectorLinex) + (Ny * vectorLiney);
						
					Wx = (line_axis_x[j] - polygon_axis_x[i]);
					Wy = (line_axis_y[j] - polygon_axis_y[i]);

					T = -(((Nx * Wx) + (Ny * Wy)) / D);

					if(D > 0){
						if(T > TEmax[k]){
							TEmax[k] = T;
						}
					}
					else if(D < 0){
						if (T < TLmin[k]) {
							TLmin[k] = T;
						}
					}
					
					k++;
				}
				var l = 0;
				for (var j = 0; j < DotX.length; j++) {
					Wx = (DotX[j] - polygon_axis_x[i]);
					Wy = (DotY[j] - polygon_axis_y[i]);

					var x = (Nx * Wx) + (Ny * Wy);
					if (x < 0) {
						checkInside[l] = "outside";
					}
					l++;
				}
			}
		}
		else if (lowZero ==  true) {
			for (var i = 0; i < polygon_axis_x.length; i++) {
				if (i == polygon_axis_x.length - 1) {
					Nx =  polygon_axis_y[0] - polygon_axis_y[i];
					Ny = polygon_axis_x[i] - polygon_axis_x[0];
				}
				else{
					Nx = polygon_axis_y[i+1] - polygon_axis_y[i];
					Ny = polygon_axis_x[i] - polygon_axis_x[i+1];
				}

				var k = 0;	

				for (var j = 0; j < line_axis_x.length; j+=2) {
					vectorLinex = line_axis_x[j+1] - line_axis_x[j];
					vectorLiney =  line_axis_y[j+1] - line_axis_y[j];

					D = (Nx * vectorLinex) + (Ny * vectorLiney);
					
					Wx = (line_axis_x[j] - polygon_axis_x[i]);
					Wy = (line_axis_y[j] - polygon_axis_y[i]);

					T = -(((Nx * Wx) + (Ny * Wy)) / D);
			
					if(D > 0){
						if(T > TEmax[k]){
							TEmax[k] = T;
						}
					}
					else if(D < 0){
						if (T < TLmin[k]) {
							TLmin[k] = T;
						}
					}
			
					k++;
				}
				var l = 0;
				for (var j = 0; j < DotX.length; j++) {
					Wx = (DotX[j] - polygon_axis_x[i]);
					Wy = (DotY[j] - polygon_axis_y[i]);

					var x = (Nx * Wx) + (Ny * Wy);
					if (x < 0) {
						checkInside[l] = "outside";
					}
					l++;
				}
			}
		}
 				
 		for (var j = 0;j < line_axis_x.length/2;j++) {
 			if(TEmax[j] < TLmin[j]){
	 			var clippingStartPointx;
	 			var clippingStartPointy;
	 			var clippingEndPointx;
	 			var clippingEndPointy;
	 			var a = j*2;
	 			var b = 1;


	 				vectorLinex = line_axis_x[a+b] - line_axis_x[a];
					vectorLiney =  line_axis_y[a+b] - line_axis_y[a];
	 					
					clippingStartPointx = line_axis_x[a] + (vectorLinex * TEmax[j]);
					clippingStartPointy = line_axis_y[a] + (vectorLiney * TEmax[j]);

					clippingEndPointx = line_axis_x[a] + (vectorLinex * TLmin[j]);
					clippingEndPointy = line_axis_y[a] + (vectorLiney * TLmin[j]);
	 					
	 			ctx.beginPath();
				ctx.strokeStyle = "blue";
				ctx.lineWidth = 5;
				ctx.moveTo(clippingStartPointx,clippingStartPointy);
				ctx.lineTo(clippingEndPointx,clippingEndPointy);
				ctx.stroke();
			}
 		}
		for (var i = 0; i < DotX.length; i++) {
			if (checkInside[i] == "inside") {
				ctx.fillStyle = "blue";
				ctx.beginPath();
				ctx.arc(DotX[i],DotY[i],4,0,2*Math.PI);
				ctx.fill();
			}
		}
		
 		dragging = false;
	}
	else if(checkConvex == false){
		alert('Polygon Not Convex');
		checkConvex = false;
		dragging = false;
	}
}

function draw(x){
	tools = x;	
	if (x != "pointer") {
		if (x == "line") {
			ctx.strokeStyle = "purple";
			ctx.lineWidth = 2;
		}
		else if(x == "dot"){
			ctx.fillStyle = "purple";
		}			
		else if( x == "polygon"){
			ctx.strokeStyle = "red";
			ctx.lineWidth = 3;
		}

	
		canvas.addEventListener("mousedown",dragStart,false);
		canvas.addEventListener("mousemove",drag,false);
		canvas.addEventListener("mouseup",dragStop,false);
		
		if (tools == "polygon") {
			canvas.addEventListener("dblclick",closePoly,false);
		}
	}
}

function clearScreen(){

	tools = "pointer";
	dragging = false;

	while(x_points.length != 0 || y_points.length != 0 || polygon_axis_y != 0 || polygon_axis_x != 0 || line_axis_y != 0 || line_axis_x != 0 || DotX != 0 || DotY != 0){
		polygon_axis_x.pop();
		polygon_axis_y.pop();
		x_points.pop();
		y_points.pop();
		line_axis_x.pop();
		line_axis_y.pop();
		DotX.pop();
		DotY.pop();
	}
	for (var i = 0; i < 100; i++) {
		TEmax[i] = 0;
		TLmin[i] = 1;
		checkInside[i] = "inside";
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);


}

function show(){
	tools = "pointer";
	dragging = false;
	document.getElementById("deleteSheet").style.display = "block";
	document.getElementById("close").style.display = "block";
	if(list == "dot"){
		document.getElementById("dotList").style.display = "block";
		document.getElementById("lineList").style.display = "none";
		document.getElementById("deleteSheet").style.height = "155px";
		dotList();
	}
	else if(list == "line"){
		document.getElementById("dotList").style.display = "none";
		document.getElementById("lineList").style.display = "block";
		document.getElementById("deleteSheet").style.height = "200px";
		lineList();
	}	
}

function closeSheet(){
	document.getElementById("deleteSheet").style.display = "none";
 	document.getElementById("close").style.display = "none";
 	document.getElementById("nopoint").style.display = "none";
 	document.getElementById("noline").style.display = "none";
}

function saveImg(){
	var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
	window.location.href = image;

}
function showList(x){
	list = x;
	if(list == "dot"){
		document.getElementById("dotList").style.display = "block";
		document.getElementById("lineList").style.display = "none";
		document.getElementById("deleteSheet").style.height = "155px";
		dotList();
	}
	else if(list == "line"){
		document.getElementById("dotList").style.display = "none";
		document.getElementById("lineList").style.display = "block";
		document.getElementById("deleteSheet").style.height = "200px";
		lineList();
	}
}
function dotList(){
	var dotTable = document.getElementById("dotTable");
	if(DotX.length > 0){
		var rows = "<tr><th>COORDINATE</th>";
		for (var i = 1; i <= DotX.length; i++) {
			rows += "<th>";
			rows += i.toString();
			rows += "</th>";
		}
		rows += "</tr><tr><th>X</th>";
		for (var i = 0; i < DotX.length; i++) {
			rows += "<th>";
			rows += DotX[i];
			rows += "</th>";
		}
		rows += "</tr><tr><th>Y</th>";
		for (var i = 0; i < DotX.length; i++) {
			rows += "<th>";
			rows += DotY[i];
			rows += "</th>";
		}
		rows += "</tr><tr><th>ACTION</th>";
		for (var i = 0; i < DotX.length; i++) {
			rows += "<th>";
			rows += "<button onclick='deleteDot(" + i + ")' style='border:none;width:70px;height30px;padding:5px;background-color:red;color:white;'>DELETE</button>";
			rows += "</th>";
		}
		rows += "</tr>";
		document.getElementById("nopoint").style.display = "none";
		document.getElementById("noline").style.display = "none";
		dotTable.innerHTML = rows;
	}
	else if (DotX.length == 0) {
		document.getElementById("nopoint").style.display = "block";
		document.getElementById("noline").style.display = "none";
		document.getElementById("dotList").style.display = "none";
	}

}

function lineList(){
	var lineTable = document.getElementById("lineTable");
	if (line_axis_x.length > 0) {
		var rows = "<tr><th>COORDINATE</th>";
		for (var i = 1; i <= line_axis_x.length/2; i++) {
			rows += "<th>";
			rows += i.toString();
			rows += "</th>";
		}
		rows += "</tr><tr><th>X1</th>";
		for (var i = 0; i < line_axis_x.length; i+=2) {
			rows += "<th>";
			rows += line_axis_x[i];
			rows += "</th>";
		}
		rows += "</tr><tr><th>Y1</th>";
		for (var i = 0; i < line_axis_y.length; i+=2) {
			rows += "<th>";
			rows += line_axis_y[i];
			rows += "</th>";
		}
		rows += "</tr><tr><th>X2</th>";
		for (var i = 1; i < line_axis_x.length; i+=2) {
			rows += "<th>";
			rows += line_axis_x[i];
			rows += "</th>";
		}
		rows += "</tr><tr><th>Y1</th>";
		for (var i = 1; i < line_axis_y.length; i+=2) {
			rows += "<th>";
			rows += line_axis_y[i];
			rows += "</th>";
		}
		rows += "</tr><tr><th>ACTION</th>";
		for (var i = 0; i < line_axis_x.length; i+=2) {
			rows += "<th>";
			rows += "<button onclick='deleteLine(" + i + ")' style='border:none;width:70px;height30px;padding:5px;background-color:red;color:white;'>DELETE</button>";
			rows += "</th>";
		}
		rows += "</tr>";
		document.getElementById("nopoint").style.display = "none";
		document.getElementById("noline").style.display = "none";
		lineTable.innerHTML = rows;
	}
	else if (line_axis_x.length == 0){
		document.getElementById("nopoint").style.display = "none";
		document.getElementById("noline").style.display = "block";
		document.getElementById("lineList").style.display = "none";
	}
}

function deleteDot(x){
	var index = x;
	ctx.strokeStyle = "purple";
	ctx.fillStyle = "purple";
	ctx.lineWidth = 2;
	if (index == DotX.length-1){
		DotX.pop();
		DotY.pop();
	}
	else{
		for(var i = index;i < DotX.length;i++){			
			if (i == DotX.length - 1) {
				DotX.pop();
				DotY.pop();
			}
			else{
				DotX[i] = DotX[i+1];
				DotY[i] = DotY[i+1];
			}
		}
	}
	ctx.clearRect(0,0,canvas.width,canvas.height);
	for (var i = 0; i < DotX.length; i++) {
		ctx.beginPath();
		ctx.arc(DotX[i],DotY[i],3,0,Math.PI * 2);
		ctx.fill();
	}
	for (var i = 0; i < line_axis_x.length; i+=2) {
		ctx.beginPath();
		ctx.moveTo(line_axis_x[i],line_axis_y[i]);
		ctx.lineTo(line_axis_x[i+1],line_axis_y[i+1]);
		ctx.stroke();
	}
	for (var i = index; i < DotX.length; i++) {
		if (i == DotX.length - 1) {
			checkInside.pop();
		}
		else{
			checkInside[i] = checkInside[i+1];
		}
	}
	if (polygon_axis_x.length > 0) {
		for (var i = 0; i < polygon_axis_x.length; i++) {
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.strokeStyle = "red";
			if (i == polygon_axis_x.length - 1) {
				ctx.moveTo(polygon_axis_x[i], polygon_axis_y[i]);
				ctx.lineTo(polygon_axis_x[0], polygon_axis_y[0]);

			}
			else {
				ctx.moveTo(polygon_axis_x[i], polygon_axis_y[i]);
				ctx.lineTo(polygon_axis_x[i+1], polygon_axis_y[i+1]);
			}
			ctx.stroke();
		}
		clipping();
	}
	dotList();
}
function deleteLine(x){
	var index = x;
	ctx.strokeStyle = "purple";
	ctx.lineWidth = "2";

	if (index == line_axis_x.length-2){
		line_axis_x.pop();
		line_axis_y.pop();
		line_axis_x.pop();
		line_axis_y.pop();
	}
	else{
		index++;
		for(var i = index;i < line_axis_x.length;i+=2){			
			if (i == line_axis_x.length - 1) {
				line_axis_x.pop();
				line_axis_y.pop();
			}
			else{
				line_axis_x[i] = line_axis_x[i+2];
				line_axis_y[i] = line_axis_y[i+2];
			}
		}
		index--;
		for(var i = index;i < line_axis_x.length;i+=2){			
			if (i == line_axis_x.length - 1) {
				line_axis_x.pop();
				line_axis_y.pop();
			}
			else{
				line_axis_x[i] = line_axis_x[i+2];
				line_axis_y[i] = line_axis_y[i+2];
			}
		}
	}
	ctx.clearRect(0,0,canvas.width,canvas.height);
	for (var i = 0; i < line_axis_x.length; i+=2) {
		ctx.beginPath();
		ctx.moveTo(line_axis_x[i],line_axis_y[i]);
		ctx.lineTo(line_axis_x[i+1],line_axis_y[i+1]);
		ctx.stroke();
	}
	for (var i = 0; i < DotX.length; i++) {
		ctx.beginPath();
		ctx.fillStyle = "purple";
		ctx.arc(DotX[i],DotY[i],3,0,Math.PI * 2);
		ctx.fill();
	}
	for (var i = index; i < line_axis_x.length; i++) {
		if (i == line_axis_x.length - 1) {
			TEmax.pop();
			TLmin.pop();
		}
		else{
			TEmax[i] = TEmax[i+1];
			TLmin[i] = TLmin[i+1];
		}
	}
	
	if (polygon_axis_x.length > 0) {
		for (var i = 0; i < polygon_axis_x.length; i++) {
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.strokeStyle = "red";
			if (i == polygon_axis_x.length - 1) {
				ctx.moveTo(polygon_axis_x[i], polygon_axis_y[i]);
				ctx.lineTo(polygon_axis_x[0], polygon_axis_y[0]);

			}
			else {
				ctx.moveTo(polygon_axis_x[i], polygon_axis_y[i]);
				ctx.lineTo(polygon_axis_x[i+1], polygon_axis_y[i+1]);
			}
			ctx.stroke();
		}
		clipping();
	}
	lineList();
}
function removePolygon(){
	tools = "pointer";
	dragging = false;
	ctx.strokeStyle = "purple";
	ctx.lineWidth = "2";

	ctx.clearRect(0,0,canvas.width,canvas.height);

	while(polygon_axis_x.length != 0 || polygon_axis_y.length != 0) {
		polygon_axis_x.pop();
		polygon_axis_y.pop();
	}

	for (var i = 0; i < line_axis_x.length; i+=2) {
		ctx.beginPath();
		ctx.moveTo(line_axis_x[i],line_axis_y[i]);
		ctx.lineTo(line_axis_x[i+1],line_axis_y[i+1]);
		ctx.stroke();
	}
	for (var i = 0; i < DotX.length; i++) {
		ctx.beginPath();
		ctx.fillStyle = "purple";
		ctx.arc(DotX[i],DotY[i],3,0,Math.PI * 2);
		ctx.fill();
	}
}
