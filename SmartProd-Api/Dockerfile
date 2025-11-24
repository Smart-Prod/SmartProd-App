FROM node:18

# Define diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Gera cliente do Prisma
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Define variáveis de ambiente
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
