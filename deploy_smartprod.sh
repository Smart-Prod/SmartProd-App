#!/bin/bash
# Script completo para build, push Docker e deploy Kubernetes
# Atenção: ajuste SEU_USUARIO e TOKEN se usar 2FA

# ======== CONFIGURAÇÃO ========
DOCKER_USER="bressanvt"
DOCKER_API_IMAGE="smartprod-api"
DOCKER_FRONT_IMAGE="smartprod-front"
API_PATH="./SmartProd-Api"
FRONT_PATH="./Smartprod-front"
K8S_PATH="./k8s"
USE_2FA=false         # true se usar 2FA e precisar de token
TOKEN=""               # seu Personal Access Token se USE_2FA=true
# ============================

echo "=== LOGIN NO DOCKER HUB ==="
if [ "$USE_2FA" = true ]; then
    echo "$TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
else
    docker login
fi

echo "=== BUILD DAS IMAGENS ==="
docker build -t $DOCKER_USER/$DOCKER_API_IMAGE:latest $API_PATH
docker build -t $DOCKER_USER/$DOCKER_FRONT_IMAGE:latest $FRONT_PATH

echo "=== PUSH PARA DOCKER HUB ==="
docker push $DOCKER_USER/$DOCKER_API_IMAGE:latest
docker push $DOCKER_USER/$DOCKER_FRONT_IMAGE:latest

echo "=== APLICAR DEPLOYMENTS E SERVICES NO KUBERNETES ==="
kubectl apply -f $K8S_PATH/api-deployment.yml
kubectl apply -f $K8S_PATH/front-deployment.yml
kubectl apply -f $K8S_PATH/api-service.yml
kubectl apply -f $K8S_PATH/front-service.yml

echo "=== AGUARDANDO OS PODS SUBIREM ==="
kubectl wait --for=condition=ready pod -l app=smartprod-api --timeout=120s
kubectl wait --for=condition=ready pod -l app=smartprod-front --timeout=120s

echo "=== FRONT-END IP EXTERNO ==="
FRONT_IP=$(kubectl get svc smartprod-front-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ -z "$FRONT_IP" ]; then
    echo "Aguarde alguns minutos, o LoadBalancer ainda não provisionou o IP."
else
    echo "Acesse sua aplicação em: http://$FRONT_IP"
fi

echo "=== SCRIPT CONCLUÍDO ==="
