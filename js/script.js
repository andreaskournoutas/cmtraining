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
$('.alert').hide();
listenToDarkThemeChange();

$('#login-button').click(function() {
    firebase.auth().signInWithEmailAndPassword($('#email').val(), $('#password').val()).then((user) => {
        $('#reauthenticate-email').val(user.email);
        if ((user.uid == 'KNPfSGIuwTPZp6goKc8sp9Uhv7C2') || (user.uid == 'wFPela8qkzZEFOuNm35Oct2F14O2')) {
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
        // An error happened.
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
    $('.alert').hide();
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
        // An error happened.
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
    }
    else {
        disableDarkTheme();
    }
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
    if ((window.matchMedia) && (window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        enableDarkTheme();
    }
}

function listenToDarkThemeChange() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            enableDarkTheme();
        } else {
            disableDarkTheme();
        }
    });
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