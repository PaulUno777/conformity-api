pipeline {
  agent any
  stages {
    stage('Checkout Code') {
      steps {
        git(url: 'https://github.com/PaulUno777/conformity-api.git', branch: 'master')
      }
    }

    stage('log') {
      steps {
        sh 'ls -la'
      }
    }

    stage('Build') {
      steps {
        sh 'docker build -f conformity-api/Dockerfile .'
      }
    }

  }
}