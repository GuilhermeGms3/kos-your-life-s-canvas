# Plano de Implementacao

Este plano transforma a Fase 1 em passos pequenos e executaveis.

## Marco transversal: Cofre, Midia e Academia

Estado inicial:

- Rota `/vault` com upload multiplo e persistencia IndexedDB.
- Organizacao por pilar, colecao, tags e descricao.
- Visualizacao local de imagem, video, audio e PDF.
- Rota `/study/media` com retomada de video e anotacoes temporais.
- Linha de anotacoes clicavel que funciona como sumario autoral.
- Rota `/legacy/academy` com modos Aprender e Lecionar.
- Grafo de progressao com pre-requisitos e desbloqueios.
- Recompensas da Academia vinculadas a arquivos do Cofre.
- Atlas da Academia com 26 disciplinas e mais de 300 nucleos interligados.
- Navegacao persistente entre Inicio, Estudo, Cofre, Video e Academia.

Proximos passos:

- Relacionar arquivos diretamente a livros, notas e conceitos.
- Fichamentos de PDF e ebook.
- Edicao autoral das trilhas da Academia.
- Perfis locais separados para estudantes.
- Migracao do Cofre para armazenamento duravel.

## Marco transversal: fundacao dos seis pilares

Objetivo:

Fazer os pilares deixarem de ser apenas apresentacoes visuais sem disputar
prioridade com o Study Core.

Status inicial:

- Salas navegaveis para Experience, Creation, Memory, Discovery e Legacy.
- Navegacao direta entre os seis pilares.
- Selecao de dominio por foco.
- Captura persistida no navegador em todos os pilares.
- Registros com titulo, conteudo, tags, tipo, dominio, estado e datas.
- Acervo recente filtrado pelo dominio ativo.
- Atalho de teclado `N` para abrir a captura e `Esc` para fecha-la.

Proximos passos transversais:

- Edicao, arquivamento e exclusao recuperavel de registros.
- Busca entre pilares.
- Relacoes manuais entre registros.
- Exportacao em formato aberto.
- Migracao da persistencia local para repositorio local duravel.

Referencia:

- Consultar `docs/PILLARS.md` para a evolucao especifica de cada pilar.

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

Status:

- Cadastro manual expandido com autores, categorias, status, formato, posse,
  localizacao e observacoes.
- Edicao persistida de livros.
- Associacao e remocao de notas vinculadas ao livro.
- Ponte de estado com Calibre-Web dentro da Library Orbit.
- Infraestrutura Docker opcional em `infra/calibre-web`.

Proximo passo:

- Importar metadados selecionados pelo catalogo OPDS sem duplicar os arquivos no
  KOS.

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
3. Dar captura basica aos seis pilares.
4. Implementar notas.
5. Implementar livros.
6. Implementar fichamentos.
7. Implementar perguntas rapidas.
8. Implementar conceitos.
9. Criar tela integrada de sessao de estudo.
10. Criar busca e relacoes transversais.

## Cuidado importante

O KOS deve continuar bonito, mas cada marco deve adicionar uma capacidade real.
Se a interface ficar linda e nao salvar nada, a Fase 1 ainda nao cumpriu sua
missao.
