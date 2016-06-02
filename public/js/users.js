// # Users
// JS for displaying user information.

// ## Dependencies
// * `jquery-2.2.2`
'user strict';
$(document).ready(function () {


    // ### USER_API_ROOT_URL 
    // Our root route for the user API.
    const USER_API_ROOT_URL = 'https://push-code-assessment.herokuapp.com',
        // ### USER_DATA_URL
        // Route for list of all the users.
        USER_DATA_URL = USER_API_ROOT_URL + '/v1/api/users',
        // ### USER_TASKS_SUB_URL
        // Prefixed with USER_DATA_URL/:id/, this sub-url is where users' tasks
        // data is.
        USER_TASKS_SUB_URL = '/tasks';

    // An ES6 promise to chain our async calls with.
    var promise;

    // ### setRowForUserData
    // Sets an HTML table row string for a username column value, and 
    // a list of tasks the user has for the other column value. Specific for the
    // USER_TASKS_SUB_URL API.
    //
    // #### Params
    // * `username` (String) - name for the user.
    // * `taskList` (Array[String]) - list of tasks for the user.
    function setRowForUserData(username, taskList) {
        // This is where some templating would be nice (i.e. Reach, etc).
        // But this is pretty simple, so we'll minimize dependencies.
        $('table#user-display > tbody').append(
            '<tr>\n' +
                '<td>' + username + '</td>\n' +
                '<td>' +
                    '<ul>\n' + 
                        // Generate HTML UL LI elements for the tasks.
                        taskList.map(function (task) {
                            return '<li>\n' + task + '</li>\n';
                        }).join('') + 
                    '<ul>\n' + 
                '</td>\n' +
            '</tr>'
        );
    }


    // ### Add user data
    // Here's we're we finally add the user data.
    promise = new Promise(
    // #### User data - get user info from the USER_DATA_URL API route.
    function (fullfill, reject) {
        $.ajax({
            url: USER_DATA_URL
        })
        // If successfull, fullfill the promise.
        .done(function(data) {
            fullfill(data);
        })
        // Otherwise, reject it.
        .fail(function () {
            // TODO - grab the specific error.
            reject('Could not GET data from ' + USER_DATA_URL)
        });
    })
    // ## User Tasks data - get user info from the USER_TASKS_SUB_URL API route.
    .then(function (userList) {
        userList.forEach(function (userData) {
            if (userData.id) {
                $.ajax({
                    url: [
                        USER_DATA_URL,
                        userData.id.toString(),
                        USER_TASKS_SUB_URL
                    ].join('/')
                })
                // If successfull, we won't fullfill the promise, but we won't
                // reject it.
                // TODO - Promse might support adding multiple callback here?
                .done(function(taskData) {
                    // TODO - fullfill(data);

                    // Set the user data.
                    if (typeof userData.name === 'string' &&
                        Array.isArray(taskData)) {
                        setRowForUserData(userData.name, taskData);
                    } else {
                        console.error('User data or task data were of ' +
                            ' unexpected types.');
                    }
                })
                // Otherwise, reject it.
                .fail(function () {
                    // TODO - grab the specific error.
                    console.error('Could not GET data from ' + USER_DATA_URL)
                });
            } else {
                console.error('User data had no id attr for ' +
                    JSON.stringify(userData));
            }
        });
    })
    .catch(function (errorMsg) {
        console.log('TODO - list error on page')
    });
    
});