pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "myapp/node-app"
        EC2_DEV_HOST = 'ubuntu@dev-ec2-public-ip' // Replace with your dev EC2 IP
        EC2_STAGING_HOST = 'ubuntu@staging-ec2-public-ip' // Replace with your staging EC2 IP
        EC2_PROD_HOST = 'ubuntu@prod-ec2-public-ip' // Replace with your production EC2 IP
        AWS_KEY = credentials('aws-ec2-key') // Jenkins credential for SSH
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: env.BRANCH_NAME, url: 'https://github.com/user/repo.git'
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

        // Optional: Push to a Docker Registry if needed
        // stage('Push Docker Image to Registry') {
        //     steps {
        //         script {
        //             docker.withRegistry('https://registry-url', 'docker-credentials-id') {
        //                 sh "docker push $DOCKER_IMAGE:$BUILD_NUMBER"
        //             }
        //         }
        //     }
        // }

        stage('Deploy to Development Environment') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    sshagent(['aws-ec2-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no $EC2_DEV_HOST 'docker pull $DOCKER_IMAGE:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3000 --name nodeapp $DOCKER_IMAGE:$BUILD_NUMBER'
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
                        ssh -o StrictHostKeyChecking=no $EC2_STAGING_HOST 'docker pull $DOCKER_IMAGE:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3000 --name nodeapp $DOCKER_IMAGE:$BUILD_NUMBER'
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
                        ssh -o StrictHostKeyChecking=no $EC2_PROD_HOST 'docker pull $DOCKER_IMAGE:$BUILD_NUMBER && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 3000:3000 --name nodeapp $DOCKER_IMAGE:$BUILD_NUMBER'
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

