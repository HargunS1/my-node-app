pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "myapp/node-app"
        EC2_DEV_HOST = 'ubuntu@54.189.115.164' // Replace with your dev EC2 IP
        EC2_STAGING_HOST = 'ubuntu@44.243.184.139' // Replace with your staging EC2 IP
        EC2_PROD_HOST = 'ubuntu@54.212.142.105' // Replace with your production EC2 IP
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
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKER_HUB_PASS')]) {
                            sh """
                            ssh -o StrictHostKeyChecking=no $EC2_DEV_HOST 'echo "$DOCKER_HUB_PASS" | docker login -u "$DOCKER_HUB_USER" --password-stdin'
                            ssh -o StrictHostKeyChecking=no $EC2_DEV_HOST 'docker pull hargun1955991532/node-app:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3001 --name nodeapp hargun1955991532/node-app:$BUILD_NUMBER'
                            """
                        }
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
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKER_HUB_PASS')]) {
                            sh """
                            ssh -o StrictHostKeyChecking=no $EC2_STAGING_HOST 'echo "$DOCKER_HUB_PASS" | docker login -u "$DOCKER_HUB_USER" --password-stdin'
                            ssh -o StrictHostKeyChecking=no $EC2_STAGING_HOST 'docker pull hargun1955991532/node-app:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3001 --name nodeapp hargun1955991532/node-app:$BUILD_NUMBER'
                            """
                        }
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
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKER_HUB_PASS')]) {
                            sh """
                            ssh -o StrictHostKeyChecking=no $EC2_PROD_HOST 'echo "$DOCKER_HUB_PASS" | docker login -u "$DOCKER_HUB_USER" --password-stdin'
                            ssh -o StrictHostKeyChecking=no $EC2_PROD_HOST 'docker pull hargun1955991532/node-app:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3001 --name nodeapp hargun1955991532/node-app:$BUILD_NUMBER'
                            """
                        }
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
