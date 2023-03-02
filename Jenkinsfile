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

        stage('Create dotenv file') {
          steps {
            sh '''touch .env;



'''
          }
        }

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
      }
    }

    stage('log2') {
      steps {
        sh 'cat ./.env;'
      }
    }

    stage('Start app') {
      steps {
        sh '''yarn;
yarn build;
yarn install --frozen-lockfile --production && yarn cache clean;
start:prod;
'''
      }
    }

  }
}