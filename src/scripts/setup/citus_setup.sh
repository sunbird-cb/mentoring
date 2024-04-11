#!/bin/bash

# Exit on error
set -e

if [ $# -lt 2 ]; then
    echo "Error: Folder name and database URL not provided. Usage: $0 <folder_name> <database_url>"
    exit 1
fi

# Use the provided folder name
FOLDER_NAME=$1

# Check if folder exists
if [ ! -d "$FOLDER_NAME" ]; then
    echo "Error: Folder '$FOLDER_NAME' not found."
    exit 1
fi

# Use the provided database URL
DEV_DATABASE_URL=$2

# Extract database credentials and connection details
DB_USER=$(echo $DEV_DATABASE_URL | grep -oP '(?<=://)([^:]+)')
DB_PASSWORD=$(echo $DEV_DATABASE_URL | grep -oP '(?<=://)[^:]+:\K[^@]+')
DB_HOST=$(echo $DEV_DATABASE_URL | grep -oP '(?<=@)([^:/]+)')
DB_PORT=$(echo $DEV_DATABASE_URL | grep -oP '(?<=:)([0-9]+)(?=/)')
DB_NAME=$(echo $DEV_DATABASE_URL | grep -oP '(?<=/)[^/]+$')

# Log database variables
echo "Extracted Database Variables:"
echo "DB_USER: $DB_USER"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"

# Define the container name (same as DB_HOST)
CONTAINER_NAME=$DB_HOST

# Retrieve distributionColumns.sql from the specified folder
DISTRIBUTION_COLUMNS_FILE="$FOLDER_NAME/distributionColumns.sql"

if [ ! -f "$DISTRIBUTION_COLUMNS_FILE" ]; then
    echo "Error: distributionColumns.sql not found in folder '$FOLDER_NAME'."
    exit 1
fi

# Copy distributionColumns.sql into the Docker container
echo "Copying distributionColumns.sql to container '$CONTAINER_NAME'..."
docker cp "$DISTRIBUTION_COLUMNS_FILE" "$CONTAINER_NAME:/distributionColumns.sql"

# Create Citus extension in the database within the container
echo "Creating Citus extension in the database..."
docker exec --user $DB_USER $CONTAINER_NAME bash -c "PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -p $DB_PORT -c \"CREATE EXTENSION IF NOT EXISTS citus;\""

# Create distribution column within the container
echo "Creating distribution column..."
docker exec --user $DB_USER $CONTAINER_NAME bash -c "PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -p $DB_PORT -f \"/distributionColumns.sql\""

echo "Citus extension setup complete."
