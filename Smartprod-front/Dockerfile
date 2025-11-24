# Usando Node 18 como base
FROM node:18 AS build

# Diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código
COPY . .

# Build da aplicação (gera a pasta dist)
RUN npm run build

# Serve a aplicação usando nginx
FROM nginx:alpine

# Copia build para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe porta 80 (definida no service)
EXPOSE 80

# Comando padrão do nginx
CMD ["nginx", "-g", "daemon off;"]
