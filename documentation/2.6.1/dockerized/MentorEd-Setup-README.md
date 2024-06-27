## Dockerized Services and Dependencies

Expectation: Upon following the prescribed steps, you will achieve a fully operational Mentor application setup, complete with both the portal and backend services.

## Prerequisites

To set up the application, you must install Docker and Docker Compose on your system using any one of the following ways:
 
* Ubuntu users can refer to [How To Install and Use Docker Compose on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04) for detailed installation instructions. 

* Windows and MacOS users can refer to the [Docker Compose Installation Guide](https://docs.docker.com/compose/install/) for the installation instructions.

Once these prerequisites are in place, you're all set to get started with setting up the application.

## Installation

1.  **Create mentoring Directory:** Create a directory named **mentoring**.

    > Example Command: `mkdir mentoring && cd mentoring/`

2.  **Download Docker Compose File:** Retrieve the **[docker-compose-mentoring.yml](https://github.com/ELEVATE-Project/mentoring/blob/master/src/scripts/setup/docker-compose-mentoring.yml)** file from the Mentoring repository and save it to the mentoring directory.

    ```
    curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/docker-compose-mentoring.yml
    ```

    > **Note:** Run all the commands from the mentoring directory.

    Directory structure:

    ```
    ./mentoring
    └── docker-compose-mentoring.yml
    ```

3.  **Download Environment Files**: Using the OS specific commands given below, download environment files for all the services.

    -   **Ubuntu/Linux/Mac**
        ```
        curl -L \
         -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/interface_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/mentoring_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/notification_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/scheduler_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/user_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/environment.ts
        ```
    -   **Windows**

        ```
        curl -L ^
            -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/interface_env ^
            -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/mentoring_env ^
            -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/notification_env ^
            -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/scheduler_env ^
            -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/user_env ^
            -O https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/envs/environment.ts
        ```

    > **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Mentoring](https://github.com/ELEVATE-Project/mentoring/blob/master/src/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), and [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) repositories for reference.

    > **Caution:** While the default values in the downloaded environment files enable the application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.
    >
    > For detailed instructions on adjusting these values, please consult the **[Environment Variable Modification Guide](https://github.com/ELEVATE-Project/mentoring/blob/master/documentation/2.6.1/MentorEd-Env-Modification-README.md)**.

    > **Important:** As mentioned in the above linked document, the **User SignUp** functionality may be compromised if key environment variables are not set correctly during deployment. If you opt to skip this setup, consider using the sample user account generator detailed in the `Sample User Accounts Generation` section of this document.

4.  **Download `replace_volume_path` Script File**

    -   **Ubuntu/Linux/Mac**

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/dockerized/scripts/mac-linux/replace_volume_path.sh
        ```

    -   **Windows**

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/dockerized/scripts/windows/replace_volume_path.bat
        ```

5.  **Run `replace_volume_path` Script File**

    -   **Ubuntu/Linux/Mac**
        1. Make the `replace_volume_path.sh` file an executable.
            ```
            chmod +x replace_volume_path.sh
            ```
        2. Run the script file using the following command.
            ```
            ./replace_volume_path.sh
            ```
    -   **Windows**

        Run the script file either by double clicking it or by executing the following command from the terminal.

        ```
        replace_volume_path.bat
        ```

        > **Note**: The provided script file replaces the host path for the **portal** service container volume in the `docker-compose-mentoring.yml` file with your current directory path.
        >
        > volumes:
        >
        > \- /home/joffin/elevate/backend/environment.ts:/app/src/environments/environment.ts

6.  **Download `docker-compose-up` and `docker-compose-down` Script Files**

    -   **Ubuntu/Linux/Mac**

        1. Download the files.

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/mac-linux/docker-compose-up.sh
            ```

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/mac-linux/docker-compose-down.sh
            ```

        2. Make the files executable by running the following commands.

            ```
            chmod +x docker-compose-up.sh
            ```

            ```
            chmod +x docker-compose-down.sh
            ```

    -   **Windows**

        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/windows/docker-compose-up.bat
        ```

        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/windows/docker-compose-down.bat
        ```

7.  **Run All Services and Dependencies:** All services and dependencies can be started using the `docker-compose-up` script file.

    -   **Ubuntu/Linux/Mac**
        ```
        ./docker-compose-up.sh
        ```
    -   **Windows**

        ```
        docker-compose-up.bat
        ```

        > Double-click the file or run the above command from the terminal.

        > **Note**: During the first Docker Compose run, the database, migration seeder files, and the script to set the default organization will be executed automatically.

8.  **Access The Application**: Once the services are up and the front-end app bundle is built successfully, navigate to **[localhost:8100](http://localhost:8100/)** to access the application.
9.  **Gracefully Stop All Services and Dependencies:** All containers which are part of the docker-compose can be gracefully stopped by pressing `Ctrl + c` in the same terminal where the services are running.
10. **Remove All Service and Dependency Containers**: All docker containers can be stopped and removed by using the `docker-compose-down` file.

    -   **Ubuntu/Linux/Mac**
        ```
        ./docker-compose-down.sh
        ```
    -   **Windows**

        ```
        docker-compose-down.bat
        ```

        > **Caution**: As per the default configuration in the `docker-compose-mentoring.yml` file, using the `down` command will lead to data loss since the database container does not persist data. To persist data across `down` commands and subsequent container removals, refer to the "Persistence of Database Data in Docker Containers" section of this documentation.

## Enable Citus Extension

The application relies on PostgreSQL as its core database system. To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

For more information, refer **[Citus Data](https://www.citusdata.com/)**.

To enable the Citus extension for Mentor and User services, follow these steps.

1. Create a sub-directory named `mentoring` and download `distributionColumns.sql` into it.
    ```
    mkdir mentoring && curl -o ./mentoring/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/distribution-columns/mentoring/distributionColumns.sql
    ```
2. Create a sub-directory named `user` and download `distributionColumns.sql` into it.
    ```
    mkdir user && curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/distribution-columns/user/distributionColumns.sql
    ```
3. Set up the citus_setup file by following the steps given below.

    - **Ubuntu/Linux/Mac**

        1. Download the `citus_setup.sh` file.

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/mac-linux/citus_setup.sh
            ```

        2. Make the setup file executable by running the following command.

            ```
            chmod +x citus_setup.sh
            ```

        3. Enable Citus and set distribution columns for `mentoring` database by running the `citus_setup.sh`with the following arguments.
            ```
            ./citus_setup.sh mentoring postgres://postgres:postgres@citus_master:5432/mentoring
            ```
        4. Enable Citus and set distribution columns for `user` database by running the `citus_setup.sh`with the following arguments.
            ```
            ./citus_setup.sh user postgres://postgres:postgres@citus_master:5432/user
            ```

    - **Windows**
        1. Download the `citus_setup.bat` file.
            ```
             curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/windows/citus_setup.bat
            ```
        2. Enable Citus and set distribution columns for `mentoring` database by running the `citus_setup.bat`with the following arguments.
            ```
            citus_setup.bat mentoring postgres://postgres:postgres@citus_master:5432/mentoring
            ```
        3. Enable Citus and set distribution columns for `user` database by running the `citus_setup.bat`with the following arguments.
            ```
            citus_setup.bat user postgres://postgres:postgres@citus_master:5432/user
            ```
            > **Note:** Since the `citus_setup.bat` file requires arguments, it must be run from a terminal.

## Persistence Of Database Data In Docker Container

To ensure the persistence of database data when running `docker compose down`, it is necessary to modify the `docker-compose-mentoring.yml` file according to the steps given below:

1. **Modification Of The `docker-compose-mentoring.yml` File:**

    Begin by opening the `docker-compose-mentoring.yml` file. Locate the section pertaining to the Citus container and proceed to uncomment the volume specification. This action is demonstrated in the snippet provided below:

    ```yaml
    citus:
        image: citusdata/citus:11.2.0
        container_name: 'citus_master'
        ports:
            - 5432:5432
        volumes:
            - citus-data:/var/lib/postgresql/data
    ```

2. **Uncommenting Volume Names Under The Volumes Section:**

    Next, navigate to the volumes section of the file and proceed to uncomment the volume names as illustrated in the subsequent snippet:

    ```yaml
    networks:
        elevate_net:
            external: false

    volumes:
        citus-data:
    ```

By implementing these adjustments, the configuration ensures that when the `docker-compose down` command is executed, the database data is securely stored within the specified volumes. Consequently, this data will be retained and remain accessible, even after the containers are terminated and subsequently reinstated using the `docker-compose up` command.

## Sample User Accounts Generation

During the initial setup of Mentor services with the default configuration, you may encounter issues creating new accounts through the regular Signup flow on the Mentor portal. This typically occurs because the default SignUp process includes OTP verification to prevent abuse. Until the notification service is configured correctly to send actual emails, you will not be able to create new accounts.

In such cases, you can generate sample user accounts using the steps below. This allows you to explore the services and portal immediately after setup.

> **Warning:** Use this generator only immediately after the initial system setup and before any normal user accounts are created through the portal. It should not be used under any circumstances thereafter.

1. **Download The `sampleData.sql` Files:**

    - **Ubuntu/Linux/Mac**

        ```
        mkdir -p sample-data/mentoring sample-data/user && \
        curl -L https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/sample-data/mac-linux/mentoring/sampleData.sql -o sample-data/mentoring/sampleData.sql && \
        curl -L https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/sample-data/mac-linux/user/sampleData.sql -o sample-data/user/sampleData.sql
        ```

    - **Windows**

        ```
        mkdir sample-data\mentoring 2>nul & mkdir sample-data\user 2>nul & ^
        curl -L "https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/sample-data/windows/mentoring/sampleData.sql" -o sample-data\mentoring\sampleData.sql & ^
        curl -L "https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/sample-data/windows/user/sampleData.sql" -o sample-data\user\sampleData.sql
        ```

2. **Download The `insert_sample_data` Script File:**

    - **Ubuntu/Linux/Mac**

        ```
        curl -L -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/dockerized/scripts/mac-linux/insert_sample_data.sh && chmod +x insert_sample_data.sh
        ```

    - **Windows**

        ```
        curl -L -o insert_sample_data.bat https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/dockerized/scripts/windows/insert_sample_data.bat
        ```

3. **Run The `insert_sample_data` Script File:**

    - **Ubuntu/Linux/Mac**

        ```
        ./insert_sample_data.sh user postgres://postgres:postgres@citus_master:5432/user && \
        ./insert_sample_data.sh mentoring postgres://postgres:postgres@citus_master:5432/mentoring
        ```

    - **Windows**

        ```
        insert_sample_data.bat user postgres://postgres:postgres@citus_master:5432/user & ^
        insert_sample_data.bat mentoring postgres://postgres:postgres@citus_master:5432/mentoring
        ```

    After successfully running the script mentioned above, the following user accounts will be created and available for login:

    | Email ID                 | Password   | Role               |
    | ------------------------ | ---------- | ------------------ |
    | aaravpatel@example.com   | Password1@ | Mentee             |
    | arunimareddy@example.com | Password1@ | Mentor             |
    | aaravpatel@example.com   | Password1@ | Organization Admin |
