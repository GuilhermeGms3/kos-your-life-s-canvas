# Fase 1: Study Core

## Objetivo

Construir o primeiro nucleo real do KOS: um ambiente pessoal para estudar,
salvar anotacoes, catalogar livros e gerar perguntas rapidas a partir do
material registrado.

Esta fase deve provar que o KOS e util antes de expandir para acervo completo,
homelab, automacoes, midias e integracoes externas.

## Escopo principal

### 1. Notas persistidas

O usuario deve conseguir:

- Criar uma nota.
- Editar uma nota.
- Salvar uma nota.
- Listar notas recentes.
- Associar notas a livros, temas ou conceitos.

### 2. Catalogo de livros

O usuario deve conseguir:

- Registrar um livro manualmente.
- Guardar titulo, autor, status, categoria e observacoes.
- Marcar se o livro esta para ler, lendo, pausado, concluido ou abandonado.
- Relacionar notas a um livro.

### 3. Fichamentos

O usuario deve conseguir:

- Criar uma ficha de leitura.
- Registrar resumo, ideias principais, citacoes e reflexoes.
- Associar conceitos importantes.

### 4. Perguntas rapidas

O sistema deve conseguir gerar perguntas nao pre-prontas, baseadas no material
registrado pelo usuario.

Tipos iniciais:

- Perguntas de revisao.
- Perguntas de compreensao.
- Perguntas de conexao entre conceitos.
- Perguntas filosoficas ou abertas quando o tema permitir.

### 5. Sessoes de estudo

O usuario deve conseguir:

- Iniciar uma sessao de estudo.
- Escolher um livro, nota ou tema.
- Registrar notas durante a sessao.
- Encerrar a sessao com resumo e proximos passos.

### 6. Conceitos

O usuario deve conseguir:

- Criar conceitos.
- Relacionar conceitos a notas e livros.
- Ver conceitos recentes ou mais conectados.

## Fora do escopo da Fase 1

Ficam para depois:

- Automacao residencial.
- NAS e Proxmox.
- Streaming de midia.
- Multiusuario.
- Sistema completo de tarefas.
- Importacao massiva de todos os arquivos pessoais.
- IA local complexa.
- Grafo visual avancado.

## Primeira interface funcional

A primeira tela funcional deve conter:

- Area de foco atual de estudo.
- Atalho para criar nota.
- Atalho para adicionar livro.
- Lista de notas recentes.
- Lista de livros em andamento.
- Botao para gerar perguntas rapidas.
- Entrada para busca simples.

Ela pode manter a sensacao cosmica/PS5, mas deve priorizar as acoes acima.

## Criterio de sucesso

A Fase 1 sera bem-sucedida quando o usuario conseguir usar o KOS por alguns dias
para estudar de verdade, sem precisar sair dele para registrar o basico.

