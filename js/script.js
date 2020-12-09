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

enableDarkThemeOnLoad();
checkPwaInstallation();
checkUserState();
initializeOneSignal();
checkNotificationsStateOnLoad();
$('[data-toggle="popover"]').popover();
listenToDarkThemeChange();

$('#login-button').click(function() {
    firebase.auth().signInWithEmailAndPassword($('#email').val(), $('#password').val()).then((user) => {
        $('#reauthenticate-email').val(user.email);
        if ((user.uid == 'KNPfSGIuwTPZp6goKc8sp9Uhv7C2') || (user.uid == 'wFPela8qkzZEFOuNm35Oct2F14O2')) {
            loadFirebaseUsers();
            $('.nav').addClass('invisible');
            $('.nav-link').show();
            $('.nav-link').not('.admin').hide();
            $('.nav').removeClass('invisible');
            $('#create-tab').tab('show');
        }
        else {
            $('.nav').addClass('invisible');
            $('.nav-link').show();
            $('.nav-link').not('.user').hide();
            $('.nav').removeClass('invisible');
            $('#workouts-tab').tab('show');
        }
    }).catch((error) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorMessage);
    });
});

$('#logout-button').click(function() {
    firebase.auth().signOut().then(function() {
        $('.nav').addClass('invisible');
        $('.nav-link').show();
        $('.nav-link').not('.login').hide();
        $('.nav').removeClass('invisible');
        $('#login-tab').tab('show');
    }).catch(function(error) {
        $('#logout-error').show();
    });
});

$('#password-reset-button').click(function() {
    firebase.auth().sendPasswordResetEmail($('#password-reset-email').val()).then(function() {
        $('#password-reset-success').show();
        $('#password-reset-success').val('');
    }).catch(function(error) {
        $('#password-reset-error').show();
        $('#password-reset-success').val('');
    });
});

$('.tab-link').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
    $('.alert-success, .alert-danger').hide();
});

$('#password-change-link').click(function() {
    $('#reauthenticate-tab').tab('show');
});

$('#reauthenticate-button').click(function() {
    let user = firebase.auth().currentUser;
    let credential = firebase.auth.EmailAuthProvider.credential(
        user.email, 
        $('#reauthenticate-password').val()
    );
    user.reauthenticateWithCredential(credential).then(function() {
        $('#password-change-tab').tab('show');
    }).catch(function(error) {
        $('#reauthenticate-error').show();
    });
});

$('#password-change-button').click(function() {
    firebase.auth().currentUser.updatePassword($('#password-change-password').val()).then(function() {
        $('#password-change-success').show();
        $('#password-change-password').val('');
    }).catch(function(error) {
        $('#password-change-password').val('');
    });
});

$('#password-reset-link').click(function() {
    $('#password-reset-tab').tab('show');
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
        localStorage.setItem('notifications', 'false');
        $('#notifications-button-bell').removeClass('text-success');
        $('#notifications-button-slash').removeClass('invisible');
    }
    else {
        localStorage.setItem('notifications', 'true');
        $('#notifications-button-slash').addClass('invisible');
        $('#notifications-button-bell').addClass('text-success');
    }
});

$('body').on('input', '.form-control--required', function() {
    if ($(this).val() == '') {
        $(this).addClass('border-danger');
    }
    else {
        $(this).removeClass('border-danger');
    }
});

$('body').on('focusout', '.form-control--required', function() {
    if ($(this).val() == '') {
        $(this).addClass('border-danger');
    }
    else {
        $(this).removeClass('border-danger');
    }
});

$('#insert-exercise').click(function() {
    if (validateRequiredInputs()) {
        $(this).hide();
        $('#workout-functions').show();
        appendNewExercise();
    }
});

