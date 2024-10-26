pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "myapp/node-app"
        EC2_DEV_HOST = 'ubuntu@34.219.82.237' // Replace with your dev EC2 IP
        EC2_STAGING_HOST = 'ubuntu@52.35.90.26' // Replace with your staging EC2 IP
        EC2_PROD_HOST = 'ubuntu@54.202.60.180' // Replace with your production EC2 IP
        AWS_KEY = credentials('aws-ec2-key') // Jenkins credential for SSH
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: env.BRANCH_NAME, url: 'https://github.com/HargunS1/my-node-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build and Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_IMAGE:$BUILD_NUMBER .'
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-creds') {
                        sh "docker tag $DOCKER_IMAGE:$BUILD_NUMBER hargun1955991532/node-app:$BUILD_NUMBER"
                        sh "docker push hargun1955991532/node-app:$BUILD_NUMBER"
                    }
                }
            }
        }

        stage('Deploy to Development Environment') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    sshagent(['aws-ec2-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no $EC2_DEV_HOST 'docker pull  hargun1955991532/$DOCKER_IMAGE:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3000 --name nodeapp mydockerhubusername/$DOCKER_IMAGE:$BUILD_NUMBER'
                        """
                    }
                }
            }
        }

        stage('Deploy to Staging Environment') {
            when {
                branch 'staging'
            }
            steps {
                script {
                    sshagent(['aws-ec2-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no $EC2_STAGING_HOST 'docker pull  hargun1955991532/$DOCKER_IMAGE:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3000 --name nodeapp mydockerhubusername/$DOCKER_IMAGE:$BUILD_NUMBER'
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
                        ssh -o StrictHostKeyChecking=no $EC2_PROD_HOST 'docker pull hargun1955991532/$DOCKER_IMAGE:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3000 --name nodeapp mydockerhubusername/$DOCKER_IMAGE:$BUILD_NUMBER'
                        """
                    }
                }
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

