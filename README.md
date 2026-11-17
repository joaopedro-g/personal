# Personal Trainer · template

Landing page de apresentação para personal trainer. HTML, CSS e JS puros, sem build e sem dependências: abre direto no GitHub Pages.

A personal da foto foi gerada por IA (Z-Image Turbo) e recortada com BiRefNet. Não é uma pessoa real.

## Ver com o nome do cliente

O botão **✎ Ver com o seu nome** (canto inferior esquerdo) troca nome, cidade, Instagram, WhatsApp, CREF e a cor da marca na hora. O **Copiar link** gera um endereço que já abre personalizado.

Também dá para montar o link na mão:

```
https://joaopedro-g.github.io/personal/?nome=Carla%20Mendes&cidade=Curitiba&whats=41999998888&insta=carla.treina&cor=7C5CFF
```

| Parâmetro | O que muda |
|---|---|
| `nome` | nome gigante do topo, menu, rodapé, iniciais do logo e título da aba |
| `cidade` | "Presencial em …", card do mapa e rodapé |
| `whats` | todos os botões de WhatsApp (DDD + número; o 55 entra sozinho) |
| `insta` | botão do Instagram |
| `cref` | CREF no topo, no "Sobre" e no rodapé |
| `cor` | cor da marca, em hex sem `#` (ex.: `E8457A`) |
| `editor=0` | esconde o botão de personalizar |

## Para entregar a um cliente

Os textos marcados com sublinhado tracejado (`class="slot"`) são os lugares a preencher: instituição, especialização, anos de experiência, depoimentos e preços. Os valores padrão dos parâmetros ficam em `DEFAULTS`, no topo de `app.js`.

## Arquivos

- `index.html`: conteúdo e seções
- `styles.css`: identidade visual (cores em `:root`)
- `app.js`: personalização, animações de entrada, contadores, mapa, planos e FAQ
- `assets/`: foto recortada (`personal.webp`), foto do "Sobre" e a imagem de prévia do link (`og.jpg`)
