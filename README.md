# Lionel Messi ✦ M10 — site de fã (v2, luxo · azul · multi-páginas)

Site estático, sem build e sem dependências de servidor.

## Como abrir (importante)
1. **Mantenha a pasta inteira junto** — os HTML precisam de `assets/` (css, js, img, rive).
   Se abrir só o `index.html` sem a pasta, nada renderiza.
2. **Melhor experiência:** sirva por HTTP —
   `python3 -m http.server 8000` dentro desta pasta e abra `http://localhost:8000`.
   A transição de página roda no motor Rive completo (exige internet para o WASM
   em `file://`; por HTTP ela funciona offline).
3. **Abrir com duplo clique (`file://`) também funciona:** a intro tem fallback
   próprio — palavra M10 em degradê celeste, botão ENTRAR sólido e clique em
   qualquer lugar para entrar. Se a animação Rive não carregar (WebGL bloqueado,
   offline em `file://`), as cortinas assumem automaticamente. Nada de tela preta.
4. Navegadores suportados: Chrome/Edge/Firefox/Safari atuais (testado sem erros de JS).

## Publicar no GitHub Pages (passo a passo)
1. No GitHub: **Add file → Upload files**.
2. **Arraste O CONTEÚDO da pasta extraída** (os 5 `.html`, a pasta `assets/`, `.nojekyll`,
   este README) — não arraste o `.zip` (o GitHub não extrai) e não use "choose your files"
   selecionando arquivos de dentro das subpastas (isso achata a estrutura e quebra os caminhos).
3. Commit em `main`.
4. **Settings → Pages →** Branch: `main` / Folder: `/(root)` → Save.
5. Aguarde 1–2 min e abra `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
   Todos os caminhos são relativos — funciona em subpasta sem ajuste. `.nojekyll`
   desativa o processamento Jekyll (evita surpresas).

### Alternativa de 1 arquivo
`messi-m10-1arquivo.html` contém o site inteiro (5 páginas, CSS, JS e imagens embutidas,
~2,8 MB) com navegação por rotas `#/carreira`, `#/momentos`, `#/records`, `#/jogo`.
Envie **só esse arquivo** para o repositório e ative o Pages — funciona igual.
(A transição Rive completa fica disponível na versão de pasta; no arquivo único a
intro de cortinas em degradê assume automaticamente.)

## Páginas
- `index.html` — home: hero full-bleed com foto nova, marquee reativo ao scroll, statement,
  prévia de momentos, banda "2022" com parallax, números com contagem animada, linhas-índice.
- `carreira.html` — linha do tempo 1987→2025 com trilha de progresso ligada ao scroll.
- `momentos.html` — galeria de 12 quadros com lightbox (setas ←/→ no teclado).
- `records.html` — números com contagem, as 8 Bolas de Ouro (moedas de ouro) e acordeão.
- `jogo.html` — embaixadinhas com recorde salvo no navegador (localStorage).

## Sistema de design (DNA landonorris.com)
- Paleta: azul-noite `#07090F`, off-white `#F2F4F8`, celeste argentino `#75AADB`,
  ouro champagne `#C9A24B` (Bolas de Ouro). Tema claro champagne em `#F2F1EA`.
- Tipografia: Mona Sans variável (display, caps, wt 660/wdth 93) + Playfair Display itálico
  como acento de luxo.
- Grain de filme, hairlines, raio .54/.74rem, easing `cubic-bezier(.65,.05,0,1)`.

## Transição de página (mecânica real do Lando)
`assets/rive/page-transition.riv` (artboard/state machine `page-transition`, inputs
`initial` / `transition-out` / `transition-in`) rodando no runtime Rive self-hosted
(`assets/rive/`). Cliques internos tocam `transition-out`, aguardam 1000 ms (o `lL` do
Lando), navegam e a página nova toca `transition-in`. Na primeira visita, intro com botão
"entrar" (equivalente ao "Load Norris"). O tom lima do arquivo original é convertido para
o celeste da paleta via filtro no canvas; sem Rive (ex.: `file://`), cortinas com a marca
"M10" assumem com os mesmos tempos.

## Transições de scroll (Lenis + engine própria)
Rolagem suave Lenis (`assets/js/lenis.min.js`, MIT) + `assets/js/site.js`:
split-text por caractere nos títulos, reveals com blur/slide, parallax, hero com zoom
no scroll, marquee com velocidade/direção reativas, header que se esconde, barra de
progresso lateral, trilha da timeline, contadores e acordeão. Respeita
`prefers-reduced-motion`.

## Créditos
Projeto de fã, não oficial. Fotos de imprensa via busca pública (ESPN, Fox Sports,
Gulf News, The New Yorker e outras), uso editorial sem fins comerciais. Direção de arte
inspirada no site de Lando Norris (OFF+BRAND); implementação própria. Lenis (MIT).
