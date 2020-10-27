document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email());

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email(recipients = '', subject = '', body = '') {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = recipients;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;

    // Adding event listener to the form
    let form = document.querySelector("#compose-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        let recipientsElement = document.querySelector("#compose-recipients");
        let subjectElement = document.querySelector("#compose-subject");
        let bodyElement = document.querySelector("#compose-body");

        // Checking with the user if he/she wants to send an email without subject/body
        if (
            (subjectElement.value || confirm("Do you want to send an email without subject?")) &&
            (bodyElement.value || confirm("Do you want to send an email without body?"))
        ) {

            // Fetching the api
            fetch('/emails', {
                    method: 'POST',
                    body: JSON.stringify({
                        recipients: recipientsElement.value,
                        subject: subjectElement.value,
                        body: bodyElement.value
                    })
                })
                .then((response) => response.json())
                .then(result => {
                    if (result.message) {
                        load_mailbox("sent");
                    } else {
                        alert(result.error);
                        compose_email(recipients, subjectElement.value, bodyElement.value);
                    }
                });
        }
    }, { once: true });
}

function time(timestamp) {
    const date = new Date(Date.parse(timestamp));
    const datestr = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
    return datestr;
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
                    recipientsOrSender = email.recipients.join(', ');
                } else {
                    recipientsOrSender = email.sender;
                }
                const element = document.createElement('div');
                element.className = "container emails";
                if (mailbox === 'inbox') {
                    if (email.read === true) {
                        element.style.background = "#dfdede";
                    } else {
                        element.style.background = "#f7f7f7";
                    }
                } else {
                    element.style.background = "#f7f7f7";
                }
                element.innerHTML = `
                    <div class="row" id="view-${email.id}">
                        <div class="col-4">
                            <p class="emails--recipients">${recipientsOrSender}</p>
                        </div>
                        <div class="col-4">
                            <p>${email.subject}</p>
                        </div>
                        <div class="col-4">
                            <p class="emails--timestamp">${time(email.timestamp)}</p>
                        </div>
                    </div>
                        `;
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
                <h6 class="card-subtitle mb-2 text-muted">from: ${email.sender}</h6>
                <h6 class="card-subtitle mb-2 text-muted">to: ${email.recipients}</h6>
                <p class="card-text body">${email.body}</p>
                <p class="card-text"><small class="text-muted">time: ${time(email.timestamp)}</p>
                <button class="btn btn-outline-primary" id="reply-${email.id}"><i class="fas fa-reply"></i> Reply</button>
                <button class="btn btn-outline-primary" id="id-${email.id}">Archive</button>
                
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
    document.querySelector("#compose-body").value = `---\nOn ${time(timestamp)} ${sender} wrote:\n${body}\n---\n`;
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