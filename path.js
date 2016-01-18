function buildMatrix() {
	// Build adjacency matrix
	var adj = new Array(16);	// 16x16 Empty Matrix
	for (var i=0; i<16; i++) {
	  adj[i] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	}

	/* Rules:
	 * Start at node 1, end at node 16
	 * Left adds 4, right subtracts 3, middle adds 7 (with exceptions below)
	 * Node 16 can only be reached through node 9 (using middle path)
	 * Any other number will skip 16 in its add/subtract count
	 * From 16 you can only go back to 9
	 */ 

	// Edges for adjacency matrix
	var left = [[1,5],[2,6],[3,7],[4,8],[5,9],[6,10],[7,11],[8,12],[9,13],[10,14],[11,15],[12,1],[13,2],[14,3],[15,4]];
	var right = [[4,1],[5,2],[6,3],[7,4],[8,5],[9,6],[10,7],[11,8],[12,9],[13,10],[14,11],[15,12],[3,15],[2,14],[1,13]];
	var middle = [[1,8],[2,9],[3,10],[4,11],[5,12],[6,13],[7,14],[8,15],[9,16],[10,2],[11,3],[12,4],[13,5],[14,6],[15,7],[16,9]];
	var total = [left,right,middle];

	// Put into matrix
	for (var i in total) {
		var part = total[i];
		for (var j in part) {
			var cell = part[j];
			adj[cell[0]-1][cell[1]-1] = 1; // Subtract by 1 for array positioning
		}
	}
	return [total,adj];
}

// Get shortest distance between every pair of nodes with path reconstruction
function floydWarshall(adj) {
	var n = adj.length; // Set n = adjacency matrix width
	
	// Array of min distances initialized at "infinity"
	var dist = new Array(n);
	for (var i=0; i<n; i++) {
		dist[i] = new Array(n);
		for (var j=0; j<n; j++) {
			dist[i][j] = 999;
		}
	}
	
	// Array of vertex indices initialized to null
	var next = new Array(n);
	for (var i=0; i<n; i++) {
		next[i] = new Array(n);
		for (var j=0; j<n; j++) {
			next[i][j] = null;
		}
	}
	
	// For each existing edge, set dist/path
	for (var i=0; i<n; i++) {
		for (var j=0; j<n; j++) {
			if (adj[i][j] > 0) {
				dist[i][j] = adj[i][j];
				next[i][j] = j;
			}
		}
	}
	
	// Standard Floyd-Warshall
	for (var k=0; k<n; k++) {
		for (var i=0; i<n; i++) {
			for (var j=0; j<n; j++) {
				if (dist[i][k] + dist[k][j] < dist[i][j]) {
					dist[i][j] = dist[i][k] + dist[k][j];
					next[i][j] = next[i][k];
				}
			}
		}
	}
	
	// Remove loops into same node (set to "infinity" distance)
	for (var i=0; i<n; i++) {
		dist[i][i] = 999;
	}
	return {dist,next};
}

// Get shortest path from two nodes
function path(next, u, v) {
	if (next[u][v] == null)
		return [];
	var route = [u];
	while (u != v) {
		u = next[u][v];
		route.push(u);
	}
	return route;
}

// Create 2D array of all possible edges between nodes in an array (as tuples)
// Used for sub-matrix (see buildSubMatrix() below)
function collectTuples(req) {
	var tuples = [];
	
	for (var i=0; i<req.length; i++) {
		var row = [];
		for (var j=0; j<req.length;j++) {
			row.push([req[i],req[j]]);
		}
		tuples.push(row);
	}
	return tuples;
}

// Removes 1 or 16 from required nodes
function removeStartEnd(req) {
	if (req.indexOf(1) > -1) {	// Remove start node (1) if included
		req.splice(req.indexOf(1),1);
	}
	
	if (req.indexOf(16) > -1) {	// Remove end node (9) if included
		req.splice(req.indexOf(16),1);
	}
	return req;
}

// Gathers all permutations of an array
// From http://stackoverflow.com/a/20871714
function permutations(inputArr) {
	var results = [];
	
	function permute(arr, memo) {
		var cur, memo = memo || [];
		
		for (var i=0; i<arr.length; i++) {
			cur = arr.splice(i,1);
			if (arr.length === 0) {
				results.push(memo.concat(cur));
			}
			permute(arr.slice(), memo.concat(cur));
			arr.splice(i, 0, cur[0]);
		}
		return results;
	}
	return permute(inputArr);
}

