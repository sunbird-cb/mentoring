## PM2 Managed Services & Natively Installed Dependencies

Expectation: Upon following the prescribed steps, you will achieve a fully operational Mentor application setup. Both the portal and backend services are managed using PM2, with all dependencies installed natively on the host system.

## Prerequisites

Before setting up the application, the dependencies should be installed and verified to be running. Refer to the following steps to install them and verify:

-   **Ubuntu/Linux**

    1. Download dependency management scripts:
        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/check-dependencies.sh && \
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/install-dependencies.sh && \
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/uninstall-dependencies.sh && \
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

        ```
        brew link --overwrite node@20
        ```

    2. Install Kafka:

        ```
        brew install kafka
        ```

        ```
        brew services start kafka
        ```

    3. Install PostgreSQL 16:

        ```
        brew install postgresql@16
        ```

        ```
        brew services start postgresql@16
        ```

    4. Install PM2:

        ```
        sudo npm install pm2@latest -g
        ```

    5. Install Redis:

        ```
        brew install redis
        ```

        ```
        brew services start redis
        ```

    6. Download `check-dependencies.sh` file:

        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/macos/check-dependencies.sh && \
        chmod +x check-dependencies.sh
        ```

    7. Verify installed dependencies by running `check-dependencies.sh`:

        ```
        ./check-dependencies.sh
        ```

-   **Windows**

    1. Install Node.js 20:

        Download and install Node.js v20 for Windows platform (x64) from official [Node.js download page](https://nodejs.org/en/download).

    2. Install Kafka 3.5.0:

        1. Adapt the instructions given in the following ["Apache Kafka on Windows"](https://www.conduktor.io/kafka/how-to-install-apache-kafka-on-windows/) documentation to install Kafka version 3.5.0.

            > Note: As per the instructions, Kafka server and Zookeeper has to be kept active on different WSL terminals for the entire lifetime of Mentor services.

            > Note: Multiple WSL terminals can be opened by launching `Ubuntu` from start menu.

        2. Open a new WSL terminal and execute the following command to get the IP of the WSL instance.

            ```
            ip addr show eth0
            ```

            Sample Output:

            ```
            2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1492 qdisc mq state UP group default qlen 1000
            link/ether 11:56:54:f0:as:vf brd ff:ff:ff:ff:ff:ff
            inet 172.12.46.150/20 brd 172.24.79.255 scope global eth0
                valid_lft forever preferred_lft forever
            inet6 fe80::215:5dff:fee7:dc52/64 scope link
                valid_lft forever preferred_lft forever
            ```

            Keep note of the IP address shown alongside `inet`. In the above case, `172.12.46.150` is IP address of the WSL instance.

        3. In the same WSL terminal, navigate to `config` directory of Kafka from step 1 and make the following changes to `server.properties` file.

            - Uncomment `listeners=PLAINTEXT://:9092` line and change it to `listeners=PLAINTEXT://0.0.0.0:9092` to allow connections from any IP.

            - Uncomment `advertised.listeners` line and set it to `advertised.listeners=PLAINTEXT://172.12.46.150:9092`. Replace `172.12.46.150` with the actual IP address of your WSL instance.

        4. Restart the Zookeeper and Kafka Server from their own WSL terminals from step 1.

    3. Install Redis:

        1. Follow the instructions given in the official [Redis Documentation](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-windows/) to install Redis using WSL.

        2. Using the WSL terminal, open the Redis configuration file in a text editor, such as nano:

            ```
            sudo nano /etc/redis/redis.conf
            ```

        3. Find the line containing `bind 127.0.0.1 ::1` and change it to `bind 0.0.0.0 ::.`. This change allows Redis to accept connections from any IP address. Then save and exit the file.

        4. Restart Redis to apply the changes:

            ```
            sudo service redis-server restart
            ```

    4. Install PM2:

        ```
        npm install pm2@latest -g
        ```

    5. Install PostgreSQL 16:

        1. Download and install PostgreSQL 16 from [EnterpriseDB PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) download page.

            > Note: Set username and password for the default database to be 'postgres' during installation.

        2. Once installed, Add `C:\Program Files\PostgreSQL\16\bin` to windows environment variables. Refer [here](https://www.computerhope.com/issues/ch000549.htm) or [here](https://stackoverflow.com/a/68851621) for more information regarding how to set it.

## Installation

1. **Create Mentoring Directory:** Create a directory named **mentorEd**.

    > Example Command: `mkdir mentorEd && cd mentorEd/`

2. **Git Clone Services And Portal Repositories**

    - **Ubuntu/Linux/MacOS**

        ```
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/mentoring.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/user.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/notification.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/interface-service.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/scheduler.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/mentoring-mobile-app.git
        ```

    - **Windows**

        ```
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/mentoring.git & ^
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/user.git & ^
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/notification.git & ^
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/interface-service.git & ^
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/scheduler.git & ^
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/mentoring-mobile-app.git
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

    - **Windows**

        ```
        cd mentoring\src & npm install & cd ..\.. & ^
        cd user\src & npm install & cd ..\.. & ^
        cd notification\src & npm install & cd ..\.. & ^
        cd interface-service\src & npm install & cd ..\.. & ^
        cd scheduler\src & npm install & cd ..\.. & ^
        cd mentoring-mobile-app & npm install --force & cd ..
        ```

4. **Download Environment Files**

    - **Ubuntu/Linux**

        ```
        curl -L -o mentoring/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/mentoring_env && \
        curl -L -o user/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/user_env && \
        curl -L -o notification/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/notification_env && \
        curl -L -o interface-service/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/interface_env && \
        curl -L -o scheduler/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/scheduler_env && \
        curl -L -o mentoring-mobile-app/src/environments/environment.ts https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/environment.ts
        ```

    - **MacOS**

        ```
        curl -L -o mentoring/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/non-citus/mentoring_env && \
        curl -L -o user/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/non-citus/user_env && \
        curl -L -o notification/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/non-citus/notification_env && \
        curl -L -o interface-service/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/interface_env && \
        curl -L -o scheduler/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/scheduler_env && \
        curl -L -o mentoring-mobile-app/src/environments/environment.ts https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/environment.ts
        ```

    - **Windows**

        ```
        curl -L -o mentoring\src\.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/non-citus/mentoring_env & ^
        curl -L -o user\src\.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/non-citus/user_env & ^
        curl -L -o notification\src\.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/non-citus/notification_env & ^
        curl -L -o interface-service\src\.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/interface_env & ^
        curl -L -o scheduler\src\.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/scheduler_env & ^
        curl -L -o mentoring-mobile-app\src\environments\environment.ts https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/environment.ts
        ```

    > **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Mentoring](https://github.com/ELEVATE-Project/mentoring/blob/master/src/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), and [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) repositories for reference.

    > **Caution:** While the default values in the downloaded environment files enable the application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.
    >
    > For detailed instructions on adjusting these values, please consult the **[Environment Variable Modification Guide](https://github.com/ELEVATE-Project/mentoring/blob/master/documentation/2.6.1/MentorEd-Env-Modification-README.md)**.

    > **Important:** As mentioned in the above linked document, the **User SignUp** functionality may be compromised if key environment variables are not set correctly during deployment. If you opt to skip this setup, consider using the sample user account generator detailed in the `Sample User Accounts Generation` section of this document.

5. **Create Databases**

    - **Ubuntu/Linux**
        1. Download `create-databases.sh` Script File:
            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/create-databases.sh
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
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/macos/create-databases.sh
            ```
        2. Make the executable by running the following command:
            ```
            chmod +x create-databases.sh
            ```
        3. Run the script file:
            ```
            ./create-databases.sh
            ```

    - **Windows**

        1. Download `create-databases.bat` Script File:
            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/windows/create-databases.bat
            ```
        2. Run the script file from a command-prompt terminal:
            ```
            create-databases.bat
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

    - **Windows**
        1. Install Sequelize-cli globally:
            ```
            npm i sequelize-cli -g
            ```
        2. Run Migrations:
            ```
            cd mentoring/src & npx sequelize-cli db:migrate & cd ../.. && ^
            cd user/src & npx sequelize-cli db:migrate & cd ../.. & ^
            cd notification/src & npx sequelize-cli db:migrate & cd ../..
            ```

7. **Enabling Citus And Setting Distribution Columns (Optional)**

    The application relies on PostgreSQL as its core database system. To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

    > **Note:** Currently only available for Linux based operation systems.

    1. Download mentoring `distributionColumns.sql` file.

        ```
        curl -o ./mentoring/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/distribution-columns/mentoring/distributionColumns.sql
        ```

    2. Download user `distributionColumns.sql` file.

        ```
        curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/distribution-columns/user/distributionColumns.sql
        ```

    3. Set up the `citus_setup` file by following the steps given below.

        - **Ubuntu/Linux**

            1. Download the `citus_setup.sh` file:

                ```
                curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/citus_setup.sh
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
   Use the application's in-build seeders to insert the initial data.

    - **Ubuntu/Linux/MacOS**

        ```
        cd mentoring/src && npm run db:seed:all && cd ../.. && \
        cd user/src && npm run db:seed:all && cd ../..
        ```

    - **Windows**
        ```
        cd mentoring/src & npm run db:seed:all & cd ../.. & ^
        cd user/src & npm run db:seed:all & cd ../..
        ```

9. **Start The Services**

    Following the steps given below, 2 instances of each Mentor backend service will be deployed and be managed by PM2 process manager.

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

    - **Windows**
        ```
        cd mentoring/src && pm2 start app.js -i 2 --name mentored-mentoring && cd ../.. && ^
        cd user/src && pm2 start app.js -i 2 --name mentored-user && cd ../.. && ^
        cd notification/src && pm2 start app.js -i 2 --name mentored-notification && cd ../.. && ^
        cd interface-service/src && pm2 start app.js -i 2 --name mentored-interface && cd ../.. && ^
        cd scheduler/src && pm2 start app.js -i 2 --name mentored-scheduler && cd ../..
        ```

10. **Run Service Scripts**

    - **Ubuntu/Linux/MacOS**

        ```
        cd user/src/scripts && node insertDefaultOrg.js && node viewsScript.js && \
        node -r module-alias/register uploadSampleCSV.js && cd ../../.. && \
        cd mentoring/src/scripts && node psqlFunction.js && node viewsScript.js && cd ../../..
        ```

    - **Windows**
        ```
        cd user/src/scripts & node insertDefaultOrg.js & node viewsScript.js & ^
        node -r module-alias/register uploadSampleCSV.js & cd ../../.. && ^
        cd mentoring/src/scripts & node psqlFunction.js & node viewsScript.js & cd ../../..
        ```

11. **Start The Portal**

    The portal utilizes Ionic and Angular CLI for building the browser bundle, follow the steps given below to install them and start the portal.

    - **Ubuntu/Linux**

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

        4. Build the portal:

            ```
            npx ionic build
            ```

        5. Start the portal:
            ```
            npx pm2 start pm2.config.json && cd ..
            ```

    - **Windows**

        1. Install Ionic CLI globally:

            ```
            npm install -g @ionic/cli
            ```

        2. Install Angular CLI globally:

            ```
            npm install -g @angular/cli
            ```

        3. Navigate to `mentoring-mobile-app` directory:

            ```
            cd mentoring-mobile-app
            ```

        4. Build the portal

            ```
            ionic build
            ```

        5. Start the portal:
            ```
            pm2 start pm2.config.json & cd ..
            ```

    Navigate to http://localhost:7601 to access the portal.

## Sample User Accounts Generation

During the initial setup of Mentor services with the default configuration, you may encounter issues creating new accounts through the regular Signup flow on the Mentor portal. This typically occurs because the default SignUp process includes OTP verification to prevent abuse. Until the notification service is configured correctly to send actual emails, you will not be able to create new accounts.

In such cases, you can generate sample user accounts using the steps below. This allows you to explore the services and portal immediately after setup.

> **Warning:** Use this generator only immediately after the initial system setup and before any normal user accounts are created through the portal. It should not be used under any circumstances thereafter.

-   **Ubuntu/Linux**

    ```
    curl -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/native/scripts/linux/insert_sample_data.sh && \
    chmod +x insert_sample_data.sh && \
    ./insert_sample_data.sh
    ```

-   **MacOS**

    ```
    curl -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/native/scripts/macos/insert_sample_data.sh && \
    chmod +x insert_sample_data.sh && \
    ./insert_sample_data.sh
    ```

-   **Windows**

    ```
    curl -o insert_sample_data.bat https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/native/scripts/windows/insert_sample_data.bat && ^
    insert_sample_data.bat
    ```

After successfully running the script mentioned above, the following user accounts will be created and available for login:

| Email ID                 | Password   | Role               |
| ------------------------ | ---------- | ------------------ |
| aaravpatel@example.com   | Password1@ | Mentee             |
| arunimareddy@example.com | Password1@ | Mentor             |
| devikasingh@example.com  | Password1@ | Organization Admin |
