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
      parallel {
        stage('Build') {
          steps {
            sh 'docker build -t unoteck/conformity-api:latest -f ./Dockerfile .'
          }
        }

        stage('Log Into Dockerhub') {
          environment {
            DOCKERHUB_USER = 'unoteck'
            DOCKERHUB_PASSWORD = 'David.lock#2023'
          }
          steps {
            sh 'docker login -u $DOCKERHUB_USER -p $DOCKERHUB_PASSWORD'
          }
        }

      }
    }

    stage('Push') {
      parallel {
        stage('Push') {
          steps {
            sh 'docker push unoteck/conformity-api:latest'
          }
        }

        stage('log') {
          steps {
            sh 'docker images'
          }
        }

      }
    }

    stage('Start App') {
      steps {
        sh 'docker run -d --restart=always -p 3000:3000 unoteck/conformity-api:latest'
      }
    }

  }
}