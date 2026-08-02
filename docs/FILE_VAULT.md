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
- Unidades de aprendizagem usando arquivos como materiais principais e complementares.
- Oficina Kindle organizando conversao, revisao e envio de livros.
- Exportacao e restauracao de um pacote completo do KOS.

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
- O backup e manual e precisa ser exportado periodicamente.
- Outro computador nao recebe os arquivos.

Antes de guardar um acervo insubstituivel, o Cofre deve migrar para um
repositorio local com SQLite para metadados e filesystem ou NAS para binarios.

## Proximos passos

- Pastas e colecoes hierarquicas.
- Relacoes com livros, notas, conceitos e aulas.
- Deteccao de duplicatas por hash.
- Lixeira recuperavel.
- Backup automatico e migracao para armazenamento self-hosted.

## Pacote de backup

A area `/system/backup` gera um arquivo `.kos.zip` com:

- `manifest.json` versionado.
- Todas as chaves `kos.*` do LocalStorage.
- Metadados dos ativos do Cofre.
- Binarios originais guardados no IndexedDB.

Antes de restaurar, o KOS valida formato, versao e presenca de cada arquivo. A
restauracao substitui apenas dados do KOS e nao remove chaves de outros sistemas
no navegador.
