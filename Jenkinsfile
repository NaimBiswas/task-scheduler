pipeline {
    agent any
    environment {
        REGISTRY = "naimbiswas"
        TAG = "${env.GIT_COMMIT}"
        DOCKER_CREDENTIALS = credentials('Jenkins-docker-cred')
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Login to Docker') {
            steps {
                sh """
                echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin
                """
            }
        }
        stage('Build Docker Images') {
            steps {
                // sh "docker build -t $REGISTRY/task-scheduler-backend:$TAG -f Dockerfile.backend ."
                sh "docker build -t $REGISTRY/task-scheduler-frontend:$TAG -f Dockerfile.frontend ."
            }
        }
        stage('Push Docker Images') {
            steps {
                sh "docker push $REGISTRY/task-scheduler-backend:$TAG"
                sh "docker push $REGISTRY/task-scheduler-frontend:$TAG"
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
               withCredentials([usernamePassword(credentialsId: 'Jenkins-docker-cred', usernameVariable: 'naimbiswas', passwordVariable: 'DOCKER_PASS')]) {
                    // sh "kubectl set image deployment/task-scheduler-backend backend=$REGISTRY/task-scheduler-backend:$TAG"
                    sh "kubectl set image deployment/task-scheduler-frontend frontend=$REGISTRY/task-scheduler-frontend:$TAG"
               }
            }
        }
    }
    post {
        success { echo 'Deployment done Successfully!' }
        failure { echo 'Deployment Failed!' }
    }
}
