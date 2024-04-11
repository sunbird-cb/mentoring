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

# Create Citus extension
echo "Creating Citus extension in the database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -c "CREATE EXTENSION IF NOT EXISTS citus;"

# Retrieve distributionColumns.sql from the specified folder
DISTRIBUTION_COLUMNS_FILE="$FOLDER_NAME/distributionColumns.sql"

if [ ! -f "$DISTRIBUTION_COLUMNS_FILE" ]; then
  echo "Error: distributionColumns.sql not found in folder '$FOLDER_NAME'."
  exit 1
fi

# Create distribution column
echo "Creating distribution column..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -f "$DISTRIBUTION_COLUMNS_FILE"

echo "Citus extension setup complete."
