pipeline{
    agent {
        label 'Jenkins_Agent' // Replace this with the label you created in the Node settings
    }

    environment{
        DOCKER_CREDS = credentials('docker-hub-creds')
        EC2_KEY = credentials('ec2-ssh-key')
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages{
        stage('Checkout'){
            steps{
                checkout scm
            }
        }

        stage('Build and push Docker Images'){
            steps{
                script{
                    sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
                    
                    //build and tag the backend images
                    def backendImage = docker.build("karanjoshi09/yatramitra-backend:${IMAGE_TAG}", "./backend")
                    backendImage.push()
                    backendImage.push("latest")

                    // Build and tag the Frontend image 
                    // ---> CHANGE THE URL HERE DEPENDING ON IF YOU ARE USING A DOMAIN OR JUST AN IP <---
                    def frontendImage = docker.build("karanjoshi09/yatramitra-frontend:${IMAGE_TAG}", "--build-arg NEXT_PUBLIC_API_URL=http://13.63.151.1:5000/api ./frontend")
                    frontendImage.push()
                    frontendImage.push("latest")
                }
            }
        }

        stage('Deploy to production'){
            steps{
                sshagent(['ec2-ssh-key']){
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@13.63.151.1 "mkdir -p /home/ubuntu/yatramitra"
                        scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@13.63.151.1:/home/ubuntu/yatramitra/docker-compose.yml
                        ssh -o StrictHostKeyChecking=no ubuntu@13.63.151.1 "cd /home/ubuntu/yatramitra && docker-compose down && docker-compose pull && docker-compose up -d"
                    '''
                }
            }
        }
    }
}
