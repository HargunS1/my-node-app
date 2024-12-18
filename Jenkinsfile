pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "myapp/node-app"
        EC2_DEV_HOST = 'ubuntu@44.245.142.30'
        EC2_STAGING_HOST = 'ubuntu@52.32.203.19'
        EC2_PROD_HOST = 'ubuntu@52.25.111.94'
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
                    sh "docker build -t $DOCKER_IMAGE:${env.BRANCH_NAME}-${BUILD_NUMBER} ."
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-creds') {
                        sh "docker tag $DOCKER_IMAGE:${env.BRANCH_NAME}-${BUILD_NUMBER} hargun1955991532/node-app:${env.BRANCH_NAME}-${BUILD_NUMBER}"
                        sh "docker push hargun1955991532/node-app:${env.BRANCH_NAME}-${BUILD_NUMBER}"
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
                        ssh -o StrictHostKeyChecking=no $EC2_DEV_HOST '
                          docker pull hargun1955991532/node-app:dev-${BUILD_NUMBER} &&
                          docker stop nodeapp || true &&
                          docker rm nodeapp || true &&
                          docker run -d -p 4000:3001 --name nodeapp hargun1955991532/node-app:dev-${BUILD_NUMBER} &&
                          docker stop cadvisor || true &&
                          docker rm cadvisor || true &&
                          docker run -d --name=cadvisor -p 8081:8080 \
                            --volume=/:/rootfs:ro \
                            --volume=/var/run:/var/run:ro \
                            --volume=/sys:/sys:ro \
                            --volume=/var/lib/docker/:/var/lib/docker:ro \
                            gcr.io/cadvisor/cadvisor:latest
                        '
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
                        ssh -o StrictHostKeyChecking=no $EC2_STAGING_HOST '
                          docker pull hargun1955991532/node-app:staging-${BUILD_NUMBER} &&
                          docker stop nodeapp || true &&
                          docker rm nodeapp || true &&
                          docker run -d -p 4000:3001 --name nodeapp hargun1955991532/node-app:staging-${BUILD_NUMBER} &&
                          docker stop cadvisor || true &&
                          docker rm cadvisor || true &&
                          docker run -d --name=cadvisor -p 8081:8080 \
                            --volume=/:/rootfs:ro \
                            --volume=/var/run:/var/run:ro \
                            --volume=/sys:/sys:ro \
                            --volume=/var/lib/docker/:/var/lib/docker:ro \
                            gcr.io/cadvisor/cadvisor:latest
                        '
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
                        ssh -o StrictHostKeyChecking=no $EC2_PROD_HOST '
                          docker pull hargun1955991532/node-app:main-${BUILD_NUMBER} &&
                          docker stop nodeapp || true &&
                          docker rm nodeapp || true &&
                          docker run -d -p 4000:3001 --name nodeapp hargun1955991532/node-app:main-${BUILD_NUMBER} &&
                          docker stop cadvisor || true &&
                          docker rm cadvisor || true &&
                          docker run -d --name=cadvisor -p 8081:8080 \
                            --volume=/:/rootfs:ro \
                            --volume=/var/run:/var/run:ro \
                            --volume=/sys:/sys:ro \
                            --volume=/var/lib/docker/:/var/lib/docker:ro \
                            gcr.io/cadvisor/cadvisor:latest
                        '
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful, and monitoring tools are running!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
