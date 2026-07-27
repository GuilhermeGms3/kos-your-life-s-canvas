# Integracoes Futuras

O KOS deve evitar acoplar ferramentas externas cedo demais. Primeiro ele precisa
ter nucleo proprio: notas, livros, conceitos, estudo e perguntas.

Depois disso, integracoes podem ampliar o ecossistema.

## Conhecimento e notas

### Logseq

Boa referencia para pensamento em blocos, backlinks, grafo e arquivos locais em
Markdown/Org-mode.

Uso possivel:

- Inspirar modelo de blocos e links.
- Importar/exportar Markdown.
- Estudar formato de grafo local-first.

### Joplin

Boa referencia para notas Markdown, web clipper e sincronizacao self-hosted.

Uso possivel:

- Inspirar captura rapida.
- Inspirar sincronizacao.
- Possivel importacao/exportacao de notas.

## Biblioteca

### Calibre / Calibre-Web

Referencia forte para catalogar ebooks e PDFs.

Estado:

- Primeira integracao ativa.
- Container opcional em `infra/calibre-web`.
- Estado de conexao e acesso direto exibidos na Library Orbit.
- Endpoint OPDS reservado para a proxima etapa de importacao de metadados.

Divisao de responsabilidades:

- Calibre-Web mantem arquivos, capas, formatos e catalogo tecnico.
- KOS mantem estado pessoal, observacoes, notas, fichamentos, perguntas e
  relacoes.
- O KOS continua utilizavel quando o Calibre-Web estiver desligado.

### Calibre Desktop / Kindle

Estado:

- Oficina Kindle ativa em `/library/kindle`.
- Bridge local opcional para o `ebook-convert` do Calibre 64.
- Conversao para EPUB e AZW3.
- Inspecao de EPUB para detectar ausencia de texto e indice.
- Fila persistente de revisao, problemas, aprovacao e envio.
- Conexao autorizada pelo navegador com a pasta `documents` do Kindle.

O Calibre Desktop converte. O Calibre-Web cataloga. O KOS organiza o processo e
registra se o livro realmente ficou legivel.

## Projetos

### Plane

Alternativa moderna self-hosted ao Jira.

Uso possivel:

- Gerenciar projetos pessoais.
- Criar ciclos de estudo ou construcao.
- Integrar roadmap do KOS e outros projetos.

### OpenProject

Mais robusto e pesado, bom para gestao completa.

Uso possivel:

- Projetos longos.
- Planejamento com Gantt.
- Wiki e gestao de tempo.

## Casa e homelab

### Home Assistant

Referencia principal para automacao residencial local-first.

Uso possivel:

- Integrar estados da casa no KOS.
- Criar rotinas de estudo.
- Controlar ambiente de foco, luz, musica e notificacoes.

## Regra para integracoes

Uma integracao so deve entrar quando responder claramente:

- O que ela adiciona ao KOS?
- Quais dados ela controla?
- O KOS depende dela ou apenas conversa com ela?
- O usuario consegue continuar usando o KOS se ela cair?
