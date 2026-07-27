# Cofre de Arquivos

O Cofre e a camada compartilhada de arquivos do KOS. Livros, PDFs, videos,
audios, imagens, pacotes e outros materiais entram uma vez e podem ser
referenciados por estudo, pilares e recompensas.

## Estado atual

- Upload multiplo.
- Armazenamento binario local em IndexedDB.
- Classificacao automatica por tipo.
- Organizacao por pilar, colecao, tags e descricao.
- Busca por nome, colecao, tags e descricao.
- Visualizacao de imagens, videos, audios e PDFs.
- Download do arquivo original.
- Estudio de Video consumindo o mesmo acervo.
- Academia do Legado vinculando arquivos como recompensas.
- Oficina Kindle organizando conversao, revisao e envio de livros.

## Regra de propriedade

O arquivo pertence ao Cofre. Os outros modulos guardam apenas o identificador e
o contexto da relacao. Isso evita duplicacao e permite que um PDF participe de
um livro, uma aula e uma recompensa ao mesmo tempo.

## Persistencia

Na etapa atual, IndexedDB e adequada para prototipar uploads reais sem backend.
Ela e superior ao LocalStorage para arquivos binarios, mas ainda depende do
navegador e do perfil local.

Limites:

- Limpeza dos dados do navegador pode remover o acervo.
- A cota varia por navegador e dispositivo.
- Nao existe backup automatico.
- Outro computador nao recebe os arquivos.

Antes de guardar um acervo insubstituivel, o Cofre deve migrar para um
repositorio local com SQLite para metadados e filesystem ou NAS para binarios.

## Proximos passos

- Pastas e colecoes hierarquicas.
- Relacoes com livros, notas, conceitos e aulas.
- Importacao e exportacao de manifesto.
- Deteccao de duplicatas por hash.
- Lixeira recuperavel.
- Backup e migracao para armazenamento self-hosted.
