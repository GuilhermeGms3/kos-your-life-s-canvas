# Plano de Implementacao

Este plano transforma a Fase 1 em passos pequenos e executaveis.

## Marco 0: Fundacao do KOS

Objetivo:

Criar a base conceitual e tecnica minima para o projeto deixar de ser apenas
uma tela mockada.

Tarefas:

- Registrar a visao, produto, arquitetura, modelo de dados e roadmap em
  documentos.
- Criar tipos de dominio para notas, livros, fichamentos, conceitos, sessoes de
  estudo e perguntas.
- Separar os pilares do KOS da camada visual.
- Criar dados-semente para o Study Core.
- Garantir que a home continue funcionando depois da separacao.

Resultado esperado:

O projeto passa a ter uma fundacao legivel para evoluir por anos, e o front
continua estavel.

## Marco 1: Reorganizar o front atual

Objetivo:

Preparar o codigo para virar produto sem perder a identidade visual atual.

Tarefas:

- Extrair dados mockados para arquivos proprios.
- Separar componentes da home em arquivos menores.
- Criar estrutura de modulos para estudo, biblioteca, notas e conceitos.
- Manter a home cosmica como entrada do KOS.
- Criar uma rota inicial para o Study Core.

Resultado esperado:

O front continua parecido, mas deixa de ser um unico arquivo grande.

Status inicial:

- Rota `/study` criada como primeiro Study Core.
- Persistencia local criada para notas, livros, conceitos e perguntas.
- Home ganhou atalho para o Study Core.
- Primeira direcao PS5-like aplicada com modos, trilho de foco, painel
  contextual e criacao por painel.
- Navegacao por foco adicionada com setas, atalhos discretos e trilho que segue
  o card ativo.
- Salas-semente criadas para iniciar Experience, Creation, Memory, Discovery e
  Legacy sem tirar foco do Study Core.

## Marco 2: Notas persistidas

Objetivo:

Permitir que o usuario escreva e recupere notas.

Status inicial:

- Criacao de notas persistidas no navegador.
- Edicao de titulo, conteudo e tags.
- Metadados de criacao e atualizacao exibidos no painel contextual.
- Selecao da nota editada preservada no trilho de foco.
- Salvamento local via camada `useKosLocalState`.

Primeira versao:

- Lista de notas.
- Criacao de nota.
- Edicao de titulo e conteudo.
- Salvamento local.
- Metadados basicos.

Persistencia inicial aceitavel:

- LocalStorage ou IndexedDB para prototipo.

Persistencia futura:

- SQLite ou backend local/self-hosted.
- Exportacao em Markdown.

## Marco 3: Catalogo de livros

Objetivo:

Criar o primeiro acervo persistido.

Primeira versao:

- Lista de livros.
- Cadastro manual.
- Status de leitura.
- Campo de observacoes.
- Associacao simples entre livro e notas.

## Marco 4: Fichamentos

Objetivo:

Transformar leitura em conhecimento revisavel.

Primeira versao:

- Ficha ligada a um livro.
- Resumo.
- Ideias principais.
- Citacoes.
- Reflexoes.

## Marco 5: Perguntas rapidas

Objetivo:

Gerar perguntas nao pre-prontas a partir do material salvo.

Primeira versao sem IA externa:

- Gerador baseado em templates inteligentes e conteudo da nota.
- Perguntas de revisao, compreensao e conexao.

Versao futura:

- Integrar IA local ou API configuravel.
- Usar contexto de notas, fichamentos e conceitos.

## Marco 6: Conceitos conectados

Objetivo:

Comecar o mapa mental do KOS.

Primeira versao:

- Criar conceito.
- Relacionar conceito a notas.
- Relacionar conceito a livros.
- Mostrar conceitos recentes e mais usados.

## Marco 7: Tela de estudo

Objetivo:

Criar uma experiencia de estudo real.

Primeira versao:

- Escolher alvo de estudo.
- Criar notas durante a sessao.
- Gerar perguntas.
- Registrar resumo final.
- Registrar proximos passos.

## Ordem recomendada

1. Reorganizar front.
2. Criar tipos e armazenamento local.
3. Implementar notas.
4. Implementar livros.
5. Implementar fichamentos.
6. Implementar perguntas rapidas.
7. Implementar conceitos.
8. Criar tela integrada de sessao de estudo.

## Cuidado importante

O KOS deve continuar bonito, mas cada marco deve adicionar uma capacidade real.
Se a interface ficar linda e nao salvar nada, a Fase 1 ainda nao cumpriu sua
missao.
