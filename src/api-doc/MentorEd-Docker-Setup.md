## A. Dockerized Services & Dependencies

**Expectation**: Run all services and dependencies simultaneously with a common **Docker-Compose** file.

## Prerequisites

To set up the Elevate MentorEd application, ensure you have Docker and Docker Compose installed on your system. For Ubuntu users, detailed installation instructions for both can be found in the documentation here: [How To Install and Use Docker Compose on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04). For Windows users, you can refer to the Docker documentation for installation instructions: [Docker Compose Installation Guide for Windows](https://docs.docker.com/compose/install/). Once these prerequisites are in place, you're all set to get started with setting up the Elevate MentorEd application.

## Directory Setup

### Follow these steps to download the necessary files for the Elevate application:

1.  **Create Directory:** Create a directory named **elevate** with a **backend** sub-directory within it.

    Directory structure:

    ```
    ./elevate/
    └── backend
    ```

> Example Command: `mkdir elevate &&	cd elevate/`

2.  **Download Docker Compose File:** Retrieve the **[docker-compose-mentoring.yml](https://github.com/ELEVATE-Project/mentoring/blob/temp_setup/docker-compose-mentoring.yml)** file from the Elevate Mentoring repository and save it to the backend directory.

    ```
    elevate/backend$ curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/temp_setup/docker-compose-mentoring.yml
    ```

    Directory structure:

    ```
    ./elevate/
    └── backend
        └── docker-compose-mentoring.yml
    ```

3.  **Create Sub-directories For Services:** Since each service requires distinct setup files, create separate sub-directories for the mentoring and user services within the backend directory.

    Directory structure:

    ```
    ./elevate/
    └── backend
        ├── docker-compose-mentoring.yml
        ├── mentoring
        └── user
    ```

    > Example Command: `~/elevate/backend$ mkdir mentoring`

4.  **Set up Mentoring Directory:** Navigate into the mentoring directory and download required files.

    -   **[setup.sh](https://github.com/ELEVATE-Project/mentoring/blob/temp_setup/src/setup.sh)**
        ```
        /mentoring$ curl -o setup.sh -L https://github.com/ELEVATE-Project/mentoring/raw/temp_setup/src/setup.sh
        ```
    -   **[distributionColumns.psql](https://github.com/ELEVATE-Project/mentoring/blob/temp_setup/src/distributionColumns.psql)**
        ```
        /mentoring$ curl -o distributionColumns.psql -L https://github.com/ELEVATE-Project/mentoring/raw/temp_setup/src/distributionColumns.psql
        ```

    Directory Structure:

        ./elevate/
        └── backend
            ├── docker-compose-mentoring.yml
            ├── mentoring
            │   ├── distributionColumns.psql
            │   └── setup.sh
            └── user

5.  **Make The Setup File Executable:**

    -   Ubuntu/Linux/Mac:
        ```
        /mentoring$ chmod +x setup.sh
        ```
    -   Windows
        ```
        /mentoring attrib +x setup.sh
        ```

6.  **Set Up User Directory:** Navigate into the user directory and repeat steps 4 and 5 with the following files.

    -   **[setup.sh](https://github.com/ELEVATE-Project/user/blob/temp_setup/src/setup.sh)**
        ```
        /user$ curl -o setup.sh -L https://github.com/ELEVATE-Project/user/raw/temp_setup/src/setup.sh
        ```
    -   **[distributionColumns.sql](https://github.com/ELEVATE-Project/user/blob/temp_setup/src/distributionColumns.sql)**
        `/user$ curl -o distributionColumns.sql -L https://github.com/ELEVATE-Project/user/raw/temp_setup/src/distributionColumns.sql` > **Note:** The setup.sh file needs to be set as executable.

    Directory Structure:

    ```
    ./elevate/
    └── backend
        ├── docker-compose-mentoring.yml
        ├── mentoring
        │   ├── distributionColumns.psql
        │   └── setup.sh
        └── user
            ├── distributionColumns.sql
            └── setup.sh
    ```

## Environment File Creation

### Create an environment file for the Mentoring service by following these steps:

1. Navigate to the **backend** directory and create a new file named **mentoring_env** using any text editor like nano/notepad:

-   Ubuntu/Linux/Mac:
    ```
    $ nano mentoring_env
    ```
-   Windows

    ```
    $ notepad mentoring_env
    ```

2. Copy and paste the following environment variables into the **mentoring_env** file:

    File name: **mentoring_env**
    <details>
    <summary>mentoring_env content (Click Here)</summary>

    ```
    ACCESS_TOKEN_SECRET=asadsd8as7df9as8df987asdf
    API_DOC_URL=/api-doc
    APPLICATION_BASE_URL=/mentoring/
    APPLICATION_ENV=development
    APPLICATION_HOST=mentoring
    APPLICATION_PORT=3000
    APPLICATION_URL=https://dev.mentoring.shikshalokam.org
    AWS_ACCESS_KEY_ID=aws-access-key-id
    AWS_BUCKET_ENDPOINT=s3.ap-south-1.amazonaws.com
    AWS_BUCKET_REGION=ap-south-1
    AWS_SECRET_ACCESS_KEY=aws-secret-access-key
    AZURE_ACCOUNT_KEY=azure-account-key
    AZURE_ACCOUNT_NAME=account-name
    BIG_BLUE_BUTTON_BASE_URL=/bigbluebutton/
    BIG_BLUE_BUTTON_LAST_USER_TIMEOUT_MINUTES=15
    BIG_BLUE_BUTTON_SECRET_KEY=s90df8g09sd8fg098sdfg
    BIG_BLUE_BUTTON_SESSION_END_URL=https%3A%2F%2Fdev.some-mentoring.temp.org%2F
    BIG_BLUE_BUTTON_URL=https://dev.some.temp.org
    CLOUD_STORAGE=AWS
    CLEAR_INTERNAL_CACHE=mentoringInternal
    DEFAULT_AWS_BUCKET_NAME=aws-bucket-storage-name
    DEFAULT_GCP_BUCKET_NAME=gcp-bucket-storage-name
    DEFAULT_MEETING_SERVICE=BBB
    DEFAULT_ORGANISATION_CODE=default_code
    DEFAULT_ORG_ID=1
    DEV_DATABASE_URL=postgres://postgres:postgres@localhost:5432/elevate-mentoring
    DISABLE_LOG=false
    ENABLE_EMAIL_FOR_REPORT_ISSUE=true
    ENABLE_LOG=true
    ERROR_LOG_LEVEL=silly
    GCP_PATH=gcp.json
    GCP_PROJECT_ID=project-id
    INTERNAL_ACCESS_TOKEN=internal_access_token
    INTERNAL_CACHE_EXP_TIME=86400
    KAFKA_GROUP_ID=mentoring
    KAFKA_MENTORING_TOPIC=mentoringtopic
    KAFKA_RECORDING_TOPIC=recordingtopic
    KAFKA_URL=kafka:9092
    MEETING_END_CALLBACK_EVENTS=https%3A%2F%2Fdev.some-apis.temp.org%2Fmentoring%2Fv1%2Fsessions%2Fcompleted
    MENTEE_SESSION_ENROLLMENT_EMAIL_TEMPLATE=mentee_session_enrollment
    MENTOR_SESSION_DELETE_EMAIL_TEMPLATE=mentor_session_delete
    MENTOR_SESSION_RESCHEDULE_EMAIL_TEMPLATE=mentor_session_reschedule
    NOTIFICATION_KAFKA_TOPIC=develop.notifications
    RATING_KAFKA_TOPIC=dev.rate
    REDIS_HOST=redis://redis:6379
    REFRESH_VIEW_INTERVAL=30000
    REPORT_ISSUE_EMAIL_TEMPLATE_CODE=user_issue_reported
    REQUIRED_PACKAGES=elevate-user@1.1.30 elevate-mentoring@1.1.23 elevate-scheduler@1.0.4
    SCHEDULER_SERVICE_BASE_URL=/scheduler/
    SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID=rakesh.k@some.com
    SCHEDULER_SERVICE_HOST=http://scheduler:4000
    SCHEDULER_SERVICE_URL=http://scheduler:4000/jobs/scheduleJob
    SESSION_EDIT_WINDOW_MINUTES=0
    SESSION_KAFKA_TOPIC=session
    SESSION_MENTEE_LIMIT=5
    SUPPORT_EMAIL_ID=support@xyz.com,team@xyz.com
    USER_SERVICE_BASE_URL=/user/
    USER_SERVICE_HOST=http://user:3001
    ```

    </details>

    For Elevate Notification Repository, **[Click Here](https://github.com/ELEVATE-Project/notification)**.

3. Save the changes to the file and exit the text editor.

    Directory Structure:

    ```
    ./elevate/
    └── backend
      ├── docker-compose-mentoring.yml
      ├── mentoring
      │   ├── distributionColumns.psql
      │   └── setup.sh
      ├── mentoring_env <===
      └── user
          ├── distributionColumns.sql
          └── setup.sh
    ```

    For Elevate Mentoring Repository, **[Click Here](https://github.com/ELEVATE-Project/mentoring)**.

### Create environment files for other backend services:

Following the exact same instructions from the previous section, create the following env files with the contents given below:

-   File name: **user_env**
    <details>
      <summary>user_env content (Click Here)</summary>

    ```
    ACCESS_TOKEN_EXPIRY=1
    ACCESS_TOKEN_SECRET=asadsd8as7df9as8df987asdf
    ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE=test
    ADMIN_SECRET_CODE=a98sd76fasdfasd
    API_DOC_URL=/user/api-doc
    APPLICATION_ENV=development
    APPLICATION_HOST=user
    APPLICATION_PORT=3001
    APP_NAME=MentorED
    AZURE_ACCOUNT_KEY=asd897gfa09sd87f09as8d
    AZURE_ACCOUNT_NAME=mentoring
    AWS_ACCESS_KEY_ID=adsfg98a7sdfg
    AWS_BUCKET_ENDPOINT=s3.ap-south-1.amazonaws.com
    AWS_BUCKET_REGION=ap-south-1
    AWS_SECRET_ACCESS_KEY=asd9786fg9a8sd/asdfg9a8sd7fg
    CLEAR_INTERNAL_CACHE=userinternal
    CLOUD_STORAGE=AWS
    DEFAULT_AWS_BUCKET_NAME=mentoring-dev-storage
    DEFAULT_AZURE_CONTAINER_NAME=mentoring-images
    DEFAULT_GCP_BUCKET_NAME=mentoring-dev-storage
    DEFAULT_OCI_BUCKET_NAME=dev-mentoring
    DEFAULT_ORGANISATION_CODE=default_code
    DEFAULT_ORG_ID=1
    DEFAULT_ROLE=mentee
    DEFAULT_QUEUE=test
    DEV_DATABASE_URL=postgres://postgres:postgres@localhost:5432/elevate-user
    DISABLE_LOG=false
    ENABLE_EMAIL_OTP_VERIFICATION=false
    ENABLE_LOG=true
    ERROR_LOG_LEVEL=silly
    GCP_PATH=gcp.json
    GCP_PROJECT_ID=sl-dev-project
    INTERNAL_ACCESS_TOKEN=internal_access_token
    INTERNAL_CACHE_EXP_TIME=86400
    INVITEE_EMAIL_TEMPLATE_CODE=test
    IV=09sdf8g098sdf/Q==
    KAFKA_GROUP_ID=mentoring
    KAFKA_TOPIC=
    KAFKA_URL=kafka:9092
    KEY=fasd98fg9a8sydg98a7usd89fg
    MENTEE_INVITATION_EMAIL_TEMPLATE_CODE=test
    MENTOR_INVITATION_EMAIL_TEMPLATE_CODE=test
    MENTOR_REQUEST_ACCEPTED_EMAIL_TEMPLATE_CODE=mentor_request_accepted
    MENTOR_REQUEST_REJECTED_EMAIL_TEMPLATE_CODE=mentor_request_rejected
    MENTORING_SERVICE_URL=http://mentoring:3000
    NOTIFICATION_KAFKA_TOPIC=dev.notifications
    OCI_ACCESS_KEY_ID=asdgf6a0s98d76g9a8sasdasd7df987as98df
    OCI_BUCKET_ENDPOINT=https://as98d7asdasdf.compat.objectstorage.ap-hyderabad-1.oraclecloud.com
    OCI_BUCKET_REGION=ap-hyderabad-1
    OCI_SECRET_ACCESS_KEY=as09d7f8/as0d7f09as7d8f=
    OTP_EMAIL_TEMPLATE_CODE=emailotp
    OTP_EXP_TIME=86400
    PORTAL_URL=https://mentored.some.org/auth/login
    REFRESH_TOKEN_EXPIRY=183
    REFRESH_TOKEN_SECRET=as9d87fa9s87df98as7d9f87a9sd87f98as7dg987asf
    REFRESH_VIEW_INTERVAL=540000
    REDIS_HOST=redis://redis:6379
    REGISTRATION_EMAIL_TEMPLATE_CODE=registration
    REGISTRATION_OTP_EMAIL_TEMPLATE_CODE=registrationotp
    SAMPLE_CSV_FILE_PATH=sample/bulk_user_creation.csv
    SCHEDULER_SERVICE_BASE_URL= /scheduler/
    SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID=rakesh.k@some.com
    SCHEDULER_SERVICE_HOST=http://scheduler:4000
    SCHEDULER_SERVICE_URL=http://scheduler:4000/jobs/scheduleJob
    ```

    </details>

    For Elevate User Repository, **[Click Here](https://github.com/ELEVATE-Project/user)**.

-   File name: **notification_env**
    <details>
      <summary>notification_env content</summary>

    ```
    API_DOC_URL=/api-doc
    APPLICATION_BASE_URL=/notification/
    APPLICATION_ENV=development
    APPLICATION_PORT=3002
    DEV_DATABASE_URL=postgres://postgres:postgres@localhost:5432/elevate-notification
    DISABLE_LOG=false
    ENABLE_LOG=true
    ERROR_LOG_LEVEL=silly
    INTERNAL_ACCESS_TOKEN=internal_access_token
    KAFKA_GROUP_ID=notification
    KAFKA_HOST=kafka:9092
    KAFKA_TOPIC=develop.notifications
    SENDGRID_API_KEY=SG.asd9f87a9s8d7f.
    SENDGRID_FROM_MAIL=no-reply@some.org
    ```

    </details>

    For Elevate Notification Repository, **[Click Here](https://github.com/ELEVATE-Project/notification)**.

-   File name: **scheduler_env**
    <details>
      <summary>scheduler_env content</summary>

    ```
    API_DOC_URL=/api-doc
    APPLICATION_BASE_URL=/scheduler/
    APPLICATION_ENV=development
    APPLICATION_PORT=4000
    DEFAULT_QUEUE=email
    DISABLE_LOG=false
    ENABLE_LOG=true
    ERROR_LOG_LEVEL=silly
    KAFKA_URL=kafka:9092
    NOTIFICATION_KAFKA_TOPIC=develop.notifications
    REDIS_HOST=redis
    REDIS_PORT=6379
    ```

    </details>

    For Elevate Scheduler Repository, **[Click Here](https://github.com/ELEVATE-Project/scheduler)**.

-   File name: **interface_env**
    <details>
      <summary>interface_env content</summary>

    ```
    API_DOC_URL=http://localhost:3569/apidoc
    APPLICATION_ENV=development
    APPLICATION_PORT=3569
    INSTALLED_PACKAGES=elevate-user elevate-mentoring elevate-scheduler
    MENTORING_SERVICE_BASE_URL=http://mentoring:3000
    NOTIFICATION_SERVICE_BASE_URL=http://notification:3002
    REQUIRED_PACKAGES=elevate-user@1.1.30 elevate-mentoring@1.1.23 elevate-scheduler@1.0.4
    SCHEDULER_SERVICE_BASE_URL=http://scheduler:4000
    SUPPORTED_HTTP_TYPES=GET POST PUT PATCH DELETE
    USER_SERVICE_BASE_URL=http://user:3001

    ```

    </details>

    For Elevate Scheduler Repository, **[Click Here](https://github.com/ELEVATE-Project/interface-service)**.

### Create an environment file for the Interface service by following these steps:

1. Navigate to the elevate/backend directory:

cd elevate/backend

2. Create a new file named `environment.ts`

3. Copy and paste the following environment variables into the `environment.ts` file:

```typescript
export const environment = {
	production: true,

	name: 'debug environment',

	staging: false,

	dev: false,

	baseUrl: 'http://localhost:3569',

	sqliteDBName: 'mentoring.db',

	deepLinkUrl: 'https://mentored.shikshalokam.org',

	privacyPolicyUrl: 'https://shikshalokam.org/mentoring/privacy-policy',

	termsOfServiceUrl: 'https://shikshalokam.org/mentoring/term-of-use',
}
```

4. Update Docker Compose Configuration

Open the `docker-compose-mentoring.yml` file and update the path of the `environment.ts` file under the portal docker image (refer to Line 160). Change `/home/priyanka/workspace/docker/environment.ts` to your exact path to the `environment.ts` file.

### To update all services with the latest image, follow these steps **(Optional)**:

Check the latest image in the Shikshalokam [Docker hub](https://hub.docker.com/r/shikshalokamqa/elevate-user/tags) repository. Note that the master branch typically has the latest published image.

## Run Docker Compose for Backend Services

1. Navigate to the elevate/backend directory:

```

cd elevate/backend

```

2. Determine the exact location where the environment variables are stored by running the following command:

```

pwd

```

3. Modify the file path before executing the command

-   **Ubuntu/Linux/Mac:**

Replace `<exact_path_to_environment_files>` with the actual path you obtained.

```typescript

notification_env="<exact_path_to_environment_files>/notification_env" \

scheduler_env="<exact_path_to_environment_files>/scheduler_env" \

mentoring_env="<exact_path_to_environment_files>/mentoring_env" \

users_env="<exact_path_to_environment_files>/user_env" \

interface_env="<exact_path_to_environment_files>/interface_env" \

docker-compose -f  docker-compose-mentoring.yml  up

```

-   **Windows:**

Use the exact location where the environment variables are stored before executing the command

```typescript

$env:users_env = ".\user_env.txt";

$env:interface_env = ".\interface_env.txt";

$env:scheduler_env ="./scheduler_env.txt";

$env:notification_env ="./notification_env.txt";

$env:mentoring_env ="./mentoring_env.txt" ;

docker-compose -f  docker-compose-mentoring.yml  up

```

During the Docker run, the database, migration seeder files, and the script to establish the default organization will also execute automatically.

### Enable Citus Extension

### To enable the Citus extension for mentoring and user services, follow these steps:

1. Open a new terminal tab or window.

2. Navigate to the elevate/backend directory:

```

cd /elevate/backend

```

3. Run the following command to enable the Citus extension for the user service:

```

./setup.sh postgres://postgres:postgres@localhost:5432/elevate-user

```

4. Run the following command to enable the Citus extension for the mentoring service:

```

./setup.sh postgres://postgres:postgres@localhost:5432/elevate-mentoring

```

## Stop Docker Containers

To stop the Docker containers, execute the following commands:

**Ubuntu/Linux/Mac:**

notification_env="<exact_path_to_environment_files>/notification_env" \

scheduler_env="<exact_path_to_environment_files>/scheduler_env" \

mentoring_env="<exact_path_to_environment_files>/mentoring_env" \

users_env="<exact_path_to_environment_files>/user_env" \

interface_env="<exact_path_to_environment_files>/interface_env" \

docker-compose -f docker-compose-mentoring.yml down

**Windows:**

$env:users_env = ".\user_env.txt";

$env:interface_env = ".\interface_env.txt";

$env:scheduler_env ="./scheduler_env.txt";

$env:notification_env ="./notification_env.txt";

$env:mentoring_env ="./mentoring_env.txt" ; docker-compose -f docker-compose-mentoring.yml down

## View Running Containers

To view the running containers, use the command:

```

docker container ls

```

Login to the container:

```

docker exec -it ${container_id} bash

```

## Persist Database Data

**To persist the database data when bringing down the Docker containers, follow these steps to adjust the `docker-compose-mentoring.yml` file:**

Define a volume for each service in the volumes section of the `docker-compose-mentoring.yml` file. Adjust the path `/path/to/postgres/data` to your desired host machine path where you want to store the data. For example:

```yaml

services:

user:

volumes:

- user_postgres_data:/path/to/postgres/data

mentoring:

volumes:

- mentoring_postgres_data:/path/to/postgres/data

notification:

volumes:

- notification_postgres_data:/path/to/postgres/data

```

List each volume separately under the volumes section:

```yaml
volumes:

user_postgres_data:

mentoring_postgres_data:

notification_postgres_data:
```

With this setup, when you run `docker-compose down`, the data will be stored in the volumes, and it will persist even if you bring the containers down and then back up again using `docker-compose up`.

Make sure to replace `user` and `notification` with the actual service names from your `docker-compose-mentoring.yml` file. Adjust the volume names and paths according to your requirements.