// Takes path options and picks best one
function pickBestPath(pathOptions,dist) {
	var bestOptions = [];
	var bestDist = 999;
	
	for (var i=0; i<pathOptions.length; i++) {
		var totalDist = dist[0][pathOptions[i][0]-1]; // Start with distance from node 1 to first required node
		// <debug> // console.log(1+" to "+ pathOptions[i][0] +" has dist of "+totalDist);
		for (var j=0; j<pathOptions[i].length-1; j++) {
			totalDist += dist[ pathOptions[i][j]-1 ][ pathOptions[i][j+1]-1 ];	// Add distance from "j"th required node to "j+1"th
			// <debug> // console.log(pathOptions[i][j]+" to "+  pathOptions[i][j+1] +" has dist of "+dist[ pathOptions[i][j] ][ pathOptions[i][j+1] ]);
		}
		// <debug> // console.log(pathOptions[i][pathOptions[i].length-1]+" to "+ (dist.length).toString() +" has dist of "+dist[ pathOptions[i][pathOptions[i].length-1]-1 ][ dist.length-1 ]);
		totalDist += dist[ pathOptions[i][pathOptions[i].length-1]-1 ][ dist.length-1 ];	// Add distance from last required node to end node (16)
		// <debug> // console.log("Using required node permutation of "+pathOptions[i]+" has distance of "+totalDist+".");
		if (totalDist < bestDist) {		// If this option is shorter
			bestDist = totalDist;				// Update shortest distance
			bestOptions = [];					// Clear bestOptions array
			bestOptions.push(i);				// Add path to bestOptions
		} else if (totalDist === bestDist) { // If this option is the same
			bestOptions.push(i);				// Just add path to bestOptions
		}
	}
	return bestOptions;
}

// Adds 1 to each element for proper path display
function addOnes(arr) {
	for (var i=0; i<arr.length; i++) {
		arr[i] = arr[i]+1;
	}
	return arr;
}

// Gets full paths for all best path options
function getFullBestPath(bestOptions, pathOptions, next) {
	var bestPaths = [];
	
	for (var i=0; i<bestOptions.length; i++) {
		// <debug> // console.log("Best path from 1 to "+pathOptions[bestOptions[i]][0]+" is "+addOnes(path(next,0,pathOptions[bestOptions[i]][0]-1)));
		var bestPath = addOnes(path(next,0,pathOptions[bestOptions[i]][0]-1)).toString();
		// ^ Start with path from start (1) to first required node
		
		for (var j=0; j<pathOptions[bestOptions[i]].length-1; j++) {
			// <debug> // console.log("Best path from "+pathOptions[bestOptions[i]][j]+" to "+pathOptions[bestOptions[i]][j+1]+" is "+addOnes(path(next,pathOptions[bestOptions[i]][j]-1,pathOptions[bestOptions[i]][j+1]-1)));
			bestPath += ','+addOnes(path(next,pathOptions[bestOptions[i]][j]-1,pathOptions[bestOptions[i]][j+1]-1)).toString();
			// ^ Attach path from required node to next required node
		}
		// <debug> // console.log("Best path from "+pathOptions[bestOptions[i]][pathOptions[bestOptions[i]].length-1]+" to "+16+" is "+addOnes(path(next,pathOptions[bestOptions[i]][pathOptions[bestOptions[i]].length-1]-1,15)));
		bestPath += ','+addOnes(path(next,pathOptions[bestOptions[i]][pathOptions[bestOptions[i]].length-1]-1,15)).toString();
		// ^ Attach path from last required node to end node (16)
		bestPaths.push(bestPath);
	}
	return bestPaths;
}

// Paths connected together will have repeat consecutive nodes so this removes those
function removeRepeatNodes(pathStr) {
	var pathArr = pathStr.split(",");
	for (var i=0; i<pathArr.length; i++) {
		if (pathArr[i] === pathArr[i+1]) {
			pathArr.splice(i+1, 1);
			i--;
		}
	}
	return pathArr.toString();
}

// Using the final path, this gets the directions required to take the path
function getDirections(pathStr,dirs) {
	var pathArr = pathStr.split(",");
	var dirStr = "The directions from start are ";
	
	for (var i=0; i<pathArr.length-1; i++) {
		for (var j=0; j<dirs.length; j++ ) {
			for (var k=0; k<dirs[j].length; k++) {
				// Find which direction array the edge is in
				if (pathArr[i] == dirs[j][k][0] && pathArr[i+1] == dirs[j][k][1]) {
					switch ( j ) {
						case 0:
							dirStr += "L, ";
							break;
						case 1:
							dirStr += "R, ";
							break;
						case 2:
							dirStr += "M, ";
							break;
					} // end cases
					break;
				}
			}
		}
	}
	return dirStr.slice(0, -2)+"."; // Remove last comma, add period
}

// Main start //
function main(req) {
	var ad = buildMatrix();			// Start by building adjacency matrix according to LMPQ rules
	var dirs = ad[0];				// Array containing left/middle/right direction arrays (each containing tuples of valid edges)
	var adj = ad[1];					// Adjacency matrix
	var dn = floydWarshall(adj);	// Run Floyd-Warshall to get distances between all nodes (and next node for paths)
	var dist = dn.dist;					// Distances array 
	var next = dn.next;					// Next node array

	req = removeStartEnd(req);		// Remove start (1) and end (16) nodes if exist in required array
	if (req.length == 0) {			// If empty array after removing 1,16
		req = [9];					// Only required node to reach end is 9
	}
	
	var pathOptions = permutations(req);
	var bestOptions = pickBestPath(pathOptions,dist);
	var bestPaths = getFullBestPath(bestOptions,pathOptions,next);

	// For loops in case of multiple equal paths
	var text = "";
	for (var i=0; i<bestPaths.length; i++) {
		text += "The shortest path is "+removeRepeatNodes(bestPaths[i])+".";
		text += "<BR/>";
		text += getDirections(removeRepeatNodes(bestPaths[i]),dirs);
		text += "<BR/><BR/>";
	}
	return text;

}
main([1,16]);
// (2,10), (3,4), (6,7), (5,8), (9)