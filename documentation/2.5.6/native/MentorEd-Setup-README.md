## B. PM2 Managed Services & Natively Installed Dependencies

Expectation: Upon following the prescribed steps, you will achieve a fully operational MentorEd application setup. Both the portal and backend services are managed using PM2, with all dependencies installed natively on the host system.

## Prerequisites

Before setting up the following MentorEd application, dependencies given below should be installed and verified to be running. Refer to the steps given below to install them and verify.

-   **Ubuntu/Linux**

    1. Download dependency management scripts:
        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/scripts/linux/check-dependencies.sh && \
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/scripts/linux/install-dependencies.sh && \
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/scripts/linux/uninstall-dependencies.sh && \
        chmod +x check-dependencies.sh && \
        chmod +x install-dependencies.sh && \
        chmod +x uninstall-dependencies.sh
        ```
    2. Verify installed dependencies by running `check-dependencies.sh`:

        ```
        ./check-dependencies.sh
        ```

        > Note: Keep note of any missing dependencies.

    3. Install dependencies by running `install-dependencies.sh`:
        ```
        ./install-dependencies.sh
        ```
        > Note: Install all missing dependencies and use check-dependencies script to ensure everything is installed and running.
    4. Uninstall dependencies by running `uninstall-dependencies.sh`:

        ```
        ./uninstall-dependencies.sh
        ```

        > Warning: Due to the destructive nature of the script (without further warnings), it should only be used during the initial setup of the dependencies. For example, Uninstalling PostgreSQL/Citus using script will lead to data loss. USE EXTREME CAUTION.

        > Warning: This script should only be used to uninstall dependencies that were installed via installation script in step 3. If same dependencies were installed using other methods, refrain from using this script. This script is provided in-order to reverse installation in-case issues arise from a bad install.

-   **MacOS**

    1. Install Node.js 20:

        ```
        brew install node@20
        ```

    2. Install Kafka:

        ```
        brew install kafka
        ```

    3. Install PostgreSQL 16:

        ```
        brew install postgresql@16
        ```

    4. Install PM2:

        ```
        sudo npm install pm2@latest -g
        ```

    5. Install Redis:
        ```
        brew install redis
        ```

## Installation

1. **Create Mentoring Directory:** Create a directory named **mentorEd**.

    > Example Command: `mkdir mentorEd && cd mentorEd/`

2. **Git Clone Services And Portal Repositories**

    - **Ubuntu/Linux/MacOS**

        ```
        git clone -b release-2.5.6 https://github.com/ELEVATE-Project/mentoring.git && \
        git clone -b release-2.5.6 https://github.com/ELEVATE-Project/user.git && \
        git clone -b release-2.5.6 https://github.com/ELEVATE-Project/notification.git && \
        git clone -b release-2.5.6 https://github.com/ELEVATE-Project/interface-service.git && \
        git clone -b release-2.5.6 https://github.com/ELEVATE-Project/scheduler.git && \
        git clone -b release-2.5.0 https://github.com/ELEVATE-Project/mentoring-mobile-app.git
        ```

3. **Install NPM Packages**

    - **Ubuntu/Linux/MacOS**

        ```
        cd mentoring/src && npm install && cd ../.. && \
        cd user/src && npm install && cd ../.. && \
        cd notification/src && npm install && cd ../.. && \
        cd interface-service/src && npm install && cd ../.. && \
        cd scheduler/src && npm install && cd ../.. && \
        cd mentoring-mobile-app && npm install --force && cd ..
        ```

4. **Download Environment Files**

    - **Ubuntu/Linux**

        ```
        curl -L -o mentoring/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/mentoring_env && \
        curl -L -o user/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/user_env && \
        curl -L -o notification/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/notification_env && \
        curl -L -o interface-service/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/interface_env && \
        curl -L -o scheduler/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/scheduler_env && \
        curl -L -o mentoring-mobile-app/src/environments/environment.ts https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/environment.ts
        ```

    - **Ubuntu/Linux/MacOS**

        ```
        curl -L -o mentoring/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/non-citus/mentoring_env && \
        curl -L -o user/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/non-citus/user_env && \
        curl -L -o notification/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/non-citus/notification_env && \
        curl -L -o interface-service/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/interface_env && \
        curl -L -o scheduler/src/.env https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/scheduler_env && \
        curl -L -o mentoring-mobile-app/src/environments/environment.ts https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/envs/environment.ts
        ```

5. **Create Databases**

    - **Ubuntu/Linux**
        1. Download `create-databases.sh` Script File:
            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/scripts/linux/create-databases.sh
            ```
        2. Make the executable by running the following command:
            ```
            chmod +x create-databases.sh
            ```
        3. Run the script file:
            ```
            ./create-databases.sh
            ```
    - **MacOS**
        1. Download `create-databases.sh` Script File:
            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/scripts/macos/create-databases.sh
            ```
        2. Make the executable by running the following command:
            ```
            chmod +x create-databases.sh
            ```
        3. Run the script file:
            ```
            ./create-databases.sh
            ```

6. **Run Migrations To Create Tables**

    - **Ubuntu/Linux/MacOS**
        1. Install Sequelize-cli globally:
            ```
            sudo npm i sequelize-cli -g
            ```
        2. Run Migrations:
            ```
            cd mentoring/src && npx sequelize-cli db:migrate && cd ../.. && \
            cd user/src && npx sequelize-cli db:migrate && cd ../.. && \
            cd notification/src && npx sequelize-cli db:migrate && cd ../..
            ```

7. **Enabling Citus And Setting Distribution Columns (Optional)**

    MentorEd relies on PostgreSQL as its core database system. To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

    > NOTE: Currently only available for Linux based operation systems.

    1. Download mentoring `distributionColumns.sql` file.

        ```
        curl -o ./mentoring/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/distribution-columns/mentoring/distributionColumns.sql
        ```

    2. Download user `distributionColumns.sql` file.

        ```
        curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/distribution-columns/user/distributionColumns.sql
        ```

    3. Set up the `citus_setup` file by following the steps given below.

        - **Ubuntu/Linux/MacOS**

            1. Download the `citus_setup.sh` file:

                ```
                curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/documentation/2.5.6/native/scripts/linux/citus_setup.sh
                ```

            2. Make the setup file executable by running the following command:

                ```
                chmod +x citus_setup.sh
                ```

            3. Enable Citus and set distribution columns for `mentoring` database by running the `citus_setup.sh` with the following arguments.
                ```
                ./citus_setup.sh mentoring postgres://postgres:postgres@localhost:9700/mentoring
                ```
            4. Enable Citus and set distribution columns for `user` database by running the `citus_setup.sh`with the following arguments.
                ```
                ./citus_setup.sh user postgres://postgres:postgres@localhost:9700/users
                ```

8. **Insert Initial Data**
   Use MentorEd in-build seeders to insert the initial data.

    ```
    cd mentoring/src && npm run db:seed:all && cd ../.. && \
    cd user/src && npm run db:seed:all && cd ../..
    ```

9. **Start The Services**

    Following the steps given below, 2 instances of each MentorEd backend service will be deployed and be managed by PM2 process manager.

    - **Ubuntu/Linux**

        ```
        cd mentoring/src && pm2 start app.js -i 2 --name mentored-mentoring && cd ../.. && \
        cd user/src && pm2 start app.js -i 2 --name mentored-user && cd ../.. && \
        cd notification/src && pm2 start app.js -i 2 --name mentored-notification && cd ../.. && \
        cd interface-service/src && pm2 start app.js -i 2 --name mentored-interface && cd ../.. && \
        cd scheduler/src && pm2 start app.js -i 2 --name mentored-scheduler && cd ../..
        ```

    - **MacOS**
        ```
        cd mentoring/src && npx pm2 start app.js -i 2 --name mentored-mentoring && cd ../.. && \
        cd user/src && npx pm2 start app.js -i 2 --name mentored-user && cd ../.. && \
        cd notification/src && npx pm2 start app.js -i 2 --name mentored-notification && cd ../.. && \
        cd interface-service/src && npx pm2 start app.js -i 2 --name mentored-interface && cd ../.. && \
        cd scheduler/src && npx pm2 start app.js -i 2 --name mentored-scheduler && cd ../..
        ```

10. **Run Service Scripts**

    ```
    cd user/src/scripts && node insertDefaultOrg.js && node viewsScript.js && \
    node -r module-alias/register uploadSampleCSV.js && cd ../../.. && \
    cd mentoring/src/scripts && node psqlFunction.js && node viewsScript.js && cd ../../..
    ```

11. **Start The Portal**

    MentorEd portal utilizes Ionic and Angular CLI for building the browser bundle, follow the steps given below to install them and start the portal.

    - **Ubuntu/Linux/MacOS**

        1. Install Ionic CLI globally:

            ```
            sudo npm install -g @ionic/cli
            ```

        2. Install Angular CLI globally:

            ```
            sudo npm install -g @angular/cli
            ```

        3. Navigate to `mentoring-mobile-app` directory:

            ```
            cd mentoring-mobile-app
            ```

        4. Build the portal
           Navigate to mentoring-mobile-app directory and run:

            ```
            ionic build
            ```

        5. Start the portal:
            ```
            pm2 start pm2.config.json && cd ..
            ```

    - **MacOS**

        1. Install Ionic CLI globally:

            ```
            sudo npm install -g @ionic/cli
            ```

        2. Install Angular CLI globally:

            ```
            sudo npm install -g @angular/cli
            ```

        3. Navigate to `mentoring-mobile-app` directory:

            ```
            cd mentoring-mobile-app
            ```

        4. Build the portal
           Navigate to mentoring-mobile-app directory and run:

            ```
            npx ionic build
            ```

        5. Start the portal:
            ```
            npx pm2 start pm2.config.json && cd ..
            ```

    Navigate to http://localhost:7601 to access the MentorEd Portal.
