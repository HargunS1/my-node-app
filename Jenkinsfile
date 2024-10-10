pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "myapp/node-app"
        NEXUS_REPO = "nexus-repo-url"
        AWS_KEY = credentials('aws-ec2-key') // Jenkins credential for SSH
        EC2_DEV_HOST = 'ec2-user@dev-ec2-public-ip'
        EC2_PROD_HOST = 'ec2-user@prod-ec2-public-ip'
        SONARQUBE_URL = "http://sonarqube-server"
        SONARQUBE_TOKEN = credentials('sonarqube-token')
    }

    options {
        skipDefaultCheckout true
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    // Check out the code based on the branch that triggered the build
                    git branch: env.BRANCH_NAME, url: 'https://github.com/your-username/my-node-app.git'
                }
            }
        }

        stage('Build & Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            when {
                not { branch 'main' } // Skip SonarQube analysis for production deployment
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner -Dsonar.projectKey=my-project -Dsonar.sources=. -Dsonar.host.url=$SONARQUBE_URL -Dsonar.login=$SONARQUBE_TOKEN'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:$BUILD_NUMBER .'
            }
        }

        stage('Push to Nexus') {
            steps {
                script {
                    docker.withRegistry('http://nexus-url', 'nexus-creds') {
                        sh "docker tag $DOCKER_IMAGE:$BUILD_NUMBER $NEXUS_REPO/$DOCKER_IMAGE:$BUILD_NUMBER"
                        sh "docker push $NEXUS_REPO/$DOCKER_IMAGE:$BUILD_NUMBER"
                    }
                }
            }
        }

        stage('Deploy to Development Environment') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sshagent(['aws-ec2-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no $EC2_DEV_HOST 'docker pull $NEXUS_REPO/$DOCKER_IMAGE:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3000 --name nodeapp $NEXUS_REPO/$DOCKER_IMAGE:$BUILD_NUMBER'
                        """
                    }
                }
            }
        }

        stage('Deploy to Production Environment') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sshagent(['aws-ec2-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no $EC2_PROD_HOST 'docker pull $NEXUS_REPO/$DOCKER_IMAGE:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3000 --name nodeapp $NEXUS_REPO/$DOCKER_IMAGE:$BUILD_NUMBER'
                        """
                    }
                }
            }
        }

        stage('Publish Test Reports') {
            steps {
                junit 'test-results/*.xml'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}

