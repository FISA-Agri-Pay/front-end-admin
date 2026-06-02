pipeline {
    // 아무 Jenkins 에이전트(노드)에서나 이 파이프라인을 실행
    agent any

    environment {
        // S3 버킷 이름
        S3_BUCKET = "kkpp-admin-s3-bucket"
    }

    stages {
        // 1. 소스 코드 가져오기 단계
        stage('Checkout') {
            steps {
                // Jenkins 설정(Pipeline script from SCM)에 입력한 
                // GitHub 정보를 바탕으로 코드를 체크아웃합니다.
                checkout scm
            }
        }

        // 2. 패키지 설치 단계
        stage('Install Dependencies') {
            steps {
                // 프로젝트 구동에 필요한 npm 패키지들을 설치합니다.
                sh 'npm install'
            }
        }

        // 3. 빌드 단계
        stage('Build') {
            steps {
                // React 애플리케이션을 빌드하여 build/ 폴더에 정적 파일을 생성합니다.
                sh 'npm run build'
            }
        }

        // 4. AWS S3 배포 단계
        stage('Deploy to S3') {
            steps {
                // 1단계에서 생성한 AWS 자격 증명(ID: aws-s3-deploy-key)을 불러와 환경 변수로 주입
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding', 
                    credentialsId: 'aws-s3-frontend-deploy', 
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    // aws s3 sync 명령어로 빌드된 결과물을 S3 버킷과 동기화합니다.
                    // --delete 옵션은 원본(로컬)에 없는 파일이 S3에 존재하면 삭제하여 
                    // 항상 최신 빌드 상태와 똑같이 유지하도록 만듭니다.
                    sh 'aws s3 sync build/ s3://${S3_BUCKET} --delete'
                }
            }
        }
    }
    
    // 파이프라인 실행 완료 후 결과 처리
    post {
        success {
            echo "[성공] S3 배포가 성공적으로 완료되었습니다"
        }
        failure {
            echo "[실패] 파이프라인 실행 중 오류가 발생했습니다. 로그를 확인해 주세요."
        }
    }
}