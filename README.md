# Auctions
> In this project I designed a front-end for an email client that makes API calls to send and receive emails.
## Table of contents
* [General info](#general-info)
* [Screenshots](#screenshots)
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)
* [Status](#status)
* [Inspiration](#inspiration)
* [Contact](#contact)

## General info
The purpose of this project is to implement a single-page-app email client using JavaScript, HTML, and CSS.

## Screenshots
![Screenshot1](https://user-images.githubusercontent.com/61382735/97169600-994fc680-178a-11eb-9626-d8bcf687b232.png)
![Screenshot2](https://user-images.githubusercontent.com/61382735/97169394-4aa22c80-178a-11eb-9b8d-3a78874b7865.png)

## Technologies
* Python - version 3.6
* Django - version 3.1
* JavaScript ES6
* Gunicorn - version 20.0
* Postgres - version 12.4
* Bootstrap4

## Setup
```
python3 -m venv myvenv
source myvenv/bin/activate
pip install -r requirements.txt
```

Create .env file such as: 
```
POSTGRES_ENGINE=django.db.backends.postgresql_psycopg2
POSTGRES_NAME=<your_postgres_name>
POSTGRES_USER=<your_postgres_username>
POSTGRES_PASSWORD=<your_postgres_password>
POSTGRES_HOST=<your_postgres_url>
POSTGRES_PORT=<your_postgres_port>
DJANGO_SECRET_KEY=<your_django_secret_key>
```

```
python manage.py makemigrations auctions
python manage.py migrate
python manage.py runserver

```
See your website at:
[http://127.0.0.1:8000](http://127.0.0.1:8000)

## Features
* Send and receive emails
* Visit Inbox, Sent or Archive mailbox
* Archive and unarchive emails
* Viewing and email, reply to an email 

To-do list:
* improve design 
* improve functionality

## Status
Project is paused, because it fullfills the requirements of the course, but some changes to be done to improve functionality and design.

## Inspiration
This project is part of the Harvard course I am taking, in particular CS50’s Web Programming with Python and JavaScript, project 3 - mail

## Contact
Created by [Lena Struts](https://www.linkedin.com/in/lena-yeliena-struts-5aa96292/) - feel free to contact me!