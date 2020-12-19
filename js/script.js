enablePreferredTheme();
checkPwaInstallation();
checkNotificationState();
initializeOneSignal();
initializePopovers();
listenToOsThemeChange();

function showLoginTab() {
    $('#login-tab').click();
}

function showReauthenticateTab() {
    $('#reauthenticate-tab').click();
}

function showPasswordResetTab() {
    $('#password-reset-tab').click();
}

function showWorkoutsTab(uid) {
    $('#workouts-tab').click();
    loadWorkouts(uid);
}

function showWorkoutTab(key, title, duration, durationType) {
    $('#workout-tab').click();
    loadWorkout(key, title, duration, durationType);
}

function showCreateTab() {
    $('#create-tab').click();
    loadUsers();
}

function showSettingsTab() {
    $('#settings-tab').click();
    checkNotificationsState();
}

function showPasswordChangeTab() {
    $('#password-change-tab').click();
}

function showInstallTab() {
    $('#install-tab').click();
}

function showAboutTab() {
    $('#about-tab').click();
}

function login() {
    let uid = '', email = '';
    firebase.auth().signInWithEmailAndPassword($('#email').val(), $('#password').val()).then((user) => {
        uid = user.uid;
        email = user.email;
    }).catch((error) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorCode + ' ' + errorMessage);
    });
    if ((uid == 'KNPfSGIuwTPZp6goKc8sp9Uhv7C2') || (uid == 'wFPela8qkzZEFOuNm35Oct2F14O2')) {
        loadTabsFor('admin');
        showCreateTab();
    }
    else {
        loadTabsFor('user');
        showWorkoutsTab(uid);
    }
    if ($('html').data('app-is-installed') == false) {
        $('#install-about').show();
    }
    $('#reauthenticate-email').val(email);
}

function loadTabsFor(role) {
    $('.nav').addClass('invisible');
    $('.nav-link').show();
    $('.nav-link').not('.' + role).hide();
    $('.nav').removeClass('invisible');
}

function logout() {
    firebase.auth().signOut().then(function() {
        location.reload();
    }).catch(function(error) {
        $('#logout-error').show();
    });
}

function resetPassword() {
    firebase.auth().sendPasswordResetEmail($('#password-reset-email').val()).then(function() {
        $('#password-reset-success').show();
        $('#password-reset-success').val('');
    }).catch(function(error) {
        $('#password-reset-error').show();
        $('#password-reset-success').val('');
    });
}

function reauthenticate() {
    let user = firebase.auth().currentUser;
    let credential = firebase.auth.EmailAuthProvider.credential(
        user.email, 
        $('#reauthenticate-password').val()
    );
    user.reauthenticateWithCredential(credential).then(function() {
        showPasswordChangeTab();
    }).catch(function(error) {
        $('#reauthenticate-error').show();
    });
}

function changePassword() {
    firebase.auth().currentUser.updatePassword($('#password-change-password').val()).then(function() {
        $('#password-change-success').show();
        $('#password-change-password').val('');
    }).catch(function(error) {
        $('#password-change-password').val('');
    });
}

function enableNotifications() {
    setNotificationsButtonToEnabled();
    OneSignal.push(function() {
        OneSignal.showNativePrompt();
    });
    localStorage.setItem('notifications', 'true');
    // to do
}

function disableNotifications() {
    setNotificationsButtonToDisabled();
    localStorage.setItem('notifications', 'false');
    // to do
}

function checkNotificationState() {
    if (localStorage.getItem('notifications') == 'true') {
        setNotificationsButtonToEnabled();
    }
}

function setNotificationsButtonToEnabled() {
    $('#notifications-button-slash').addClass('invisible');
    $('#notifications-button-bell').addClass('text-success');
}

function setNotificationsButtonToDisabled() {
    $('#notifications-button-bell').removeClass('text-success');
    $('#notifications-button-slash').removeClass('invisible');
}

function validateRequiredInputs() {
    let validation = true;
    $('.form-control--required').each(function() {
        if ($(this).val() == '') {
            $(this).addClass('border-danger');
            validation = validation && false;
        }
        else {
            $(this).removeClass('border-danger');
            validation = validation && true;
        }
    });
    return validation;
}

