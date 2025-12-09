pipeline {
    agent { docker { image 'node:24.11.1-alpine3.23' } }
    stages {
        stage('build') {
            steps {
                sh 'node --version'
            }
        }
    }
}