pipeline {
  agent any
  stages {
    stage('Checkout Code') {
      steps {
        git(url: 'https://github.com/PaulUno777/conformity-api.git', branch: 'master')
      }
    }

    stage('Log projet contain') {
      steps {
        sh '''touch .env;
ls -la'''
      }
    }

    stage('Add env variables') {
      environment {
        DATABASE_URL = '\'mongodb+srv://sanctionsexplorer:Sancti0nsP4ss@cluster0.nq3ns.gcp.mongodb.net/sanctionsexplorer?retryWrites=true&w=majority\''
        MYSQL_URL = '{"host": "localhost", "user": "root", "database": "sanction_explorer", "password": "Admin123"}'
        PER_PAGE = '20'
        PORT = '3000'
        TIME_ZONE = '1'
        FILE_LOCATION = '\'./public/\''
        DOWNLOAD_URL = 'http://sandbox.kamix.io:3000'
      }
      steps {
        sh '''echo DATABASE_URL=${DATABASE_URL} >> .env;
echo MYSQL_URL=${MYSQL_URL} >> .env;
echo PER_PAGE=${PER_PAGE} >> .env;
echo PORT=${PORT} >> .env;
echo TIME_ZONE=${TIME_ZONE} >> .env;
echo FILE_LOCATION=${FILE_LOCATION} >> .env;
echo DOWNLOAD_URL=${DOWNLOAD_URL} >> .env;'''
        sh 'cat .env'
      }
    }

    stage('Build app') {
      parallel {
        stage('Build app') {
          steps {
            sh 'docker build -t unoteck/kamix-sanction-service .'
          }
        }

        stage('Log into Dockerhub') {
          environment {
            DOCKER_USER = 'unoteck'
            DOCKER_PASSWORD = 'David.lock#2023'
          }
          steps {
            sh 'docker login -u $DOCKER_USER -p $DOCKER_PASSWORD'
          }
        }

      }
    }

    stage('Deploy app') {
      steps {
        sh 'docker push unoteck/kamix-sanction-service:latest'
      }
    }

    stage('start app') {
      steps {
        sh 'docker rm --force --volumes kamix-sanction-service'
        sh '''docker run \\
  -p 3000:3000 5900:3000\\
  --name kamix-sanction-service \\
  --env-file .env\\
  unoteck/kamix-sanction-service:latest'''
      }
    }

  }
}