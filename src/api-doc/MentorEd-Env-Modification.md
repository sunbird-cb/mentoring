# MentorEd Environment Variable Modification Guide

## Overview

The existing MentorEd documentation and setup guides include a set of environment files with default environment variables. These serve as an excellent starting point for any deployment and offer a fully operational MentorEd application for you to explore. However, as expected, certain features may be impaired without replacing the default environment variables with adopter-specific values. For example, variables related to notification email services and cloud file upload.

This document acts as a reference for such features and their related environment variables.

## Affected Features

1. **User SignUp**
   Since an email with an OTP code is sent to verify the email ID provided during the signup process, the notification service environment variables must be configured with real values sourced from an email service. Currently, MentorEd's notification service natively supports Sendgrid as the default email service. Therefore, the following environment variables must be set for this feature to function properly.

    ### Notification Service

    **Docker Setup:** `notification_env`

    **Manual Setup:** `notification/src/.env`

    **Variables:**

    ```
    SENDGRID_API_KEY
    SENDGRID_FROM_EMAIL
    ```

    ### Relevant Resources

    1. [Twilio SendGrid](https://sendgrid.com/en-us)
