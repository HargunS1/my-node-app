pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "myapp/node-app"
        EC2_DEV_HOST = 'ubuntu@52.25.111.94'
        EC2_STAGING_HOST = 'ubuntu@50.112.122.55'
        EC2_PROD_HOST = 'ubuntu@52.34.200.151'
        AWS_KEY = credentials('aws-ec2-key') // Jenkins credential for SSH
        PROMETHEUS_CONFIG = "/opt/prometheus/prometheus.yml" // Path to Prometheus config file
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

        stage('Setup Monitoring Tools') {
            steps {
                script {
                    sshagent(['aws-ec2-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no $EC2_DEV_HOST '
                            docker run -d --name=prometheus -p 9090:9090 -v /opt/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus &&
                            docker run -d --name=grafana -p 3000:3000 grafana/grafana
                        '
                        """
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
                        ssh -o StrictHostKeyChecking=no $EC2_DEV_HOST 'docker pull hargun1955991532/node-app:dev-${BUILD_NUMBER} && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 4000:3001 --name nodeapp hargun1955991532/node-app:dev-${BUILD_NUMBER}'
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
                        ssh -o StrictHostKeyChecking=no $EC2_STAGING_HOST 'docker pull hargun1955991532/node-app:staging-${BUILD_NUMBER} && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 4000:3001 --name nodeapp hargun1955991532/node-app:staging-${BUILD_NUMBER}'
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
                        ssh -o StrictHostKeyChecking=no $EC2_PROD_HOST 'docker pull hargun1955991532/node-app:main-${BUILD_NUMBER} && docker stop nodeapp || true && docker rm nodeapp || true && docker run -d -p 4000:3001 --name nodeapp hargun1955991532/node-app:main-${BUILD_NUMBER}'
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
