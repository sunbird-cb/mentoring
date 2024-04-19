## B. PM2 Managed Services & Natively Installed Dependencies

Expectation: Upon following the prescribed steps, you will achieve a fully operational MentorEd application setup. Both the portal and backend services are managed using PM2, with all dependencies installed natively on the host system.

## Prerequisites

Before setting up the following MentorEd application, dependencies given below should be installed and verified to be running. Refer to the installation guides given below to set up each dependency.

1. Node.js v20 (LTS)
   Refer [NodeSource distributions installation scripts](https://github.com/nodesource/distributions#installation-scripts).

2. Build Essential (Linux Only)
    ```bash
    $ sudo apt-get install build-essential
    ```

## Installation

1. Create Mentoring Directory: Create a directory named **mentoring**.

    > Example Command: `mkdir mentoring && cd mentoring/`

2. Git Clone Services/Portal Repositories

    - **Ubuntu/Linux/Mac**

        ```
        git clone https://github.com/ELEVATE-Project/mentoring.git && \
        git clone https://github.com/ELEVATE-Project/user.git && \
        git clone https://github.com/ELEVATE-Project/notification.git && \
        git clone https://github.com/ELEVATE-Project/interface-service.git && \
        git clone https://github.com/ELEVATE-Project/scheduler.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/mentoring-mobile-app.git
        ```

3. Install NPM Packages

    - **Ubuntu/Linux/Mac**

        ```
        cd mentoring/src && npm install && cd ../.. && \
        cd user/src && npm install && cd ../.. && \
        cd notification/src && npm install && cd ../.. && \
        cd interface-service/src && npm install && cd ../.. && \
        cd scheduler/src && npm install && cd ../.. && \
        cd mentoring-mobile-app && npm install && cd ..
        ```

4. Download Environment Files

    - **Ubuntu/Linux/Mac**

        ```
        curl -L -o mentoring/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/mentoring_env && \
        curl -L -o user/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/user_env && \
        curl -L -o notification/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/notification_env && \
        curl -L -o interface-service/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/interface_env && \
        curl -L -o scheduler/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/scheduler_env && \
        curl -L -o mentoring-mobile-app/src/environments/environment.ts https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/environment.ts
        ```

5. Create Databases

    - **Ubuntu/Linux/Mac**
        1. Download `create-databases.sh` Script File:
            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/create-databases.sh
            ```
        2. Make the executable by running the following command:
            ```
            chmod +x create-databases.sh
            ```
        3. Run the script file:
            ```
            ./create-databases.sh
            ```

6. Run Migrations To Create Tables

    - **Ubuntu/Linux/Mac**
        1. Install Sequelize-cli globally:
            ```
            sudo npm i sequelize-cli -g
            ```
            // The bit about changing env variables
        2. Run Migrations:
            ```
            cd mentoring/src && npx sequelize-cli db:migrate && cd ../.. && \
            cd user/src && npx sequelize-cli db:migrate && cd ../.. && \
            cd notification/src && npx sequelize-cli db:migrate && cd ../..
            ```

7. Enabling Citus And Setting Distribution Columns (Optional)
   MentorEd relies on PostgreSQL as its core database system. To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

    1. Download mentoring `distributionColumns.sql` file.

    ```
    curl -o ./mentoring/distributionColumns.sql -L https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/distribution-columns/mentoring/distributionColumns.sql
    ```

    2. Download user `distributionColumns.sql` file.

    ```
    curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/distribution-columns/user/distributionColumns.sql

    ```

    3. Set up the citus_setup_local file by following the steps given below.

        - **Ubuntu/Linux/Mac**