function validateInput(input) {
    if ($(input).val() == '') {
        $(input).addClass('border-danger');
    }
    else {
        $(input).removeClass('border-danger');
    }
}

function addExercise() {
    if (validateRequiredInputs()) {
        if ($('.exercise').length == 0) {
            $(this).hide();
            $('.workout__functions').show();
        }
        appendNewExercise();
    }
}

function showSaveWorkoutModal() {
    if (validateRequiredInputs()) {
        $('#save-workout-prompt').click();
    }
}

function saveWorkout() {
    let exercises = [];
    $('.exercise').each(function(index) {
        exercises[index] = new Object();
        exercises[index].name = $('.exercise__name', this).val();
        exercises[index].duration = $('.exercise__duration', this).val();
        exercises[index].durationType = $('.exercise__duration-type', this).val();
    });
    let newWorkoutRef = firebase.database().ref('users/' + $('#workout-user').val() + '/workouts').push();
    newWorkoutRef.set({
        'name': convertDateToName($('#workout-name').val()),
        'durationType': $('#workout-duration-type').val(),
        'duration': $('#workout-duration').val(),
        'completed': 'false',
        'exercises': exercises
    });
    $('#save-workout-success').show();
    $('#workout-name').val('');
    $('#workout-duration').val('');
    $('#insert-exercise').show();
    $('.exercise').remove();
    $('.workout__functions').hide();
    $(document).scrollTop(0);
}

function deleteExercise(exercise) {
    $(exercise).closest('.exercise').remove();
    setExerciseDeleteButtonState();
}

function loadWorkout(key, title, duration, durationType) {
    $('.exercise').remove();
    $('#workout-title').text(title);
    $('#workout-info').text('');
    $('#workout-info').append(duration);
    if (durationType == 'repetitions') {
        if (duration == 1) {
            $('#workout-info').append(' επανάληψη');
        }
        else {
            $('#workout-info').append(' επαναλήψεις');
        }
    }
    else {
        $('#workout-info').append(' λεπτά');
    }
    duration = '';
    let user = firebase.auth().currentUser;
    firebase.database().ref('users/' + user.uid + '/workouts/' + key + '/exercises').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.child('durationType').val() == 'repetitions') {
                duration += 'x';
            }
            duration += childSnapshot.child('duration').val();
            if (childSnapshot.child('durationType').val() == 'seconds') {
                duration += "''";
            }
            $('#exercises-list').append('<button type="button" class="exercise card btn d-block w-100 p-0 text-left mb-3" data-duration="' + childSnapshot.child('duration').val() + '" data-duration-type="' + childSnapshot.child('durationType').val() + '" disabled> <div class="row no-gutters w-100"> <div class="exercise__status col-auto p-3 border-right"> <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check-circle-fill text-secondary" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/> </svg> </div><div class="col p-3"> <span class="font-weight-bold">' + childSnapshot.child('name').val() + '</span> </div><div class="col-auto p-3"> <span class="exercise__duration">' + duration + '</span> </div><div class="exercise__next col-auto p-3 bg-success rounded-right text-light d-none"> <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check" fill="currentColor" xmlns="http://www.w3.org/2000/svg"></svg> <path fill-rule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/> </svg> </div></div></button>');
            duration = '';
        });
    });
}

function startWorkout() {
    if ($('.exercise')[0].data('duration-type') == 'repetitions') {
        // to do
    }
    else {
        // to do
    }
}

function enableDarkTheme() {
    $("#dark-theme-switch").prop('checked', true);
    $('html').addClass('dark');
}

function disableDarkTheme() {
    $("#dark-theme-switch").prop('checked', false);
    $('html').removeClass('dark');
}

function enablePreferredTheme() {
    if ((window.matchMedia) && (window.matchMedia('(prefers-color-scheme: dark)').matches) && (localStorage.getItem('darkTheme') != 'false')) {
        enableDarkTheme();
    }
}

function listenToOsThemeChange() {
    if (localStorage.getItem('darkTheme') == null) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                enableDarkTheme();
            } else {
                disableDarkTheme();
            }
        });
    }
}

