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
    $app.html(''); // Clear the #app div
    $app.append('<h2>Address Books List</h2>');
    
    getAddressBooks(5, pageNum).then(
        function(results) {
            var addressBooks = results.addressBooks;

            var $template = $('#addressbookListTemplate').text();
            
            var displayAddressBookList = _.template($template);
            
            $app.append(displayAddressBookList({
                addressBooks:addressBooks
            }));

            $app.append('<button class="prev">< Prev</button> <button class="next">Next ></button>');

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

    $app.html('');
    $app.append("<h2>" + addressBookName + "'s Address Book</h2>");
    $app.append('<button class="add">Add</button>');

    getEntries(addressBookId).then(
        function(Entries) {
            //display
            var $template = $('#entriesListTemplate').text();

            var displayEntriesList = _.template($template);

            // $app.append('<ul>');

            // Entries.forEach(function(Entry) {
            //     $app.find('ul').append('<li data-name="' + Entry.firstName + '"data-id="' + Entry.id + '">' + Entry.firstName + ' ' + Entry.lastName + '</li><button data-id = '+Entry.id+' class="delEntry">Delete</button>');
            // });

            $app.append(displayEntriesList({
                entriesList: Entries
            }));

            $app.find('.delEntry').on('click', function(evt) {

                console.log($(this).data('id'));
                //evt.preventDefault();

                $.ajax({
                    url: 'https://loopback-rest-api-demo-ziad-saab.c9.io/api/Entries/' + $(this).data('id'),
                    method: 'DELETE',
                }).then(function() {
                    displayAddressBook(AB_ID, AB_NAME);
                });
            });

            $app.append('<button class="menu return">Return to address book menu</button>');

            $app.find('li').on('click', function() {
                var entryId = $(this).data('id');
                var entryName = $(this).data('firstName');
                displayEntry(entryId, entryName);
                console.log(entryId, entryName);
            });




            //return button


            $app.find('.return').on('click', function() {
                displayAddressBooksList(0);
            });

            //add button

            $app.find('.add').on('click', function() {
                $app.find('ul').append('<form id="addEntry">First Name:<input id="firstNameAdd" type="text" name="firstName"><br>Last Name:<input id="lastNameAdd" type="text" name="lastName"><br>Date of Birth:<input id="birthdayAdd" type="text" name="birthday"><input type="submit" name="submit"></form>');
                //form doesn't exist until the 'click' is activated
                $('#addEntry').on('submit', function(evt) {

                    evt.preventDefault();

                    var firstNameAdd = $('#firstNameAdd').val();
                    console.log(firstNameAdd);

                    var lastNameAdd = $('#lastNameAdd').val();
                    console.log(lastNameAdd);

                    var birthdayAdd = $('#birthdayAdd').val();
                    console.log(birthdayAdd)

                    $.ajax({
                        url: 'https://loopback-rest-api-demo-ziad-saab.c9.io/api/AddressBooks/' + AB_ID + '/Entries',
                        method: 'POST',
                        data: {
                            firstName: firstNameAdd,
                            lastName: lastNameAdd,
                            birthday: birthdayAdd,
                        }
                    }).then(function() {
                        displayAddressBook(AB_ID, AB_NAME);
                    });
                });
            });
        }
    );
}

function displayEntry(entryId) {
    getEntry(entryId).then(
        function(entryId) {
            console.log(entryId);
            // display

            $app.html('');
            $app.append("<h2>Info for " + entryId.firstName + " <button class='edit'>Edit</button></h>");
            $app.append('<table>');

            //table
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

            //return button
            $app.append("<button class='entry return'>Return to Address Book</button>");


            $app.find('.return').on('click', function() {
                displayAddressBook(AB_ID, AB_NAME);
            });

            //edit
            $app.find('.edit').on('click', function() {
                //$app.append('<div class="overlay"></div>');
                $app.find('table').append("<form id='entryForm'>Home:<input type='radio' name='home'> Work:<input type='radio' name='work'> Other:<input type='radio' name='radio'><br> First Name<input id='firstNameInput' type='text' name='firstName'><br> Last Name<input id='lastNameInput' type='text' name='lastName'><br> Date of Birth<input id='birthdayInput' type='text' name='birthday'><input type='submit' name='submit'></form>");

                $('#entryForm').on('submit', function(evt) {
                    evt.preventDefault();

                    var firstName = $('#firstNameInput').val();
                    console.log(firstName);

                    var lastName = $('#lastNameInput').val();
                    console.log(lastName);

                    var birthday = $('#birthdayInput').val();

                    $.ajax({
                        url: 'https://loopback-rest-api-demo-ziad-saab.c9.io/api/Entries/' + entryId.id,
                        method: 'PUT',
                        data: {
                            firstName: firstName,
                            lastName: lastName,
                        }
                    }).then(function() {
                        displayEntry(entryId.id);
                    });
                });
            });
        });
}
// End functions that display views


// Start the app by displaying all the addressbooks
// NOTE: This line is very important! So far, our code has only defined functions! This line calls the
// function that displays the list of address books, effectively initializing our UI.
displayAddressBooksList(0);