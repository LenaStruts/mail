document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // Adding event listener to the form
    let form = document.querySelector("#compose-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        let recipients = document.querySelector("#compose-recipients");
        let subject = document.querySelector("#compose-subject");
        let body = document.querySelector("#compose-body");

        // Checking with the user if he/she wants to send an email without subject/body
        if (
            (subject.value || confirm("Do you want to send an email without subject?")) &&
            (body.value || confirm("Do you want to send an email without body?"))
        ) {

            // Fetching the api
            fetch('/emails', {
                    method: 'POST',
                    body: JSON.stringify({
                        recipients: recipients.value,
                        subject: subject.value,
                        body: body.value
                    })
                })
                .then((response) => response.json())
                .then(result => {
                    console.log(result);
                    if (result.message) {
                        load_mailbox("sent");
                    } else {
                        alert(result.error);
                    }
                });
        }
    }, { once: true });
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}