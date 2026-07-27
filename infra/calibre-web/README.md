# Calibre-Web para o KOS

Esta pasta adiciona o
[Calibre-Web](https://github.com/janeczku/calibre-web) como servico vizinho do
KOS.

Responsabilidades:

- Calibre-Web guarda os arquivos, capas, formatos e o catalogo tecnico.
- KOS guarda notas, status pessoal, fichamentos, perguntas e relacoes.
- A integracao e opcional. O Study Core continua funcionando quando o servico
  estiver desligado.

## Preparacao

No PowerShell:

```powershell
.\infra\calibre-web\bootstrap.ps1
docker compose -f .\infra\calibre-web\compose.yml up -d
```

Depois:

1. Abra `http://127.0.0.1:8083`.
2. Entre com as credenciais iniciais exibidas pela documentacao oficial.
3. Defina o caminho da biblioteca como `/books`.
4. Troque a senha inicial.

O catalogo OPDS fica em `http://127.0.0.1:8083/opds`.

## Configuracao do KOS

O KOS usa estes valores no servidor:

```dotenv
CALIBRE_WEB_URL=http://127.0.0.1:8083
CALIBRE_WEB_PUBLIC_URL=http://127.0.0.1:8083
CALIBRE_WEB_USERNAME=
CALIBRE_WEB_PASSWORD=
```

Usuario e senha sao opcionais para a verificacao basica. Quando preenchidos,
permanecem no servidor e nao sao enviados ao navegador.

Em um homelab, `CALIBRE_WEB_URL` pode usar o endereco interno do container e
`CALIBRE_WEB_PUBLIC_URL` o endereco acessivel pelo navegador.

## Dados e atualizacoes

- `data/config` guarda a configuracao do Calibre-Web.
- `data/library` guarda a biblioteca Calibre e seu `metadata.db`.
- As duas pastas sao ignoradas pelo Git.
- O container pode ser atualizado sem incorporar o codigo-fonte externo ao
  repositorio do KOS.
