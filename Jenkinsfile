pipeline {
    agent any

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
                sh 'npm run build'
            }
        }

        stage('Deploy to S3') {
            steps {
                sh 'aws s3 sync build/ s3://$ADMIN_FRONTEND_S3_BUCKET --delete'
            }
        }
    }
}
