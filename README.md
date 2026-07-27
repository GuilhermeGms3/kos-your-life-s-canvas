# KOS

KOS significa **Knowledge Operating System**.

Este projeto e um sistema pessoal de conhecimento, estudo, memoria, acervo e
criacao. Ele nao nasce para ser um produto comercial ou uma rede social. Ele
nasce para ser um segundo cerebro: um lugar onde uma vida inteira de livros,
notas, ideias, perguntas, midias, projetos e descobertas possa ser guardada,
estudada, conectada e revisitada.

O KOS deve crescer devagar, com profundidade. A primeira fase foca em estudo,
anotacoes persistidas, catalogacao de livros e geracao de perguntas rapidas a
partir do proprio material do usuario.

## Documentos principais

- [Visao](docs/VISION.md)
- [Produto](docs/PRODUCT.md)
- [Mapa dos pilares](docs/PILLARS.md)
- [Cofre de arquivos](docs/FILE_VAULT.md)
- [Oficina Kindle](docs/KINDLE_WORKSHOP.md)
- [Ecossistema de aprendizagem](docs/LEARNING_ECOSYSTEM.md)
- [Fase 1](docs/PHASE_1.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Modelo de dados](docs/DATA_MODEL.md)
- [Sistema visual](docs/DESIGN_SYSTEM.md)
- [Norte visual](docs/VISUAL_NORTH_STAR.md)
- [Integracoes futuras](docs/INTEGRATIONS.md)
- [Roadmap](docs/ROADMAP.md)
- [Plano de implementacao](docs/IMPLEMENTATION_PLAN.md)

## Primeiro servico integrado

O Calibre-Web pode ser preparado e iniciado separadamente:

```powershell
npm run calibre:bootstrap
npm run calibre:up
```

Consulte [a integracao do Calibre-Web](infra/calibre-web/README.md) antes do
primeiro uso.
