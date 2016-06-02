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


    // ### setUserTaskData
    // Sets/appends user task info to the DOM from the USER_TASKS_SUB_URL API
    // route.
    //
    // #### Params
    // * `userData` (Object) - user data as specified by the USER_DATA_URL API
    // route.
    //
    // #### Returns
    // (Promise) An ES6 Promise for chaining.
    //
    // #### ENHANCEMENTS
    // It would be better to return all our data here, and have a final success
    // function in our overall Promise set the data in the DOM.
    function setUserTaskData(userData) {
        return new Promise(function (fulfill, reject) {
            if (!userData.id) {
                reject('User data had no valid id attr for ' +
                    JSON.stringify(userData));
            }

            $.ajax({
                url: [
                    USER_DATA_URL,
                    userData.id.toString(),
                    USER_TASKS_SUB_URL
                ].join('/')
            })
            // If successfull, fulfill the promise
            .done(function(taskData) {
                // Set the user data.
                if (typeof userData.name === 'string' &&
                    Array.isArray(taskData)) {
                    setRowForUserData(userData.name, taskData);
                } else {
                    reject('User data or task data were of ' +
                        ' unexpected types.');
                }
            })
            // Otherwise, reject it.
            .fail(function () {
                reject('Could not GET data from ' + USER_DATA_URL)
            })
        });
    }


    // ### getUserDataPromise
    // Gets a Promise for user info from the USER_DATA_URL API route.
    //
    // #### Returns
    // (Promise) An ES6 Promise for chaining.
    function getUserDataPromise () {
            // #### User data - get user info from the USER_DATA_URL API route.
        return new Promise(function (fulfill, reject) {
            $.ajax({
                url: USER_DATA_URL
            })
            // If successfull, fulfill the promise.
            .done(function(data) {
                fulfill(data);
            })
            // Otherwise, reject it.
            .fail(function () {
                reject('Could not GET data from ' + USER_DATA_URL);
            });
        });
    }


    // ### Add user data
    // Here's we're we finally get and add the user data.
    // Get our initial user data via our Promise function.
    getUserDataPromise()
    // Then take that user data, and get all the task data for each user.
    .then(function (userList) {
        // We return a Promise to the chain that all our 'sub' Promises were
        // fulfilled.
        return Promise.all(userList.map(function (userData) {
            // Return each 'sub' Promise for each individual user task data
            // get/set. This function will actually update all our user data
            // in the DOM.
            return setUserTaskData(userData);
        }));
    })
    .catch(function (errorMsg) {
        $('span#error').show().text(errorMsg);
    });
    
});