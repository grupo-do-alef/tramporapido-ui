pipeline {
    agent any
    options { disableConcurrentBuilds() }

    parameters {
        string(name: 'SOURCE_REF', defaultValue: 'main', description: 'Branch a validar e publicar.')
        booleanParam(name: 'DEPLOY_TO_AWS', defaultValue: false, description: 'Cria/inicia a EC2 e publica a interface.')
    }

    environment {
        SOURCE_REF = "${params.SOURCE_REF}"
        AWS_DEFAULT_REGION = 'us-east-1'
        AWS_PAGER = ''
        AWS_PROFILE = 'lab'
        SOURCE_DIR = "${WORKSPACE}/source"
    }

    stages {
        stage('Obter código da main') {
            steps {
                sh '/workspace/jenkins/scripts/checkout-main.sh https://github.com/grupo-do-alef/tramporapido-ui.git "$SOURCE_DIR"'
            }
        }

        stage('Validar acesso AWS') {
            when { expression { params.DEPLOY_TO_AWS } }
            steps {
                sh 'aws sts get-caller-identity'
            }
        }

        stage('Instalar, verificar e montar') {
            steps {
                sh '''
                    docker run --rm --volumes-from "$HOSTNAME" -w "$WORKSPACE/source" \
                      node:22-bookworm-slim sh -c 'npm ci && npm run lint && npm run build'
                '''
            }
        }

        stage('Garantir EC2') {
            when { expression { params.DEPLOY_TO_AWS } }
            steps {
                sh '''
                    USER_PUBLIC_IP=$(/workspace/jenkins/scripts/service-ip.sh user-service public)
                    TASK_PUBLIC_IP=$(/workspace/jenkins/scripts/service-ip.sh task-service public)
                    test "$USER_PUBLIC_IP" != 'None'
                    test "$TASK_PUBLIC_IP" != 'None'
                    API_ENDPOINT=$(aws apigatewayv2 get-apis --query "Items[?Name=='tramporapido-api'].ApiEndpoint | [0]" --output text)
                    test -n "$API_ENDPOINT" && test "$API_ENDPOINT" != 'None'
                    /workspace/jenkins/scripts/ensure-ec2.sh tramporapido-ui > .ec2.env
                    printf 'USER_PUBLIC_IP=%s\nTASK_PUBLIC_IP=%s\n' "$USER_PUBLIC_IP" "$TASK_PUBLIC_IP" >> .ec2.env
                    printf 'API_ENDPOINT=%s\n' "$API_ENDPOINT" >> .ec2.env
                '''
            }
        }

        stage('Publicar e atualizar CORS') {
            when { expression { params.DEPLOY_TO_AWS } }
            steps {
                sshagent(credentials: ['ec2-deploy-key']) {
                    sh '''
                        . ./.ec2.env
                        UI_ORIGIN="http://${PUBLIC_IP}:3000"
                        cd "$WORKSPACE/source"
                        /workspace/jenkins/scripts/deploy-compose.sh \
                          tramporapido-ui "$PUBLIC_IP" \
                          "$API_ENDPOINT" "$API_ENDPOINT"
                        /workspace/jenkins/scripts/refresh-cors.sh user-service "$USER_PUBLIC_IP" "$UI_ORIGIN"
                        /workspace/jenkins/scripts/refresh-cors.sh task-service "$TASK_PUBLIC_IP" "$UI_ORIGIN"
                    '''
                }
            }
        }
    }
}