$('#add-exercise').click(function() {
    if (validateRequiredInputs()) {
        appendNewExercise();
    }
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
    let workoutDuration = '';
    if ($('#workout-duration-type').val() == 'repetitions') {
        workoutDuration += 'x';
    }
    workoutDuration += $('#workout-duration').val();
    if ($('#workout-duration-type').val() == 'minutes') {
        workoutDuration += "'";
    }
    let exercises = [];
    let exerciseDuration = '';
    $('.exercise').each(function(index) {
        exerciseDuration = '';
        if ($('.exercise__duration-type', this).val() == 'repetitions') {
            exerciseDuration += 'x';
        }
        exerciseDuration += $('.exercise__duration', this).val();
        if ($('.exercise__duration-type', this).val() == 'seconds') {
            exerciseDuration += "''";
        }
        exercises[index] = new Object();
        exercises[index].name = $('.exercise__name', this).val();
        exercises[index].duration = exerciseDuration;
    });
    let newWorkoutRef = firebase.database().ref('users/' + $('#workout-user').val() + '/workouts').push();
    newWorkoutRef.set({
        'name': convertDateToName($('#workout-name').val()),
        'durationType': $('#workout-duration-type').val();
        'duration': workoutDuration,
        'completed': 'false',
        'exercises': exercises
    });
    $('#save-workout-success').show();
    $('#workout-name').val('');
    $('#workout-duration').val('');
    $('#insert-exercise').show();
    $('.exercise').remove();
    $('#workout-functions').hide();
});

function enableDarkTheme() {
    $("#dark-theme-switch").prop('checked', true);
    $('html').addClass('dark');
}

function disableDarkTheme() {
    $("#dark-theme-switch").prop('checked', false);
    $('html').removeClass('dark');
}

function enableDarkThemeOnLoad() {
    if ((window.matchMedia) && (window.matchMedia('(prefers-color-scheme: dark)').matches) && (localStorage.getItem('darkTheme') != 'false')) {
        enableDarkTheme();
    }
}

function listenToDarkThemeChange() {
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
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        $('#install-about').hide();
        $('#install-tab').hide();
    }
    else {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
        });
        $('.btn--android').click(function() {
            deferredPrompt.prompt();
        });
    }
}

function checkUserState() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $('#reauthenticate-email').val(user.email);
            if ((user.uid == 'KNPfSGIuwTPZp6goKc8sp9Uhv7C2') || (user.uid == 'wFPela8qkzZEFOuNm35Oct2F14O2')) {
                loadFirebaseUsers();
                $('.nav').addClass('invisible');
                $('.nav-link').show();
                $('.nav-link').not('.admin').hide();
                $('.nav').removeClass('invisible');
                $('#create-tab').tab('show');
             }
            else {
                $('.nav').addClass('invisible');
                $('.nav-link').show();
                $('.nav-link').not('.user').hide();
                $('.nav').removeClass('invisible');
                $('#workouts-tab').tab('show');
            }
        }
        else {
            $('.nav').addClass('invisible');
            $('.nav-link').show();
            $('.nav-link').not('.login').hide();
            $('.nav').removeClass('invisible');
            $('#login-tab').tab('show');
        }
    });
}

function initializeOneSignal() {
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
        OneSignal.init({
        appId: "cbd2e5af-f377-4a51-88c3-13a508059c98",
        notifyButton: {
            enable: false,
        },
        });
    });
}

function checkNotificationsStateOnLoad() {
    if (localStorage.getItem('notifications') == 'true') {
        $('#notifications-button-slash').addClass('invisible');
        $('#notifications-button-bell').addClass('text-success');
    }
}

function loadFirebaseUsers() {
    firebase.database().ref('users').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            $('#workout-user').append('<option value="' + childSnapshot.key + '">' + childSnapshot.child('name').val() + '</option>');
        });
    });
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

function checkNumberOfExercises() {
    if ($('.exercise').length != 1) {
        $('.exercise__delete-button').removeAttr('disabled');
    }
    else {
        $('.exercise__delete-button').attr('disabled', true);
    }
}

function appendNewExercise() {
    $('#exercises').append('<div class="exercise card mb-3"> <div class="card-header"> <div class="form-group mb-0"> <label>Όνομα άσκησης:</label> <input type="text" class="exercise__name form-control form-control--required bg-transparent"> </div></div><div class="card-body"> <div class="form-group mb-0"> <label>Επίλεξε διάρκεια/επαναλήψεις:</label> <div class="form-row"> <div class="col"> <input type="number" class="exercise__duration form-control form-control--required"> </div><div class="col-auto"> <select class="exercise__duration-type form-control"> <option value="seconds">δευτερόλεπτα</option> <option value="repetitions">επαναλήψεις</option> </select> </div></div></div></div><div class="card-footer"> <button type="button" class="exercise__delete-button btn text-danger btn-block">Διαγραφή άσκησης</button> </div></div>');
    checkNumberOfExercises();
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