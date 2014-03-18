//global.js (added to views/layouts.jade)

var g_currentListId = undefined;

$(document).ready(function() {

	$('#listDetailsDiv').hide();
	populateLists();

	//lists related items
	$('#listsTable table tbody').on('click', 'td a.listDetailsLink', listDetailsLinkClicked);
	$('#addListButton').on('click', addNewList);
	
	//list details related items
	$('#addRestaurantButton').on('click', addRestaurantToList);
	$('#listRestTable table tbody').on('click', 'td a.deleteRestLink', deleteRestaurantFromList);
});

// Populates lists table 
function populateLists() {
	$.getJSON('/allLists', function(data) {
		var listTableHtml = "";
		$.each(data, function() {
			listTableHtml += '<tr>';
			listTableHtml += '<td style="min-width:150px"><a href="#" class="listDetailsLink" rel="' + this.listId + '" title="abaa">' + this.name + '</a></td>';
			listTableHtml += '<td>' + this.description + '</td>';
			listTableHtml += '</tr>';
		});

		$('#listsTable table tbody').html(listTableHtml);
	});
}

// Populate the restaurant list for the given list
function populateListRestaurants(listId) {

	$.getJSON('/listDetails?listId=' + listId, function(data) {

		$('#listDetailsDiv').show();
		$('#currentListName').text(data.listname);
		g_currentListId = listId;

		//populate restaurant Details Here
		var restaurantsTableHTML = "";
		var restaurants = data.restaurants;
		$.each(restaurants, function() {
			restaurantsTableHTML += '<tr>';
			restaurantsTableHTML += '<td>' + this.name + '</td>';
			restaurantsTableHTML += '<td><img src="' + this.stars + '"/></td>';
			restaurantsTableHTML += '<td>' + this.cuisine + '</td>';
			restaurantsTableHTML += '<td>' + this.address + '</td>';

			restaurantsTableHTML += '<td><a href="#" class="deleteRestLink" rel="' + this.restId + '">Delete</a></td>';
			restaurantsTableHTML += '</tr>';

		});
		$('#listRestTable table tbody').html(restaurantsTableHTML);
	});

};

/* Occurs when someone clicks on a list to view the restaurants/landing page
of the list  */
function listDetailsLinkClicked(event) {
	event.preventDefault();
	var listId = $(this).attr('rel');
	populateListRestaurants(listId);
};

/* Adding a completely new list */
function addNewList(event) {
	var listName = $('#addListFields fieldset input#listNameEntry').val();
	var listDesc = $('#addListFields fieldset input#listDescEntry').val();
	if(!listName || !listDesc) {
		alert("List name, description should be filled up");
		return false;
	}
	if(listName == listDesc) {
		alert("List name cannot match list description. You can do better!");
		return false;
	}
	var newListId = "mylistid_" + listName.toLowerCase().replace(' ', '_');
	var newListInfo = {
		listId: newListId,
		name: listName,
		description: listDesc,
		restaurants: new Array(),
		contributors: new Array(),
	};

	$.ajax({
		type:'POST',
		data: newListInfo,
		url:'/addList',
		dataType:'JSON'
	}).done(function(response) {
		// Check for successful (blank) response
		if (response.msg === '') {
			// Clear the form inputs
			$('#addListFields fieldset input').val('');
			populateLists();
			populateListRestaurants(newListId);
		}
		else {
			// If something goes wrong, alert the error message that our service returned
			alert('Error: ' + response.msg);
		}
	});

}

/* Function to add a restaurant to the current list being explored */
function addRestaurantToList(event) {
	event.preventDefault();
	
	if(!g_currentListId) {
		alert("No List Opened");
		return false;
	}

	var errorCount = 0;
	$('#addRestaurantFields input').each(function(index, val) {
		if($(this).val() === '') { errorCount++; }
	});

	// Check and make sure errorCount's still at zero
	if(errorCount === 0) {
		// If it is, compile all user info into one object
		var newRestInfo = {
		  'name': $('#addRestaurantFields fieldset input#nameEntry').val(),
		  'listId': g_currentListId,
		};

		// Use AJAX to post the object to our adduser service
		$.ajax({
		  type: 'POST',
		  data: newRestInfo,
		  url: '/addRestToList',
		  dataType: 'JSON'
		}).done(function( response ) {

			// Check for successful (blank) response
			if (response.msg === '') {
				// Clear the form inputs
				$('#addRestaurantFields fieldset input').val('');
				// Update the restaurants list
				populateListRestaurants(g_currentListId);
			}
			else {
				// If something goes wrong, alert the error message that our service returned
				alert('Error: ' + response.msg);
			}
		});
	}
	else {
		// If errorCount is more than 0, error out
		alert('Please fill in all fields');
		return false;
	}
};

function deleteRestaurantFromList(event) {
	event.preventDefault();
	if(!g_currentListId) {
		alert('No List Opened');
		return false;
	}
	var listId = g_currentListId;
	var restId = $(this).attr('rel');
	var delRestInfo = {
		listId: listId,
		restId: restId
	};
	$.ajax({
		type: 'DELETE',
		data: delRestInfo,
		url: '/delRestFromList',
		dataType:'JSON'
	}).done(function(response){
		// Check for successful (blank) response
		if (response.msg === '') {
			// Update the restaurants list
			populateListRestaurants(g_currentListId);
		}
		else {
			// If something goes wrong, alert the error message that our service returned
			alert('Error: ' + response.msg);
		}
	});
}