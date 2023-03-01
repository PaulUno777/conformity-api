pipeline {
  agent any
  stages {
    stage('Checkout Code') {
      steps {
        git(url: 'https://github.com/PaulUno777/conformity-api.git', branch: 'master')
      }
    }

    stage('list repository contain') {
      steps {
        sh 'ls -la'
      }
    }

  }
}