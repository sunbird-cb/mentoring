## A. Dockerized Services & Dependencies

**Expectation**: Run all services and dependencies simultaneously with a common **Docker-Compose** file.

## Prerequisites

To set up the Elevate MentorEd application, ensure you have Docker and Docker Compose installed on your system. For Ubuntu users, detailed installation instructions for both can be found in the documentation here: [How To Install and Use Docker Compose on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04). For Windows users, you can refer to the Docker documentation for installation instructions: [Docker Compose Installation Guide for Windows](https://docs.docker.com/compose/install/). Once these prerequisites are in place, you're all set to get started with setting up the Elevate MentorEd application.

## Installation

1.  **Create Elevate Directory:** Create a directory named **elevate**.

    > Example Command: `mkdir elevate && cd elevate/`

2.  **Download Docker Compose File:** Retrieve the **[docker-compose-mentoring.yml](https://github.com/ELEVATE-Project/mentoring/blob/doc-fix-2.5/src/scripts/setup/docker-compose-mentoring.yml)** file from the Elevate Mentoring repository and save it to the elevate directory.

    ```
    curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/docker-compose-mentoring.yml
    ```

    > Note: All commands are run from the elevate directory.

    Directory structure:

    ```
    ./elevate
    └── docker-compose-mentoring.yml
    ```

3.  **Download Environment Files**: Using the OS specific commands given below, download environment files for all the services.

    -   **Ubuntu/Linux/Mac**
        ```
        curl -L \
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/interface_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/mentoring_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/notification_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/scheduler_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/user_env \
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/environment.ts
        ```
    -   **Windows**

        ```
        curl -L ^
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/interface_env ^
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/mentoring_env ^
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/notification_env ^
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/scheduler_env ^
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/user_env ^
         -O https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/envs/environment.ts
        ```

4.  **Download `replace_volume_path` Script File**

    -   **Ubuntu/Linux/Mac**

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/mentoring/doc-fix-2.5/src/scripts/setup/replace_volume_path.sh
        ```

    -   **Windows**

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/mentoring/doc-fix-2.5/src/scripts/setup/replace_volume_path.bat
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

6.  **Download `docker-compose-up` & `docker-compose-down` Script Files**

    -   **Ubuntu/Linux/Mac**

        1. Download the files.

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/docker-compose-up.sh
            ```

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/docker-compose-down.sh
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
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/docker-compose-up.bat
        ```

        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/docker-compose-down.bat
        ```

7.  **Run All Services & Dependencies:** All services and dependencies can be started using the `docker-compose-up` script file.

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

8.  **Access The Elevate MentorEd PWA App**: Once the services are up and the front-end app bundle is built successfully, navigate to **[localhost:8100](http://localhost:8100/)** to access the MentorEd app.
9.  **Gracefully Stop All Services & Dependencies:** All containers which are part of the docker-compose can be gracefully stopped by pressing `Ctrl + c` in the same terminal where the services are running.
10. **Remove All Service & Dependency Containers**: All docker containers can be stopped and removed by using the `docker-compose-down` file.

    -   **Ubuntu/Linux/Mac**
        ```
        ./docker-compose-down.sh
        ```
    -   **Windows**

        ```
        docker-compose-down.bat
        ```

        > **Caution**: As per the default configuration in the `docker-compose-mentoring.yml` file, using the `down` command will lead to data loss since the database container does not persist data. To persist data across `down` commands and subsequent container removals, refer to the "Persistence of Database Data in Docker Containers" section of this documentation.

11. **Environment File Modification**: Modify the environment files as necessary for your deployment using any text editor, ensuring the values are appropriate for your environment.

## Enable Citus Extension

To enable the Citus extension for mentoring and user services, follow these steps.

1. Create a sub-directory named `mentoring` and download `distributionColumns.sql` into it.
    ```
    mkdir mentoring && curl -o ./mentoring/distributionColumns.sql -L https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/distribution-columns/mentoring/distributionColumns.sql
    ```
2. Create a sub-directory named `user` and download `distributionColumns.sql` into it.
    ```
    mkdir user && curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/distribution-columns/user/distributionColumns.sql
    ```
3. Set up the citus_setup file by following the steps given below.

    - **Ubuntu/Linux/Mac**

        1. Download the `citus_setup.sh` file.

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/citus_setup.sh
            ```

        2. Make the setup file executable by running the following command.

            ```
            chmod +x citus_setup.sh
            ```

        3. Enable Citus and set distribution columns for `elevate-mentoring` database by running the `citus_setup.sh`with the following arguments.
            ```
            ./citus_setup.sh mentoring postgres://postgres:postgres@citus_master:5432/elevate-mentoring
            ```
        4. Enable Citus and set distribution columns for `elevate-user` database by running the `citus_setup.sh`with the following arguments.
            ```
            ./citus_setup.sh user postgres://postgres:postgres@citus_master:5432/elevate-user
            ```

    - **Windows**
        1. Download the `citus_setup.bat` file.
            ```
             curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/doc-fix-2.5/src/scripts/setup/citus_setup.bat
            ```
        2. Enable Citus and set distribution columns for `elevate-mentoring` database by running the `citus_setup.bat`with the following arguments.
            ```
            citus_setup.bat mentoring postgres://postgres:postgres@citus_master:5432/elevate-mentoring
            ```
        3. Enable Citus and set distribution columns for `elevate-user` database by running the `citus_setup.bat`with the following arguments.
            ```
            citus_setup.bat user postgres://postgres:postgres@citus_master:5432/elevate-user
            ```
            > **Note:** Since the `citus_setup.bat` file requires arguments, it must be run from a terminal.

## Persistence of Database Data in Docker Container

To ensure the persistence of database data when running `docker compose down`, it is necessary to modify the `docker-compose-mentoring.yml` file according to the steps given below:

1. **Modification of the `docker-compose-mentoring.yml` File:**

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

2. **Uncommenting Volume Names Under the Volumes Section:**

    Next, navigate to the volumes section of the file and proceed to uncomment the volume names as illustrated in the subsequent snippet:

    ```yaml
    networks:
        elevate_net:
            external: false

    volumes:
        citus-data:
    ```

By implementing these adjustments, the configuration ensures that when the `docker-compose down` command is executed, the database data is securely stored within the specified volumes. Consequently, this data will be retained and remain accessible, even after the containers are terminated and subsequently reinstated using the `docker-compose up` command.
