# Oficina Kindle

A Oficina Kindle transforma arquivos soltos em uma fila rastreavel:

1. Recolher PDF, Word, EPUB, AZW3 ou MOBI para o Cofre.
2. Converter pelo Calibre Desktop.
3. Inspecionar o EPUB e revisar o resultado.
4. Enviar por USB ou pelo Send to Kindle.
5. Registrar o teste final no Paperwhite.

## Calibre Desktop e Calibre-Web

Sao integracoes diferentes:

- Calibre Desktop fornece o executavel `ebook-convert` e realiza conversoes.
- Calibre-Web cataloga e disponibiliza a biblioteca pelo servidor.
- O KOS controla a fila, os problemas, a aprovacao e o historico pessoal.

Para liberar conversoes locais:

```powershell
npm run calibre:bridge
```

O bridge escuta apenas em `127.0.0.1:43117`, procura a instalacao padrao do
Calibre 64 e executa somente `ebook-convert`, sem shell. Nenhum container e
necessario.

## Validacao EPUB

O inspetor abre o pacote EPUB no navegador e verifica:

- Estrutura basica do pacote.
- Quantidade de documentos de leitura.
- Presenca de texto refluivel.
- Quantidade aproximada de palavras e caracteres.
- Presenca de indice EPUB.
- Proporcao suspeita entre imagens e texto.

Essa verificacao detecta conversoes evidentemente vazias ou compostas quase
somente por imagens. Ela nao substitui a revisao no Kindle Previewer nem o teste
no Paperwhite.

## Destinos

- EPUB: revisar e enviar pelo servico Send to Kindle.
- AZW3: formato pratico para copia USB direta em Kindles compativeis.
- PDF: pode ser copiado sem conversao, mas nao oferece a mesma leitura refluivel.

O navegador pede permissao antes de acessar a raiz do Kindle. O KOS procura a
pasta `documents` e nunca mantem acesso silencioso ao dispositivo.
