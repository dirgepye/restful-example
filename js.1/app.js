// Set the API base url
var API_URL = "https://loopback-rest-api-demo-ziad-saab.c9.io/api";

// Get a reference to the <div id="app">. This is where we will output our stuff
var $app = $('#app');

var AB_ID, AB_NAME;



// Data retrieval functions
function getAddressBooks(limit, pageNum) {
    return $.getJSON(API_URL + '/AddressBooks?filter[limit]=' + (limit + 1) + '&filter[offset]=' + pageNum * limit).then(
        function(addressBooks) {
            if (addressBooks.length === limit + 1) {
                var hasNextPage = true;
                addressBooks.pop();
            }
            else {
                hasNextPage = false;
            }
            
            return {
                addressBooks: addressBooks,
                hasNextPage: hasNextPage
            };
        }
    );
}

function getAddressBook(id) {
    return $.getJSON(API_URL + '/AddressBooks/' + id);
}

function getEntries(addressBookId) {
    return $.getJSON(API_URL + '/AddressBooks/' + addressBookId + '/entries');
    // TODO... perhaps by using a GET to /AddressBooks/:id/entries :)
}

function getEntry(entryId) {
    return $.getJSON(API_URL + '/Entries/' + entryId + '?filter={"include": ["addresses","phones","emails"]}');
    // TODO..
}
// End data retrieval functions




// Functions that display things on the screen (views)
function displayAddressBooksList(pageNum) {
    getAddressBooks(5, pageNum).then(
        function(results) {
            var addressBooks = results.addressBooks;
            $app.html(''); // Clear the #app div
            $app.append('<h2>Address Books List</h2>');
            $app.append('<ul>');
            $app.append('<button class="prev">< Prev</button> <button class="next">Next ></button>');

            addressBooks.forEach(function(ab) {
                $app.find('ul').append('<li data-name="' + ab.name + '"data-id="' + ab.id + '">' + ab.name + '</li>');
            });

            $app.find('li').on('click', function() {
                var addressBookId = $(this).data('id');
                var addressBookName = $(this).data('name');
                displayAddressBook(addressBookId, addressBookName);
            });

            if (!results.hasNextPage) {
                $app.find('.next').addClass('disabled');
                $app.find('.next').prop('disabled', true);
            }
            else {
                $app.find('.next').on('click', function() {
                    displayAddressBooksList(pageNum + 1);
                });
            }
            $app.find('.prev').on('click', function() {
                displayAddressBooksList(pageNum - 1);
            });

        }
    );
}


function displayAddressBook(addressBookId, addressBookName) {
    AB_ID = addressBookId;
    AB_NAME = addressBookName;
    getEntries(addressBookId).then(
        function(Entries) {
            $app.html('');
            
            $app.append("<h2>" + addressBookName + "'s Address Book</h2>");
            $app.append('<ul>');

            Entries.forEach(function(Entry) {
                $app.find('ul').append('<li data-name="' + Entry.firstName + '"data-id="' + Entry.id + '">' + Entry.firstName + ' ' + Entry.lastName + '</li>');

            });
            
            $app.append('<button class="menu return">Return to address book menu</button>');

            $app.find('li').on('click', function() {
                var entryId = $(this).data('id');
                var entryName = $(this).data('firstName');
                displayEntry(entryId, entryName);
                console.log(entryId, entryName);
            });

            $app.find('.return').on('click', function() {
                displayAddressBooksList(0);
            });
        }
    );
}

function displayEntry(entryId, entryName) {
    getEntry(entryId).then(
        function(entryId) {
            console.log(entryId);
            $app.html('');
            
            $app.append("<h2>Info for " + entryId.firstName + " <button>Edit</button></h>");
            $app.append('<table>');

            $app.find('table').append("<tr><td class='type'>Name:</td><td>" + entryId.firstName + " " + entryId.lastName + "</td></tr><tr><td class='type'>Birthday:</td><td>" + entryId.birthday + "</td></tr>");

            entryId.addresses.forEach(function(address) {
                $app.find('table').append('<tr><td class="type">Address:</td><td><strong>' + address.type + "</strong><br>" + address.line1 + "<br>" + address.line2 + "<br>" + address.city + ", " + address.state + "<br>" + address.zip + "<br>" + address.country + '</td></tr>');
            });

            entryId.emails.forEach(function(email) {
                $app.find('table').append('<tr><td class="type">Email:</td><td><strong>' + email.type + '</strong><br>' + email.email + '</td></tr>');
            });

            entryId.phones.forEach(function(phone) {
                $app.find('table').append('<tr><td class="type">Phone:</td><td><strong>' + phone.type + '</strong><br>' + phone.phoneNumber + '<br>' + phone.phoneType + '</td></tr>');
            });
            
            $app.append("<button class='entry return'>Return to Address Book</button>");
            
            $app.find('.return').on('click', function() {
                
                displayAddressBook(AB_ID, AB_NAME);
            });
        });
}
// End functions that display views


// Start the app by displaying all the addressbooks
// NOTE: This line is very important! So far, our code has only defined functions! This line calls the
// function that displays the list of address books, effectively initializing our UI.
displayAddressBooksList(0);