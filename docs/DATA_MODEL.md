# Modelo de Dados

Este documento descreve o modelo conceitual inicial. Ele ainda nao e um schema
final de banco.

## Entidades principais

### PillarRecord

Um registro transversal permite iniciar os pilares antes de existirem modelos
especializados para cada dominio.

Campos iniciais:

- `id`
- `pillarId`
- `domainId`
- `kind`
- `title`
- `details`
- `tags`
- `status`
- `createdAt`
- `updatedAt`

Regra:

O registro transversal serve para captura e descoberta de requisitos. Quando um
fluxo amadurecer, ele pode ganhar uma entidade propria sem perder sua origem,
seu contexto ou suas relacoes.

### Note

Uma nota e a unidade basica de pensamento registrado.

Campos iniciais:

- `id`
- `title`
- `content`
- `createdAt`
- `updatedAt`
- `tags`
- `linkedBookIds`
- `linkedConceptIds`
- `source`

### Book

Um livro representa uma obra fisica ou digital.

Campos iniciais:

- `id`
- `title`
- `subtitle`
- `authors`
- `status`
- `categories`
- `format`
- `owned`
- `location`
- `startedAt`
- `finishedAt`
- `notes`

Status sugeridos:

- `to_read`
- `reading`
- `paused`
- `finished`
- `abandoned`
- `reference`

### ReadingNote

Um fichamento ou nota de leitura associada a um livro.

Campos iniciais:

- `id`
- `bookId`
- `title`
- `summary`
- `keyIdeas`
- `quotes`
- `reflections`
- `linkedConceptIds`
- `createdAt`
- `updatedAt`

### Concept

Um conceito e uma ideia nomeada que pode atravessar livros, notas e areas.

Campos iniciais:

- `id`
- `name`
- `description`
- `aliases`
- `tags`
- `linkedNoteIds`
- `linkedBookIds`
- `relatedConceptIds`

### StudySession

Uma sessao de estudo representa um periodo de foco.

Campos iniciais:

- `id`
- `title`
- `targetType`
- `targetId`
- `startedAt`
- `endedAt`
- `notesCreated`
- `summary`
- `nextSteps`

### GeneratedQuestion

Uma pergunta gerada a partir de conteudo do usuario.

Campos iniciais:

- `id`
- `promptSourceType`
- `promptSourceId`
- `question`
- `questionType`
- `createdAt`
- `answeredAt`
- `answer`

Tipos sugeridos:

- `review`
- `comprehension`
- `connection`
- `open_reflection`

## Relacoes importantes

- Uma nota pode pertencer a muitos conceitos.
- Um livro pode ter muitas notas e fichamentos.
- Um conceito pode atravessar varios livros.
- Uma sessao de estudo pode gerar notas, conceitos e perguntas.
- Uma pergunta deve sempre apontar para a fonte que a originou.

## Regra de ouro

O KOS deve guardar nao apenas o conteudo, mas o contexto do conteudo.
