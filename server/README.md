This project uses Python, Flask, and SQLAlchemy with SQLite for database management. The backend is set up in a virtual environment (venv) for dependency isolation.

-------------------------------------------------------------

# To start the backend:

#### Activating the virtual enviroment

###### Mac/Linux

source venv/bin/activate

###### Windows

venv\scripts\activate

#### Start the server

  

python3 run.py

  

--------------------------------------------------------------

  

# First time setup:

  

Standing in the server folder type the following in the terminal

	python3 -m venv venv

  

#### Activating the virtual enviroment

  

###### Mac/Linux

  

	source venv/bin/activate

###### Windows

  

	venv\scripts\activate

  
  
  

Run the requirements scripts to install dependencies

  

	pip install -r requirements.txt

  
  
  

#### *db handling*

Make sure that the following folder exists

	server/instance

Create the database with the following script

	python3 database_reset.py

#### Start the server

	python3 run.py

--------------------------------------------------------------

  

# Troubleshooting:

- If the dependencies have changed since you last installed requirements you can get errors, try rerunning:

		pip install -r requirements.txt

  
  

- Depending on python version and OS "python" and/or "python3" can be correct syntax in the terminal

- If you get database related errors, try resetting the database with the following script
		
		python3 database_reset.py






# Backend file-structure
```
/server
│── /app
│   ├── /models               SQLAlchemy database models
│   │   ├── __init__.py       
│   │   ├── user.py           User model
│   │   ├── ...               Further models
│   │
│   ├── /routes               Routes for each db model 
│   │   ├── __init__.py       
│   │   ├── user_routes.py    User-related routes
│   │   ├── ...               Further routes
│   │
│   ├── __init__.py           
│   ├── config.py             Configuration settings
│   ├── extensions.py         Flask extensions (DB, Bcrypt, etc.)
│   ├── helpers.py            Common utilities
│
│── /instance                 
│   ├── app.db                SQLite database file
│            
│── .env                      Environment variables
│── requirements.txt          Dependencies
│── run.py                    Main entry point to start Flask server
│── database_reset.py         Script to reset the database & insert test data
│── README.md                 Project documentation
```
