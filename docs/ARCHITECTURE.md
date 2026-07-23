# Arquitetura

## Estado atual

O projeto atualmente e um front-end em React com TanStack Start, TanStack Router,
Tailwind CSS, Motion, Radix UI e Lucide.

Ainda nao ha banco de dados, backend de dominio, persistencia de notas,
autenticacao, indexacao ou integracao com arquivos reais.

## Direcao arquitetural

O KOS deve caminhar para uma arquitetura pessoal, local-first e self-hosted.

Objetivos:

- Dados sob controle do usuario.
- Possibilidade de rodar em maquina local no inicio.
- Possibilidade futura de rodar em homelab com NAS e Proxmox.
- Separacao clara entre UI, dominio, persistencia, indexacao e integracoes.
- Capacidade de importar e organizar arquivos sem prender tudo em um formato
  proprietario.

## Camadas sugeridas

### Interface

Responsavel por experiencia, navegacao, estudo, escrita e exploracao.

Stack atual:

- React
- TanStack Start
- TanStack Router
- Tailwind CSS
- Radix UI
- Motion
- Lucide

### Dominio

Responsavel por regras do KOS:

- Notas.
- Livros.
- Conceitos.
- Fichamentos.
- Perguntas.
- Sessoes de estudo.
- Relacoes entre entidades.

### Persistencia

Na Fase 1, a persistencia pode comecar simples.

Opcoes futuras:

- SQLite para dados estruturados.
- Arquivos Markdown para notas exportaveis.
- Pasta de biblioteca para PDFs/epubs.
- Banco vetorial local para busca semantica e perguntas.

### Indexacao

Responsavel por transformar conteudo em busca e relacoes:

- Texto de notas.
- Metadados de livros.
- Conceitos.
- Fichamentos.
- Futuramente PDFs, epubs, videos transcritos e paginas salvas.

### Integracoes

Futuramente o KOS pode conversar com:

- Calibre ou Calibre-Web.
- Logseq/Joplin/Obsidian-like notes.
- Home Assistant.
- Plane ou OpenProject.
- Servicos do NAS.
- Modelos locais de IA.

## Principios tecnicos

- Comecar pequeno e funcional.
- Evitar acoplamento prematuro com ferramentas externas.
- Salvar dados em formatos que possam ser exportados.
- Nao depender de servicos cloud para o uso essencial.
- Cada integracao deve ser opcional.
- O front deve continuar bonito, mas nao pode impedir usabilidade.

