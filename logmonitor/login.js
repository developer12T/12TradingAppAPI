$(document).ready(function() {

    // Handle login form submit
    $("#loginForm").submit(function(e) {
        e.preventDefault();

        // Get form data
        var username = $("#username").val();
        var password = $("#password").val();

        // Send login request to server
        $.ajax({
            url: "/login",
            method: "POST",
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                // If response status is 200, redirect to dashboard
                if (response.status === 200) {
                    window.location.href = "/dashboard";
                } else {
                    // Otherwise, show error message
                    alert("Login failed.");
                }
            },
            error: function(error) {
                // Show error message
                alert(error.responseText);
            }
        });
    });

});
