#  **DOCUMENTAÇÃO DO PI — SmartProd**

---

# **1. Introdução**

O **SmartProd** é um sistema de gestão de estoque desenvolvido para pequenas e médias empresas que enfrentam dificuldades em controlar produtos, matérias-primas, ordens de produção, notas fiscais e movimentações. Durante a pesquisa com usuários, foram identificados problemas como **falta de organização**, **erros manuais**, **rupturas de estoque** e **baixa visibilidade do processo produtivo**.

### **Justificativa**

Empresas de menor porte raramente dispõem de sistemas eficientes e acessíveis. Muitas ainda dependem de planilhas ou controles manuais, resultando em falhas que impactam diretamente no processo produtivo.
O SmartProd surge para oferecer **uma solução simples, intuitiva e eficiente**, permitindo maior controle e tomada de decisão baseada em dados.

---

# **Objetivos**

### **Objetivo Geral**

Desenvolver um sistema integrado de controle de estoque e produção, auxiliando empresas na gestão de produtos, matérias-primas, OPs e notas fiscais.

### **Objetivos Específicos**

* Proporcionar controle detalhado de entradas e saídas.
* Automatizar fluxos de produção (OPs).
* Permitir importação de XML de NF-e.
* Gerar relatórios e indicadores.
* Facilitar navegação com interface simples e responsiva.

---

# **Metodologia**

O projeto foi desenvolvido utilizando:

* **Metodologia incremental**
* **Modelagem UML** (casos de uso, classes, banco)
* **Protótipo em Figma**
* **Tecnologias: React, TailwindCSS, TypeScript, Node.js, Prisma ORM, MySQL**
* **DevOps:** Docker, Kubernetes e GitHub Actions
* **Ferramentas:** Draw.io, Lucidchart, GitHub, VSCode

---

# **2. Requisitos**

## **Requisitos Funcionais**

* RF01 – Realizar login e autenticação.
* RF02 – Cadastrar produtos, matérias-primas e produtos acabados.
* RF03 – Registrar entradas e saídas de estoque.
* RF04 – Importar XML de notas fiscais.
* RF05 – Criar e gerenciar ordens de produção.
* RF06 – Gerar relatórios de estoque, produção e consumo.
* RF07 – Exibir dashboard com indicadores.

---

## **Requisitos Não Funcionais**

### **Requisitos de Produto**

* RNF01 – Interface responsiva e intuitiva.
* RNF02 – Sistema deve manter dados íntegros e consistentes.

### **Requisitos de Organização**

* RNF03 – Uso de versionamento Git e GitHub.

### **Requisitos de Confiabilidade**

* RNF04 – Banco de dados deve possuir persistência garantida.
* RNF05 – Deve suportar múltiplos usuários simultâneos.

### **Requisitos de Implementação**

* RNF06 – Backend em Node.js; Frontend em React.
* RNF07 – Armazenamento em MySQL.

### **Requisitos de Padrões**

* RNF08 – Uso de REST API.
* RNF09 – Projeto com arquitetura limpa e modular.

### **Requisitos de Interoperabilidade**

* RNF10 – Sistema deve aceitar importação XML (NF-e).

---

# **3. Modelo de Casos de Uso**


---<img width="656" height="1333" alt="diagrama_de_casos_de_uso" src="https://github.com/user-attachments/assets/65814c48-726d-4fa1-9c57-5790b3f5c293" />


# **4. Modelo do Banco de Dados**

![tabelas_db](https://github.com/user-attachments/assets/573947e2-2a1c-4c4f-82d5-4b6ad3edd590)


---

# **5. Banco de Dados**

* MySQL
* Prisma ORM
* Migrações versionadas
* Tabelas principais: usuários, produtos, matérias-primas, estoque, OPs, NF, logs

---

# **6. Diagrama de Classes**

<img width="648" height="483" alt="diagrama_de_classes_4sem2" src="https://github.com/user-attachments/assets/9ee0afaa-5fa4-4540-b986-2b4d657f5d79" />

Classes principais: Usuário, Produto, MateriaPrima, OrdemProducao, NotaFiscal, Movimentação.

---

# **7. Estudo de Viabilidade**

* **Técnica:** Tecnologias amplamente usadas, com ampla documentação.
* **Operacional:** Sistema intuitivo, baixo custo de treinamento.
* **Econômica:** Ferramentas gratuitas; custo zero de licenciamento.
* **Cronograma:** Desenvolvimento incremental ao longo do semestre.

---

# **8. Regras de Negócio (Canvas)**

<img width="2000" height="1414" alt="canvas_atualizado" src="https://github.com/user-attachments/assets/f2c18422-92b1-4984-940d-1ddc7cac7050" />

---

# **9. Design**

### **Paleta de Cores**

* Laranja
* Cinza escuro 
* Branco

<img width="1080" height="1350" alt="estudo-de_cores_fundo_branco" src="https://github.com/user-attachments/assets/99755751-4c35-4d06-9242-efbd7b4d4788" />

### **Tipografia**

* Poppins

### **Logo**

<img width="1080" height="1080" alt="logo_smartProd" src="https://github.com/user-attachments/assets/fa229a17-5e22-4316-ae3d-57a5d97ff94d" />

### **Wireframes / Modelo de Navegação**

<img width="1085" height="783" alt="felipe_regiani_1905" src="https://github.com/user-attachments/assets/f4c9487c-1998-461d-8a53-b0ddfa1fffc2" />

---

# **10. Protótipo**

Protótipo funcional desenvolvido no **Figma**:

*[https://www.figma.com/make/fAynNXQw8yWdteser0Kd7c/Sistema-de-Gest%C3%A3o-de-Estoque?node-id=0-1&p=f&fullscreen=1](https://www.figma.com/make/fAynNXQw8yWdteser0Kd7c/Sistema-de-Gest%C3%A3o-de-Estoque?node-id=0-1&p=f&fullscreen=1)*

---

# **11. Aplicação**

### **Repositório GitHub**

🔗 [https://github.com/Smart-Prod](https://github.com/Smart-Prod)

### **Tecnologias Utilizadas**

* React
* TailwindCSS
* TypeScript
* Node.js
* Prisma ORM
* MySQL
* Docker
* Kubernetes
* GitHub Actions

### **Demonstração**

* Interface principal
* Estrutura do código
* Execução via Docker
* Deploy com Kubernetes

---