function checkPwaInstallation() {
    let appIsInstalled;
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        appIsInstalled = true;
        $('#install-about').hide();
        $('#install-tab').hide();
    }
    else {
        appIsInstalled = false;
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
        });
        $('.btn--android').click(function() {
            deferredPrompt.prompt();
        });
    }
    initializeFirebase();
    checkUserState(appIsInstalled);
}

function checkUserState(appIsInstalled) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if ((user.uid == 'KNPfSGIuwTPZp6goKc8sp9Uhv7C2') || (user.uid == 'wFPela8qkzZEFOuNm35Oct2F14O2')) {
                loadTabsFor('admin');
                showCreateTab();
             }
            else {
                loadTabsFor('user');
                showWorkoutsTab(user.uid);
            }
            $('#reauthenticate-email').val(user.email);
        }
        else {
            loadTabsFor('login');
            if (!appIsInstalled) {
                $('#install-tab').show();
                $('#install-about').hide();
                $('html').attr('data-app-is-installed', 'false');
            }
            showLoginTab();
        }
    });
}

function initializeFirebase() {
    const firebaseConfig = {
        apiKey: 'AIzaSyBwnVouXfHHIJkj09NpZfx4azbUcINJznA',
        authDomain: 'cmtraining-6b1f9.firebaseapp.com',
        databaseURL: 'https://cmtraining-6b1f9.firebaseio.com',
        projectId: 'cmtraining-6b1f9',
        storageBucket: 'cmtraining-6b1f9.appspot.com',
        messagingSenderId: '1044932147127',
        appId: '1:1044932147127:web:bd2c6240e4c0291c1a9a32',
        measurementId: 'G-85X1GXXGD2'
    };
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
}

function initializeOneSignal() {
    window.OneSignal = window.OneSignal || [];
    const initConfig = {
        appId: 'cbd2e5af-f377-4a51-88c3-13a508059c98',
        safari_web_id: 'web.onesignal.auto.21fd847c-14e1-48c8-a072-78170e2e9023',
        notifyButton: {
            enable: false,
        },
        promptOptions: {
            customlink: {
                enabled: true, /* Required to use the Custom Link */
                style: "button", /* Has value of 'button' or 'link' */
                size: "medium", /* One of 'small', 'medium', or 'large' */
                color: {
                    button: '#E12D30', /* Color of the button background if style = "button" */
                    text: '#FFFFFF', /* Color of the prompt's text */
                },
                text: {
                    subscribe: "Subscribe to push notifications", /* Prompt's text when not subscribed */
                    unsubscribe: "Unsubscribe from push notifications", /* Prompt's text when subscribed */
                    explanation: "Get updates from all sorts of things that matter to you", /* Optional text appearing before the prompt button */
                },
                unsubscribeEnabled: true, /* Controls whether the prompt is visible after subscription */
            }
        }
    };
    OneSignal.push(function() {
        OneSignal.SERVICE_WORKER_PARAM = { scope: '/cmtraining/' };
        OneSignal.SERVICE_WORKER_PATH = 'cmtraining/OneSignalSDKWorker.js'
        OneSignal.SERVICE_WORKER_UPDATER_PATH = 'cmtraining/OneSignalSDKUpdaterWorker.js'
        OneSignal.init(initConfig);
    });
}

function loadUsers() {
    firebase.database().ref('users').orderByChild('name').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            $('#workout-user').append('<option value="' + childSnapshot.key + '">' + childSnapshot.child('name').val() + '</option>');
        });
    });
}

function setExerciseDeleteButtonState() {
    if ($('.exercise').length != 1) {
        $('.exercise__delete-button').removeAttr('disabled');
    }
    else {
        $('.exercise__delete-button').attr('disabled', true);
    }
}

