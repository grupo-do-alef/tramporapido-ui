# TrampoRápido — Interface Web

Interface do TrampoRápido para cadastro, acesso, currículo, consulta de vagas e candidaturas.

## Contexto e papel no projeto

O TrampoRápido conecta profissionais a oportunidades de trabalho. O sistema é composto por três repositórios:

| Repositório | Responsabilidade |
| --- | --- |
| tramporapido-ui | Experiência web e comunicação com as APIs. |
| user-service | Cadastro, autenticação por JWT, dados dos usuários e currículos. |
| task-service | Vagas, candidaturas e dúvidas. |

Este repositório apresenta os fluxos aos candidatos e contratantes. A interface não acessa PostgreSQL diretamente: usa as APIs dos dois serviços, cada um com seu banco próprio.

## Tecnologias

Versões declaradas no package.json:

- Next.js ^16.4.3 com App Router.
- React e React DOM 19.3.0.
- TypeScript ^5.
- Tailwind CSS 4, PostCSS e CSS Modules.
- React Hook Form ^7.92.0.
- ESLint 9 e React Compiler.

O Dockerfile e a pipeline usam Node.js 22. A configuração do Next.js também habilita cacheComponents e partialPrefetching.

## Organização

- src/app: páginas e layout pelo App Router.
- src/components: cabeçalho e menu lateral compartilhados.
- src/lib/api.ts: cliente HTTP, tipos e funções de autenticação e acesso às APIs.
- src/lib/use-session.ts: leitura da sessão para comportamento da interface.
- public: arquivos estáticos.
- tramporapido.fig: referência visual local.

## Páginas e estado da integração

| Rota | Papel e comportamento atual |
| --- | --- |
| / | Página inicial com atalhos. |
| /register | Cadastro real pelo user-service. |
| /login | Login real pelo user-service. |
| /resume | Consulta e gravação de currículo pela API. |
| /jobs | Listagem de vagas pela API de tarefas. |
| /jobs/[id] | Detalhes da vaga, verificação do currículo e tentativa de candidatura. |
| /jobs/register | Formulário que envia POST /tasks e redireciona ao detalhe criado. |
| /jobs/[id]/duvidas | Perguntas demonstrativas; novas perguntas ficam apenas no estado React. |
| /applications | Interface de acompanhamento sem consulta à API; mudanças de status são locais. |
| /about | Informações sobre o projeto. |


O formulário envia título, descrição, cidade, bairro, status, modalidade, data de abertura e remuneração. 

## Fluxo entre os repositórios

~~~text
Navegador / Next.js
  ├─ cadastro, login e currículo → user-service → PostgreSQL de usuários
  └─ vagas e candidaturas       → task-service → PostgreSQL de tarefas
                                     └─ consulta identidade no user-service
~~~

1. O cadastro envia nome, e-mail, senha e papéis para POST /api/register.
2. O login usa POST /api/auth/login e recebe accessToken, nome, e-mail e papéis.
3. A interface guarda o token e os dados de exibição em cookies acessíveis por JavaScript.
4. O cliente HTTP acrescenta Authorization: Bearer nas chamadas protegidas e usa credentials: include.
5. Antes de candidatar-se, a página consulta o currículo; quando necessário, encaminha para /resume com retorno à vaga.
6. A candidatura envia o taskId para POST /applications; o backend deve obter a identidade do candidato pela autenticação.


## Limitações atuais
- O projeto contempla apenas 3 casos de uso que estabelecemos anteriormente em outra entrega, o que torna a navegação funcional incompleta.
- A interface depende do user-service para cadastro, login e currículo, e do task-service para vagas e candidaturas. Não acessa os bancos diretamente. Iniciar a interface não inicia os backends.
