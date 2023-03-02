pipeline {
  agent any
  stages {
    stage('Checkout Code') {
      steps {
        git(url: 'https://github.com/PaulUno777/conformity-api.git', branch: 'master')
      }
    }

    stage('log') {
      parallel {
        stage('log') {
          steps {
            sh 'ls -la'
          }
        }

        stage('') {
          steps {
            sh '''touch .env;

echo DATABASE_URL=${DATABASE_URL} >> .env;



'''
          }
        }

      }
    }

  }
}