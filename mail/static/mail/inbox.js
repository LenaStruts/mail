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
    document.querySelector('#email').style.display = 'none';

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
    document.querySelector('#email').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // fetch the api
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            emails.forEach(email => {
                let recipientsOrSender;
                if (mailbox === 'sent') {
                    recipientsOrSender = email.recipients;
                } else {
                    recipientsOrSender = email.sender;
                }
                const element = document.createElement('div');
                element.className = "card mb-3";
                if (mailbox === 'inbox') {
                    if (email.read === true) {
                        element.style.background = "#d3d3d3";
                    } else {
                        element.style.background = "#f7f7f7";
                    }
                } else {
                    element.style.background = "#f7f7f7";
                }

                element.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Subject: ${email.subject}</h5>
                            <p class="card-text">${recipientsOrSender}</p>
                            <p class="card-text"><small class="text-muted">time: ${email.timestamp}</p>
                            <button class="btn btn-primary" id="view-${email.id}">View email</button>
                        </div>`;
                document.querySelector('#emails-view').append(element);
                document.querySelector(`#view-${email.id}`).onclick = () => view_email(email.id);
            })
        });
}

function view_email(id) {
    // Show the mailbox and hide other views
    document.querySelector('#email').innerHTML = '';
    document.querySelector('#email').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    // Fetch the api
    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            const element = document.createElement('div');
            element.className = "card bg-light mb-3";
            element.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Subject: ${email.subject}</h5>
                <p class="card-text">from: ${email.sender}</p>
                <p class="card-text">to: ${email.recipients}</p>
                <p class="card-text">${email.body}</p>
                <p class="card-text"><small class="text-muted">time: ${email.timestamp}</p>
                <button class="btn btn-primary" id="id-${email.id}">Archive</button>
                <button class="btn btn-primary" id="reply-${email.id}">Reply</button>
            </div>`;
            document.querySelector('#email').append(element);
            // Archive/unarchive emails
            const button = document.querySelector(`#id-${email.id}`);
            button.onclick = () =>
                archived(id, !email.archived)
                .then(function() {
                    if (!email.archived) {
                        load_mailbox("archive");
                    } else {
                        load_mailbox("inbox");
                    }
                });
            button.innerHTML = !email.archived ? "Archive" : "Unarchive";

            document.querySelector(`#reply-${email.id}`).onclick = () => reply(email.sender, email.subject, email.body, email.timestamp);
            header = document.querySelector('h2').innerHTML

            if (header != email.sender) {
                button.style.visibility = 'visible';
                document.querySelector(`#reply-${email.id}`).style.visibility = 'visible';
            } else {
                button.style.visibility = 'hidden';
                document.querySelector(`#reply-${email.id}`).style.visibility = 'hidden';
            }

            // Make email read
            read(id);
        });
}

// Reply the emails
function reply(sender, subject, body, timestamp) {
    compose_email();
    document.querySelector("#compose-recipients").value = sender;
    if (subject.startsWith("Re: ")) {
        document.querySelector("#compose-subject").value = subject;
    } else {
        document.querySelector("#compose-subject").value = `Re: ${subject}`;
    }
    document.querySelector("#compose-body").value = `---\nOn ${timestamp} ${sender} wrote:\n${body}\n---\n`;
}

// Turn emails into read
function read(id) {
    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
}

// Switch emails from unarchived to archived and reverse
function archived(id, archived = true) {
    return fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived
        })
    });
}