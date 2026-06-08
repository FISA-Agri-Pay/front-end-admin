pipeline {
    agent any

    tools {
        nodejs 'frontend-admin-nodejs'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Environment') {
            steps {
                sh '''
                    test -n "$REACT_APP_ADMIN_API_BASE_URL" || (echo "REACT_APP_ADMIN_API_BASE_URL is required." && exit 1)
                    test -n "$ADMIN_FRONTEND_S3_BUCKET" || (echo "ADMIN_FRONTEND_S3_BUCKET is required." && exit 1)
                    test -n "$ADMIN_FRONTEND_S3_PREFIX" || (echo "ADMIN_FRONTEND_S3_PREFIX is required." && exit 1)
                    test -n "$AWS_CREDENTIALS_ID" || (echo "AWS_CREDENTIALS_ID is required." && exit 1)
                    test -n "$AWS_DEFAULT_REGION" || (echo "AWS_DEFAULT_REGION is required." && exit 1)

                    DEPLOY_PREFIX="${ADMIN_FRONTEND_S3_PREFIX%/}"
                    test -n "$DEPLOY_PREFIX" || (echo "ADMIN_FRONTEND_S3_PREFIX must not point to the bucket root." && exit 1)

                    case "$DEPLOY_PREFIX" in
                        /*|"."|"..")
                            echo "ADMIN_FRONTEND_S3_PREFIX must be a non-root relative S3 prefix."
                            exit 1
                            ;;
                    esac
                '''
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh '''
                    DEPLOY_PREFIX="${ADMIN_FRONTEND_S3_PREFIX%/}"
                    PUBLIC_URL="/$DEPLOY_PREFIX" npm run build
                '''
            }
        }

        stage('Deploy to S3') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: env.AWS_CREDENTIALS_ID,
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh '''
                        DEPLOY_PREFIX="${ADMIN_FRONTEND_S3_PREFIX%/}"
                        aws s3 sync build/ "s3://$ADMIN_FRONTEND_S3_BUCKET/$DEPLOY_PREFIX/" --delete
                    '''
                }
            }
        }
    }
}
