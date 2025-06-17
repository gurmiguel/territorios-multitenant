## Territórios (Multitenant)

App para gerenciar territórios das congregações em formato multitenant.

### Como rodar

Inice rodando o comando `npm install` na pasta raiz.

Copie os arquivos `.env.example` dos apps (api e web) e popule-os com as variáveis de ambiente necessárias.

---

Em seguida, com o Docker executando na máquina, execute `npm run -w api db:run` (ou `npm run -w api db:start` nas próximas execuções) de forma a rodar o banco de dados postgres.

Por último, basta rodar o comando `npm run dev` na raiz, e o projeto iniciará a api e o frontend em paralelo.

Para executar as requisições de teste, utilize o arquivo em `apps/api/requests/api.http` e rode cada request utilizando a extensão [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) do vscode, ou outra ferramenta compatível.
