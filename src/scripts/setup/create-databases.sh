#!/bin/bash

# Run commands as the postgres user
sudo -u postgres psql -p 9700 -c "CREATE USER mentored_db_user WITH ENCRYPTED PASSWORD 'mentored_password';"

# Create the mentoring database and assign privileges
sudo -u postgres psql -p 9700 -c "CREATE DATABASE mentoring;"
sudo -u postgres psql -p 9700 -d mentoring -c "GRANT ALL PRIVILEGES ON DATABASE mentoring TO mentored_db_user;"
sudo -u postgres psql -p 9700 -d mentoring -c "GRANT ALL ON SCHEMA public TO mentored_db_user;"

# Create the user database and assign privileges
sudo -u postgres psql -p 9700 -c "CREATE DATABASE users;"
sudo -u postgres psql -p 9700 -d users -c "GRANT ALL PRIVILEGES ON DATABASE users TO mentored_db_user;"
sudo -u postgres psql -p 9700 -d users -c "GRANT ALL ON SCHEMA public TO mentored_db_user;"

# Create the notification database and assign privileges
sudo -u postgres psql -p 9700 -c "CREATE DATABASE notification;"
sudo -u postgres psql -p 9700 -d notification -c "GRANT ALL PRIVILEGES ON DATABASE notification TO mentored_db_user;"
sudo -u postgres psql -p 9700 -d notification -c "GRANT ALL ON SCHEMA public TO mentored_db_user;"

echo "Database setup complete."
