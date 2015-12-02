
//
// Global accessor.
//
var flowchart = {

};

// Module.
(function () {

	//
	// Width of a node.
	//
	flowchart.nodeWidth = 250;

	//
	// Amount of space reserved for displaying the node's name.
	//
	flowchart.nodeNameHeight = 40;

	//
	// Height of a connector in a node.
	//
	flowchart.connectorHeight = 35;

	//
	// Compute the Y coordinate of a connector, given its index.
	//
	flowchart.computeConnectorY = function (connectorIndex) {
		return flowchart.nodeNameHeight + (connectorIndex * flowchart.connectorHeight);
	}

	//
	// Compute the position of a connector in the graph.
	//
	flowchart.computeConnectorPos = function (node, connectorIndex, inputConnector) {
		return {
			//x: node.x() + (inputConnector ? 0 : flowchart.nodeWidth),
			x: node.x() + (inputConnector ? node.inputConnectors[connectorIndex]._x : node.outputConnectors[connectorIndex]._x),
			y: node.y() + (inputConnector ? node.inputConnectors[connectorIndex]._y : node.outputConnectors[connectorIndex]._y),
		};
	};

	//
	// View model for a connector.
	//
	flowchart.ConnectorViewModel = function (connectorDataModel, x, y, parentNode) {

		this.data = connectorDataModel;
		this._parentNode = parentNode;
		this._childNode = undefined;
		this._data = undefined;
		this._x = x;
		this._y = y;

		//
		// The name of the connector.
		//
		this.name = function () {
			return this.data.name;
		}

		//
		// X coordinate of the connector.
		//
		this.x = function () {
			return this._x;
		};

		//
		// Y coordinate of the connector.
		//
		this.y = function () { 
			return this._y;
		};

		//
		// The parent node that the connector is attached to.
		//
		this.parentNode = function () {
			return this._parentNode;
		};
		
		//
		// The parent node that the connector is attached to.
		//
		this.childNode = function () {
			return this._childNode;
		};
		
		//
		// The connection model
		//
		this.data = function () {
			return this._data;
		};
	};

	//
	// Create view model for a list of data models.
	//
	var createConnectorsViewModel = function (connectorDataModels, x, parentNode) {
		var viewModels = [];

		if (connectorDataModels) {
			for (var i = 0; i < connectorDataModels.length; ++i) {
				var connectorViewModel = 
					new flowchart.ConnectorViewModel(connectorDataModels[i], x, flowchart.computeConnectorY(i), parentNode);
				viewModels.push(connectorViewModel);
			}
		}

		return viewModels;
	};

	//
	// View model for a node.
	//
	flowchart.NodeViewModel = function (nodeDataModel) {

		this.data = nodeDataModel;
		this.inputConnectors = createConnectorsViewModel(this.data.inputConnectors, 0, this, "input");
		//this.outputConnectors = createConnectorsViewModel(this.data.outputConnectors, flowchart.nodeWidth, this, "output");
		this.outputConnectors = createConnectorsViewModel(this.data.outputConnectors, flowchart.computeConnectorY(Math.max(this.data.outputConnectors.length,this.data.inputConnectors.length)), this, "output");

		// Set to true when the node is selected.
		this._selected = false;

		//
		// Name of the node.
		//
		this.name = function () {
			return this.data.name || "";
		};

		//
		// X coordinate of the node.
		//
		this.x = function () { 
			return this.data.x;
		};

		//
		// Y coordinate of the node.
		//
		this.y = function () {
			return this.data.y;
		};

		//
		// Width of the node.
		//
		this.width = function () {
			//return flowchart.nodeWidth;
			var numConnectors =
				Math.max(
					this.inputConnectors.length, 
					this.outputConnectors.length);
			return flowchart.computeConnectorY(numConnectors);
		}
		
		this.outputConnectorX = function() {
			for (var index = 0; index < this.outputConnectors.length; index++) {
				var radius = (this.width()/2);
				var center_y = radius; // It's a circle, the center coordinates are equal to the radius
				var center_x = radius;
				this.outputConnectors[index]._x = radius * Math.cos(Math.asin((this.outputConnectors[index]._y - center_y) / radius)) + center_x;
			}
		}
		
		this.inputConnectorX = function() {
			for (var index = 0; index < this.inputConnectors.length; index++) {
				var radius = (this.width()/2);
				var center_y = radius; // It's a circle, the center coordinates are equal to the radius
				var center_x = radius;
				this.inputConnectors[index]._x = center_x - radius * Math.cos(Math.asin((this.inputConnectors[index]._y - center_y) / radius));
			}
		}

		//
		// Height of the node.
		//
		this.height = function () {
			var numConnectors =
				Math.max(
					this.inputConnectors.length, 
					this.outputConnectors.length);
			return flowchart.computeConnectorY(numConnectors);
		}

		//
		// Select the node.
		//
		this.select = function () {
			this._selected = true;
		};

		//
		// Deselect the node.
		//
		this.deselect = function () {
			this._selected = false;
		};

		//
		// Toggle the selection state of the node.
		//
		this.toggleSelected = function () {
			this._selected = !this._selected;
		};

		//
		// Returns true if the node is selected.
		//
		this.selected = function () {
			return this._selected;
		};

		//
		// Internal function to add a connector.
		this._addConnector = function (connectorDataModel, x, connectorsDataModel, connectorsViewModel) {
			var connectorViewModel = 
				new flowchart.ConnectorViewModel(connectorDataModel, x, 
						flowchart.computeConnectorY(connectorsViewModel.length), this);

			connectorsDataModel.push(connectorDataModel);
			// Add to node's view model.
			connectorsViewModel.push(connectorViewModel);
		}

		//
		// Add an input connector to the node.
		//
		this.addInputConnector = function (connectorDataModel) {
			if (!this.data.inputConnectors) {
				this.data.inputConnectors = [];
			}
			this._addConnector(connectorDataModel, 0, this.data.inputConnectors, this.inputConnectors, "input");
			this.inputConnectorX();
			this.outputConnectorX();
		};

		//
		// Add an ouput connector to the node.
		//
		this.addOutputConnector = function (connectorDataModel) {
			if (!this.data.outputConnectors) {
				this.data.outputConnectors = [];
			}
			this._addConnector(connectorDataModel, this.width(), this.data.outputConnectors, this.outputConnectors, "output");
			this.inputConnectorX();
			this.outputConnectorX();
		};
		
		this.removeInputConnector = function() {
			this.inputConnectors.pop();
			this.data.inputConnectors.pop();
			this.inputConnectorX();
			this.outputConnectorX();
		}
		
		this.removeOutputConnector = function() {
			this.outputConnectors.pop();
			this.data.outputConnectors.pop();
			this.inputConnectorX();
			this.outputConnectorX();
		}
		
		/* init */
		this.outputConnectorX();
		this.inputConnectorX();
		
	};

	// 
	// Wrap the nodes data-model in a view-model.
	//
	var createNodesViewModel = function (nodesDataModel) {
		var nodesViewModel = [];

		if (nodesDataModel) {
			for (var i = 0; i < nodesDataModel.length; ++i) {
				nodesViewModel.push(new flowchart.NodeViewModel(nodesDataModel[i]));
			}
		}

		return nodesViewModel;
	};

	//
	// View model for a connection.
	//
	flowchart.ConnectionViewModel = function (connectionDataModel, sourceConnector, destConnector) {

		this.data = connectionDataModel;
		this.source = sourceConnector;
		this.dest = destConnector;
		
		/* This allows the node to traverse it's own connections */
		sourceConnector._childNode = destConnector.parentNode();
		destConnector._childNode = sourceConnector.parentNode();

		// Set to true when the connection is selected.
		this._selected = false;

		this.sourceCoordX = function () { 
			return this.source.parentNode().x() + this.source.x();
		};

		this.sourceCoordY = function () { 
			return this.source.parentNode().y() + this.source.y();
		};

		this.sourceCoord = function () {
			return {
				x: this.sourceCoordX(),
				y: this.sourceCoordY()
			};
		}

		this.sourceTangentX = function () { 
			return flowchart.computeConnectionSourceTangentX(this.sourceCoord(), this.destCoord());
		};

		this.sourceTangentY = function () { 
			return flowchart.computeConnectionSourceTangentY(this.sourceCoord(), this.destCoord());
		};

		this.destCoordX = function () { 
			return this.dest.parentNode().x() + this.dest.x();
		};

		this.destCoordY = function () { 
			return this.dest.parentNode().y() + this.dest.y();
		};

		this.destCoord = function () {
			return {
				x: this.destCoordX(),
				y: this.destCoordY()
			};
		}

		this.destTangentX = function () { 
			return flowchart.computeConnectionDestTangentX(this.sourceCoord(), this.destCoord());
		};

		this.destTangentY = function () { 
			return flowchart.computeConnectionDestTangentY(this.sourceCoord(), this.destCoord());
		};

		//
		// Select the connection.
		//
		this.select = function () {
			this._selected = true;
		};

		//
		// Deselect the connection.
		//
		this.deselect = function () {
			this._selected = false;
		};

		//
		// Toggle the selection state of the connection.
		//
		this.toggleSelected = function () {
			this._selected = !this._selected;
		};

		//
		// Returns true if the connection is selected.
		//
		this.selected = function () {
			return this._selected;
		};
	};

	//
	// Helper function.
	//
	var computeConnectionTangentOffset = function (pt1, pt2) {

		return (pt2.x - pt1.x) / 2;	
	}

	//
	// Compute the tangent for the bezier curve.
	//
	flowchart.computeConnectionSourceTangentX = function (pt1, pt2) {

		return pt1.x + computeConnectionTangentOffset(pt1, pt2);
	};

	//
	// Compute the tangent for the bezier curve.
	//
	flowchart.computeConnectionSourceTangentY = function (pt1, pt2) {

		return pt1.y;
	};

	//
	// Compute the tangent for the bezier curve.
	//
	flowchart.computeConnectionSourceTangent = function(pt1, pt2) {
		return {
			x: flowchart.computeConnectionSourceTangentX(pt1, pt2),
			y: flowchart.computeConnectionSourceTangentY(pt1, pt2),
		};
	};

	//
	// Compute the tangent for the bezier curve.
	//
	flowchart.computeConnectionDestTangentX = function (pt1, pt2) {

		return pt2.x - computeConnectionTangentOffset(pt1, pt2);
	};

	//
	// Compute the tangent for the bezier curve.
	//
	flowchart.computeConnectionDestTangentY = function (pt1, pt2) {

		return pt2.y;
	};

	//
	// Compute the tangent for the bezier curve.
	//
	flowchart.computeConnectionDestTangent = function(pt1, pt2) {
		return {
			x: flowchart.computeConnectionDestTangentX(pt1, pt2),
			y: flowchart.computeConnectionDestTangentY(pt1, pt2),
		};
	};

	//
	// View model for the chart.
	//
	flowchart.ChartViewModel = function (chartDataModel) {

		//
		// Find a specific node within the chart.
		//
		this.findNode = function (nodeID) {

			for (var i = 0; i < this.nodes.length; ++i) {
				var node = this.nodes[i];
				if (node.data.id == nodeID) {
					return node;
				}
			}

			throw new Error("Failed to find node " + nodeID);
		};

		//
		// Find a specific input connector within the chart.
		//
		this.findInputConnector = function (nodeID, connectorIndex) {

			var node = this.findNode(nodeID);

			if (!node.inputConnectors || node.inputConnectors.length <= connectorIndex) {
				throw new Error("Node " + nodeID + " has invalid input connectors.");
			}

			return node.inputConnectors[connectorIndex];
		};

		//
		// Find a specific output connector within the chart.
		//
		this.findOutputConnector = function (nodeID, connectorIndex) {

			var node = this.findNode(nodeID);

			if (!node.outputConnectors || node.outputConnectors.length <= connectorIndex) {
				throw new Error("Node " + nodeID + " has invalid output connectors.");
			}

			return node.outputConnectors[connectorIndex];
		};

		//
		// Create a view model for connection from the data model.
		//
		this._createConnectionViewModel = function(connectionDataModel) {

			var sourceConnector = this.findOutputConnector(connectionDataModel.source.nodeID, connectionDataModel.source.connectorIndex);
			var destConnector = this.findInputConnector(connectionDataModel.dest.nodeID, connectionDataModel.dest.connectorIndex);			
			return new flowchart.ConnectionViewModel(connectionDataModel, sourceConnector, destConnector);
		}

		// 
		// Wrap the connections data-model in a view-model.
		//
		this._createConnectionsViewModel = function (connectionsDataModel) {

			var connectionsViewModel = [];

			if (connectionsDataModel) {
				for (var i = 0; i < connectionsDataModel.length; ++i) {
					var connectionViewModel = this._createConnectionViewModel(connectionsDataModel[i]);
					connectionViewModel.dest.connectionViewModel = connectionViewModel;
					connectionViewModel.source.connectionViewModel = connectionViewModel;
					connectionsViewModel.push(connectionViewModel);
					if (connectionViewModel.dest.x() 
						=== connectionViewModel.dest._parentNode.inputConnectors[connectionViewModel.dest._parentNode.inputConnectors.length - 1].x()
						&& connectionViewModel.dest.y() 
						=== connectionViewModel.dest._parentNode.inputConnectors[connectionViewModel.dest._parentNode.inputConnectors.length - 1].y()) {
						connectionViewModel.dest._parentNode.addInputConnector({name:""});
					}
					
					if (connectionViewModel.source.x() 
						=== connectionViewModel.source._parentNode.outputConnectors[connectionViewModel.source._parentNode.outputConnectors.length - 1].x()
						&& connectionViewModel.source.y() 
						=== connectionViewModel.source._parentNode.outputConnectors[connectionViewModel.source._parentNode.outputConnectors.length - 1].y()) {
						connectionViewModel.source._parentNode.addOutputConnector({name:""});
					}
				}
			}

			return connectionsViewModel;
		};

		// Reference to the underlying data.
		this.data = chartDataModel;

		// Create a view-model for nodes.
		this.nodes = createNodesViewModel(this.data.nodes);

		// Create a view-model for connections.
		this.connections = this._createConnectionsViewModel(this.data.connections);

		//
		// Create a view model for a new connection.
		//
		this.createNewConnection = function (sourceConnector, destConnector) {

			//debug.assertObjectValid(sourceConnector);
			//debug.assertObjectValid(destConnector);

			var connectionsDataModel = this.data.connections;
			if (!connectionsDataModel) {
				connectionsDataModel = this.data.connections = [];
			}

			var connectionsViewModel = this.connections;
			if (!connectionsViewModel) {
				connectionsViewModel = this.connections = [];
			}

			var sourceNode = sourceConnector.parentNode();
			var sourceConnectorIndex = sourceNode.outputConnectors.indexOf(sourceConnector);
			if (sourceConnectorIndex == -1) {
				sourceConnectorIndex = sourceNode.inputConnectors.indexOf(sourceConnector);
				if (sourceConnectorIndex == -1) {
					throw new Error("Failed to find source connector within either inputConnectors or outputConnectors of source node.");
				} else if (sourceNode.inputConnectors.indexOf(sourceConnector) === sourceNode.inputConnectors.length - 1) {
					sourceNode.addInputConnector({name:""});
				}
			} else if (sourceNode.outputConnectors.indexOf(sourceConnector) === sourceNode.outputConnectors.length - 1) {
				sourceNode.addOutputConnector({name:""});
			}

			var destNode = destConnector.parentNode();
			var destConnectorIndex = destNode.inputConnectors.indexOf(destConnector);
			if (destConnectorIndex == -1) {
				destConnectorIndex = destNode.outputConnectors.indexOf(destConnector);
				if (destConnectorIndex == -1) {
					throw new Error("Failed to find dest connector within inputConnectors or ouputConnectors of dest node.");
				} else if (destNode.outputConnectors.indexOf(destConnector) === destNode.outputConnectors.length - 1) {
					destNode.addOutputConnector({name:""});
				}
			} else if (destNode.inputConnectors.indexOf(destConnector) === destNode.inputConnectors.length - 1) {
				destNode.addInputConnector({name:""});
			}

			var connectionDataModel = {
				source: {
					nodeID: sourceNode.data.id,
					connectorIndex: sourceConnectorIndex,
				},
				dest: {
					nodeID: destNode.data.id,
					connectorIndex: destConnectorIndex,
				},
			};
			connectionsDataModel.push(connectionDataModel);
			
			var connectionViewModel = new flowchart.ConnectionViewModel(connectionDataModel, sourceConnector, destConnector);
			connectionViewModel.dest.connectionViewModel = connectionViewModel;
			connectionViewModel.source.connectionViewModel = connectionViewModel;
			connectionsViewModel.push(connectionViewModel);
		};		

		//
		// Add a node to the view model.
		//
		this.addNode = function (nodeDataModel) {
			if (!this.data.nodes) {
				this.data.nodes = [];
			}

			// 
			// Update the data model.
			//
			this.data.nodes.push(nodeDataModel);

			// 
			// Update the view model.
			//
			this.nodes.push(new flowchart.NodeViewModel(nodeDataModel));		
		}

		//
		// Select all nodes and connections in the chart.
		//
		this.selectAll = function () {

			var nodes = this.nodes;
			for (var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				node.select();
			}

			var connections = this.connections;
			for (var i = 0; i < connections.length; ++i) {
				var connection = connections[i];
				connection.select();
			}			
		}

		//
		// Deselect all nodes and connections in the chart.
		//
		this.deselectAll = function () {

			var nodes = this.nodes;
			for (var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				node.deselect();
			}

			var connections = this.connections;
			for (var i = 0; i < connections.length; ++i) {
				var connection = connections[i];
				connection.deselect();
			}
		};

		//
		// Update the location of the node and its connectors.
		//
		this.updateSelectedNodesLocation = function (deltaX, deltaY) {

			var selectedNodes = this.getSelectedNodes();

			for (var i = 0; i < selectedNodes.length; ++i) {
				var node = selectedNodes[i];
				node.data.x += deltaX;
				node.data.y += deltaY;
			}
		};

		//
		// Handle mouse click on a particular node.
		//
		this.handleNodeClicked = function (node, ctrlKey) {

			if (ctrlKey) {
				node.toggleSelected();
			}
			else {
				this.deselectAll();
				node.select();
			}

			// Move node to the end of the list so it is rendered after all the other.
			// This is the way Z-order is done in SVG.
			var nodeIndex = this.nodes.indexOf(node);
			if (nodeIndex == -1) {
				throw new Error("Failed to find node in view model!");
			}
			if (nodeIndex !== this.nodes.length - 1) {
				this.nodes.splice(nodeIndex, 1);
				this.nodes.push(node);
			}
		};

		//
		// Handle mouse down on a connection.
		//
		this.handleConnectionMouseDown = function (connection, ctrlKey) {

			if (ctrlKey) {
				connection.toggleSelected();
			}
			else {
				this.deselectAll();
				connection.select();
			}
		};

		//
		// Delete all nodes and connections that are selected.
		//
		this.deleteSelected = function () {

			var newNodeViewModels = [];
			var newNodeDataModels = [];

			var deletedNodeIds = [];

			//
			// Sort nodes into:
			//		nodes to keep and 
			//		nodes to delete.
			//

			for (var nodeIndex = 0; nodeIndex < this.nodes.length; ++nodeIndex) {

				var node = this.nodes[nodeIndex];
				if (!node.selected()) {
					// Only retain non-selected nodes.
					newNodeViewModels.push(node);
					newNodeDataModels.push(node.data);
				}
				else {
					// Keep track of nodes that were deleted, so their connections can also
					// be deleted.
					deletedNodeIds.push(node.data.id);
				}
			}

			var newConnectionViewModels = [];
			var newConnectionDataModels = [];

			//
			// Remove connections that are selected.
			// Also remove connections for nodes that have been deleted.
			//
			for (var connectionIndex = 0; connectionIndex < this.connections.length; ++connectionIndex) {

				var connection = this.connections[connectionIndex];				
				if (!connection.selected() &&
					deletedNodeIds.indexOf(connection.data.source.nodeID) === -1 &&
					deletedNodeIds.indexOf(connection.data.dest.nodeID) === -1)
				{
					//
					// The nodes this connection is attached to were not deleted
					// so keep the connection.
					//
					newConnectionViewModels.push(connection);
					newConnectionDataModels.push(connection.data);
				} else {
					/*if (connection.source.x() === connection.source._parentNode.outputConnectors[connection.source._parentNode.outputConnectors.length - 2].x()
						&& connection.source.y() === connection.source._parentNode.outputConnectors[connection.source._parentNode.outputConnectors.length - 2].y()
						&& connection.source._parentNode.outputConnectors[connection.source._parentNode.outputConnectors.length - 1].childNode() === undefined) {
						connection.source._parentNode.removeOutputConnector();
					}
					if (connection.dest.x() === connection.dest._parentNode.inputConnectors[connection.dest._parentNode.inputConnectors.length - 2].x()
						&& connection.dest.y() === connection.dest._parentNode.inputConnectors[connection.dest._parentNode.inputConnectors.length - 2].y()
						&& connection.dest._parentNode.inputConnectors[connection.dest._parentNode.inputConnectors.length - 1].childNode() === undefined) {
						connection.dest._parentNode.removeInputConnector();
					}*/
					while ( connection.source._parentNode.outputConnectors.length > 1
						&& connection.source._parentNode.outputConnectors[connection.source._parentNode.outputConnectors.length - 2].childNode() === undefined
						&& connection.source._parentNode.outputConnectors[connection.source._parentNode.outputConnectors.length - 1].childNode() === undefined) {
						connection.source._parentNode.removeOutputConnector();
					}
					while ( connection.dest._parentNode.inputConnectors.length > 1
						&& connection.dest._parentNode.inputConnectors[connection.dest._parentNode.inputConnectors.length - 2].childNode() === undefined
						&& connection.dest._parentNode.inputConnectors[connection.dest._parentNode.inputConnectors.length - 1].childNode() === undefined) {
						connection.dest._parentNode.removeInputConnector();
					}
					connection.source._childNode = undefined;
					connection.dest._childNode = undefined;
				}
			}

			//
			// Update nodes and connections.
			//
			this.nodes = newNodeViewModels;
			this.data.nodes = newNodeDataModels;
			this.connections = newConnectionViewModels;
			this.data.connections = newConnectionDataModels;
		};

		//
		// Select nodes and connections that fall within the selection rect.
		//
		this.applySelectionRect = function (selectionRect) {

			this.deselectAll();

			for (var i = 0; i < this.nodes.length; ++i) {
				var node = this.nodes[i];
				if (node.x() >= selectionRect.x && 
					node.y() >= selectionRect.y && 
					node.x() + node.width() <= selectionRect.x + selectionRect.width &&
					node.y() + node.height() <= selectionRect.y + selectionRect.height)
				{
					// Select nodes that are within the selection rect.
					node.select();
				}
			}

			for (var i = 0; i < this.connections.length; ++i) {
				var connection = this.connections[i];
				if (connection.source.parentNode().selected() &&
					connection.dest.parentNode().selected())
				{
					// Select the connection if both its parent nodes are selected.
					connection.select();
				}
			}

		};

		//
		// Get the array of nodes that are currently selected.
		//
		this.getSelectedNodes = function () {
			var selectedNodes = [];

			for (var i = 0; i < this.nodes.length; ++i) {
				var node = this.nodes[i];
				if (node.selected()) {
					selectedNodes.push(node);
				}
			}

			return selectedNodes;
		};

		//
		// Get the array of connections that are currently selected.
		//
		this.getSelectedConnections = function () {
			var selectedConnections = [];

			for (var i = 0; i < this.connections.length; ++i) {
				var connection = this.connections[i];
				if (connection.selected()) {
					selectedConnections.push(connection);
				}
			}

			return selectedConnections;
		};
		

	};

})();