function appendNewExercise() {
    $('#exercises').append('<div class="exercise card mb-3"> <div class="card-header"> <div class="form-group mb-0"> <label>Όνομα άσκησης:</label> <input type="text" class="exercise__name form-control form-control--required bg-transparent"> </div></div><div class="card-body"> <div class="form-group mb-0"> <label>Επίλεξε διάρκεια/επαναλήψεις:</label> <div class="form-row"> <div class="col"> <input type="number" class="exercise__duration form-control form-control--required bg-transparent"> </div><div class="col-auto"> <select class="exercise__duration-type form-control"> <option value="seconds">δευτερόλεπτα</option> <option value="repetitions">επαναλήψεις</option> </select> </div></div></div></div><div class="card-footer"> <button type="button" class="exercise__delete-button btn text-danger btn-block">Διαγραφή άσκησης</button> </div></div>');
    setExerciseDeleteButtonState();
    $(document).scrollTop($(document).height());
}

function convertDateToName(date) {
    let y = date.slice(0, 4);
    let m = date.slice(5, 7);
    let d = date.slice(8, 10);
    return (y + m + d);
}

function convertNameToDate(name) {
    let y = name.slice(0, 4);
    let m = name.slice(4, 6);
    let d = name.slice(6, 8);
    return (d + '/' + m + '/' + y);
}

function showLoader() {
    $('#show-loader').click();
}

function hideLoader() {
    $('#hide-loader').click();
}

function loadWorkouts(uid) {
    firebase.database().ref('users/' + uid + '/workouts').orderByChild('name').once('value').then(function(snapshot) {
        if (snapshot.numChildren() == 0) {
            $('#workouts-warning').show();
        }
        else {
            snapshot.forEach(function(childSnapshot) {
                $('#workouts-warning').hide();
                let status = '';
                if (childSnapshot.child('completed').val() == 'true') {
                    status = 'text-success';
                }
                else {
                    status = 'text-secondary';
                }
                $('#workouts-list').prepend('<button type="button" class="workout card btn d-block w-100 p-0 text-left mb-3" data-key="' + childSnapshot.key + '" data-title="' + convertNameToDate(childSnapshot.child('name').val()) + '" data-duration="' + childSnapshot.child('duration').val() + '" data-duration-type="' + childSnapshot.child('durationType').val() + '"> <div class="row no-gutters w-100"> <div class="col-auto p-3 border-right"> <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check-circle-fill ' + status + '" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/> </svg> </div><div class="col p-3"> <span class="font-weight-bold">' + convertNameToDate(childSnapshot.child('name').val()) + '</span> </div><div class="col-auto p-3 bg-info rounded-right text-light"> <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-right" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/> </svg> </div></div></button>');
            });
        }
    });
}

function initializePopovers() {
    $('[data-toggle="popover"]').popover();
}

$('#login-button').click(function() {
    login();
});

$('#logout-button').click(function() {
    logout();
});

$('#password-reset-button').click(function() {
    resetPassword();
});

$('#password-change-link').click(function() {
    showReauthenticateTab();
});

$('#reauthenticate-button').click(function() {
    reauthenticate();
});

$('#password-change-button').click(function() {
    changePassword();
});

$('#password-reset-link').click(function() {
    showPasswordResetTab();
});

$('#dark-theme-switch').change(function() {
    if ($(this).prop('checked')) {
        enableDarkTheme();
        localStorage.setItem('darkTheme', 'true');
    }
    else {
        disableDarkTheme();
        localStorage.setItem('darkTheme', 'false');
    }
});

$('#notifications-button').click(function() {
    if (localStorage.getItem('notifications') == 'true') {
        disableNotifications();
    }
    else {
        enableNotifications();
    }
});

$('body').on('input', '.form-control--required', function() {
    validateInput(this);
});

$('body').on('focusout', '.form-control--required', function() {
    validateInput(this);
});

$('.add-exercise').click(function() {
    addExercise();
});

$('#delete-workout').click(function() {
    location.reload();
});

$('#validate-workout').click(function() {
    if (validateRequiredInputs()) {
        $('#save-workout-prompt').click();
    }
});

$('#save-workout').click(function() {
    saveWorkout();
});

$('body').on('click', '.exercise__delete-button', function() {
    deleteExercise(this);
});

$('body').on('click', '.workout', function() {
    showWorkoutTab($(this).data('key'), $(this).data('title'), $(this).data('duration'), $(this).data('duration-type'));
});

$('#start-workout').click(function() {
    startWorkout();
});

$('.tab-link').click(function(e) {
    $('.alert-success, .alert-danger').hide();
});